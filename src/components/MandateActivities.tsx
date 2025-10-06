
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from './Header';
import Footer from './Footer';
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mandate Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Our Mandate
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full" />
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6">
              {mandates.map((mandate) => (
                <div key={mandate.id} className="bg-card p-8 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all">
                  {mandate.title && (
                    <h2 className="text-2xl font-semibold text-primary mb-4">{mandate.title}</h2>
                  )}
                  {mandate.year && (
                    <p className="text-sm text-muted-foreground mb-4">Year: {mandate.year}</p>
                  )}
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: mandate.content }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Activities Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Our Activities
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full" />
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-card p-8 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all">
                  {activity.title && (
                    <h3 className="text-2xl font-semibold text-primary mb-4">{activity.title}</h3>
                  )}
                  {activity.year && (
                    <p className="text-sm text-muted-foreground mb-4">Year: {activity.year}</p>
                  )}
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.content }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-12 rounded-2xl border border-primary/20">
              <h3 className="text-2xl font-bold text-primary mb-4">
                Join Our Mission
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Be part of India's premier plant biology community and contribute to advancing research and education.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Become a Member
              </Button>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MandateActivities;