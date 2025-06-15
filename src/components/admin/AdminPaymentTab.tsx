
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Download } from 'lucide-react';
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
  notes?: string;
  created_at: string;
  user_name?: string;
  membership_type?: string;
}

interface AdminPaymentTabProps {
  payments: PaymentRecord[];
  onAddPayment: (paymentData: any) => void;
  onUpdatePayment: (paymentId: string, paymentData: any) => void;
}

const AdminPaymentTab = ({ payments, onAddPayment, onUpdatePayment }: AdminPaymentTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    membership_id: '',
    amount: 0,
    payment_method: '',
    payment_status: 'pending',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      user_id: '',
      membership_id: '',
      amount: 0,
      payment_method: '',
      payment_status: 'pending',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = {
      ...formData,
      payment_date: formData.payment_status === 'paid' ? new Date().toISOString() : null
    };

    if (editingPayment) {
      onUpdatePayment(editingPayment.id, paymentData);
      setEditingPayment(null);
    } else {
      onAddPayment(paymentData);
      setIsAddDialogOpen(false);
    }
    resetForm();
  };

  const handleEdit = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setFormData({
      user_id: payment.user_id,
      membership_id: payment.membership_id || '',
      amount: payment.amount,
      payment_method: payment.payment_method || '',
      payment_status: payment.payment_status,
      notes: payment.notes || ''
    });
  };

  const exportPaymentsCSV = () => {
    try {
      const headers = [
        'Date',
        'User ID',
        'User Name',
        'Membership Type',
        'Amount',
        'Currency',
        'Payment Method',
        'Status',
        'Notes'
      ];

      const csvData = payments.map(payment => [
        payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A',
        payment.user_id || 'N/A',
        payment.user_name || 'N/A',
        payment.membership_type || 'N/A',
        payment.amount?.toString() || '0',
        payment.currency || 'INR',
        payment.payment_method || 'N/A',
        payment.payment_status || 'N/A',
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

  const PaymentForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="User ID"
        value={formData.user_id}
        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
        required
      />
      <Input
        placeholder="Membership ID (optional)"
        value={formData.membership_id}
        onChange={(e) => setFormData({ ...formData, membership_id: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
        required
      />
      <Input
        placeholder="Payment Method"
        value={formData.payment_method}
        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
      />
      <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />
      <Button type="submit">
        {editingPayment ? 'Update' : 'Add'} Payment
      </Button>
    </form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Tracking</CardTitle>
            <CardDescription>Manage and track membership payments</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportPaymentsCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Record</DialogTitle>
                  <DialogDescription>Create new payment tracking record</DialogDescription>
                </DialogHeader>
                <PaymentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.user_name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">{payment.user_id}</div>
                  </div>
                </TableCell>
                <TableCell>₹{payment.amount}</TableCell>
                <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.payment_status)}>
                    {payment.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(payment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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

        {editingPayment && (
          <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Payment Record</DialogTitle>
                <DialogDescription>Update payment details</DialogDescription>
              </DialogHeader>
              <PaymentForm />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPaymentTab;
