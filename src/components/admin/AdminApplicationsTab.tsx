import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  membership_type: string;
  amount: number;
  status: string;
  payment_status: string;
  application_status: string;
  application_documents: any;
  admin_review_notes: string | null;
  created_at: string;
  user_roles?: {
    full_name: string;
    email: string;
    phone: string;
    institution: string;
    designation: string;
  };
}

interface AdminApplicationsTabProps {
  applications: Application[];
  onRefresh: () => void;
}

const AdminApplicationsTab = ({ applications, onRefresh }: AdminApplicationsTabProps) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      payment_pending: 'bg-purple-100 text-purple-800',
      active: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('memberships')
        .update({
          application_status: 'approved',
          admin_review_notes: reviewNotes,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (updateError) throw updateError;

      // Send approval email with payment link
      try {
        const { data: planData } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('plan_type', selectedApp.membership_type)
          .single();

        await supabase.functions.invoke('send-gmail', {
          body: {
            to: selectedApp.user_roles?.email,
            subject: 'ISPB - Membership Application Approved',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Membership Application Approved!</h2>
                <p>Dear ${selectedApp.user_roles?.full_name},</p>
                <p>We are pleased to inform you that your membership application has been approved.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #d1fae5; border-radius: 8px; border-left: 4px solid #059669;">
                  <h3 style="margin-top: 0; color: #065f46;">Next Steps:</h3>
                  <ol style="margin-bottom: 0;">
                    <li>Click the link below to proceed with payment</li>
                    <li>Complete the payment process</li>
                    <li>You'll receive your membership confirmation</li>
                  </ol>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Membership Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${selectedApp.membership_type}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount to Pay:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>₹${selectedApp.amount}</strong></td></tr>
                </table>
                ${reviewNotes ? `<div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 8px;">
                  <h4 style="margin-top: 0; color: #1e40af;">Admin Notes:</h4>
                  <p style="margin-bottom: 0;">${reviewNotes}</p>
                </div>` : ''}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/enhanced-membership" style="display: inline-block; padding: 12px 30px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Payment</a>
                </div>
                <p style="color: #6b7280;">For any queries, please contact us at ispbtnau@gmail.com</p>
                <p style="color: #6b7280;">Best regards,<br><strong>ISPB Team</strong></p>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      toast.success('Application approved successfully!');
      setIsReviewDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes('');
      onRefresh();
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast.error(error.message || 'Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('memberships')
        .update({
          application_status: 'rejected',
          status: 'cancelled',
          admin_review_notes: reviewNotes,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Send rejection email
      try {
        await supabase.functions.invoke('send-gmail', {
          body: {
            to: selectedApp.user_roles?.email,
            subject: 'ISPB - Membership Application Update',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Regarding Your Membership Application</h2>
                <p>Dear ${selectedApp.user_roles?.full_name},</p>
                <p>Thank you for your interest in ISPB membership.</p>
                <p>After careful review, we regret to inform you that we are unable to process your application at this time.</p>
                ${reviewNotes ? `<div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <h4 style="margin-top: 0; color: #991b1b;">Review Notes:</h4>
                  <p style="margin-bottom: 0;">${reviewNotes}</p>
                </div>` : ''}
                <p style="margin-top: 20px;">If you have any questions or would like to discuss this decision, please feel free to contact us at ispbtnau@gmail.com</p>
                <p style="color: #6b7280;">Best regards,<br><strong>ISPB Team</strong></p>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      toast.success('Application rejected');
      setIsReviewDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes('');
      onRefresh();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error(error.message || 'Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Applications</CardTitle>
        <CardDescription>Review and approve membership applications</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  {new Date(app.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{app.user_roles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{app.user_roles?.email}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{app.membership_type}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(app.application_status)}>
                    {app.application_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {app.application_status === 'submitted' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setIsReviewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No pending applications
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>Review and approve or reject this membership application</DialogDescription>
            </DialogHeader>
            
            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Name</Label>
                    <p>{selectedApp.user_roles?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p>{selectedApp.user_roles?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p>{selectedApp.user_roles?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Institution</Label>
                    <p>{selectedApp.user_roles?.institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Designation</Label>
                    <p>{selectedApp.user_roles?.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Membership Type</Label>
                    <p className="capitalize">{selectedApp.membership_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount</Label>
                    <p>₹{selectedApp.amount}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reviewNotes">Admin Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    rows={4}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about the application review..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Approve & Send Payment Link'}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminApplicationsTab;
