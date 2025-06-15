import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, CreditCard, Calendar, Edit, Save } from 'lucide-react';
import MembershipCancellation from './MembershipCancellation';

const UserDashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<any>(null);
  const [memberships, setMemberships] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    institution: '',
    designation: '',
    specialization: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    console.log('Fetching user data for:', user.id);

    // Fetch user role data (which now contains profile info)
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userRoleError) {
      console.error('Error fetching user role:', userRoleError);
    }

    if (userRoleData) {
      console.log('Fetched user role data:', userRoleData);
      setUserRole(userRoleData);
      setEditForm({
        full_name: userRoleData.full_name || '',
        phone: userRoleData.phone || '',
        institution: userRoleData.institution || '',
        designation: userRoleData.designation || '',
        specialization: userRoleData.specialization || ''
      });
    }

    // Fetch memberships - include manual memberships and active ones
    const { data: membershipData } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .in('payment_status', ['paid', 'active', 'manual'])
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setMemberships(membershipData || []);

    // Fetch conference registrations
    const { data: regData } = await supabase
      .from('conference_registrations')
      .select(`
        *,
        conferences(title, date_from, date_to, venue)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setRegistrations(regData || []);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    
    try {
      console.log('Updating profile with data:', editForm);
      
      // First check if user_roles record exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let updateResult;
      
      if (existingRole) {
        // Update existing record
        updateResult = await supabase
          .from('user_roles')
          .update({
            ...editForm,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert new record if doesn't exist
        updateResult = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'member',
            email: user.email,
            ...editForm,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (updateResult.error) {
        console.error('Profile update error:', updateResult.error);
        toast.error('Error updating profile: ' + updateResult.error.message);
        return;
      }

      console.log('Profile updated successfully:', updateResult.data);
      
      // Update local state immediately
      setUserRole(updateResult.data);
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchUserData();
      }, 500);
      
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
    } finally {
      setIsUpdating(false);
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

  const handleMembershipCancellation = () => {
    fetchUserData(); // Refresh data after cancellation
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access your dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Manage your profile and view your activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Memberships</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberships.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conference Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-green-600">
                {userRole?.full_name ? 'Complete' : 'Incomplete'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="conferences">Conferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
                <Button
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-700">{userRole?.full_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-700">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    {isEditing ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-700">{userRole?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Institution</label>
                    {isEditing ? (
                      <Input
                        value={editForm.institution}
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        placeholder="Enter your institution"
                      />
                    ) : (
                      <p className="text-gray-700">{userRole?.institution || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Designation</label>
                    {isEditing ? (
                      <Input
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        placeholder="Enter your designation"
                      />
                    ) : (
                      <p className="text-gray-700">{userRole?.designation || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Specialization</label>
                    {isEditing ? (
                      <Input
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                        placeholder="Enter your specialization"
                      />
                    ) : (
                      <p className="text-gray-700">{userRole?.specialization || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memberships">
            <Card>
              <CardHeader>
                <CardTitle>My Active Memberships</CardTitle>
                <CardDescription>View and manage your active memberships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberships.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active memberships found</p>
                  ) : (
                    memberships.map((membership: any) => (
                      <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold capitalize">{membership.membership_type}</h3>
                          <p className="text-sm text-gray-600">
                            Valid: {membership.valid_from} to {membership.valid_until}
                          </p>
                          <p className="text-sm text-gray-500">Amount: ₹{membership.amount}</p>
                          {membership.is_manual && (
                            <p className="text-xs text-blue-600">Manual membership</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(membership.status)}>
                              {membership.status}
                            </Badge>
                            <Badge className={getStatusColor(membership.payment_status)}>
                              {membership.payment_status === 'manual' ? 'Admin Added' : membership.payment_status}
                            </Badge>
                          </div>
                          {membership.status === 'active' && (
                            <MembershipCancellation
                              membershipId={membership.id}
                              membershipType={membership.membership_type}
                              onCancellationSuccess={handleMembershipCancellation}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conferences">
            <Card>
              <CardHeader>
                <CardTitle>Conference Registrations</CardTitle>
                <CardDescription>View your conference registrations and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No conference registrations found</p>
                  ) : (
                    registrations.map((reg: any) => (
                      <div key={reg.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{reg.conferences?.title}</h3>
                          <Badge className={getStatusColor(reg.payment_status)}>
                            {reg.payment_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <p>Venue: {reg.conferences?.venue}</p>
                          <p>Date: {reg.conferences?.date_from} to {reg.conferences?.date_to}</p>
                          <p>Amount: ₹{reg.amount_paid}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
