import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, Upload, FileText, AlertCircle, Clock, XCircle, Mail } from 'lucide-react';

interface ApplicationStep {
  step: number;
  title: string;
  description: string;
}

const STEPS: ApplicationStep[] = [
  { step: 1, title: 'Application Form', description: 'Complete the online membership application form' },
  { step: 2, title: 'Upload Documents', description: 'Submit required documents (PDF, JPG, PNG)' },
  { step: 3, title: 'Application Review', description: 'Your application is under review' }
];

interface MembershipPlan {
  id: string;
  plan_type: string;
  title: string;
  price: number;
  duration_months: number;
  features: any;
  is_active: boolean;
}

const MembershipApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    institution: '',
    designation: '',
    specialization: '',
    membership_type: '',
    remarks: '',
    documents: [] as File[]
  });

  useEffect(() => {
    if (user) {
      checkExistingApplication();
      fetchMembershipPlans();
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setApplicationData(prev => ({
        ...prev,
        full_name: data.full_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        institution: data.institution || '',
        designation: data.designation || '',
        specialization: data.specialization || ''
      }));
    }
  };

  const fetchMembershipPlans = async () => {
    const { data } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (data) {
      setMembershipPlans(data);
    }
  };

  const checkExistingApplication = async () => {
    setIsLoading(true);
    try {
      // Check for any existing application
      const { data } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingApplication(data);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate documents
      if (applicationData.documents.length === 0) {
        toast.error('Please upload at least one document');
        setIsLoading(false);
        return;
      }

      // Check file types
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      for (const file of applicationData.documents) {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}. Only PDF, JPG, and PNG are allowed.`);
          setIsLoading(false);
          return;
        }
      }

      // Update user role with application data
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user?.id,
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          institution: applicationData.institution,
          designation: applicationData.designation,
          specialization: applicationData.specialization,
          role: 'member',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (roleError) throw roleError;

      // Get membership plan details
      const selectedPlan = membershipPlans.find(p => p.plan_type === applicationData.membership_type);
      if (!selectedPlan) throw new Error('Membership plan not found');

      // Upload documents to storage
      const uploadedDocs = [];
      for (const file of applicationData.documents) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `application-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('publications')
          .upload(filePath, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { data: urlData } = supabase.storage
          .from('publications')
          .getPublicUrl(filePath);

        uploadedDocs.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          path: filePath
        });
      }

      // Create membership application
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user?.id,
          membership_type: applicationData.membership_type,
          amount: selectedPlan.price,
          status: 'pending',
          payment_status: 'pending',
          application_status: 'submitted',
          application_documents: uploadedDocs,
          admin_review_notes: applicationData.remarks ? `Applicant Remarks: ${applicationData.remarks}` : null,
          currency: 'INR'
        })
        .select()
        .single();

      if (membershipError) throw membershipError;

      // Send notification email to admin
      try {
        await supabase.functions.invoke('send-gmail', {
          body: {
            to: 'ispbtnau@gmail.com',
            subject: 'New Membership Application Received - ISPB',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">New Membership Application</h2>
                <p>A new membership application has been submitted.</p>
                <h3 style="color: #374151;">Applicant Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.full_name}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.email}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.phone}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Institution:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.institution}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Designation:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.designation}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Specialization:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.specialization}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Membership Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${selectedPlan.title}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${selectedPlan.price}</td></tr>
                  ${applicationData.remarks ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Remarks:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.remarks}</td></tr>` : ''}
                </table>
                <p style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                  Please review and approve the application in the admin panel at <a href="https://ispb.ejplantbreeding.org/admin">Admin Panel</a>
                </p>
              </div>
            `
          }
        });

        // Send confirmation email to user
        await supabase.functions.invoke('send-gmail', {
          body: {
            to: applicationData.email,
            subject: 'ISPB - Membership Application Received',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Application Received Successfully!</h2>
                <p>Dear ${applicationData.full_name},</p>
                <p>Thank you for applying for ISPB membership. We have received your application and it is now under review.</p>
                <h3 style="color: #374151;">Application Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Membership Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${selectedPlan.title}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">₹${selectedPlan.price}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Institution:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationData.institution}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><span style="color: #2563eb; font-weight: bold;">Under Review</span></td></tr>
                </table>
                <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
                  <h4 style="margin-top: 0; color: #1e40af;">What's Next?</h4>
                  <ul style="margin-bottom: 0;">
                    <li>Your application will be reviewed within 7-10 working days</li>
                    <li>You'll receive an email once your application is reviewed</li>
                    <li>If approved, a payment link will be sent to you</li>
                    <li>After payment, you'll receive your membership confirmation</li>
                  </ul>
                </div>
                <p style="margin-top: 20px; color: #6b7280;">For any queries, please contact us at <a href="mailto:ispbtnau@gmail.com">ispbtnau@gmail.com</a></p>
                <p style="color: #6b7280;">Best regards,<br><strong>ISPB Team</strong></p>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      toast.success('Application submitted successfully!');
      setExistingApplication(membership);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      const validFiles = files.filter(file => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}. Only PDF, JPG, and PNG are allowed.`);
          return false;
        }
        return true;
      });
      
      setApplicationData({ ...applicationData, documents: validFiles });
    }
  };

  const handleReapply = () => {
    setExistingApplication(null);
    setCurrentStep(1);
    setApplicationData({
      ...applicationData,
      documents: []
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to apply for membership.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/auth">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show status page based on existing application
  if (existingApplication) {
    const status = existingApplication.application_status;
    const paymentStatus = existingApplication.payment_status;

    // If approved and paid - show member status
    if (status === 'approved' && paymentStatus === 'paid') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-800">Congratulations!</CardTitle>
                <CardDescription className="text-green-700">
                  You are now an ISPB {existingApplication.membership_type} Member
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {existingApplication.member_code && (
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Your Member Code</p>
                    <p className="text-3xl font-bold text-green-700">{existingApplication.member_code}</p>
                  </div>
                )}
                <p className="text-gray-600">
                  For further details, please contact us at{' '}
                  <a href="mailto:ispbtnau@gmail.com" className="text-green-600 font-medium">
                    ispbtnau@gmail.com
                  </a>
                </p>
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // If approved but not paid - show payment pending
    if (status === 'approved' && paymentStatus !== 'paid') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-blue-800">Application Approved!</CardTitle>
                <CardDescription className="text-blue-700">
                  Please complete your payment to activate membership
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Amount to Pay</p>
                  <p className="text-3xl font-bold text-blue-700">₹{existingApplication.amount}</p>
                  <p className="text-sm text-gray-500 capitalize">{existingApplication.membership_type} Membership</p>
                </div>
                <Button asChild className="w-full">
                  <a href="/enhanced-membership">Complete Payment</a>
                </Button>
                <p className="text-sm text-gray-600">
                  If you haven't received the payment link, please contact{' '}
                  <a href="mailto:ispbtnau@gmail.com" className="text-blue-600">ispbtnau@gmail.com</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // If submitted - show under review
    if (status === 'submitted') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="text-center">
                <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-800">Application Under Review</CardTitle>
                <CardDescription className="text-yellow-700">
                  Your application is being reviewed by our membership committee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Membership Type</p>
                      <p className="font-medium capitalize">{existingApplication.membership_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium">₹{existingApplication.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted On</p>
                      <p className="font-medium">{new Date(existingApplication.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-yellow-200">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> What to Expect
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Review typically takes 7-10 working days</li>
                    <li>• You'll receive an email once reviewed</li>
                    <li>• If approved, payment link will be sent</li>
                  </ul>
                </div>
                <p className="text-center text-sm text-gray-600">
                  For queries, contact <a href="mailto:ispbtnau@gmail.com" className="text-yellow-700 font-medium">ispbtnau@gmail.com</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // If rejected - allow reapply
    if (status === 'rejected') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-800">Application Not Approved</CardTitle>
                <CardDescription className="text-red-700">
                  Unfortunately, your application could not be approved at this time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {existingApplication.admin_review_notes && (
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <h4 className="font-medium mb-2">Review Notes:</h4>
                    <p className="text-sm text-gray-600">{existingApplication.admin_review_notes}</p>
                  </div>
                )}
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600">
                    You may reapply with updated information and documents.
                  </p>
                  <Button onClick={handleReapply} className="w-full">
                    Submit New Application
                  </Button>
                  <p className="text-sm text-gray-500">
                    For clarification, contact <a href="mailto:ispbtnau@gmail.com" className="text-red-600">ispbtnau@gmail.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Membership Application</h1>
          <p className="text-lg text-gray-600">Join ISPB and become part of our research community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= s.step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > s.step ? <CheckCircle className="h-6 w-6" /> : s.step}
                </div>
                <p className={`text-xs mt-2 text-center ${currentStep >= s.step ? 'text-green-600' : 'text-gray-500'}`}>
                  {s.title}
                </p>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 w-full ${currentStep > s.step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Application Form */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Application Form</CardTitle>
              <CardDescription>Complete your membership application details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (!applicationData.membership_type) {
                  toast.error('Please select a membership type');
                  return;
                }
                setCurrentStep(2); 
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={applicationData.full_name}
                      onChange={(e) => setApplicationData({ ...applicationData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={applicationData.phone}
                      onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      value={applicationData.institution}
                      onChange={(e) => setApplicationData({ ...applicationData, institution: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      value={applicationData.designation}
                      onChange={(e) => setApplicationData({ ...applicationData, designation: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={applicationData.specialization}
                      onChange={(e) => setApplicationData({ ...applicationData, specialization: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="membership_type">Membership Type *</Label>
                  <Select 
                    value={applicationData.membership_type} 
                    onValueChange={(value) => setApplicationData({ ...applicationData, membership_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.plan_type}>
                          {plan.title} - ₹{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    rows={3}
                    value={applicationData.remarks}
                    onChange={(e) => setApplicationData({ ...applicationData, remarks: e.target.value })}
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  Continue to Document Upload
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Upload Documents</CardTitle>
              <CardDescription>Upload supporting documents (PDF, JPG, or PNG only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Required Documents:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Proof of identity (Aadhar Card / PAN Card / Passport)</li>
                      <li>Institutional ID or proof of affiliation</li>
                      <li>Recent passport size photograph</li>
                    </ul>
                    <p className="mt-2 text-blue-600">Accepted formats: PDF, JPG, PNG</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Label htmlFor="documents" className="cursor-pointer">
                  <p className="text-gray-600 mb-2">Click to upload documents</p>
                  <p className="text-sm text-gray-500">PDF, JPG, or PNG files only</p>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {applicationData.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Selected files:</p>
                  {applicationData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitApplication} 
                  disabled={isLoading || applicationData.documents.length === 0}
                  className="flex-1"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-800">Application Submitted!</CardTitle>
              <CardDescription className="text-green-700">
                Your membership application has been successfully submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">A confirmation email has been sent to:</p>
                <p className="font-medium text-gray-900">{applicationData.email}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ul className="text-sm text-gray-600 text-left space-y-1">
                  <li>• Your application will be reviewed within 7-10 working days</li>
                  <li>• You'll receive an email notification about the status</li>
                  <li>• If approved, a payment link will be sent to you</li>
                </ul>
              </div>
              <Button asChild>
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MembershipApplication;
