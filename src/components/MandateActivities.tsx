
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  display_order: number;
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

  const congresses = [
    {
      year: "2023",
      title: "15th ISPB Congress",
      theme: "Climate-Smart Plant Breeding for Sustainable Agriculture",
      location: "Hyderabad, India",
      participants: "450+ Delegates"
    },
    {
      year: "2021",
      title: "14th ISPB Congress",
      theme: "Genomics-Assisted Plant Breeding for Future Food Security",
      location: "Virtual Conference",
      participants: "600+ Delegates"
    },
    {
      year: "2019",
      title: "13th ISPB Congress",
      theme: "Plant Breeding Innovations for Nutritional Security",
      location: "Pune, India",
      participants: "520+ Delegates"
    },
    {
      year: "2017",
      title: "12th ISPB Congress",
      theme: "Harnessing Genetic Diversity for Crop Improvement",
      location: "Bhubaneswar, India",
      participants: "480+ Delegates"
    },
    {
      year: "2015",
      title: "11th ISPB Congress",
      theme: "Plant Breeding for Abiotic Stress Tolerance",
      location: "Coimbatore, India",
      participants: "400+ Delegates"
    },
    {
      year: "2013",
      title: "10th ISPB Congress",
      theme: "Molecular Plant Breeding: Challenges and Opportunities",
      location: "New Delhi, India",
      participants: "380+ Delegates"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mandate & Activities</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our mission-driven activities and initiatives that advance plant breeding science 
            and support the professional community in India.
          </p>
        </div>

        {/* Mandate Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mandate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mandates.map((mandate) => (
              <Card key={mandate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">{mandate.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{mandate.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Congress History */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">ISPB Congress History</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-6">
              {congresses.map((congress, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 py-4">
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{congress.title}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {congress.year}
                    </span>
                  </div>
                  <p className="text-lg text-green-600 font-medium mb-2">{congress.theme}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📍 {congress.location}</span>
                    <span>👥 {congress.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-green-600">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{activity.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg mb-6 opacity-90">
            Be part of India's premier plant breeding community and contribute to agricultural innovation.
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Become a Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandateActivities;
