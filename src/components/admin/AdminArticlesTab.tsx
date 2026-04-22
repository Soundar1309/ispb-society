import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import {
  FileText,
  Mail,
  User,
  Hash,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  CreditCard,
  Building,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ArticleSubmission {
  id: string;
  name: string;
  email: string;
  author_name: string;
  article_id: string;
  article_name: string;
  amount: number;
  payment_status: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  created_at: string;
}

interface AdminArticlesTabProps {
  articleSubmissions: ArticleSubmission[];
}

const AdminArticlesTab = ({ articleSubmissions }: AdminArticlesTabProps) => {
  const handleDownloadReceipt = (submission: ArticleSubmission) => {

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #333; max-width: 800px; margin: auto; border: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #10b981; padding-bottom: 20px;">
          <div>
            <h1 style="color: #059669; margin: 0; font-size: 28px;">EJPB</h1>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Electronic Journal of Plant Breeding</p>
            <p style="margin: 2px 0; color: #999; font-size: 12px;">Official Publication of ISPB</p>
            <p style="margin: 2px 0; color: #999; font-size: 12px;">TNAU, Coimbatore - 641003</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; color: #374151;">RECEIPT</h2>
            <p style="margin: 5px 0; font-weight: bold; color: #059669;">PAID</p>
            <p style="margin: 2px 0; font-size: 12px; color: #666;">Date: ${format(new Date(submission.created_at), 'PPP')}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px;">Bill To</h3>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${submission.name}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">${submission.email}</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px;">Manuscript Info</h3>
            <p style="margin: 0; font-weight: bold; font-size: 14px;">${submission.article_name}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #666;">ID: ${submission.article_id}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f9fafb; text-align: left;">
              <th style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">Description</th>
              <th style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 14px;">Article Submission Fee for "${submission.article_name}"</td>
              <td style="padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right; font-weight: bold;">₹${submission.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="font-size: 12px; color: #999;">
            <p style="margin: 2px 0;">Order ID: ${submission.razorpay_order_id}</p>
            <p style="margin: 2px 0;">Payment ID: ${submission.razorpay_payment_id || 'N/A'}</p>
            <p style="margin: 2px 0;">Generated on: ${format(new Date(), 'PPP p')}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #666; font-size: 14px;">Total Paid</p>
            <p style="margin: 5px 0; color: #059669; font-size: 24px; font-weight: bold;">₹${submission.amount.toLocaleString()}</p>
          </div>
        </div>

        <div style="margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #999;">This is a computer-generated receipt. No signature required.</p>
          <p style="margin: 5px 0; font-size: 12px; color: #999;">Thank you for publishing with EJPB.</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Receipt-${submission.article_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as const;

    html2pdf().from(element).set(opt).save();
    toast.success('Receipt downloading...');
  };

  return (
    <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
              <FileText className="w-6 h-6" />
              Article Submissions
            </CardTitle>
            <CardDescription className="text-gray-500">
              Track and manage guest article submissions and payments
            </CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            Total: {articleSubmissions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold">Submitter Info</TableHead>
                <TableHead className="font-semibold">Article Details</TableHead>
                <TableHead className="font-semibold text-center">Date</TableHead>
                <TableHead className="font-semibold text-center">Amount</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articleSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    No article submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                articleSubmissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {submission.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {submission.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium text-primary">
                          <FileText className="w-3.5 h-3.5" />
                          {submission.article_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Hash className="w-3.5 h-3.5 text-gray-400" />
                          ID: {submission.article_id}
                        </div>
                        <div className="text-xs text-gray-400">
                          Author: {submission.author_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{format(new Date(submission.created_at), 'dd MMM yyyy')}</span>
                        <span className="text-[10px] text-gray-400">{format(new Date(submission.created_at), 'hh:mm a')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-gray-700">
                      ₹{submission.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center justify-center gap-1 w-20 mx-auto">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                <Info className="w-5 h-5 text-primary" />
                                Submission Details
                              </DialogTitle>
                              <DialogDescription>
                                Full information for submission ID: {submission.id}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900 border-b pb-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    Submitter Details
                                  </h4>
                                  <div className="space-y-1 pl-6">
                                    <p className="text-sm"><span className="text-gray-500">Name:</span> {submission.name}</p>
                                    <p className="text-sm"><span className="text-gray-500">Email:</span> {submission.email}</p>
                                    <p className="text-sm"><span className="text-gray-500">Author Name:</span> {submission.author_name}</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900 border-b pb-1">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Article Details
                                  </h4>
                                  <div className="space-y-1 pl-6">
                                    <p className="text-sm font-medium">{submission.article_name}</p>
                                    <p className="text-sm"><span className="text-gray-500">Manuscript ID:</span> {submission.article_id}</p>
                                    <p className="text-sm text-gray-500 italic">Submitted on: {format(new Date(submission.created_at), 'PPP p')}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900 border-b pb-1">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    Payment Information
                                  </h4>
                                  <div className="space-y-1 pl-6">
                                    <p className="text-sm flex items-center justify-between">
                                      <span className="text-gray-500">Status:</span>
                                      <Badge className="bg-emerald-500">
                                        Paid
                                      </Badge>
                                    </p>
                                    <p className="text-sm flex items-center justify-between">
                                      <span className="text-gray-500">Amount:</span>
                                      <span className="font-bold">₹{submission.amount.toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm">
                                      <span className="text-gray-500">Order ID:</span>
                                      <code className="text-[10px] ml-2 bg-gray-100 px-1 rounded">{submission.razorpay_order_id}</code>
                                    </p>
                                    {submission.razorpay_payment_id && (
                                      <p className="text-sm">
                                        <span className="text-gray-500">Payment ID:</span>
                                        <code className="text-[10px] ml-2 bg-gray-100 px-1 rounded">{submission.razorpay_payment_id}</code>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-900 border-b pb-1">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    Organization
                                  </h4>
                                  <div className="space-y-1 pl-6">
                                    <p className="text-sm font-medium">EJPB</p>
                                    <p className="text-xs text-gray-500">Electronic Journal of Plant Breeding</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                              {submission.payment_status === 'paid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                  onClick={() => handleDownloadReceipt(submission)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download Receipt
                                </Button>
                              )}
                              <DialogTrigger asChild>
                                <Button variant="secondary" size="sm">
                                  Close
                                </Button>
                              </DialogTrigger>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadReceipt(submission)}
                        >
                          <Download className="h-4 w-4 text-emerald-600" />
                          <span className="sr-only">Download Receipt</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminArticlesTab;
