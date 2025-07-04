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

  // Simplified and organized tabs
  const tabs = [
    { value: 'dashboard', label: 'Dashboard', category: 'overview' },
    { value: 'members', label: 'Members', category: 'management' },
    { value: 'life-members', label: 'Life Members', category: 'management' },
    { value: 'users', label: 'User Roles', category: 'management' },
    { value: 'conferences', label: 'Conferences', category: 'content' },
    { value: 'publications', label: 'Publications', category: 'content' },
    { value: 'gallery', label: 'Gallery', category: 'content' },
    { value: 'office-bearers', label: 'Office Bearers', category: 'content' },
    { value: 'content', label: 'Mandates & Activities', category: 'content' },
    { value: 'messages', label: 'Messages', category: 'communication' },
    { value: 'payments', label: 'Payments', category: 'finance' },
  ];

  // Group tabs by category for better organization
  const tabCategories = {
    overview: tabs.filter(t => t.category === 'overview'),
    management: tabs.filter(t => t.category === 'management'),
    content: tabs.filter(t => t.category === 'content'),
    communication: tabs.filter(t => t.category === 'communication'),
    finance: tabs.filter(t => t.category === 'finance'),
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
      default:
        return <AdminStats stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="responsive-container py-4 sm:py-6">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Comprehensive management system for ISPB
              </p>
            </div>
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="self-center sm:self-start bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span className="ml-2">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Tabs - Redesigned */}
        {!isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <ScrollArea className="w-full">
                <div className="space-y-4">
                  {/* Overview Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</h3>
                    <div className="flex flex-wrap gap-2">
                      {tabCategories.overview.map((tab) => (
                        <Button
                          key={tab.value}
                          variant={activeTab === tab.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab(tab.value)}
                          className={`transition-all duration-200 ${
                            activeTab === tab.value 
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                              : 'hover:bg-green-50 hover:border-green-300'
                          }`}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Management Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</h3>
                    <div className="flex flex-wrap gap-2">
                      {tabCategories.management.map((tab) => (
                        <Button
                          key={tab.value}
                          variant={activeTab === tab.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab(tab.value)}
                          className={`transition-all duration-200 ${
                            activeTab === tab.value 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</h3>
                    <div className="flex flex-wrap gap-2">
                      {tabCategories.content.map((tab) => (
                        <Button
                          key={tab.value}
                          variant={activeTab === tab.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab(tab.value)}
                          className={`transition-all duration-200 ${
                            activeTab === tab.value 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                              : 'hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Communication & Finance Section */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Communication</h3>
                      <div className="flex flex-wrap gap-2">
                        {tabCategories.communication.map((tab) => (
                          <Button
                            key={tab.value}
                            variant={activeTab === tab.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab(tab.value)}
                            className={`transition-all duration-200 ${
                              activeTab === tab.value 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md' 
                                : 'hover:bg-orange-50 hover:border-orange-300'
                            }`}
                          >
                            {tab.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Finance</h3>
                      <div className="flex flex-wrap gap-2">
                        {tabCategories.finance.map((tab) => (
                          <Button
                            key={tab.value}
                            variant={activeTab === tab.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab(tab.value)}
                            className={`transition-all duration-200 ${
                              activeTab === tab.value 
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' 
                                : 'hover:bg-red-50 hover:border-red-300'
                            }`}
                          >
                            {tab.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {renderTabContent()}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        ) : (
          /* Mobile Layout - Enhanced */
          <div className="space-y-4">
            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                <div className="space-y-3">
                  {Object.entries(tabCategories).map(([category, categoryTabs]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryTabs.map((tab) => (
                          <Button
                            key={tab.value}
                            variant={activeTab === tab.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setActiveTab(tab.value);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`justify-start text-xs transition-all ${
                              activeTab === tab.value 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {tab.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Tab Indicator */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {tabs.find(tab => tab.value === activeTab)?.label}
                </h2>
                <div className="text-xs text-gray-500 capitalize">
                  {tabs.find(tab => tab.value === activeTab)?.category}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
