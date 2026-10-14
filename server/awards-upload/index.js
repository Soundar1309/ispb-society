/**
 * ISPB Awards image upload API.
 *
 *  POST   /api/awards/upload   (multipart, field "file")  -> { url }
 *  DELETE /api/awards/upload   (JSON { url })             -> { ok: true }
 *
 * Security features:
 * - Supabase JWT verification & admin role check.
 * - Rate limiting on upload & delete endpoints.
 * - In-memory buffer inspection with magic-bytes verification (JPEG, PNG, WEBP).
 * - Client file extensions & Content-Type headers are discarded; extension is derived from magic bytes.
 * - Cryptographically random, unique filenames.
 * - Automatic .htaccess creation in AWARDS_DIR preventing script execution and directory indexing.
 * - Strict regex-based path sanitization on deletion.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

// Always load .env from the same folder as index.js regardless of PM2 working directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DEFAULT_SUPABASE_URL = 'https://ktgirheyxeuyhmlrnhjl.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z2lyaGV5eGV1eWhtbHJuaGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Nzk4NjQsImV4cCI6MjA2NTM1NTg2NH0.Dq05YAigL7BVatiuKhY1IFQoGjrzsNWymD25NeDgcFc';
const DEFAULT_PUBLIC_URL = 'https://ispb.ejplantbreeding.org';

function cleanVal(v) {
  if (!v) return '';
  return String(v).replace(/^["']|["']$/g, '').trim();
}

const PORT = parseInt(cleanVal(process.env.PORT) || '3001', 10);
const AWARDS_DIR = cleanVal(process.env.AWARDS_DIR) || '/var/www/html/awards';
const PUBLIC_BASE_URL = (cleanVal(process.env.PUBLIC_BASE_URL) || DEFAULT_PUBLIC_URL).replace(/\/$/, '');
const SUPABASE_URL = (cleanVal(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL).replace(/\/$/, '');

// Prioritize service role key if set and valid for this project, otherwise anon key or verified default
const rawServiceKey = cleanVal(process.env.SUPABASE_SERVICE_ROLE_KEY);
const rawAnonKey = cleanVal(
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_KEY
);

function isValidSupabaseKeyForProject(key) {
  if (!key || typeof key !== 'string') return false;
  const parts = key.trim().split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.ref === 'ktgirheyxeuyhmlrnhjl';
  } catch {
    return false;
  }
}

let SUPABASE_KEY = DEFAULT_SUPABASE_KEY;
if (isValidSupabaseKeyForProject(rawServiceKey)) {
  SUPABASE_KEY = rawServiceKey;
} else if (isValidSupabaseKeyForProject(rawAnonKey)) {
  SUPABASE_KEY = rawAnonKey;
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => cleanVal(s))
  .filter(Boolean);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

// Ensure awards directory exists
fs.mkdirSync(AWARDS_DIR, { recursive: true });

// Ensure .htaccess security hardening is present in AWARDS_DIR
function ensureHtaccessProtection(dir) {
  const htaccessPath = path.join(dir, '.htaccess');
  if (!fs.existsSync(htaccessPath)) {
    const rules = [
      '# Hardened static image serving for awards uploads',
      'Options -Indexes -ExecCGI',
      '<FilesMatch "(?i)\\.(php|phtml|php3|php4|php5|php7|phps|cgi|pl|py|sh|bash|exe|asp|aspx)$">',
      '    Require all denied',
      '</FilesMatch>',
      '<IfModule mod_headers.c>',
      '    Header set X-Content-Type-Options "nosniff"',
      '</IfModule>',
      '',
    ].join('\n');
    try {
      fs.writeFileSync(htaccessPath, rules, 'utf8');
      console.log(`Protected upload directory with ${htaccessPath}`);
    } catch (err) {
      console.warn(`Could not create .htaccess in ${dir}:`, err.message);
    }
  }
}
ensureHtaccessProtection(AWARDS_DIR);

/**
 * Validates file magic bytes to verify genuine image content.
 * Discards client-provided MIME types or extensions.
 */
function detectImageFormat(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: '.png', mime: 'image/png' };
  }

  // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50) at index 8
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }

  return null;
}

const app = express();
// Enable trust proxy because Nginx sets X-Forwarded-For
app.set('trust proxy', 1);
app.use(express.json());

