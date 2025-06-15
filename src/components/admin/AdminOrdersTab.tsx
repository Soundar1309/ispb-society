
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  amount: number;
  status: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  memberships?: {
    membership_type: string;
    status: string;
  };
}

interface AdminOrdersTabProps {
  orders: Order[];
}

const AdminOrdersTab = ({ orders }: AdminOrdersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Management</CardTitle>
        <CardDescription>View and manage all payment orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{order.profiles?.full_name}</h3>
                <p className="text-sm text-gray-600">{order.profiles?.email}</p>
                <p className="text-sm text-gray-500">₹{order.amount} - {order.memberships?.membership_type}</p>
              </div>
              <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTab;
