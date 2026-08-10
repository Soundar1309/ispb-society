import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, CreditCard, Search, RefreshCw, Filter, CheckCircle, Clock, XCircle, Trash2, FileText, Loader2, Eye, CheckCircle2, Upload, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual mark-as-paid dialog state
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [proofPayment, setProofPayment] = useState<PaymentRecord | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofReason, setProofReason] = useState('');
  const [proofUploading, setProofUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Step 1: Open the proof dialog
  const openProofDialog = (payment: PaymentRecord) => {
    if (!payment.membership_id || !payment.user_id) {
      toast.error('Cannot mark as paid: missing membership or user link.');
      return;
    }
    setProofPayment(payment);
    setProofFile(null);
    setProofReason('');
    setProofDialogOpen(true);
  };

  // Step 2: Submit - upload proof → save to DB → run all 11 steps
  const handleMarkAsPaid = async () => {
    if (!proofPayment) return;
    if (!proofFile) {
      toast.error('Please upload a payment proof (screenshot or PDF).');
      return;
    }
    if (!proofReason.trim() || proofReason.trim().length < 10) {
      toast.error('Please enter a reason (minimum 10 characters).');
      return;
    }

    setProofUploading(true);
    setProcessingId(proofPayment.id);

    try {
      // Upload proof file to payment-proofs bucket
      const fileExt = proofFile.name.split('.').pop();
      const filePath = `${proofPayment.user_id}/${proofPayment.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile, { upsert: true });

      if (uploadError) throw new Error('Failed to upload proof: ' + uploadError.message);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const proofUrl = urlData?.publicUrl || '';

      // Save proof URL + reason to orders table (requires migration - non-blocking if columns missing)
      try {
        await supabase
          .from('orders')
          .update({
            manual_payment_notes: proofReason.trim(),
            manual_payment_proof_url: proofUrl,
          } as any)
          .eq('id', proofPayment.id);
      } catch (colErr) {
        console.warn('Could not save proof metadata to orders (columns may not exist yet):', colErr);
      }

      // Now run all 11 steps via edge function
      const { data, error } = await supabase.functions.invoke('admin-mark-paid', {
        body: {
          orderId: proofPayment.id,
          membershipId: proofPayment.membership_id,
          userId: proofPayment.user_id,
          proofUrl,
          notes: proofReason.trim(),
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Unknown error from edge function');
      }

      setProofDialogOpen(false);
      fetchPayments();
      toast.success(
        `✅ ${proofPayment.user_name || proofPayment.user_email} activated! Member Code: ${data.memberCode}. Welcome email sent.`
      );
    } catch (error: any) {
      console.error('Error marking payment as paid:', error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setProofUploading(false);
      setProcessingId(null);
    }
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

  const handleDownloadInvoice = async (payment: PaymentRecord) => {
    try {
      setProcessingId(payment.id);
      toast.loading('Preparing invoice for download...');

      let htmlContent = '';

      // Always generate fresh invoice to ensure latest design/fixes are applied
      // This bypasses potentially stale files in storage
      if (!htmlContent) {
        const { data, error } = await supabase.functions.invoke('generate-invoice', {
          body: {
            orderId: payment.id,
            membershipId: payment.membership_id,
            userId: payment.user_id
          }
        });

        if (error) throw error;
        if (data?.invoiceHtml) {
          htmlContent = data.invoiceHtml;
          // Refresh list to update invoice_url if newly generated
          fetchPayments();
        } else {
          throw new Error('No invoice data returned');
        }
      }

      if (!htmlContent) {
        throw new Error('Failed to retrieve invoice content');
      }

      // Create an iframe to render the invoice
      // We position it ON SCREEN with a high Z-Index to ensure it renders
      // It will look like a "preview" overlay for a second
      const iframe = document.createElement('iframe');

      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0'; // Visible!
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.zIndex = '9999';
      iframe.style.backgroundColor = 'white';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Could not create iframe document');
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Wait for resources to load
      await new Promise<void>((resolve) => {
        if (iframe.contentWindow) {
          iframe.contentWindow.onload = () => resolve();
        } else {
          iframe.onload = () => resolve();
        }
        setTimeout(resolve, 2000); // 2s timeout
      });

      // Extra delay for fonts
      await new Promise(resolve => setTimeout(resolve, 800));

      const opt = {
        margin: 10,
        filename: `ISPB_Invoice_${payment.razorpay_payment_id || payment.id.slice(0, 8)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowWidth: 1024
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      // Generate PDF
      await html2pdf().set(opt).from(doc.body).save();

      // Cleanup
      document.body.removeChild(iframe);
      toast.dismiss();
      toast.success('Invoice downloaded successfully');

    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.dismiss();
      toast.error('Failed to download invoice');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewInvoice = async (payment: PaymentRecord) => {
    try {
      setProcessingId(payment.id);

      let htmlContent = '';
      // Always regenerate to ensure latest design
      // toast.loading('Generating invoice...'); // Loading handled by if check below effectively

      if (!htmlContent) {
        toast.loading('Generating invoice...');
        const { data, error } = await supabase.functions.invoke('generate-invoice', {
          body: {
            orderId: payment.id,
            membershipId: payment.membership_id,
            userId: payment.user_id
          }
        });

        if (error) throw error;

        if (data?.invoiceHtml) {
          htmlContent = data.invoiceHtml;
          fetchPayments();
        }
      }

      if (htmlContent) {
        // use document.write for reliable rendering
        const win = window.open('', '_blank');
        if (win) {
          win.document.open();
          win.document.write(htmlContent);
          win.document.close();
          toast.dismiss();
        } else {
          throw new Error('Popup blocked');
        }
      } else {
        throw new Error('Could not get invoice content');
      }

    } catch (error) {
      console.error('Error viewing invoice:', error);
      toast.dismiss();
      toast.error('Failed to view invoice');
    } finally {
      setProcessingId(null);
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
    <>
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
            <p className="text-2xl font-bold text-green-700">&#8377;{totals.paidAmount.toLocaleString()}</p>
            <p className="text-xs text-green-500">{totals.paidCount} successful payments</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">&#8377;{totals.pendingAmount.toLocaleString()}</p>
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
                      <div className="font-medium text-sm">{payment.user_name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500">{payment.user_email || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize text-sm">{payment.membership_type}</div>
                      {payment.member_code && (
                        <div className="text-xs text-green-600 font-mono">{payment.member_code}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm">
                        &#8377;{payment.amount?.toLocaleString() || 0}
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
                        {payment.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processingId === payment.id}
                            onClick={() => openProofDialog(payment)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            title="Mark as Paid (requires proof & reason)"
                          >
                            {processingId === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {payment.status === 'paid' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(payment)}
                              disabled={processingId === payment.id}
                              className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment)}
                              disabled={processingId === payment.id}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              title="Download Invoice PDF"
                            >
                              {processingId === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        < AlertDialog >
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

    {/* Manual Mark-as-Paid: Proof & Reason Dialog */}
    <Dialog open={proofDialogOpen} onOpenChange={(open) => { if (!proofUploading) setProofDialogOpen(open); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Manual Payment Confirmation
          </DialogTitle>
          <DialogDescription className="text-left space-y-1">
            {proofPayment && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border text-sm space-y-1">
                <div><span className="text-slate-500">Member:</span> <strong>{proofPayment.user_name || proofPayment.user_email}</strong></div>
                <div><span className="text-slate-500">Email:</span> {proofPayment.user_email}</div>
                <div><span className="text-slate-500">Amount:</span> <strong>₹{proofPayment.amount?.toLocaleString()}</strong> — {proofPayment.membership_type}</div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Warning */}
          <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>This action will permanently activate the membership and send a welcome email. Both proof and reason are required.</span>
          </div>

          {/* Proof upload */}
          <div className="space-y-2">
            <Label htmlFor="proof-upload" className="text-sm font-medium">
              Payment Proof <span className="text-red-500">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                proofFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="proof-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              {proofFile ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{proofFile.name}</p>
                    <p className="text-xs text-green-600">{(proofFile.size / 1024).toFixed(1)} KB — Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 space-y-1">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm font-medium">Click to upload payment proof</p>
                  <p className="text-xs">Screenshot, PDF, or image (max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="proof-reason" className="text-sm font-medium">
              Reason for Manual Entry <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="proof-reason"
              placeholder="e.g. Payment confirmed in Razorpay dashboard (ID: pay_xxxxx) but webhook did not trigger. Verified by admin on 10-Aug-2026."
              value={proofReason}
              onChange={(e) => setProofReason(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            <div className={`text-xs text-right ${proofReason.length < 10 ? 'text-red-400' : 'text-slate-400'}`}>
              {proofReason.length} characters {proofReason.length < 10 ? `(need ${10 - proofReason.length} more)` : '✓'}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setProofDialogOpen(false)}
            disabled={proofUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMarkAsPaid}
            disabled={proofUploading || !proofFile || proofReason.trim().length < 10}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
          >
            {proofUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm & Activate</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AdminPaymentTab;
