import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Trophy,
  Building2,
  MapPin,
  UploadCloud,
  Eye,
  EyeOff,
  Award as AwardIcon,
  Search,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { IspbAward } from '@/components/IspbAwards';
import AwardsPagination from '@/components/AwardsPagination';

const ADMIN_PAGE_SIZE = 10;

const AWARDS_UPLOAD_URL = import.meta.env.VITE_AWARDS_UPLOAD_URL || '/api/awards/upload';

const emptyForm = {
  award_year: new Date().getFullYear(),
  award_number: '',
  award_name: '',
  recipient_name: '',
  affiliation: '',
  location: '',
  description: '',
  image_url: '',
  display_order: 1,
  is_active: true,
};

const initials = (name: string) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const isSafeImageUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  );
};

const isManagedAwardImage = (url?: string | null): boolean => {
  if (!url) return false;
  return /\/awards\/award-\d+-[a-f0-9]+\.(jpg|png|webp)$/i.test(url);
};

const getFreshAccessToken = async (): Promise<string | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  let session = sessionData.session;
  // If session is absent or expires in less than 60 seconds, refresh it
  if (!session || (session.expires_at && session.expires_at * 1000 - Date.now() < 60000)) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session) {
      session = refreshed.session;
    }
  }
  return session?.access_token || null;
};

