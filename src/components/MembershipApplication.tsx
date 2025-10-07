import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle, Upload, FileText } from 'lucide-react';

interface ApplicationStep {
  step: number;
  title: string;
  description: string;
}

const STEPS: ApplicationStep[] = [
  { step: 1, title: 'Application Form', description: 'Complete the online membership application form' },
  { step: 2, title: 'Upload Documents', description: 'Submit required documents' },
  { step: 3, title: 'Application Review', description: 'Reviewed by membership committee (7-10 working days)' },
  { step: 4, title: 'Payment', description: 'Make secure payment after admin approval' },
  { step: 5, title: 'Confirmation', description: 'Receive membership confirmation' }
];

const MembershipApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    institution: '',
    designation: '',
    specialization: '',
    membership_type: '',
    reason_for_joining: '',
    documents: [] as File[]
  });

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user role with application data
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          full_name: applicationData.full_name,
          email: applicationData.email,
          phone: applicationData.phone,
          institution: applicationData.institution,
          designation: applicationData.designation,
          specialization: applicationData.specialization,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      // If no existing role, insert one
      if (roleError?.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user?.id,
            full_name: applicationData.full_name,
            email: applicationData.email,
            phone: applicationData.phone,
            institution: applicationData.institution,
            designation: applicationData.designation,
            specialization: applicationData.specialization,
            role: 'member'
          });
        
        if (insertError) throw insertError;
      } else if (roleError) {
        throw roleError;
      }

      // Get membership plan details
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('plan_type', applicationData.membership_type)
        .single();

      if (!plan) throw new Error('Membership plan not found');

      // Create membership application
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user?.id,
          membership_type: applicationData.membership_type,
          amount: plan.price,
          status: 'pending',
          payment_status: 'pending',
          application_status: 'submitted',
          application_documents: applicationData.documents.map(f => f.name),
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
            subject: 'New Membership Application Received',
            html: `
              <h2>New Membership Application</h2>
              <p>A new membership application has been submitted.</p>
              <h3>Applicant Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${applicationData.full_name}</li>
                <li><strong>Email:</strong> ${applicationData.email}</li>
                <li><strong>Phone:</strong> ${applicationData.phone}</li>
                <li><strong>Institution:</strong> ${applicationData.institution}</li>
                <li><strong>Designation:</strong> ${applicationData.designation}</li>
                <li><strong>Membership Type:</strong> ${applicationData.membership_type}</li>
              </ul>
              <p>Please review and approve the application in the admin panel.</p>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }

      toast.success('Application submitted successfully! You will receive an email once reviewed.');
      setCurrentStep(3);
      
      setTimeout(() => {
        navigate('/membership');
      }, 3000);
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
      setApplicationData({ ...applicationData, documents: files });
    }
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
              <CardDescription>Complete your membership application</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }} className="space-y-4">
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
                  <Select value={applicationData.membership_type} onValueChange={(value) => setApplicationData({ ...applicationData, membership_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Membership</SelectItem>
                      <SelectItem value="lifetime">Lifetime Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Joining</Label>
                  <Textarea
                    id="reason"
                    rows={4}
                    value={applicationData.reason_for_joining}
                    onChange={(e) => setApplicationData({ ...applicationData, reason_for_joining: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Continue to Document Upload</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Upload Documents</CardTitle>
              <CardDescription>Upload supporting documents (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Label htmlFor="documents" className="cursor-pointer">
                  <p className="text-gray-600 mb-2">Click to upload documents</p>
                  <p className="text-sm text-gray-500">PDF, DOC, or image files</p>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {applicationData.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Selected files:</p>
                  {applicationData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleSubmitApplication} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Application Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Your membership application has been submitted and is now under review.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Your application will be reviewed within 7-10 working days</li>
                  <li>✓ You'll receive an email once approved by the admin</li>
                  <li>✓ Payment link will be sent after approval</li>
                  <li>✓ Membership confirmation will be sent after payment</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/membership')} className="w-full">
                Go to Membership Portal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MembershipApplication;
