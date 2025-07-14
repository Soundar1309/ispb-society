import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  institution: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface AdminOfficeBearersTabProps {
  officeBearers: OfficeBearer[];
  onRefresh: () => void;
}

const AdminOfficeBearersTab = ({ officeBearers, onRefresh }: AdminOfficeBearersTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBearer, setEditingBearer] = useState<OfficeBearer | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    institution: '',
    image_url: '',
    display_order: 1
  });

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      institution: '',
      image_url: '',
      display_order: 1
    });
    setEditingBearer(null);
    setPreviewUrl('');
  };

  const handleEdit = (bearer: OfficeBearer) => {
    setEditingBearer(bearer);
    setFormData({
      name: bearer.name || '',
      designation: bearer.designation || '',
      institution: bearer.institution || '',
      image_url: bearer.image_url || '',
      display_order: bearer.display_order || 1
    });
    setPreviewUrl(bearer.image_url || '');
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload only PNG, JPG, or JPEG images');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `office-bearer-${Date.now()}.${fileExt}`;

      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        // For now, we'll use the base64 data URL directly
        // In a production environment, you'd upload to Supabase Storage
        setPreviewUrl(base64Data);
        setFormData(prev => ({ ...prev, image_url: base64Data }));
        toast.success('Image uploaded successfully');
        setUploading(false);
      };
      
      reader.onerror = () => {
        toast.error('Error reading file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBearer) {
        const { error } = await supabase
          .from('office_bearers')
          .update(formData)
          .eq('id', editingBearer.id);
        
        if (error) throw error;
        toast.success('Office bearer updated successfully');
      } else {
        const { error } = await supabase
          .from('office_bearers')
          .insert(formData);
        
        if (error) throw error;
        toast.success('Office bearer added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving office bearer:', error);
      toast.error(error.message || 'Error saving office bearer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office bearer?')) return;
    
    try {
      const { error } = await supabase
        .from('office_bearers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Office bearer deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting office bearer:', error);
      toast.error(error.message || 'Error deleting office bearer');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('office_bearers')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Office bearer ${!isActive ? 'activated' : 'deactivated'} successfully`);
      onRefresh();
    } catch (error: any) {
      console.error('Error updating office bearer:', error);
      toast.error(error.message || 'Error updating office bearer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Office Bearers Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Office Bearer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBearer ? 'Edit Office Bearer' : 'Add New Office Bearer'}
              </DialogTitle>
              <DialogDescription>
                {editingBearer ? 'Update office bearer details' : 'Add a new office bearer'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
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

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Profile Image</Label>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpg,image/jpeg"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG only. Max 5MB.
                  </p>
                </div>

                {/* Manual URL Input */}
                <div>
                  <Label htmlFor="image_url">Or enter image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {editingBearer ? 'Update' : 'Add'} Office Bearer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {officeBearers.map((bearer) => (
          <Card key={bearer.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  {bearer.image_url && (
                    <img
                      src={bearer.image_url}
                      alt={bearer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{bearer.name}</CardTitle>
                    <CardDescription>{bearer.designation}</CardDescription>
                    {bearer.institution && (
                      <p className="text-sm text-gray-600">{bearer.institution}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(bearer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(bearer.id, bearer.is_active)}
                    className={bearer.is_active ? '' : 'text-red-600'}
                  >
                    {bearer.is_active ? 'Active' : 'Hidden'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(bearer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Display Order: {bearer.display_order}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOfficeBearersTab;
