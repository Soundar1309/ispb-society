
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from './Header';
import { Button } from './ui/button';

interface ContentItem {
  id: string;
  title: string | null;
  content: string;
  display_order: number;
  year?: number | null;
  is_active: boolean;
}

const MandateActivities = () => {
  const [mandates, setMandates] = useState<ContentItem[]>([]);
  const [activities, setActivities] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch mandates
      const { data: mandatesData, error: mandatesError } = await supabase
        .from('mandates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (mandatesError) {
        console.error('Error fetching mandates:', mandatesError);
      } else {
        setMandates(mandatesData || []);
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Mandate Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Our Mandate
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-green-50 to-orange-50 mx-auto rounded-full" />
            </div>
            
            <div className="space-y-6">
              {mandates.map((mandate) => (
                <div key={mandate.id} className="relative overflow-hidden bg-white p-6 md:p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-green-600" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4 mb-2">
                    {mandate.title && (
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug tracking-tight">{mandate.title}</h2>
                    )}
                    {mandate.year && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-emerald-200">
                        {mandate.year}
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-3" />
                  <div 
                    className="mt-1 text-gray-700 leading-relaxed prose prose-sm max-w-none text-justify prose-a:text-emerald-700 prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: mandate.content }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Activities Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Activities
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-green-50 to-orange-50 mx-auto rounded-full" />
            </div>
            
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="relative overflow-hidden bg-white p-6 md:p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-green-600" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4 mb-2">
                    {activity.title && (
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug tracking-tight">{activity.title}</h3>
                    )}
                    {activity.year && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-emerald-200">
                        {activity.year}
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mb-3" />
                  <div 
                    className="mt-1 text-gray-700 leading-relaxed prose prose-sm max-w-none text-justify prose-a:text-emerald-700 prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: activity.content }}
                  />
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>

      {/* CTA Section - full width across viewport */}
      <section aria-labelledby="cta-title">
        <div className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-10 md:py-12">
          <div className="text-center">
            <h3 id="cta-title" className="text-2xl font-bold mb-3 md:mb-4">Join Our Mission</h3>
            <p className="mb-6 max-w-3xl mx-auto text-emerald-50 px-4">
              Be part of India's premier plant breeding community and contribute to agricultural innovation.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-emerald-50 rounded-full px-5 md:px-6 py-2 shadow-sm"
              >
                Become a Member
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MandateActivities;