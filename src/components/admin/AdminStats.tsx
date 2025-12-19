import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, DollarSign, Activity, FileText, User, Settings, Calendar } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    membershipEnrolled: number;
    unreadMessages: number;
    totalRevenue: number;
    revenueGrowth: number;
    membershipGrowth: number;
  };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      sub: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% from last month`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50",
      trend: stats.revenueGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: "Active Members",
      value: stats.membershipEnrolled.toString(),
      sub: `${stats.membershipGrowth > 0 ? '+' : ''}${stats.membershipGrowth.toFixed(1)}% new this month`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100/50",
      trend: stats.membershipGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: "Pending Actions",
      value: stats.unreadMessages.toString(),
      sub: "Unread messages",
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-100/50",
      trend: 'neutral'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                  </div>
                  {stat.trend === 'up' && <ArrowUpRight className="h-5 w-5 text-emerald-500" />}
                  {stat.trend === 'down' && <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />}
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500">
                  <span className={stat.trend === 'up' ? "text-emerald-600 font-medium" : stat.trend === 'down' ? "text-red-600 font-medium" : ""}>
                    {stat.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  );
};

export default AdminStats;
