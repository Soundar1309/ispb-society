
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryItem {
  id: string;
  image_url: string;
  display_order: number;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('id, image_url, display_order')
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
    <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-12">Gallery</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our visual collection of events, activities, and memorable moments
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">Gallery is currently empty.</p>
            </div>
          ) : (
            galleryItems.map((item) => (
              <div key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image_url}
                    alt="Gallery image"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
