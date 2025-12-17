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
import { CheckCircle, XCircle, Eye, Download, FileText } from 'lucide-react';

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
        await supabase.functions.invoke('send-gmail', {
          body: {
            to: selectedApp.user_roles?.email,
            subject: 'ISPB - Membership Application Approved - Complete Your Payment',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">🎉 Congratulations! Your Application is Approved!</h2>
                <p>Dear ${selectedApp.user_roles?.full_name},</p>
                <p>We are pleased to inform you that your ISPB membership application has been approved by our membership committee.</p>
                <div style="margin: 20px 0; padding: 20px; background-color: #d1fae5; border-radius: 8px; border-left: 4px solid #059669;">
                  <h3 style="margin-top: 0; color: #065f46;">Complete Your Membership</h3>
                  <p style="margin-bottom: 10px;">To activate your membership, please complete the payment using the link below:</p>
                  <table style="width: 100%; margin: 15px 0;">
                    <tr><td style="padding: 8px 0;"><strong>Membership Type:</strong></td><td style="padding: 8px 0; text-transform: capitalize;">${selectedApp.membership_type}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong>Amount to Pay:</strong></td><td style="padding: 8px 0; font-size: 1.2em; color: #059669;"><strong>₹${selectedApp.amount}</strong></td></tr>
                  </table>
                </div>
                ${reviewNotes ? `<div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 8px;">
                  <h4 style="margin-top: 0; color: #1e40af;">Message from Admin:</h4>
                  <p style="margin-bottom: 0;">${reviewNotes}</p>
                </div>` : ''}
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://ispb.ejplantbreeding.org/enhanced-membership" style="display: inline-block; padding: 15px 40px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Payment Now</a>
                </div>
                <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Note:</strong> Please complete your payment at your earliest convenience. Once payment is confirmed, you will receive your membership confirmation and member code.</p>
                </div>
                <p style="color: #6b7280; margin-top: 20px;">For any queries, please contact us at <a href="mailto:ispbtnau@gmail.com" style="color: #059669;">ispbtnau@gmail.com</a></p>
                <p style="color: #6b7280;">Best regards,<br><strong>ISPB Membership Committee</strong></p>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      toast.success('Application approved! Payment link sent to applicant.');
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
            subject: 'ISPB - Membership Application Status',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Membership Application Update</h2>
                <p>Dear ${selectedApp.user_roles?.full_name},</p>
                <p>Thank you for your interest in becoming an ISPB member.</p>
                <p>We're sorry to inform you that after careful review, your membership application could not be approved as it did not meet our eligibility criteria.</p>
                ${reviewNotes ? `<div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <h4 style="margin-top: 0; color: #991b1b;">Review Notes:</h4>
                  <p style="margin-bottom: 0;">${reviewNotes}</p>
                </div>` : ''}
                <p style="margin-top: 20px;">If you believe this decision was made in error or have additional information to provide, you are welcome to submit a new application.</p>
                <p style="margin-top: 20px;">For any queries or clarification, please contact us at <a href="mailto:ispbtnau@gmail.com" style="color: #dc2626;">ispbtnau@gmail.com</a></p>
                <p style="color: #6b7280; margin-top: 30px;">Best regards,<br><strong>ISPB Membership Committee</strong></p>
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
                  <Button
                    size="sm"
                    variant={app.application_status === 'submitted' ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedApp(app);
                      setIsReviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {app.application_status === 'submitted' ? 'Review' : 'View'}
                  </Button>
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

                {/* Uploaded Documents Section */}
                {selectedApp.application_documents && Array.isArray(selectedApp.application_documents) && selectedApp.application_documents.length > 0 ? (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <Label className="text-sm font-medium mb-3 block">Uploaded Documents</Label>
                    <div className="space-y-2">
                      {selectedApp.application_documents.map((doc: any, index: number) => {
                        // Handle both old format (string) and new format (object)
                        const isObject = typeof doc === 'object' && doc.url;
                        const docName = isObject ? doc.name : doc;
                        const docUrl = isObject ? doc.url : null;
                        const docSize = isObject ? doc.size : null;

                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-background rounded-md border">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{docName || `Document ${index + 1}`}</p>
                                {docSize && (
                                  <p className="text-xs text-muted-foreground">
                                    {(docSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                                {!isObject && (
                                  <p className="text-xs text-amber-600">Legacy upload - file not in storage</p>
                                )}
                              </div>
                            </div>
                            {docUrl ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(docUrl, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = docUrl;
                                    link.download = docName || 'document';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Not Available
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/50 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  </div>
                )}

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

                {selectedApp.admin_review_notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium mb-2 block">Previous Admin Notes</Label>
                    <p className="text-sm text-muted-foreground">{selectedApp.admin_review_notes}</p>
                  </div>
                )}

                {selectedApp.application_status === 'submitted' && (
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
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminApplicationsTab;
