
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Crown, 
  UserCheck, 
  Calendar, 
  BookOpen, 
  Image, 
  Award, 
  MessageSquare, 
  CreditCard,
  ChevronRight,
  Settings
} from 'lucide-react';
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

  // Redesigned menu structure with icons and better organization
  const menuSections = [
    {
      title: 'Overview',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          description: 'System overview and analytics'
        }
      ]
    },
    {
      title: 'User Management',
      items: [
        { 
          id: 'members', 
          label: 'Members', 
          icon: Users,
          description: 'Manage member accounts',
          count: users?.length || 0
        },
        { 
          id: 'life-members', 
          label: 'Life Members', 
          icon: Crown,
          description: 'Lifetime membership holders',
          count: lifeMembers?.length || 0
        },
        { 
          id: 'membership-plans', 
          label: 'Membership Plans', 
          icon: Settings,
          description: 'Manage membership plans',
          count: membershipPlans?.length || 0
        },
        { 
          id: 'users', 
          label: 'User Roles', 
          icon: UserCheck,
          description: 'Manage user permissions'
        }
      ]
    },
    {
      title: 'Content Management',
      items: [
        { 
          id: 'conferences', 
          label: 'Conferences', 
          icon: Calendar,
          description: 'Event management',
          count: conferences?.length || 0
        },
        { 
          id: 'publications', 
          label: 'Publications', 
          icon: BookOpen,
          description: 'Research publications',
          count: publications?.length || 0
        },
        { 
          id: 'gallery', 
          label: 'Gallery', 
          icon: Image,
          description: 'Image gallery management',
          count: galleryItems?.length || 0
        },
        { 
          id: 'office-bearers', 
          label: 'Office Bearers', 
          icon: Award,
          description: 'Leadership team',
          count: officeBearers?.length || 0
        },
        { 
          id: 'content', 
          label: 'Mandates & Activities', 
          icon: BookOpen,
          description: 'Organizational content'
        }
      ]
    },
    {
      title: 'Communication & Finance',
      items: [
        { 
          id: 'messages', 
          label: 'Messages', 
          icon: MessageSquare,
          description: 'Contact form submissions',
          count: messages?.filter(m => m.status === 'unread')?.length || 0,
          urgent: messages?.filter(m => m.status === 'unread')?.length > 0
        },
        { 
          id: 'payments', 
          label: 'Payments', 
          icon: CreditCard,
          description: 'Payment tracking',
          count: payments?.length || 0
        }
      ]
    }
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
      case 'membership-plans':
        return (
          <AdminMembershipPlansTab 
            membershipPlans={membershipPlans}
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

  const currentItem = menuSections
    .flatMap(section => section.items)
    .find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="responsive-container py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Manage your ISPB platform efficiently
              </p>
            </div>
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="self-start bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span className="ml-2">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${isMobile && !isMobileMenuOpen ? 'hidden' : 'block'}`}>
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="space-y-6 p-4">
                    {menuSections.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          {section.title}
                        </h3>
                        <div className="space-y-1">
                          {section.items.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id;
                            
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  if (isMobile) setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${
                                  isActive 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <IconComponent className={`h-4 w-4 flex-shrink-0 ${
                                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                                  }`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm truncate">
                                      {item.label}
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-slate-500 truncate">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {item.count !== undefined && (
                                    <Badge 
                                      variant={item.urgent ? "destructive" : "secondary"} 
                                      className="text-xs min-w-[20px] h-5 flex items-center justify-center"
                                    >
                                      {item.count}
                                    </Badge>
                                  )}
                                  {isActive && <ChevronRight className="h-3 w-3 text-blue-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  {currentItem?.icon && (
                    <currentItem.icon className="h-5 w-5 text-blue-600" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {currentItem?.label || 'Dashboard'}
                    </CardTitle>
                    {currentItem?.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {currentItem.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
