import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminCommandPalette } from './AdminCommandPalette';
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
  Settings,
  FileText,
  Cog
} from 'lucide-react';
import AdminStats from './AdminStats';
import AdminApplicationsTab from './AdminApplicationsTab';
import AdminMembersTab from './AdminMembersTab';
import AdminConferencesTab from './AdminConferencesTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminContentTab from './AdminContentTab';
import AdminPaymentTab from './AdminPaymentTab';
import AdminPaymentSettingsTab from './AdminPaymentSettingsTab';
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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminDashboardProps {
  loading?: boolean;
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
  applications?: any[];
  refreshData: () => void;
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  addMembership: (membershipData: any) => void;
  updateMembership: (membershipId: string, membershipData: any) => void;
  deleteMembership: (membershipId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminDashboard = ({
  loading = false,
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
  applications = [],
  refreshData,
  updateUserRole,
  addMembership,
  updateMembership,
  deleteMembership,
  activeTab,
  setActiveTab
}: AdminDashboardProps) => {
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
          id: 'applications',
          label: 'Applications',
          icon: FileText,
          description: 'Review membership applications',
          count: applications?.length || 0
        },
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
        },
        {
          id: 'payment-settings',
          label: 'Payment Settings',
          icon: Cog,
          description: 'Razorpay configuration'
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
    if (loading) {
      return (
        <div className="space-y-6">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <LoadingSkeleton variant="table" count={5} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminStats stats={stats} />;
      case 'applications':
        return (
          <AdminApplicationsTab
            applications={applications}
            onRefresh={refreshData}
          />
        );
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
            plans={membershipPlans}
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
      case 'payment-settings':
        return <AdminPaymentSettingsTab />;
      default:
        return <AdminStats stats={stats} />;
    }
  };

  const currentItem = menuSections
    .flatMap(section => section.items)
    .find(item => item.id === activeTab);

  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        <AdminSidebarNav
          sections={menuSections}
          activeTab={activeTab}
          onSelectTab={(id) => {
            setActiveTab(id);
            setIsMobileMenuOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r bg-white h-screen shrink-0">
        <AdminSidebarNav
          sections={menuSections}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </aside>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-white px-6 h-16 shrink-0 z-10">
          <MobileNav />

          <div className="flex items-center gap-2 mr-auto">
            {currentItem?.icon && (
              <currentItem.icon className="h-5 w-5 text-blue-600 hidden sm:block" />
            )}
            <h1 className="text-lg font-semibold text-slate-800">
              {currentItem?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <AdminCommandPalette onSelectTab={setActiveTab} />
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'} className="hidden sm:flex">
              Go to Site
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Dynamic Description/Header for Tab */}
            {currentItem?.description && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{currentItem.label}</h2>
                <p className="text-slate-500">{currentItem.description}</p>
              </div>
            )}

            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
