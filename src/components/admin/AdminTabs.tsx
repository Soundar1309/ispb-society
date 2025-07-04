
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminTabsProps {
  children: React.ReactNode;
}

const AdminTabs = ({ children }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="members" className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger 
            value="members" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Members
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="plans" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Plans
          </TabsTrigger>
          <TabsTrigger 
            value="conferences" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Conferences
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Content
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all duration-200 font-medium text-sm px-3 py-2.5 rounded-md"
          >
            Payments
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {children}
      </div>
    </Tabs>
  );
};

export default AdminTabs;
