
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabs from '@/components/admin/AdminTabs';
import UserManagement from '@/components/admin/UserManagement';
import AdminMembersTab from '@/components/admin/AdminMembersTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminMessagesTab from '@/components/admin/AdminMessagesTab';
import AdminPublicationsTab from '@/components/admin/AdminPublicationsTab';

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
      supabase.from('profiles').select('id, full_name, email, created_at, institution, phone').order('created_at', { ascending: false }),
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management of ISPB website and members</p>
        </div>

        <div className="mb-8">
          <AdminStats stats={stats} />
        </div>

        <AdminTabs>
          <TabsContent value="members">
            <AdminMembersTab members={members} userRoles={userRoles} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={users} 
              userRoles={userRoles} 
              onChangeUserRole={handleChangeUserRole} 
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessagesTab 
              messages={messages} 
              onMarkMessageRead={handleMarkMessageRead} 
            />
          </TabsContent>

          <TabsContent value="publications">
            <AdminPublicationsTab 
              publications={publications} 
              onAddPublication={handleAddPublication} 
            />
          </TabsContent>
        </AdminTabs>
      </div>
    </div>
  );
};

export default AdminPanel;