const deleteUploadedImage = async (url: string) => {
  try {
    const token = await getFreshAccessToken();
    if (!token) return;
    await fetch(AWARDS_UPLOAD_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.warn('Could not delete image file:', err);
  }
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 pt-1">
    <span className="text-xs font-bold uppercase tracking-wider text-green-700">{children}</span>
    <div className="flex-1 h-px bg-green-100" />
  </div>
);

const AdminAwardsTab = ({ onRefresh }: { onRefresh?: () => void }) => {
  const [awards, setAwards] = useState<IspbAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IspbAward | null>(null);
  const [deleting, setDeleting] = useState<IspbAward | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);

  const fetchAwards = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('ispb_awards')
      .select('*')
      .order('award_year', { ascending: false })
      .order('display_order', { ascending: true });
    if (error) {
      toast.error(error.message || 'Error loading awards');
    } else {
      setAwards(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  const filteredAwards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return awards;
    return awards.filter((a) =>
      [a.recipient_name, a.award_name, a.award_number, a.location]
        .some((field) => (field || '').toLowerCase().includes(q))
    );
  }, [awards, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAwards.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAwards = useMemo(
    () => filteredAwards.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE),
    [filteredAwards, currentPage]
  );

  // go back to the first page whenever the search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const years = useMemo(
    () => Array.from(new Set(pagedAwards.map((a) => a.award_year))).sort((a, b) => b - a),
    [pagedAwards]
  );

  const openAdd = (year?: number) => {
    setEditing(null);
    const targetYear = year ?? new Date().getFullYear();
    const inYear = awards.filter((a) => a.award_year === targetYear);
    setFormData({ ...emptyForm, award_year: targetYear, display_order: inYear.length + 1 });
    setIsDialogOpen(true);
  };

  const openEdit = (award: IspbAward) => {
    setEditing(award);
    setFormData({
      award_year: award.award_year,
      award_number: award.award_number || '',
      award_name: award.award_name || '',
      recipient_name: award.recipient_name || '',
      affiliation: award.affiliation || '',
      location: award.location || '',
      description: award.description || '',
      image_url: award.image_url || '',
      display_order: award.display_order || 1,
      is_active: award.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpg', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPG, JPEG or WEBP image');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      input.value = '';
      return;
    }

    setUploading(true);
    try {
      const token = await getFreshAccessToken();
      if (!token) throw new Error('Authentication session expired. Please sign out and sign in again.');

      const body = new FormData();
      body.append('file', file);
      const res = await fetch(AWARDS_UPLOAD_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        // Response was not JSON (e.g. 404 HTML from Vite dev server or Apache fallback)
      }

      if (!res.ok || !json.url) {
        const errorMsg =
          json.error ||
          (res.status === 404
            ? 'Upload service not reachable (404). Ensure the upload server is running and Apache or Vite proxy is active.'
            : res.status === 403
            ? 'Permission denied (403). Only users with admin role can upload photos.'
            : res.status === 401
            ? 'Authentication session expired (401). Please sign out and sign in again.'
            : res.status === 502 || res.status === 504
            ? 'Upload API server is down or not responding (502/504).'
            : `Upload failed (HTTP ${res.status || 'unknown'})`);
        throw new Error(errorMsg);
      }

      // If user replaces an image they uploaded in this modal session, clean up the prior file
      if (formData.image_url && isManagedAwardImage(formData.image_url) && formData.image_url !== editing?.image_url) {
        deleteUploadedImage(formData.image_url);
      }

      setFormData((prev) => ({ ...prev, image_url: json.url }));
      toast.success('Photo uploaded');
    } catch (error: any) {
      console.error('Award photo upload failed:', error);
      toast.error(error.message || 'Photo upload failed');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleRemovePhoto = () => {
    // If the image was uploaded in this session and hasn't been saved yet, clean it up from server
    if (formData.image_url && isManagedAwardImage(formData.image_url) && formData.image_url !== editing?.image_url) {
      deleteUploadedImage(formData.image_url);
    }
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const year = Number(formData.award_year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      toast.error('Please enter a valid year (1900–2200)');
      return;
    }
    if (!formData.award_number.trim() || !formData.award_name.trim() || !formData.recipient_name.trim()) {
      toast.error('Award number, award name and recipient name are required');
      return;
    }

    const rawImageUrl = formData.image_url.trim();
    if (rawImageUrl) {
      const isSafe =
        rawImageUrl.startsWith('https://') ||
        rawImageUrl.startsWith('http://') ||
        rawImageUrl.startsWith('/');
      if (!isSafe) {
        toast.error('Photo URL must start with https://, http://, or /');
        return;
      }
    }

    const payload = {
      ...formData,
      award_year: year,
      award_number: formData.award_number.trim(),
      award_name: formData.award_name.trim(),
      recipient_name: formData.recipient_name.trim(),
      affiliation: formData.affiliation.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      image_url: rawImageUrl,
      display_order: Number(formData.display_order) || 1,
    };

    setSaving(true);
    try {
      const table = (supabase as any).from('ispb_awards');
      const { error } = editing
        ? await table.update(payload).eq('id', editing.id)
        : await table.insert(payload);
      if (error) throw error;

      // If an existing photo was replaced or cleared, remove the old file from server
      if (editing?.image_url && isManagedAwardImage(editing.image_url) && editing.image_url !== rawImageUrl) {
        deleteUploadedImage(editing.image_url);
      }

      toast.success(editing ? 'Award updated successfully' : 'Award added successfully');
      setIsDialogOpen(false);
      setEditing(null);
      await fetchAwards();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error saving award:', error);
      toast.error(error.message || 'Error saving award');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const oldImageUrl = deleting.image_url;
    try {
      const { error } = await (supabase as any).from('ispb_awards').delete().eq('id', deleting.id);
      if (error) throw error;

      // Clean up server-stored image if present
      if (oldImageUrl && isManagedAwardImage(oldImageUrl)) {
        deleteUploadedImage(oldImageUrl);
      }

      toast.success('Award deleted successfully');
      await fetchAwards();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || 'Error deleting award');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (award: IspbAward) => {
    const { error } = await (supabase as any)
      .from('ispb_awards')
      .update({ is_active: !award.is_active })
      .eq('id', award.id);
    if (error) {
      toast.error(error.message || 'Error updating award');
      return;
    }
    toast.success(`Award ${!award.is_active ? 'published' : 'hidden'}`);
    fetchAwards();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center ring-1 ring-white/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">ISPB Awards</h2>
              <p className="text-sm text-green-50/90">Manage year-wise awards and recipients</p>
            </div>
          </div>
          <Button
            id="add-award-btn"
            onClick={() => openAdd()}
            className="bg-white text-green-700 hover:bg-green-50 font-semibold shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Award
          </Button>
        </div>
      </div>

      {/* Search */}
      {awards.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="awards-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient name, award, award number or location..."
            className="pl-9 pr-9 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 divide-y divide-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[72px] animate-pulse bg-gray-100/60" />
          ))}
        </div>
      ) : years.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <AwardIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            {awards.length === 0 ? 'No awards yet.' : `No awards match "${search}".`}
          </p>
          {awards.length === 0 ? (
            <Button onClick={() => openAdd()}>
              <Plus className="h-4 w-4 mr-2" /> Add the first award
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setSearch('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        years.map((year) => {
          const yearAwards = pagedAwards.filter((a) => a.award_year === year);
          return (
            <section key={year} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
                  {year}
                </h3>
                <span className="text-xs font-semibold rounded-full bg-green-100 text-green-800 px-2.5 py-1">
                  {yearAwards.length} {yearAwards.length === 1 ? 'recipient' : 'recipients'}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {yearAwards.map((award) => (
                  <div
                    key={award.id}
                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-4 py-3 hover:bg-green-50/40 transition-colors ${
                      award.is_active ? '' : 'bg-gray-50/80'
                    }`}
                  >
                    {/* Recipient */}
                    <div className="flex items-center gap-3 md:w-[30%] min-w-0">
                      {isSafeImageUrl(award.image_url) ? (
                        <img
                          src={award.image_url!}
                          alt={award.recipient_name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className={`h-12 w-12 rounded-full object-cover object-top ring-2 ring-green-100 shrink-0 ${
                            award.is_active ? '' : 'grayscale opacity-70'
                          }`}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-green-50 ring-2 ring-green-100 flex items-center justify-center text-sm font-bold text-green-600 shrink-0">
                          {initials(award.recipient_name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{award.recipient_name}</p>
                        {award.affiliation && (
                          <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{award.affiliation}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Award */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          No. {award.award_number}
                        </span>
                        <span className="text-sm font-semibold text-green-700">{award.award_name}</span>
                      </div>
                      {award.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{award.description}</p>
                      )}
                    </div>

                    {/* Location */}
                    {award.location && (
                      <p className="hidden lg:flex items-center gap-1 text-xs text-gray-500 lg:w-44 shrink-0">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{award.location}</span>
                      </p>
                    )}

                    {/* Status + actions */}
                    <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(award)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
                          award.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        aria-label={award.is_active ? 'Hide award' : 'Publish award'}
                      >
                        {award.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {award.is_active ? 'Published' : 'Hidden'}
                      </button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(award)} aria-label="Edit award">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleting(award)}
                          aria-label="Delete award"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}

      {!loading && (
        <AwardsPagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredAwards.length}
          pageSize={ADMIN_PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-600 text-white flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{editing ? 'Edit Award' : 'Add New Award'}</DialogTitle>
                <DialogDescription>
                  {editing ? 'Update award details' : 'Add an award for any past, current or future year'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-5">
            <SectionTitle>Award details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="award_year">Year *</Label>
                <Input
                  id="award_year"
                  type="number"
                  min={1900}
                  max={2200}
                  value={Number.isNaN(formData.award_year) ? '' : formData.award_year}
                  onChange={(e) => setFormData({ ...formData, award_year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="award_number">Award Number *</Label>
                <Input
                  id="award_number"
                  placeholder="e.g. A-01"
                  value={formData.award_number}
                  onChange={(e) => setFormData({ ...formData, award_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="award_display_order">Display Order</Label>
                <Input
                  id="award_display_order"
                  type="number"
                  min={1}
                  value={Number.isNaN(formData.display_order) ? '' : formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="award_name">Award Name *</Label>
              <Input
                id="award_name"
                placeholder="e.g. Young Scientist Award"
                value={formData.award_name}
                onChange={(e) => setFormData({ ...formData, award_name: e.target.value })}
                required
              />
            </div>

            <SectionTitle>Recipient</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-5">
              {/* Photo */}
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="relative h-36 w-36 mx-auto sm:mx-0">
                  <label
                    htmlFor="award_image_upload"
                    className="h-full w-full rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 hover:border-green-400 hover:bg-green-50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                  >
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover object-top" />
                    ) : (
                      <>
                        <UploadCloud className="h-7 w-7 text-green-500 mb-1" />
                        <span className="text-xs text-gray-500 px-2">{uploading ? 'Uploading...' : 'Click to upload'}</span>
                      </>
                    )}
                  </label>
                  {formData.image_url && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemovePhoto}
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <input
                    id="award_image_upload"
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-gray-400 text-center sm:text-left">PNG/JPG/WEBP · max 2MB</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient_name">Recipient Name *</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="affiliation">Affiliation</Label>
                  <Input
                    id="affiliation"
                    placeholder="Institution / organisation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State / Country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="award_image_url">Or paste photo URL</Label>
              <Input
                id="award_image_url"
                type="text"
                placeholder="https://..."
                value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <SectionTitle>About</SectionTitle>
            <div>
              <Label htmlFor="award_description">Short Description</Label>
              <Textarea
                id="award_description"
                rows={3}
                placeholder="Why was this award given?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-gray-500">Show this award on the public ISPB Awards page</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading} className="bg-green-600 hover:bg-green-700">
                {saving ? 'Saving...' : editing ? 'Update Award' : 'Add Award'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this award?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.award_name}" awarded to {deleting?.recipient_name} ({deleting?.award_year}) will be
              permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAwardsTab;
