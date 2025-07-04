import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import AdminStats from './AdminStats';
import AdminMembersTab from './AdminMembersTab';
import AdminConferencesTab from './AdminConferencesTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminContentTab from './AdminContentTab';
import AdminPaymentTab from './AdminPaymentTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminMembershipPlansTab from './AdminMembershipPlansTab';
import AdminLifeMembersTab from './AdminLifeMembersTab';
import AdminPublicationsTab from './AdminPublicationsTab';
import AdminGalleryTab from './AdminGalleryTab';
import AdminOfficeBearersTab from './AdminOfficeBearersTab';
import UserManagement from './UserManagement';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

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
  publications?: any[];
  galleryItems?: any[];
  officeBearers?: any[];
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
  publications = [],
  galleryItems = [],
  officeBearers = [],
  refreshData,
  updateUserRole,
  addMembership,
  updateMembership,
  deleteMembership
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const tabs = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'members', label: 'Members' },
    { value: 'users', label: 'Users' },
    { value: 'messages', label: 'Messages' },
    { value: 'conferences', label: 'Conferences' },
    { value: 'payments', label: 'Payments' },
    { value: 'orders', label: 'Orders' },
    { value: 'plans', label: 'Plans' },
    { value: 'life-members', label: 'Life Members' },
    { value: 'publications', label: 'Publications' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'office-bearers', label: 'Office Bearers' },
    { value: 'content', label: 'Content' }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminStats stats={stats} />;
      case 'users':
        return (
          <UserManagement 
            users={userRoles}
            userRoles={userRoles}
            onChangeUserRole={updateUserRole}
          />
        );
      case 'members':
        return (
          <AdminMembersTab 
            members={users}
            userRoles={userRoles}
            onAddMembership={addMembership}
            onUpdateMembership={updateMembership}
            onDeleteMembership={deleteMembership}
          />
        );
      case 'life-members':
        return (
          <AdminLifeMembersTab 
            lifeMembers={lifeMembers}
            onRefresh={refreshData}
          />
        );
      case 'publications':
        return (
          <AdminPublicationsTab 
            publications={publications}
            onRefresh={refreshData}
          />
        );
      case 'gallery':
        return (
          <AdminGalleryTab 
            galleryItems={galleryItems}
            onRefresh={refreshData}
          />
        );
      case 'office-bearers':
        return (
          <AdminOfficeBearersTab 
            officeBearers={officeBearers}
            onRefresh={refreshData}
          />
        );
      case 'conferences':
        return (
          <AdminConferencesTab 
            conferences={conferences}
            onRefresh={refreshData}
          />
        );
      case 'messages':
        return (
          <AdminMessagesTab 
            messages={messages}
            onMarkMessageRead={handleMarkMessageRead}
          />
        );
      case 'content':
        return (
          <AdminContentTab 
            mandates={mandates}
            activities={activities}
            onAddContent={handleAddContent}
            onUpdateContent={handleUpdateContent}
            onDeleteContent={handleDeleteContent}
          />
        );
      case 'payments':
        return (
          <AdminPaymentTab 
            payments={payments}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
          />
        );
      case 'orders':
        return (
          <AdminOrdersTab 
            orders={orders}
          />
        );
      case 'plans':
        return (
          <AdminMembershipPlansTab 
            plans={membershipPlans}
            onRefresh={refreshData}
          />
        );
      default:
        return <AdminStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="responsive-container py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="responsive-text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="responsive-text-sm text-gray-600 mt-1">
                Comprehensive management of ISPB website and registered users
              </p>
            </div>
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="self-start"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span className="ml-2">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Tabs */}
        {!isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <ScrollArea className="w-full">
              <TabsList className="grid w-full grid-cols-7 lg:grid-cols-13 gap-1 h-auto p-1">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="text-xs sm:text-sm whitespace-nowrap px-2 py-2 data-[state=active]:bg-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <div className="mt-6">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {renderTabContent()}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        ) : (
          /* Mobile Layout */
          <div className="space-y-4">
            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setActiveTab(tab.value);
                        setIsMobileMenuOpen(false);
                      }}
                      className="justify-start text-xs"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Tab Indicator */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">
                  {tabs.find(tab => tab.value === activeTab)?.label}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
