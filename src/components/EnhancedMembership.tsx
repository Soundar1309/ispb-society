import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PaymentIntegration from './PaymentIntegration';
import MembershipCancellation from './MembershipCancellation';
import NotFound from '@/pages/NotFound';

const EnhancedMembership = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [approvedApplication, setApprovedApplication] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
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
      await Promise.all([
        fetchUserRole(),
        fetchMemberships(),
        fetchApprovedApplication()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    return data;
  };

  const fetchMemberships = async () => {
    // Include manual memberships in the query and fetch member_code
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
    return data;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('user_roles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Error updating profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchUserRole();
    }
  };

  const handleMembershipCancellation = () => {
    fetchMemberships(); // Refresh memberships after cancellation
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

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

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

  // Access Control Check
  const hasActiveMembership = memberships.length > 0;
  const hasApprovedApplication = !!approvedApplication;

  if (!hasActiveMembership && !hasApprovedApplication) {
    return <NotFound />;
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
                <CardTitle>Your Profile</CardTitle>
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
                      <Button type="submit" className="flex-1">Save</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Membership Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Active Membership Status</CardTitle>
                <CardDescription>Your current active memberships</CardDescription>
              </CardHeader>
              <CardContent>
                {memberships.length > 0 ? (
                  <div className="space-y-3">
                    {memberships.map((membership) => (
                      <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium capitalize">{membership.membership_type}</p>
                            {membership.member_code && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-mono">
                                <Hash className="h-3 w-3" />
                                {membership.member_code}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {membership.valid_from && membership.valid_until
                              ? `${membership.valid_from} to ${membership.valid_until}`
                              : 'Pending activation'
                            }
                          </p>
                          {membership.is_manual && (
                            <p className="text-xs text-blue-600">Admin added membership</p>
                          )}
                          {membership.membership_type === 'lifetime' && (
                            <p className="text-xs text-yellow-600">Lifetime membership - Valid until auto-renewed annually</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(membership.status)}>
                            {membership.status}
                          </Badge>
                          {membership.status === 'active' && (
                            <MembershipCancellation
                              membershipId={membership.id}
                              membershipType={membership.membership_type}
                              onCancellationSuccess={handleMembershipCancellation}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active memberships</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Integration Section */}
          <div className="lg:col-span-2">
            <PaymentIntegration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMembership;
