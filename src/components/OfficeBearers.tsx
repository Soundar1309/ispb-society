import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface OfficeBearer {
  id: string;
  name: string;
  designation: string;
  institution: string;
  image_url: string;
  display_order: number;
}

const OfficeBearers = () => {
  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficeBearers();
  }, []);

  const fetchOfficeBearers = async () => {
    try {
      const { data, error } = await supabase
        .from('office_bearers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setOfficeBearers(data || []);
    } catch (error) {
      console.error('Error fetching office bearers:', error);
      toast.error('Error loading office bearers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Office Bearers</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Meet our distinguished office bearers who guide the Indian Society of Plant Breeders
            </p>
          </div>
          <LoadingSkeleton variant="profile" count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-12 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Office Bearers</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Meet our distinguished office bearers who guide the Indian Society of Plant Breeders
          </p>
        </div>

        {/* Office Bearers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
          {officeBearers.map((bearer) => (
            <Card key={bearer.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-[4/5] w-full overflow-hidden bg-gray-200 relative">
                {bearer.image_url ? (
                  <img
                    src={bearer.image_url}
                    alt={bearer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-6xl font-bold">
                      {bearer.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-6 text-center bg-white relative z-10">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {bearer.name}
                </h3>
                <p className="text-green-600 font-semibold mb-2 text-sm sm:text-base">
                  {bearer.designation}
                </p>
                {bearer.institution && (
                  <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">
                    {bearer.institution}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficeBearers;
