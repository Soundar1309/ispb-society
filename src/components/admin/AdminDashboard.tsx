
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStats from './AdminStats';
import AdminMembersTab from './AdminMembersTab';
import AdminConferencesTab from './AdminConferencesTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminContentTab from './AdminContentTab';
import AdminPaymentTab from './AdminPaymentTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminPublicationsTab from './AdminPublicationsTab';
import AdminMembershipPlansTab from './AdminMembershipPlansTab';
import AdminLifeMembersTab from './AdminLifeMembersTab';
import UserManagement from './UserManagement';

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive management of ISPB website and registered users</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="life-members">Life Members</TabsTrigger>
            <TabsTrigger value="conferences">Conferences</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessagesTab 
              messages={messages}
            />
          </TabsContent>

          <TabsContent value="content">
            <AdminContentTab 
              mandates={mandates}
              activities={activities}
            />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentTab 
              payments={payments}
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab 
              orders={orders}
            />
          </TabsContent>

          <TabsContent value="publications">
            <AdminPublicationsTab />
          </TabsContent>

          <TabsContent value="plans">
            <AdminMembershipPlansTab 
              plans={membershipPlans}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
