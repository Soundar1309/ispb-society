
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Calendar, CheckCircle, User, Edit, Save, X, Loader2 } from 'lucide-react';
import NotFound from '@/pages/NotFound';

const EnhancedMembershipPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [approvedApplication, setApprovedApplication] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    institution: '',
    designation: '',
    specialization: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        checkAccessAndFetchData();
      } else {
        setIsPageLoading(false);
      }
    }
  }, [user, authLoading]);

  const checkAccessAndFetchData = async () => {
    setIsPageLoading(true);
    try {
      // Fetch all necessary data in parallel
      const [roleRes, membershipsRes, plansRes, applicationRes] = await Promise.all([
        fetchUserRole(),
        fetchMemberships(),
        fetchMembershipPlans(),
        fetchApprovedApplication()
      ]);

      // Determine access inside the effect isn't ideal because state updates are async
      // But we can check the results directly here if we returned them from fetch functions
      // Refactoring fetch functions to return data would be cleaner, but for now 
      // rely on the state updates that will happen. 
      // ACTUALLY, to avoid flicker, we should verify access here before setting page loading to false.

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const fetchApprovedApplication = async () => {
    const { data } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user?.id)
      .eq('application_status', 'approved')
      .eq('payment_status', 'pending')
      .maybeSingle();

    if (data) {
      setApprovedApplication(data);
    }
    return data;
  };

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
    return data;
  };

  const fetchMemberships = async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user?.id)
      .in('payment_status', ['paid', 'manual'])
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setMemberships(data);
    }

    if (error) {
      console.error('Error fetching memberships:', error);
    }
    return data;
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
    return data;
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Access Control Check
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

  // Check if user has active membership or approved application
  const hasActiveMembership = memberships.length > 0;
  const hasApprovedApplication = !!approvedApplication;

  if (!hasActiveMembership && !hasApprovedApplication) {
    return <NotFound />;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-lg border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Welcome to the ISPB family.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Your membership has been activated successfully. You can now access all member benefits.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium">Transaction ID</p>
                <p className="text-green-700 font-mono text-sm break-all">
                  {approvedApplication?.razorpay_payment_id || 'Completed'}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
              onClick={() => {
                setShowSuccess(false);
                // Optionally redirect to dashboard or just show the active state
                window.location.href = '/dashboard'; // Assuming dashboard exists logic
              }}
            >
              Go to Dashboard
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
            {memberships.length > 0 && (
              <Card className="border-green-200 bg-green-50 mb-6">
                <CardHeader>
                  <CardTitle className="text-green-800">Membership Active</CardTitle>
                  <CardDescription className="text-green-700">
                    You already have an active <span className="font-medium capitalize">{memberships[0]?.membership_type}</span> membership.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {memberships.length === 0 && approvedApplication && (
              <Card className="border-green-200 bg-green-50 mb-6">
                <CardHeader>
                  <CardTitle className="text-green-800">Application Approved!</CardTitle>
                  <CardDescription className="text-green-700">Complete your payment to activate membership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Membership Type</p>
                        <p className="font-medium capitalize">{approvedApplication.membership_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{approvedApplication.amount}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePurchaseMembership(approvedApplication)}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Processing...' : `Complete Payment - ₹${approvedApplication.amount}`}
                  </Button>
                </CardContent>
              </Card>
            )}

            {memberships.length === 0 && !approvedApplication && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Apply for Membership</CardTitle>
                  <CardDescription className="text-blue-700">Submit your application to become an ISPB member</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">To become a member, you need to submit an application that will be reviewed by our membership committee.</p>
                  <Button asChild className="w-full">
                    <a href="/membership-application">Apply for Membership</a>
                  </Button>
                </CardContent>
              </Card>
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
