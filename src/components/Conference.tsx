import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, FileText, DollarSign, ExternalLink, User, Mail, Phone, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton, PageLoader } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface Conference {
  id: string;
  title: string;
  description: string;
  venue: string;
  date_from: string;
  date_to: string;
  fee: number;
  is_active: boolean;
  image_url?: string;
  link?: string;
  deadline?: string;
  registration_required?: boolean;
  attachment_url?: string;
  registration_form_url?: string;
}

const Conference = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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

  const handleRegisterClick = (conference: Conference) => {
    setSelectedConference(conference);
    setRegistrationData({
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      institution: ''
    });
    setShowRegistration(true);
  };

  const handleRegistrationSubmit = async () => {
    if (!selectedConference || !registrationData.name || !registrationData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationPayload = {
        conference_id: selectedConference.id,
        user_id: user?.id || null,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        institution: registrationData.institution,
        amount_paid: selectedConference.fee,
        payment_status: selectedConference.fee ? 'pending' : 'completed'
      };

      const { error } = await supabase
        .from('conference_registrations')
        .insert(registrationPayload);

      if (error) throw error;

      if (selectedConference.fee && selectedConference.fee > 0) {
        toast.success('Registration initiated. Proceeding to payment...');
      } else {
        toast.success('Registration completed successfully!');
        setShowRegistration(false);
        setSelectedConference(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Conferences & Events</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our upcoming conferences, workshops, and past events
            </p>
          </div>
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 p-6">
                  <Skeleton className="h-8 w-2/3 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                          {conference.deadline && (
                            <p className="text-red-600 text-sm font-medium">
                              Registration Deadline: {formatDate(conference.deadline)}
                            </p>
                          )}
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
                      {conference.fee && conference.fee > 0 && (
                        <div className="flex items-start space-x-3">
                          <DollarSign className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Registration Fee</h4>
                            <p className="text-gray-700">₹{conference.fee}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {conference.registration_required ? (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleRegisterClick(conference)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Register Now
                        </Button>
                      ) : conference.link && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(conference.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )}
                      {conference.attachment_url && (
                        <Button 
                          variant="outline"
                          onClick={() => window.open(conference.attachment_url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download Attachment
                        </Button>
                      )}
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

        {/* Registration Dialog */}
        <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register for {selectedConference?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={registrationData.phone}
                  onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={registrationData.institution}
                  onChange={(e) => setRegistrationData({ ...registrationData, institution: e.target.value })}
                  placeholder="Enter your institution"
                />
              </div>
              {selectedConference?.fee && selectedConference.fee > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Registration Fee: ₹{selectedConference.fee}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    You will be redirected to payment gateway after registration
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistration(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegistrationSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Conference;
