
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Settings, Calendar, FileText } from 'lucide-react';

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
        <TabsTrigger value="conferences" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Conferences</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Content</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default AdminTabs;
