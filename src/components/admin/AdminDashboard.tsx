import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStats from './AdminStats';
import AdminMembersTab from './AdminMembersTab';
import AdminConferencesTab from './AdminConferencesTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminContentTab from './AdminContentTab';
import AdminPaymentTab from './AdminPaymentTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminMembershipPlansTab from './AdminMembershipPlansTab';
import AdminLifeMembersTab from './AdminLifeMembersTab';
import UserManagement from './UserManagement';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminDashboardProps {
  stats: any;
  users: any[];
  userRoles: any[];
  conferences: any[];
  messages: any[];
  mandates: any[];
  activities: any[];
  payments: any[];
  membershipPlans: any[];
  lifeMembers?: any[];
  orders: any[];
  refreshData: () => void;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  addMembership: (membershipData: any) => void;
  updateMembership: (membershipId: string, membershipData: any) => void;
  deleteMembership: (membershipId: string) => void;
}

const AdminDashboard = ({
  stats,
  users,
  userRoles,
  conferences,
  messages,
  mandates,
  activities,
  payments,
  membershipPlans,
  lifeMembers = [],
  orders,
  refreshData,
  updateUserRole,
  addMembership,
  updateMembership,
  deleteMembership
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Conference handlers
  const handleAddConference = async (conferenceData: any) => {
    try {
      const { error } = await supabase
        .from('conferences')
        .insert(conferenceData);

      if (error) throw error;
      toast.success('Conference added successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error adding conference:', error);
      toast.error(error.message || 'Error adding conference');
    }
  };

  const handleUpdateConference = async (conferenceId: string, conferenceData: any) => {
    try {
      const { error } = await supabase
        .from('conferences')
        .update(conferenceData)
        .eq('id', conferenceId);

      if (error) throw error;
      toast.success('Conference updated successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error updating conference:', error);
      toast.error(error.message || 'Error updating conference');
    }
  };

  const handleDeleteConference = async (conferenceId: string) => {
    try {
      const { error } = await supabase
        .from('conferences')
        .delete()
        .eq('id', conferenceId);

      if (error) throw error;
      toast.success('Conference deleted successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error deleting conference:', error);
      toast.error(error.message || 'Error deleting conference');
    }
  };

  // Message handlers
  const handleMarkMessageRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Message marked as read');
      refreshData();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast.error(error.message || 'Error marking message as read');
    }
  };

  // Content handlers
  const handleAddContent = async (data: any, type: 'mandate' | 'activity') => {
    try {
      const table = type === 'mandate' ? 'mandates' : 'activities';
      const { error } = await supabase
        .from(table)
        .insert(data);

      if (error) throw error;
      toast.success(`${type} added successfully`);
      refreshData();
    } catch (error: any) {
      console.error(`Error adding ${type}:`, error);
      toast.error(error.message || `Error adding ${type}`);
    }
  };

  const handleUpdateContent = async (id: string, data: any, type: 'mandate' | 'activity') => {
    try {
      const table = type === 'mandate' ? 'mandates' : 'activities';
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success(`${type} updated successfully`);
      refreshData();
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      toast.error(error.message || `Error updating ${type}`);
    }
  };

  const handleDeleteContent = async (id: string, type: 'mandate' | 'activity') => {
    try {
      const table = type === 'mandate' ? 'mandates' : 'activities';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(`${type} deleted successfully`);
      refreshData();
    } catch (error: any) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error.message || `Error deleting ${type}`);
    }
  };

  // Payment handlers
  const handleAddPayment = async (paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payment_tracking')
        .insert(paymentData);

      if (error) throw error;
      toast.success('Payment record added successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast.error(error.message || 'Error adding payment');
    }
  };

  const handleUpdatePayment = async (paymentId: string, paymentData: any) => {
    try {
      const { error } = await supabase
        .from('payment_tracking')
        .update(paymentData)
        .eq('id', paymentId);

      if (error) throw error;
      toast.success('Payment record updated successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(error.message || 'Error updating payment');
    }
  };

  // Publication handlers
  const handleAddPublication = async (publicationData: any) => {
    try {
      const { error } = await supabase
        .from('publications')
        .insert(publicationData);

      if (error) throw error;
      toast.success('Publication added successfully');
      refreshData();
    } catch (error: any) {
      console.error('Error adding publication:', error);
      toast.error(error.message || 'Error adding publication');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management of ISPB website and registered users</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="life-members">Life Members</TabsTrigger>
            <TabsTrigger value="conferences">Conferences</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminStats stats={stats} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={userRoles}
              userRoles={userRoles}
              onChangeUserRole={updateUserRole}
            />
          </TabsContent>

          <TabsContent value="members">
            <AdminMembersTab 
              members={users}
              userRoles={userRoles}
              onAddMembership={addMembership}
              onUpdateMembership={updateMembership}
              onDeleteMembership={deleteMembership}
            />
          </TabsContent>

          <TabsContent value="life-members">
            <AdminLifeMembersTab 
              lifeMembers={lifeMembers}
              onRefresh={refreshData}
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

          <TabsContent value="payments">
            <AdminPaymentTab 
              payments={payments}
              onAddPayment={handleAddPayment}
              onUpdatePayment={handleUpdatePayment}
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab 
              orders={orders}
            />
          </TabsContent>

          <TabsContent value="plans">
            <AdminMembershipPlansTab 
              plans={membershipPlans}
              onRefresh={refreshData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
