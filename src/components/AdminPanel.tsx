
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Users, CreditCard, BookOpen, MessageSquare, Calendar, UserPlus, Settings } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalOrders: 0,
    totalPublications: 0,
    unreadMessages: 0
  });

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    checkAdminAccess();
    if (isAdmin) {
      fetchStats();
      fetchAllData();
    }
  }, [user, isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data && !error) {
      setIsAdmin(true);
    }
  };

  const fetchStats = async () => {
    const [membersRes, ordersRes, publicationsRes, messagesRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('publications').select('id', { count: 'exact' }),
      supabase.from('contact_messages').select('id', { count: 'exact' }).eq('status', 'unread')
    ]);

    setStats({
      totalMembers: membersRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalPublications: publicationsRes.count || 0,
      unreadMessages: messagesRes.count || 0
    });
  };

  const fetchAllData = async () => {
    const [membersRes, ordersRes, messagesRes, publicationsRes, usersRes, userRolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select(`
        *,
        memberships(membership_type, status),
        profiles(full_name, email)
      `).order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('publications').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email, created_at').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*')
    ]);

    setMembers(membersRes.data || []);
    setOrders(ordersRes.data || []);
    setMessages(messagesRes.data || []);
    setPublications(publicationsRes.data || []);
    setUsers(usersRes.data || []);
    setUserRoles(userRolesRes.data || []);
  };

  const handleMarkMessageRead = async (messageId: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);

    if (!error) {
      toast.success('Message marked as read');
      fetchAllData();
      fetchStats();
    }
  };

  const handleAddPublication = async (publicationData: any) => {
    const { error } = await supabase
      .from('publications')
      .insert(publicationData);

    if (!error) {
      toast.success('Publication added successfully');
      fetchAllData();
      fetchStats();
    } else {
      toast.error('Error adding publication');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      // First, remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (!error) {
        toast.success('User role updated successfully');
        fetchAllData();
      } else {
        toast.error('Error updating user role');
      }
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const getUserRole = (userId: string) => {
    const userRole = userRoles.find(role => role.user_id === userId);
    return userRole ? userRole.role : 'member';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage ISPB website and members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publications</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPublications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Members Management</CardTitle>
                <CardDescription>View and manage all registered members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{member.full_name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.institution}</p>
                      </div>
                      <Badge variant="outline">Member</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Member Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'No Name'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getUserRole(user.id) === 'admin' ? 'destructive' : 'default'}>
                            {getUserRole(user.id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => handleChangeUserRole(user.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>View and manage all payment orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{order.profiles?.full_name}</h3>
                        <p className="text-sm text-gray-600">{order.profiles?.email}</p>
                        <p className="text-sm text-gray-500">₹{order.amount} - {order.memberships?.membership_type}</p>
                      </div>
                      <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>View and respond to contact form messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{message.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={message.status === 'unread' ? 'destructive' : 'default'}>
                            {message.status}
                          </Badge>
                          {message.status === 'unread' && (
                            <Button size="sm" onClick={() => handleMarkMessageRead(message.id)}>
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                      <p className="text-sm font-medium mb-2">{message.subject}</p>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications">
            <Card>
              <CardHeader>
                <CardTitle>Publications Management</CardTitle>
                <CardDescription>Add and manage publications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <PublicationForm onAdd={handleAddPublication} />
                  <div className="space-y-4">
                    {publications.map((publication: any) => (
                      <div key={publication.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{publication.title}</h3>
                        <p className="text-sm text-gray-600">{publication.authors}</p>
                        <p className="text-sm text-gray-500">{publication.journal} - {publication.year}</p>
                        {publication.is_featured && <Badge>Featured</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const PublicationForm = ({ onAdd }: { onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    volume: '',
    year: '',
    doi: '',
    is_featured: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      year: parseInt(formData.year) || null
    });
    setFormData({
      title: '',
      authors: '',
      journal: '',
      volume: '',
      year: '',
      doi: '',
      is_featured: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold">Add New Publication</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          placeholder="Authors"
          value={formData.authors}
          onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
        />
        <Input
          placeholder="Journal"
          value={formData.journal}
          onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
        />
        <Input
          placeholder="Volume"
          value={formData.volume}
          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
        />
        <Input
          placeholder="Year"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        />
        <Input
          placeholder="DOI"
          value={formData.doi}
          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.is_featured}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
        />
        <label htmlFor="featured" className="text-sm">Featured Publication</label>
      </div>
      <Button type="submit">Add Publication</Button>
    </form>
  );
};

export default AdminPanel;