// Restrict CORS if ALLOWED_ORIGINS configured; otherwise allow same-origin proxy
app.use(
  cors({
    origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : false,
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

// Health check endpoint (minimal, secure response without exposing internal config)
app.get('/api/awards/health', (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// Static files route for /awards (allows local development and fallback serving)
app.use(
  '/awards',
  express.static(AWARDS_DIR, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// Rate limiter for upload and delete endpoints (max 60 requests per 15 min per IP)
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests. Please try again later.' },
});

// Memory storage so file buffer is inspected and validated before anything is written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
});

// Verifies the Supabase access token and checks that the user has the 'admin' role
async function requireAdmin(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Missing token' });

    // 1. Decode JWT payload to get user ID and check expiration
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch {
      return res.status(401).json({ error: 'Malformed token' });
    }

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token has expired. Please sign out and sign in again.' });
    }

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: no user ID found' });
    }

    // 2. Query Supabase PostgREST with the user's token
    // PostgREST cryptographically verifies the JWT signature and enforces RLS for the user
    const roleUrl = `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(userId)}&role=eq.admin&select=role&limit=1`;
    const response = await fetch(roleUrl, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 || response.status === 403) {
      const errJson = await response.json().catch(() => ({}));
      console.warn('Supabase rejected user JWT:', errJson);
      const detail = errJson?.message || errJson?.msg || errJson?.error_description || 'Session is invalid or expired';
      return res.status(401).json({ error: `${detail}. Please sign out and sign in again.` });
    }

    if (!response.ok) {
      console.error('Role check HTTP error:', response.status);
      return res.status(500).json({ error: 'Failed to verify admin status' });
    }

    const roles = await response.json();
    if (!Array.isArray(roles) || roles.length === 0) {
      console.warn(`Access denied: User ${userId} is not an admin`);
      return res.status(403).json({ error: 'Admin only' });
    }

    req.user = { id: userId, email: payload.email };
    next();
  } catch (e) {
    console.error('Auth verification failed:', e);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

app.post('/api/awards/upload', uploadRateLimiter, requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size must be 2MB or less' });
      }
      return res.status(400).json({ error: err.message || 'Upload error' });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify true file format from binary magic bytes
    const detected = detectImageFormat(req.file.buffer);
    if (!detected) {
      return res.status(400).json({
        error: 'Invalid file content: only genuine JPG, PNG or WEBP images are allowed',
      });
    }

    // Generate non-colliding, randomized filename using detected extension
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `award-${Date.now()}-${randomHex}${detected.ext}`;
    const destinationPath = path.join(AWARDS_DIR, filename);

    try {
      await fs.promises.writeFile(destinationPath, req.file.buffer);
      res.json({ url: `${PUBLIC_BASE_URL}/awards/${filename}` });
    } catch (writeErr) {
      console.error('Failed to write uploaded file:', writeErr);
      res.status(500).json({ error: 'Failed to save uploaded file' });
    }
  });
});

app.delete('/api/awards/upload', uploadRateLimiter, requireAdmin, (req, res) => {
  const url = String(req.body?.url || '');
  const name = path.basename(url);

  // Strict regex prevents directory traversal (../) and allows only standard award filenames
  if (!/^award-\d+-[a-f0-9]+\.(jpg|png|webp)$/i.test(name)) {
    return res.status(400).json({ error: 'Invalid or unauthorized file name' });
  }

  const targetPath = path.join(AWARDS_DIR, name);
  fs.unlink(targetPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete award image:', err);
      return res.status(500).json({ error: 'Delete failed' });
    }
    res.json({ ok: true });
  });
});

app.listen(PORT, '127.0.0.1', () => {
  const keyTail = SUPABASE_KEY.length > 8 ? `...${SUPABASE_KEY.slice(-6)}` : 'INVALID/TOO_SHORT';
  console.log(`Awards upload API running on 127.0.0.1:${PORT}`);
  console.log(`Storage directory: ${AWARDS_DIR}`);
  console.log(`Public base URL:   ${PUBLIC_BASE_URL}`);
  console.log(`Supabase URL:      ${SUPABASE_URL}`);
  console.log(`Supabase Key:      loaded (${keyTail})`);
});
