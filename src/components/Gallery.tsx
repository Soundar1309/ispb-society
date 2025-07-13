
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Image, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  category_id: string;
  display_order: number;
  image_size?: string;
  file_format?: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  display_order: number;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category_id: '',
    image_file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchGalleryItems();
    fetchCategories();
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [galleryItems, searchTerm, categoryFilter]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          gallery_categories!gallery_category_id_fkey(name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error('Error loading gallery');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = galleryItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category_id === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const handleImageUpload = async () => {
    if (!uploadData.title || !uploadData.category_id || !uploadData.image_file) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate file format
    const allowedFormats = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedFormats.includes(uploadData.image_file.type)) {
      toast.error('Only PNG, JPG, and JPEG files are allowed');
      return;
    }

    setIsUploading(true);
    try {
      // Create a simple data URL for the image (in a real app, you'd upload to storage)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        const { error } = await supabase
          .from('gallery')
          .insert({
            title: uploadData.title,
            description: uploadData.description,
            image_url: imageUrl, // In production, use proper file storage
            category_id: uploadData.category_id,
            image_size: '405x256',
            file_format: uploadData.image_file!.type.split('/')[1]
          });

        if (error) throw error;

        toast.success('Image uploaded successfully!');
        setShowUpload(false);
        setUploadData({
          title: '',
          description: '',
          category_id: '',
          image_file: null
        });
        fetchGalleryItems();
      };
      reader.readAsDataURL(uploadData.image_file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading gallery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore our visual collection of events, activities, and memorable moments
              </p>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setShowUpload(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 capitalize">
                      {categories.find(cat => cat.id === item.category_id)?.name || 'General'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Enter image title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Enter image description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={uploadData.category_id} onValueChange={(value) => setUploadData({ ...uploadData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Image File *</Label>
                <Input
                  id="image"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => setUploadData({ ...uploadData, image_file: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 405 × 256 px. Formats: PNG, JPG, JPEG
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpload(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;
