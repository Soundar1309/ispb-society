
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Calendar, CheckCircle, User, Edit, Save, X } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EnhancedMembershipPage = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    institution: '',
    designation: '',
    specialization: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchMemberships();
      fetchMembershipPlans();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setUserRole(data);
      setProfileData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        institution: data.institution || '',
        designation: data.designation || '',
        specialization: data.specialization || ''
      });
    }

    if (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchMemberships = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user?.id)
      .in('payment_status', ['paid', 'active', 'manual'])
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setMemberships(data);
    }

    if (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  const fetchMembershipPlans = async () => {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (data) {
      setMembershipPlans(data);
    }

    if (error) {
      console.error('Error fetching membership plans:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchUserRole();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchaseMembership = async (plan: any) => {
    if (memberships.length > 0) {
      toast.error('You already have an active membership');
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          membershipPlanId: plan.plan_type,
          amount: plan.price
        }
      });

      if (orderError || !orderData) {
        throw new Error('Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ISPB Membership',
        description: plan.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                membershipId: orderData.membershipId
              }
            });

            if (verifyError) {
              throw new Error('Payment verification failed');
            }

            toast.success('Membership activated successfully!');
            fetchMemberships();
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: userRole?.full_name || '',
          email: user?.email || '',
          contact: userRole?.phone || ''
        },
        theme: {
          color: '#22c55e'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'manual':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access membership features.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Membership Portal</h1>
          <p className="text-lg text-gray-600">Manage your ISPB membership and profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="text-gray-900">{userRole?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-gray-900">{userRole?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Institution</Label>
                      <p className="text-gray-900">{userRole?.institution || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Designation</Label>
                      <p className="text-gray-900">{userRole?.designation || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Specialization</Label>
                      <p className="text-gray-900">{userRole?.specialization || 'Not provided'}</p>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={profileData.institution}
                        onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={profileData.designation}
                        onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Current Memberships */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Active Memberships
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberships.length > 0 ? (
                  <div className="space-y-3">
                    {memberships.map((membership) => (
                      <div key={membership.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium capitalize">{membership.membership_type}</h3>
                          <Badge className={getStatusColor(membership.status)}>
                            {membership.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Amount: ₹{membership.amount}</p>
                          {membership.valid_from && membership.valid_until ? (
                            <p>Valid: {membership.valid_from} to {membership.valid_until}</p>
                          ) : membership.valid_from ? (
                            <p>Valid from: {membership.valid_from}</p>
                          ) : (
                            <p>Lifetime membership</p>
                          )}
                          {membership.is_manual && (
                            <p className="text-blue-600">Admin added membership</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No active memberships</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Membership Plans Section */}
          <div className="lg:col-span-2">
            {memberships.length === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Membership</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {membershipPlans.map((plan) => (
                    <Card key={plan.id} className="relative">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {plan.title}
                        </CardTitle>
                        <CardDescription>
                          {plan.duration_months > 0 ? `${plan.duration_months} months` : 'Lifetime'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-green-600">
                          ₹{plan.price}
                          {plan.duration_months > 0 && (
                            <span className="text-sm text-gray-500">
                              /{plan.duration_months > 12 ? 'year' : `${plan.duration_months}mo`}
                            </span>
                          )}
                        </div>
                        
                        <ul className="space-y-2">
                          {plan.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          onClick={() => handlePurchaseMembership(plan)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? 'Processing...' : `Purchase ₹${plan.price}`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Member Benefits */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Member Benefits</CardTitle>
                <CardDescription>Exclusive advantages of ISPB membership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Conference Access</h3>
                    <p className="text-sm text-gray-600">Priority registration and discounted rates for all ISPB conferences</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Digital Resources</h3>
                    <p className="text-sm text-gray-600">Access to journals, publications, and technical resources</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Professional Network</h3>
                    <p className="text-sm text-gray-600">Connect with plant breeding experts and researchers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMembershipPage;
