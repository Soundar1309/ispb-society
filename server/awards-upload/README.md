# ISPB Awards – Image Upload API (AWS EC2 + Nginx)

Award recipient photos are stored in the **`awards`** folder on the EC2 server (`/var/www/html/awards`) and served directly by Nginx at `https://YOUR-DOMAIN/awards/<file>`. The database (`ispb_awards.image_url`) stores only that URL.

```
Admin panel ──(POST /api/awards/upload + Supabase JWT)──► Nginx ──proxy──► Node API :3001
                                                                             │ validates magic bytes & saves file
Visitors ◄──────────── https://YOUR-DOMAIN/awards/award-xxxx.jpg ◄── Nginx ◄─┘ /var/www/html/awards
```

### Security Features:
- **Authentication & RBAC**: Only authenticated Supabase users with the `admin` role in `user_roles` can upload or delete.
- **Magic-Byte Binary Inspection**: Verifies actual binary headers of uploaded images (JPEG, PNG, WEBP). Spoofed client file extensions or forged MIME types are rejected.
- **Randomized File Names**: File names are generated using `crypto.randomBytes` + timestamp. Original client file names are completely discarded.
- **Memory Buffer Processing**: Uploaded files are inspected in-memory and strictly validated before touching the disk.
- **Directory Execution Prevention**: Nginx location block denies execution of any scripts (`.php`, `.cgi`, `.py`, `.sh`, etc.) in `/awards/`.
- **Rate Limiting**: Rate limited to prevent denial-of-service / disk flooding attacks.
- **Path Traversal Shield**: The delete endpoint enforces strict regex validation on the file basename (`award-\d+-[a-f0-9]+\.(jpg|png|webp)`).
- **Auto-Cleanup**: The admin panel automatically deletes old/replaced image files from the server when awards are deleted or photos replaced.
- **Internal Only**: The API binds strictly to `127.0.0.1:3001`. Never expose port 3001 in your EC2 security group.

---

## Nginx Setup on Server (Fixes HTTP 405)

When Nginx receives `POST /api/awards/upload` without a `location /api/awards/` block, it falls back to static `index.html` and returns **`405 Not Allowed`**. 

Follow these steps to configure Nginx:

### 1. Edit your Nginx configuration
Find your site's Nginx configuration (usually in `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/`):
```bash
sudo ls -l /etc/nginx/sites-enabled/
```
Open your active site config (e.g. `default` or `ispb`):
```bash
sudo nano /etc/nginx/sites-available/default
```

### 2. Add the API proxy and Awards location blocks
Inside your `server { ... }` block (specifically the one with `listen 443 ssl` if you use HTTPS):

```nginx
    # 1. Reverse proxy upload API requests to the Node.js service
    location /api/awards/ {
        proxy_pass http://127.0.0.1:3001/api/awards/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Critical: Nginx default is 1M, which causes 413 error for 2MB photos
        client_max_body_size 10M;
    }

    # 2. Serve static award photos directly from the server disk
    location /awards/ {
        alias /var/www/html/awards/;
        add_header X-Content-Type-Options "nosniff";
        autoindex off;
        expires 30d;

        # Security: block script execution in the uploads folder
        location ~* \.(php|pl|py|cgi|sh|bash|exe|asp|aspx)$ {
            deny all;
        }
    }
```

### 3. Test and reload Nginx
```bash
sudo nginx -t
```
*(Must output: `nginx: configuration file /etc/nginx/nginx.conf test is successful`)*.

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Node.js Upload Service Setup on EC2

### 1. Create the `awards` folder on EC2
```bash
sudo mkdir -p /var/www/html/awards
sudo chown -R $USER:www-data /var/www/html/awards
sudo chmod 775 /var/www/html/awards
```

### 2. Copy API files & configure
From your PC (PowerShell):
```powershell
scp -i C:\path\your-key.pem -r server\awards-upload\* ubuntu@YOUR_EC2_IP:/home/ubuntu/awards-upload/
```
On EC2:
```bash
cd ~/awards-upload
npm install --omit=dev
cp .env.example .env
nano .env
```
`.env` variables:
| Variable | Value |
|---|---|
| `PORT` | `3001` |
| `AWARDS_DIR` | `/var/www/html/awards` |
| `PUBLIC_BASE_URL` | `https://YOUR-DOMAIN.com` (no trailing slash) |
| `SUPABASE_URL` | `https://ktgirheyxeuyhmlrnhjl.supabase.co` |
| `SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(recommended)* Service role key (bypasses RLS for admin role verification) |
| `ALLOWED_ORIGINS` | `https://YOUR-DOMAIN.com` (add `,http://localhost:8080` for local testing) |

### 3. Start or Restart with PM2
```bash
pm2 start index.js --name awards-upload
pm2 save
pm2 startup
```
If already added:
```bash
pm2 restart awards-upload
pm2 status
```

### 4. Verify locally on the server
```bash
curl http://127.0.0.1:3001/api/awards/health
```
Expected output:
```json
{"ok":true,"service":"awards-upload","timestamp":...}
```

---

## ⚠️ Important Deployment Note (Preserving Uploaded Photos)

When deploying new frontend builds from your PC:
```powershell
npm run build
scp -i C:\path\your-key.pem -r dist\* ubuntu@YOUR_EC2_IP:/tmp/dist/
```
On EC2, copy to `/var/www/html` using `--exclude awards`:
```bash
rsync -a --exclude awards /tmp/dist/ /var/www/html/
```
> **CRITICAL**: Never execute `rm -rf /var/www/html/*`! Doing so would delete all stored award recipient photos.
