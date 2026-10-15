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
import {
  Plus,
  Edit,
  Trash2,
  X,
  Trophy,
  UploadCloud,
  Award as AwardIcon,
  Search,
  FileText,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { IspbAward } from '@/components/IspbAwards';
import AwardsPagination from '@/components/AwardsPagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ADMIN_PAGE_SIZE = 10;
const AWARDS_UPLOAD_URL = import.meta.env.VITE_AWARDS_UPLOAD_URL || '/api/awards/upload';

const emptyForm = {
  award_year: new Date().getFullYear(),
  award_name: '',
  description: '',
  pdf_url: '',
};

const isManagedAwardFile = (url?: string | null): boolean => {
  if (!url) return false;
  return /\/awards\/(award|award-doc)-\d+-[a-f0-9]+\.(jpg|png|webp|pdf)$/i.test(url);
};

const getFreshAccessToken = async (): Promise<string | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  let session = sessionData.session;
  if (!session || (session.expires_at && session.expires_at * 1000 - Date.now() < 60000)) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session) {
      session = refreshed.session;
    }
  }
  return session?.access_token || null;
};

const deleteUploadedFile = async (url: string) => {
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
    console.warn('Could not delete file from server:', err);
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
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);

  const fetchAwards = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('ispb_awards')
      .select('*')
      .order('award_year', { ascending: false })
      .order('created_at', { ascending: false });
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
      [a.award_name, a.description, String(a.award_year)]
        .some((field) => (field || '').toLowerCase().includes(q))
    );
  }, [awards, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAwards.length / ADMIN_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAwards = useMemo(
    () => filteredAwards.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE),
    [filteredAwards, currentPage]
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openAdd = (year?: number) => {
    setEditing(null);
    const targetYear = year ?? new Date().getFullYear();
    setFormData({ ...emptyForm, award_year: targetYear });
    setIsDialogOpen(true);
  };

  const openEdit = (award: IspbAward) => {
    setEditing(award);
    setFormData({
      award_year: award.award_year,
      award_name: award.award_name || '',
      description: award.description || '',
      pdf_url: award.pdf_url || '',
    });
    setIsDialogOpen(true);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a genuine PDF file');
      input.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('PDF file must be smaller than 25MB');
      input.value = '';
      return;
    }

    setUploadingPdf(true);
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
        // Fallback for non-JSON response
      }

      if (!res.ok || !json.url) {
        const errorMsg =
          json.error ||
          (res.status === 404
            ? 'Upload service not reachable (404).'
            : res.status === 403
              ? 'Permission denied (403). Only admins can upload files.'
              : res.status === 401
                ? 'Authentication expired (401). Please sign in again.'
                : `Upload failed (HTTP ${res.status || 'unknown'})`);
        throw new Error(errorMsg);
      }

      // If user replaces a PDF uploaded in this modal session, clean up prior file
      if (formData.pdf_url && isManagedAwardFile(formData.pdf_url) && formData.pdf_url !== editing?.pdf_url) {
        deleteUploadedFile(formData.pdf_url);
      }

      setFormData((prev) => ({ ...prev, pdf_url: json.url }));
      toast.success('PDF document uploaded successfully');
    } catch (error: any) {
      console.error('Award PDF upload failed:', error);
      toast.error(error.message || 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
      input.value = '';
    }
  };

  const handleRemovePdf = () => {
    if (formData.pdf_url && isManagedAwardFile(formData.pdf_url) && formData.pdf_url !== editing?.pdf_url) {
      deleteUploadedFile(formData.pdf_url);
    }
    setFormData((prev) => ({ ...prev, pdf_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const year = Number(formData.award_year);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      toast.error('Please enter a valid year (1900–2200)');
      return;
    }
    if (!formData.award_name.trim()) {
      toast.error('Award name is required');
      return;
    }

    const rawPdfUrl = formData.pdf_url.trim();
    if (rawPdfUrl) {
      const isSafe =
        rawPdfUrl.startsWith('https://') ||
        rawPdfUrl.startsWith('http://') ||
        rawPdfUrl.startsWith('/');
      if (!isSafe) {
        toast.error('PDF URL must start with https://, http://, or /');
        return;
      }
    }

    // Automatically set is_active = true on submission
    const payload = {
      award_year: year,
      award_name: formData.award_name.trim(),
      description: formData.description.trim() || null,
      pdf_url: rawPdfUrl || null,
      is_active: true,
    };

    setSaving(true);
    try {
      const table = (supabase as any).from('ispb_awards');
      const { error } = editing
        ? await table.update(payload).eq('id', editing.id)
        : await table.insert(payload);
      if (error) throw error;

      // If an existing PDF was replaced or cleared, remove old file from server
      if (editing?.pdf_url && isManagedAwardFile(editing.pdf_url) && editing.pdf_url !== rawPdfUrl) {
        deleteUploadedFile(editing.pdf_url);
      }

      toast.success(editing ? 'Award updated and published' : 'Award added and published');
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
    const oldPdfUrl = deleting.pdf_url;
    try {
      const { error } = await (supabase as any).from('ispb_awards').delete().eq('id', deleting.id);
      if (error) throw error;

      if (oldPdfUrl && isManagedAwardFile(oldPdfUrl)) {
        deleteUploadedFile(oldPdfUrl);
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

  return (
    <div className="space-y-6">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">ISPB Awards Management</h2>
          <p className="text-sm text-gray-500 mt-1">Add, edit, and manage ISPB awards</p>
        </div>
        <Button
          id="add-award-btn"
          onClick={() => openAdd()}
          className="bg-[#0b1329] hover:bg-[#152243] text-white font-medium px-4 py-2 rounded-lg shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Award
        </Button>
      </div>

      {/* Search Input */}
      {awards.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="awards-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search awards by name, year or description..."
            className="pl-9 pr-9 bg-white border-gray-200 text-sm"
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

      {/* Main Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 divide-y divide-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-gray-100/60 rounded my-2" />
          ))}
        </div>
      ) : filteredAwards.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 bg-white">
          <AwardIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">
            {awards.length === 0 ? 'No awards created yet.' : `No awards match "${search}".`}
          </p>
          {awards.length === 0 ? (
            <Button onClick={() => openAdd()} className="bg-[#0b1329] hover:bg-[#152243] text-white">
              <Plus className="h-4 w-4 mr-2" /> Add the first award
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setSearch('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/60">
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="w-[50%] min-w-[260px] text-xs font-semibold uppercase tracking-wider text-gray-500 py-3.5 px-6">
                    Title
                  </TableHead>
                  <TableHead className="w-[15%] min-w-[100px] text-xs font-semibold uppercase tracking-wider text-gray-500 py-3.5 px-4">
                    Year
                  </TableHead>
                  <TableHead className="w-[15%] min-w-[100px] text-xs font-semibold uppercase tracking-wider text-gray-500 py-3.5 px-4">
                    Links
                  </TableHead>
                  <TableHead className="w-[20%] min-w-[120px] text-xs font-semibold uppercase tracking-wider text-gray-500 py-3.5 px-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedAwards.map((award) => (
                  <TableRow key={award.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    {/* Title + Short Description */}
                    <TableCell className="py-4 px-6 align-middle">
                      <div className="flex flex-col gap-1 pr-2">
                        <span className="font-semibold text-gray-900 leading-snug">
                          {award.award_name}
                        </span>
                        {award.description && (
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {award.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Year */}
                    <TableCell className="py-4 px-4 text-sm font-medium text-gray-700 align-middle">
                      {award.award_year}
                    </TableCell>

                    {/* Links (PDF link with icon matching screenshot) */}
                    <TableCell className="py-4 px-4 align-middle">
                      {award.pdf_url ? (
                        <a
                          href={award.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(award)}
                          className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          title="Edit award"
                          aria-label="Edit award"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleting(award)}
                          className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                          title="Delete award"
                          aria-label="Delete award"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Integrated Table Footer with Pagination */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/40">
            <AwardsPagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredAwards.length}
              pageSize={ADMIN_PAGE_SIZE}
              onPageChange={setPage}
              className="mt-0"
            />
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-600 text-white flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{editing ? 'Edit Award' : 'Add New Award'}</DialogTitle>
                <DialogDescription>
                  Enter award details, short description, and attached PDF document
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-5">
            <SectionTitle>Award Details</SectionTitle>
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
              <Label htmlFor="award_name">Award Name *</Label>
              <Input
                id="award_name"
                placeholder="e.g. ISPB Lifetime Achievement Award"
                value={formData.award_name}
                onChange={(e) => setFormData({ ...formData, award_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="award_description">Short Description</Label>
              <Textarea
                id="award_description"
                rows={3}
                placeholder="Brief summary or description about the award, eligibility, or recipients..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <SectionTitle>Award PDF Document</SectionTitle>
            <div className="space-y-3">
              {/* PDF file drop/upload */}
              <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50/40 p-4 text-center">
                {formData.pdf_url ? (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {formData.pdf_url.split('/').pop()}
                        </p>
                        <a
                          href={formData.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-green-700 hover:underline inline-flex items-center gap-1"
                        >
                          Preview PDF <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      onClick={handleRemovePdf}
                      aria-label="Remove PDF"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="award_pdf_upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-2 hover:opacity-90 transition-opacity"
                  >
                    <UploadCloud className="h-8 w-8 text-green-600 mb-1" />
                    <span className="text-sm font-semibold text-green-800">
                      {uploadingPdf ? 'Uploading PDF...' : 'Click to upload Award PDF'}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">PDF documents up to 25MB</span>
                  </label>
                )}
                <input
                  id="award_pdf_upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="award_pdf_url" className="text-xs text-gray-500">
                  Or paste PDF URL directly
                </Label>
                <Input
                  id="award_pdf_url"
                  type="text"
                  placeholder="https://..."
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploadingPdf} className="bg-green-600 hover:bg-green-700">
                {saving ? 'Saving...' : editing ? 'Update Award' : 'Add Award'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this award?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.award_name}" ({deleting?.award_year}) will be permanently removed. Any associated PDF file on the server will also be deleted. This cannot be undone.
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
