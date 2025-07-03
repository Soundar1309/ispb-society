
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Publication {
  id: string;
  title: string;
  authors: string;
  description: string;
  year: number;
  pdf_url: string;
  category: string;
  status: string;
  is_featured: boolean;
}

interface AdminPublicationsTabProps {
  publications: Publication[];
  onRefresh: () => void;
}

const AdminPublicationsTab = ({ publications, onRefresh }: AdminPublicationsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    year: new Date().getFullYear(),
    pdf_url: '',
    category: 'research',
    status: 'published',
    is_featured: false
  });

  const resetForm = () => {
    setFormData({
      title: '',
      authors: '',
      description: '',
      year: new Date().getFullYear(),
      pdf_url: '',
      category: 'research',
      status: 'published',
      is_featured: false
    });
    setEditingPublication(null);
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setFormData({
      title: publication.title || '',
      authors: publication.authors || '',
      description: publication.description || '',
      year: publication.year || new Date().getFullYear(),
      pdf_url: publication.pdf_url || '',
      category: publication.category || 'research',
      status: publication.status || 'published',
      is_featured: publication.is_featured || false
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPublication) {
        const { error } = await supabase
          .from('publications')
          .update(formData)
          .eq('id', editingPublication.id);
        
        if (error) throw error;
        toast.success('Publication updated successfully');
      } else {
        const { error } = await supabase
          .from('publications')
          .insert(formData);
        
        if (error) throw error;
        toast.success('Publication added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving publication:', error);
      toast.error(error.message || 'Error saving publication');
    }
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
      toast.error(error.message || 'Error deleting publication');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Publications Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPublication ? 'Edit Publication' : 'Add New Publication'}
              </DialogTitle>
              <DialogDescription>
                {editingPublication ? 'Update publication details' : 'Add a new publication to the database'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="authors">Authors *</Label>
                  <Textarea
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the publication"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="editorial">Editorial</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="pdf_url">PDF URL *</Label>
                  <Input
                    id="pdf_url"
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://example.com/publication.pdf"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Publication</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPublication ? 'Update' : 'Add'} Publication
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {publications.map((publication) => (
          <Card key={publication.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{publication.title}</CardTitle>
                  <CardDescription>{publication.authors}</CardDescription>
                  {publication.description && (
                    <CardDescription className="mt-2 text-sm">{publication.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {publication.is_featured && <Badge variant="secondary">Featured</Badge>}
                  <Badge variant="outline">{publication.category}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(publication)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(publication.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 flex items-center justify-between">
                <div>
                  <p><strong>Year:</strong> {publication.year}</p>
                </div>
                {publication.pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(publication.pdf_url, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPublicationsTab;
