
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

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
          <div className="text-center">Loading office bearers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Office Bearers</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet our distinguished office bearers who guide the Indian Society of Plant Breeders
          </p>
        </div>

        {/* Office Bearers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {officeBearers.map((bearer) => (
            <Card key={bearer.id} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  {bearer.image_url ? (
                    <img
                      src={bearer.image_url}
                      alt={bearer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl font-bold">
                        {bearer.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {bearer.name}
                </h3>
                <p className="text-green-600 font-medium mb-2">
                  {bearer.designation}
                </p>
                {bearer.institution && (
                  <p className="text-gray-600 text-sm">
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
