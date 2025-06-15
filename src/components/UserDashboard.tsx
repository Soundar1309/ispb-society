
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, CreditCard, BookOpen, Calendar, Edit, Save } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [memberships, setMemberships] = useState([]);
  const [orders, setOrders] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
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

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        institution: profileData.institution || '',
        designation: profileData.designation || '',
        specialization: profileData.specialization || ''
      });
    }

    // Fetch memberships
    const { data: membershipData } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMemberships(membershipData || []);

    // Fetch orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setOrders(orderData || []);

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

    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', user.id);

    if (!error) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchUserData();
    } else {
      toast.error('Error updating profile');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memberships</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberships.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
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
                {profile?.full_name ? 'Complete' : 'Incomplete'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
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
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
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
                      <p className="text-gray-700">{profile?.full_name || 'Not provided'}</p>
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
                      <p className="text-gray-700">{profile?.phone || 'Not provided'}</p>
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
                      <p className="text-gray-700">{profile?.institution || 'Not provided'}</p>
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
                      <p className="text-gray-700">{profile?.designation || 'Not provided'}</p>
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
                      <p className="text-gray-700">{profile?.specialization || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memberships">
            <Card>
              <CardHeader>
                <CardTitle>My Memberships</CardTitle>
                <CardDescription>View your active and past memberships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberships.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No memberships found</p>
                  ) : (
                    memberships.map((membership: any) => (
                      <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{membership.membership_type}</h3>
                          <p className="text-sm text-gray-600">
                            Valid: {membership.valid_from} to {membership.valid_until}
                          </p>
                          <p className="text-sm text-gray-500">Amount: ₹{membership.amount}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(membership.status)}>
                            {membership.status}
                          </Badge>
                          <Badge className={getStatusColor(membership.payment_status)}>
                            {membership.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your payment orders and transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders found</p>
                  ) : (
                    orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{order.amount} - {order.currency}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
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
