import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabs from '@/components/admin/AdminTabs';
import UserManagement from '@/components/admin/UserManagement';
import AdminMembersTab from '@/components/admin/AdminMembersTab';
import AdminConferencesTab from '@/components/admin/AdminConferencesTab';
import AdminMessagesTab from '@/components/admin/AdminMessagesTab';
import AdminPublicationsTab from '@/components/admin/AdminPublicationsTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import CSVExport from '@/components/admin/CSVExport';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    membershipEnrolled: 0,
    totalUsers: 0,
    totalPublications: 0,
    unreadMessages: 0
  });

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [messages, setMessages] = useState([]);
  const [publications, setPublications] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin && !loading) {
      fetchStats();
      fetchAllData();
    }
  }, [isAdmin, loading]);

  const checkAdminAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (data && !error) {
        setIsAdmin(true);
      } else {
        setError('You do not have admin privileges');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setError('Error checking admin privileges');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [membersRes, usersRes, membershipRes, publicationsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('publications').select('id', { count: 'exact' }),
        supabase.from('contact_messages').select('id', { count: 'exact' }).eq('status', 'unread')
      ]);

      setStats({
        totalMembers: membersRes.count || 0,
        totalUsers: usersRes.count || 0,
        membershipEnrolled: membershipRes.count || 0,
        totalPublications: publicationsRes.count || 0,
        unreadMessages: messagesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading statistics');
    }
  };

  const fetchAllData = async () => {
    try {
      const [
        membersRes, 
        conferencesRes, 
        messagesRes, 
        publicationsRes, 
        usersRes, 
        userRolesRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('conferences').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('publications').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email, created_at, institution, phone').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*')
      ]);

      setMembers(membersRes.data || []);
      setConferences(conferencesRes.data || []);
      setMessages(messagesRes.data || []);
      setPublications(publicationsRes.data || []);
      setUsers(usersRes.data || []);
      setUserRoles(userRolesRes.data || []);
      
      // Mock data for mandates and activities since these tables don't exist yet
      setMandates([]);
      setActivities([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading admin data');
    }
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

  // Conference management handlers
  const handleAddConference = async (conferenceData: any) => {
    const { error } = await supabase
      .from('conferences')
      .insert(conferenceData);

    if (!error) {
      toast.success('Conference added successfully');
      fetchAllData();
    } else {
      toast.error('Error adding conference');
    }
  };

  const handleUpdateConference = async (id: string, conferenceData: any) => {
    const { error } = await supabase
      .from('conferences')
      .update(conferenceData)
      .eq('id', id);

    if (!error) {
      toast.success('Conference updated successfully');
      fetchAllData();
    } else {
      toast.error('Error updating conference');
    }
  };

  const handleDeleteConference = async (id: string) => {
    const { error } = await supabase
      .from('conferences')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Conference deleted successfully');
      fetchAllData();
    } else {
      toast.error('Error deleting conference');
    }
  };

  // Content management handlers (placeholder - would need database tables)
  const handleAddContent = async (contentData: any, type: 'mandate' | 'activity') => {
    // This would need a proper database table for mandates/activities
    toast.info(`Content management for ${type}s needs database implementation`);
  };

  const handleUpdateContent = async (id: string, contentData: any, type: 'mandate' | 'activity') => {
    toast.info(`Content management for ${type}s needs database implementation`);
  };

  const handleDeleteContent = async (id: string, type: 'mandate' | 'activity') => {
    toast.info(`Content management for ${type}s needs database implementation`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {error || "You don't have admin privileges to access this page."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive management of ISPB website and members</p>
            </div>
            <CSVExport users={users} members={members} />
          </div>
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

          <TabsContent value="conferences">
            <AdminConferencesTab 
              conferences={conferences}
              onAddConference={handleAddConference}
              onUpdateConference={handleUpdateConference}
              onDeleteConference={handleDeleteConference}
            />
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

          <TabsContent value="content">
            <AdminContentTab 
              mandates={mandates}
              activities={activities}
              onAddContent={handleAddContent}
              onUpdateContent={handleUpdateContent}
              onDeleteContent={handleDeleteContent}
            />
          </TabsContent>
        </AdminTabs>
      </div>
    </div>
  );
};

export default AdminPanel;
