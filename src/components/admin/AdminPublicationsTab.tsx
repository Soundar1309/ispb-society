
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
    price: '',
    link: '',
    pdf_url: '',
    pdf_file_url: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      authors: '',
      journal: '',
      year: '',
      category: 'research',
      cover_image_url: '',
      price: '',
      link: '',
      pdf_url: '',
      pdf_file_url: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const publicationData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        price: formData.price ? parseFloat(formData.price) : null,
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
    } catch (error: any) {
      console.error('Error saving publication:', error);
      toast.error('Error saving publication: ' + error.message);
    } finally {
      setIsSubmitting(false);
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
      price: publication.price?.toString() || '',
      link: publication.link || '',
      pdf_url: publication.pdf_url || '',
      pdf_file_url: publication.pdf_file_url || ''
    });
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
    } catch (error: any) {
      console.error('Error deleting publication:', error);
      toast.error('Error deleting publication: ' + error.message);
    }
  };

  const PublicationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Title *</label>
          <Input
            placeholder="Publication Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Publication Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Authors</label>
          <Input
            placeholder="Author names"
            value={formData.authors}
            onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Journal</label>
          <Input
            placeholder="Journal name"
            value={formData.journal}
            onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Year</label>
          <Input
            type="number"
            placeholder="2024"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="research">Research</option>
            <option value="review">Review</option>
            <option value="book">Book</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Cover Image URL (Optional)</label>
          <Input
            type="url"
            placeholder="https://example.com/cover.jpg"
            value={formData.cover_image_url}
            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Price (₹) (Optional)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="500.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Buy Link (Optional)</label>
          <Input
            type="url"
            placeholder="https://store.example.com/publication"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">PDF URL (Optional)</label>
          <Input
            type="url"
            placeholder="https://example.com/publication.pdf"
            value={formData.pdf_url}
            onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">PDF File URL (Optional)</label>
          <Input
            type="url"
            placeholder="https://example.com/files/publication.pdf"
            value={formData.pdf_file_url}
            onChange={(e) => setFormData({ ...formData, pdf_file_url: e.target.value })}
          />
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
                        {publication.link && (
                          <a 
                            href={publication.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Buy Link
                          </a>
                        )}
                        {publication.pdf_url && (
                          <a 
                            href={publication.pdf_url} 
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
          <Dialog open={!!editingPublication} onOpenChange={() => setEditingPublication(null)}>
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
