import { TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import AdminTabs from './AdminTabs';
import UserManagement from './UserManagement';
import AdminMembersTab from './AdminMembersTab';
import AdminConferencesTab from './AdminConferencesTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminContentTab from './AdminContentTab';

interface AdminDashboardProps {
  stats: any;
  users: any[];
  userRoles: any[];
  conferences: any[];
  messages: any[];
  mandates: any[];
  activities: any[];
  refreshData: () => void;
  updateUserRole?: (userId: string, newRole: string) => Promise<any>;
  addMembership?: (membershipData: any) => Promise<any>;
  updateMembership?: (membershipId: string, membershipData: any) => Promise<any>;
  deleteMembership?: (membershipId: string) => Promise<any>;
}

const AdminDashboard = ({
  stats,
  users,
  userRoles,
  conferences,
  messages,
  mandates,
  activities,
  refreshData,
  updateUserRole,
  addMembership,
  updateMembership,
  deleteMembership
}: AdminDashboardProps) => {

  const handleMarkMessageRead = async (messageId: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);

    if (!error) {
      toast.success('Message marked as read');
      refreshData();
    }
  };

  const handleAddMember = async (memberData: any) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        ...memberData,
        user_id: crypto.randomUUID() // This would need proper user creation
      });

    if (!error) {
      toast.success('Member added successfully');
      refreshData();
    } else {
      toast.error('Error adding member');
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      if (updateUserRole) {
        await updateUserRole(userId, newRole);
      } else {
        // Fallback to direct update
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
        
        toast.success('User role updated successfully');
        refreshData();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error updating user role');
      throw error;
    }
  };

  // Conference management handlers
  const handleAddConference = async (conferenceData: any) => {
    const { error } = await supabase
      .from('conferences')
      .insert(conferenceData);

    if (!error) {
      toast.success('Conference added successfully');
      refreshData();
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
      refreshData();
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
      refreshData();
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader users={users} />

        <div className="mb-8">
          <AdminStats stats={stats} />
        </div>

        <AdminTabs>
          <TabsContent value="members">
            <AdminMembersTab 
              members={users} 
              userRoles={userRoles}
              onAddMembership={addMembership}
              onUpdateMembership={updateMembership}
              onDeleteMembership={deleteMembership}
            />
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

export default AdminDashboard;
