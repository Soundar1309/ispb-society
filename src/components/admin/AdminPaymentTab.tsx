import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRecord {
  id: string;
  membership_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: string;
  payment_date?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  notes?: string;
  created_at: string;
  user_name?: string;
  membership_type?: string;
}

interface AdminPaymentTabProps {
  payments: PaymentRecord[];
  onAddPayment?: (paymentData: unknown) => void;
  onUpdatePayment?: (paymentId: string, paymentData: unknown) => void;
}

const AdminPaymentTab = ({ payments }: AdminPaymentTabProps) => {
  const exportPaymentsCSV = () => {
    try {
      const headers = [
        'Date',
        'User Name',
        'Membership Type',
        'Amount',
        'Currency',
        'Payment Method',
        'Status',
        'Razorpay Payment ID',
        'Razorpay Order ID',
        'Notes'
      ];

      const csvData = payments.map(payment => [
        payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A',
        payment.user_name || 'N/A',
        payment.membership_type || 'N/A',
        payment.amount?.toString() || '0',
        payment.currency || 'INR',
        payment.payment_method || 'Razorpay',
        payment.payment_status || 'N/A',
        payment.razorpay_payment_id || 'N/A',
        payment.razorpay_order_id || 'N/A',
        payment.notes || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Payments CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting CSV file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = payments
    .filter(p => p.payment_status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Records
            </CardTitle>
            <CardDescription>View all membership payment transactions</CardDescription>
          </div>
          <Button onClick={exportPaymentsCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Total Collected</p>
            <p className="text-2xl font-bold text-green-700">₹{totalPaid.toLocaleString()}</p>
            <p className="text-xs text-green-500">{payments.filter(p => p.payment_status === 'paid').length} payments</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-700">₹{totalPending.toLocaleString()}</p>
            <p className="text-xs text-yellow-500">{payments.filter(p => p.payment_status === 'pending').length} payments</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-700">{payments.length}</p>
            <p className="text-xs text-blue-500">All time</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.user_name || 'Unknown User'}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">
                  {payment.membership_type || 'N/A'}
                </TableCell>
                <TableCell className="font-medium">
                  ₹{payment.amount?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-gray-500">
                    {payment.razorpay_payment_id || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.payment_status)}>
                    {payment.payment_status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No payment records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPaymentTab;
