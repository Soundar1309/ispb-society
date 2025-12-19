import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, CreditCard, Search, RefreshCw, Filter, CheckCircle, Clock, XCircle, Trash2, FileText } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRecord {
  id: string;
  membership_id: string | null;
  user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at: string;
  updated_at: string;
  invoice_url: string | null;
  // Joined data
  user_name: string;
  user_email: string;
  membership_type: string;
  member_code: string | null;
}

interface AdminPaymentTabProps {
  payments?: any[];
  onAddPayment?: (paymentData: unknown) => void;
  onUpdatePayment?: (paymentId: string, paymentData: unknown) => void;
}

const AdminPaymentTab = ({ onAddPayment, onUpdatePayment }: AdminPaymentTabProps) => {
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipTypeFilter, setMembershipTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Fetch payments with proper joins
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch memberships
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select('id, membership_type, member_code, user_id');

      if (membershipsError) throw membershipsError;

      // Fetch user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, full_name, email');

      if (userRolesError) throw userRolesError;

      // Create lookup maps
      const membershipsMap = new Map(membershipsData?.map(m => [m.id, m]) || []);
      const userRolesMap = new Map(userRolesData?.map(u => [u.user_id, u]) || []);

      // Join data
      const enrichedPayments: PaymentRecord[] = (ordersData || []).map(order => {
        const membership = order.membership_id ? membershipsMap.get(order.membership_id) : null;
        const userRole = order.user_id ? userRolesMap.get(order.user_id) : null;

        return {
          id: order.id,
          membership_id: order.membership_id,
          user_id: order.user_id,
          amount: order.amount,
          currency: order.currency || 'INR',
          status: order.status,
          payment_method: order.payment_method,
          razorpay_payment_id: order.razorpay_payment_id,
          razorpay_order_id: order.razorpay_order_id,
          created_at: order.created_at,
          updated_at: order.updated_at,
          invoice_url: order.invoice_url || null,
          user_name: userRole?.full_name || 'Unknown User',
          user_email: userRole?.email || 'N/A',
          membership_type: membership?.membership_type || 'N/A',
          member_code: membership?.member_code || null,
        };
      });

      setAllPayments(enrichedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error loading payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          payment.user_name?.toLowerCase().includes(query) ||
          payment.user_email?.toLowerCase().includes(query) ||
          payment.razorpay_payment_id?.toLowerCase().includes(query) ||
          payment.razorpay_order_id?.toLowerCase().includes(query) ||
          payment.member_code?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }

      // Membership type filter
      if (membershipTypeFilter !== 'all' && payment.membership_type !== membershipTypeFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.created_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            if (paymentDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (paymentDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (paymentDate < monthAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            if (paymentDate < yearAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [allPayments, searchQuery, statusFilter, membershipTypeFilter, dateFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const paid = filteredPayments.filter(p => p.status === 'paid');
    const pending = filteredPayments.filter(p => p.status === 'pending');
    const failed = filteredPayments.filter(p => p.status === 'failed' || p.status === 'cancelled');

    return {
      paidAmount: paid.reduce((sum, p) => sum + (p.amount || 0), 0),
      paidCount: paid.length,
      pendingAmount: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingCount: pending.length,
      failedCount: failed.length,
      totalCount: filteredPayments.length,
    };
  }, [filteredPayments]);

  // Export CSV
  const exportPaymentsCSV = () => {
    try {
      const headers = [
        'Date',
        'User Name',
        'Email',
        'Membership Type',
        'Member Code',
        'Amount',
        'Currency',
        'Status',
        'Payment Method',
        'Razorpay Payment ID',
        'Razorpay Order ID'
      ];

      const csvData = filteredPayments.map(payment => [
        payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'N/A',
        payment.user_name || 'N/A',
        payment.user_email || 'N/A',
        payment.membership_type || 'N/A',
        payment.member_code || 'N/A',
        payment.amount?.toString() || '0',
        payment.currency || 'INR',
        payment.status || 'N/A',
        payment.payment_method || 'Razorpay',
        payment.razorpay_payment_id || 'N/A',
        payment.razorpay_order_id || 'N/A'
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
      link.setAttribute('download', `ispb_payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filteredPayments.length} payment records to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting CSV file');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {status === 'cancelled' ? 'Cancelled' : 'Failed'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMembershipTypeFilter('all');
    setDateFilter('all');
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      setAllPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success('Payment record deleted successfully');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error deleting payment record');
    }
  };

  const handleGenerateInvoice = async (payment: PaymentRecord) => {
    try {
      toast.loading('Generating invoice...');
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          orderId: payment.id,
          membershipId: payment.membership_id,
          userId: payment.user_id
        }
      });

      if (error) throw error;

      if (data?.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
        toast.dismiss();
        toast.success('Invoice generated successfully');
        fetchPayments(); // Refresh to get updated invoice_url
      } else if (data?.invoiceHtml) {
        // Open HTML invoice in new tab
        const blob = new Blob([data.invoiceHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.dismiss();
        toast.success('Invoice generated');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.dismiss();
      toast.error('Failed to generate invoice');
    }
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || membershipTypeFilter !== 'all' || dateFilter !== 'all';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Records
            </CardTitle>
            <CardDescription>
              View and manage all membership payment transactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPayments} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportPaymentsCSV} variant="outline" size="sm" disabled={filteredPayments.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600 font-medium">Total Collected</p>
            </div>
            <p className="text-2xl font-bold text-green-700">₹{totals.paidAmount.toLocaleString()}</p>
            <p className="text-xs text-green-500">{totals.paidCount} successful payments</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">₹{totals.pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-yellow-500">{totals.pendingCount} awaiting payment</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600 font-medium">Failed/Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{totals.failedCount}</p>
            <p className="text-xs text-red-500">transactions</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">Total Records</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{totals.totalCount}</p>
            <p className="text-xs text-blue-500">
              {hasActiveFilters ? `filtered from ${allPayments.length}` : 'all time'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs">
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, email, payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={membershipTypeFilter} onValueChange={setMembershipTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Membership</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Payment ID</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500">Loading payments...</p>
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500">
                      {hasActiveFilters ? 'No payments match your filters' : 'No payment records found'}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="text-sm">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {payment.created_at ? new Date(payment.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{payment.user_name}</div>
                      <div className="text-xs text-slate-500">{payment.user_email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize text-sm">{payment.membership_type}</div>
                      {payment.member_code && (
                        <div className="text-xs text-green-600 font-mono">{payment.member_code}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">
                        ₹{payment.amount?.toLocaleString() || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.razorpay_payment_id ? (
                        <div>
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {payment.razorpay_payment_id}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.status === 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (payment.invoice_url) {
                                window.open(payment.invoice_url, '_blank');
                              } else {
                                handleGenerateInvoice(payment);
                              }
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            title={payment.invoice_url ? 'Download Invoice' : 'Generate Invoice'}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this payment record for {payment.user_name}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePayment(payment.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        {filteredPayments.length > 0 && (
          <div className="text-xs text-slate-500 text-center">
            Showing {filteredPayments.length} of {allPayments.length} total payment records
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPaymentTab;
