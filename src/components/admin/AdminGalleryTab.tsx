
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GalleryItem {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface AdminGalleryTabProps {
  galleryItems: GalleryItem[];
  onRefresh: () => void;
}

const AdminGalleryTab = ({ galleryItems, onRefresh }: AdminGalleryTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    image_file: null as File | null,
    display_order: 1
  });
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      image_file: null,
      display_order: 1
    });
    setEditingItem(null);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      image_file: null,
      display_order: item.display_order || 1
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_file && !editingItem) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      let imageUrl = editingItem?.image_url || '';
      
      // Upload new image if provided
      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, formData.image_file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);
        
        imageUrl = data.publicUrl;
      }
      
      if (editingItem) {
        const { error } = await supabase
          .from('gallery')
          .update({
            image_url: imageUrl,
            display_order: formData.display_order
          })
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast.success('Gallery item updated successfully');
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert({
            image_url: imageUrl,
            title: '',
            display_order: formData.display_order
          });
        
        if (error) throw error;
        toast.success('Gallery item added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving gallery item:', error);
      toast.error(error.message || 'Error saving gallery item');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Gallery item deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting gallery item:', error);
      toast.error(error.message || 'Error deleting gallery item');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Gallery item ${!isActive ? 'activated' : 'deactivated'} successfully`);
      onRefresh();
    } catch (error: any) {
      console.error('Error updating gallery item:', error);
      toast.error(error.message || 'Error updating gallery item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update gallery item details' : 'Add a new image to the gallery'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="image_file">
                  {editingItem ? 'Upload New Image (optional)' : 'Upload Image *'}
                </Label>
                <Input
                  id="image_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image_file: e.target.files?.[0] || null })}
                  required={!editingItem}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, WEBP
                </p>
              </div>
              
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : editingItem ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={item.image_url}
                alt="Gallery item"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order: {item.display_order}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className={item.is_active ? '' : 'text-red-600'}
                  >
                    {item.is_active ? 'Active' : 'Hidden'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGalleryTab;
