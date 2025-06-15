
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, FileText, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Conference {
  id: string;
  title: string;
  description: string;
  venue: string;
  date_from: string;
  date_to: string;
  registration_fee: number;
  early_bird_fee: number;
  early_bird_deadline: string;
  is_active: boolean;
  image_url?: string;
}

const Conference = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('is_active', true)
        .order('date_from', { ascending: true });

      if (error) {
        console.error('Error fetching conferences:', error);
      } else {
        setConferences(data || []);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const isEarlyBirdValid = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) > new Date();
  };

  const getUpcomingConferences = () => {
    const now = new Date();
    return conferences.filter(conf => new Date(conf.date_from) > now);
  };

  const getPastConferences = () => {
    const now = new Date();
    return conferences.filter(conf => new Date(conf.date_to) < now);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conferences...</p>
        </div>
      </div>
    );
  }

  const upcomingConferences = getUpcomingConferences();
  const pastConferences = getPastConferences();

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conferences & Events</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our upcoming conferences, workshops, and past events that bring together 
            the plant breeding community for knowledge sharing and networking.
          </p>
        </div>

        {/* Upcoming Conferences */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Conferences</h2>
          {upcomingConferences.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Conferences</h3>
              <p className="text-gray-600">Check back soon for new conference announcements.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {upcomingConferences.map((conference) => (
                <div key={conference.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{conference.title}</h3>
                        {conference.description && (
                          <p className="text-lg opacity-90">{conference.description}</p>
                        )}
                      </div>
                      <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                        Registration Open
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Date & Time</h4>
                          <p className="text-gray-700">
                            {formatDate(conference.date_from)} - {formatDate(conference.date_to)}
                          </p>
                        </div>
                      </div>
                      {conference.venue && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                            <p className="text-gray-700">{conference.venue}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Registration Fee</h4>
                          <p className="text-gray-700">
                            Regular: ₹{conference.registration_fee}
                            {conference.early_bird_fee && isEarlyBirdValid(conference.early_bird_deadline) && (
                              <span className="block text-green-600 font-medium">
                                Early Bird: ₹{conference.early_bird_fee}
                              </span>
                            )}
                          </p>
                          {conference.early_bird_deadline && isEarlyBirdValid(conference.early_bird_deadline) && (
                            <p className="text-sm text-gray-500">
                              Early bird until: {formatDate(conference.early_bird_deadline)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Register Now
                      </Button>
                      <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        View Details
                      </Button>
                      <Button variant="outline">
                        Download Brochure
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Conferences */}
        {pastConferences.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Past Conferences</h2>
            <div className="space-y-6">
              {pastConferences.map((conference) => (
                <div key={conference.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-grow mb-4 lg:mb-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{conference.title}</h3>
                      {conference.description && (
                        <p className="text-green-600 font-medium mb-2">{conference.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(conference.date_from)} - {formatDate(conference.date_to)}
                        </span>
                        {conference.venue && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {conference.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium text-center">
                        Conference Completed
                      </span>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        View Archive →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call for Papers - Only show if there are upcoming conferences */}
        {upcomingConferences.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Call for Papers</h2>
            <p className="text-lg mb-6 opacity-90">
              Submit your research abstracts and be part of our upcoming conferences.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Abstract Submission</h3>
                <p className="text-sm opacity-90">Open for submissions</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Full Paper Submission</h3>
                <p className="text-sm opacity-90">Detailed guidelines available</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Poster Presentation</h3>
                <p className="text-sm opacity-90">On-site registration available</p>
              </div>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Submit Abstract
            </Button>
          </div>
        )}

        {/* Empty State */}
        {conferences.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Conferences Available</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on organizing exciting conferences for the plant breeding community. 
              Check back soon for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conference;
