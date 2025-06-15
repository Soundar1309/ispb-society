
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminTabsProps {
  children: React.ReactNode;
}

const AdminTabs = ({ children }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="members" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="conferences">Conferences</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default AdminTabs;
