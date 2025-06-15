
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, MessageSquare, BookOpen, Settings } from 'lucide-react';

interface AdminTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

const AdminTabs = ({ children, defaultValue = "members" }: AdminTabsProps) => {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-4">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
        <TabsTrigger value="members" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">User Mgmt</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Orders</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
        <TabsTrigger value="publications" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Publications</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default AdminTabs;
