import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Publication {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  journal?: string;
  year?: number;
  category?: string;
  status?: string;
  is_featured?: boolean;
  pdf_url?: string;
  pdf_file_url?: string;
  cover_image_url?: string;
  price?: number;
  link?: string;
}

interface AdminPublicationsTabProps {
  publications: Publication[];
  onRefresh: () => void;
}

const AdminPublicationsTab = ({ publications, onRefresh }: AdminPublicationsTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authors: '',
    journal: '',
    year: '',
    category: 'research',
    cover_image_url: '',
    price: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      authors: '',
      journal: '',
      year: '',
      category: 'research',
      cover_image_url: '',
      price: ''
    });
    setPdfFile(null);
    setUploadProgress(0);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size should be less than 50MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let pdfFileUrl = editingPublication?.pdf_file_url || '';

      // Upload PDF file if selected
      if (pdfFile) {
        const fileExt = 'pdf';
        const fileName = `${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('publications')
          .upload(filePath, pdfFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload PDF file');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('publications')
          .getPublicUrl(filePath);

        pdfFileUrl = urlData.publicUrl;
        setUploadProgress(100);
      }

      const publicationData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        pdf_file_url: pdfFileUrl,
        status: 'published',
        is_featured: false
      };

      if (editingPublication) {
        const { error } = await supabase
          .from('publications')
          .update(publicationData)
          .eq('id', editingPublication.id);

        if (error) throw error;
        toast.success('Publication updated successfully');
        setEditingPublication(null);
      } else {
        const { error } = await supabase
          .from('publications')
          .insert(publicationData);

        if (error) throw error;
        toast.success('Publication added successfully');
        setIsAddDialogOpen(false);
      }

      resetForm();
      onRefresh();
    } catch (error: unknown) {
      console.error('Error saving publication:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Error saving publication: ' + message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setFormData({
      title: publication.title,
      description: publication.description || '',
      authors: publication.authors || '',
      journal: publication.journal || '',
      year: publication.year?.toString() || '',
      category: publication.category || 'research',
      cover_image_url: publication.cover_image_url || '',
      price: publication.price?.toString() || ''
    });
    setPdfFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Publication deleted successfully');
      onRefresh();
    } catch (error: unknown) {
      console.error('Error deleting publication:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Error deleting publication: ' + message);
    }
  };

  const PublicationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Title *</label>
              <Input
                placeholder="Publication Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <Textarea
                placeholder="Publication Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Publication Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">Publication Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Authors</label>
              <Input
                placeholder="Author names"
                value={formData.authors}
                onChange={(e) => handleInputChange('authors', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Journal</label>
              <Input
                placeholder="Journal name"
                value={formData.journal}
                onChange={(e) => handleInputChange('journal', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Year</label>
              <Input
                type="number"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="research">Research</option>
                <option value="review">Review</option>
                <option value="book">Book</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media & Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">Media & Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Cover Image URL</label>
              <Input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={formData.cover_image_url}
                onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="500.00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* PDF Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">PDF Document</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Upload PDF File *</label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {pdfFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {editingPublication?.pdf_file_url && !pdfFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ PDF file already uploaded
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (editingPublication) {
              setEditingPublication(null);
            } else {
              setIsAddDialogOpen(false);
            }
            resetForm();
          }}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingPublication ? 'Update Publication' : 'Add Publication'}
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Publication Management</CardTitle>
            <CardDescription>Add, edit, and manage publications</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Publication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Publication</DialogTitle>
                <DialogDescription>Create a new publication</DialogDescription>
              </DialogHeader>
              <PublicationForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {publications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No publications found. Add your first publication!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[150px]">Authors</TableHead>
                  <TableHead className="min-w-[100px]">Year</TableHead>
                  <TableHead className="min-w-[100px]">Price</TableHead>
                  <TableHead className="min-w-[100px]">Links</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((publication) => (
                  <TableRow key={publication.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{publication.title}</span>
                        {publication.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{publication.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{publication.authors || 'N/A'}</TableCell>
                    <TableCell>{publication.year || 'N/A'}</TableCell>
                    <TableCell>
                      {publication.price ? `₹${publication.price}` : 'Free'}
                    </TableCell>
                     <TableCell>
                      <div className="flex flex-col gap-1">
                        {publication.pdf_file_url && (
                          <a 
                            href={publication.pdf_file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            PDF
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(publication)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(publication.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {editingPublication && (
          <Dialog open={!!editingPublication} onOpenChange={(open) => { if (!open) setEditingPublication(null); }}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Publication</DialogTitle>
                <DialogDescription>Update publication details</DialogDescription>
              </DialogHeader>
              <PublicationForm />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPublicationsTab;
