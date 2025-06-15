
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, BookOpen, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalMembers: number;
    totalOrders: number;
    totalPublications: number;
    unreadMessages: number;
  };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+23%",
      changeType: "increase"
    },
    {
      title: "Publications",
      value: stats.totalPublications,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+5%",
      changeType: "increase"
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: stats.unreadMessages > 0 ? "New" : "Clear",
      changeType: stats.unreadMessages > 0 ? "warning" : "success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${
                  stat.changeType === 'increase' ? 'text-green-500' : 
                  stat.changeType === 'warning' ? 'text-orange-500' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-medium ${
                  stat.changeType === 'increase' ? 'text-green-500' : 
                  stat.changeType === 'warning' ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;
