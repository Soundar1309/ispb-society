
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailedPayload = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailedPayload) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const PaymentIntegration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [approvedMembership, setApprovedMembership] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [paymentSettings, setPaymentSettings] = useState<{ is_enabled: boolean; is_test_mode: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchApprovedMembership(),
        fetchUserProfile(),
        fetchPaymentSettings()
      ]).finally(() => setPageLoading(false));
    } else {
      setPageLoading(false);
    }
  }, [user]);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('is_enabled, is_test_mode')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setPaymentSettings(data);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchApprovedMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user?.id)
        .eq('application_status', 'approved')
        .eq('payment_status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Error fetching membership:', error);
      }
      setApprovedMembership(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setUserProfile(data);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    if (!approvedMembership) {
      toast.error('You need an approved membership application to proceed');
      return;
    }

    // Check if payments are enabled
    if (paymentSettings && !paymentSettings.is_enabled) {
      toast.error('Payment gateway is currently disabled. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          membershipPlanId: approvedMembership.membership_type,
          amount: approvedMembership.amount,
          membershipId: approvedMembership.id,
          userId: user.id
        }
      });

      if (orderError || !orderData) {
        console.error('Order creation failed:', orderError, orderData);
        const errorMsg = orderData?.error || orderError?.message || 'Failed to create order';
        throw new Error(errorMsg);
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Indian Society of Plant Breeders',
        description: `${approvedMembership.membership_type} Membership`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const { error: verifyError, data: verifyData } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                membershipId: orderData.membershipId,
                userId: user.id
              }
            });

            if (verifyError) throw verifyError;
            if (verifyData?.success) {
              toast.success('Successfully enrolled the membership');
              // Refresh membership status
              fetchApprovedMembership();
              // Redirect to dashboard
              navigate('/dashboard');
            } else {
              toast.error(verifyData?.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.message('Payment cancelled');
          }
        },
        prefill: {
          name: userProfile?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: userProfile?.phone || '',
        },
        theme: {
          color: '#16a34a'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayFailedPayload) {
        console.error('Razorpay payment.failed:', response?.error);
        const reason = response?.error?.description || response?.error?.reason || 'Payment failed';
        toast.error(reason);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      const err = error as { name?: string; message?: string } | undefined;
      const msg = err?.message || 'Payment initialization failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Complete Your Membership Payment
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            Your application has been approved. Complete the payment to activate your membership.
          </p>
        </div>

        {/* No approved application */}
        {!user ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please login to view your membership status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/auth">Login / Sign Up</a>
              </Button>
            </CardContent>
          </Card>
        ) : !approvedMembership ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>No Approved Application</CardTitle>
              <CardDescription>
                You don't have an approved membership application pending payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please submit a membership application first, then wait for admin approval before making payment.
              </p>
              <Button asChild className="w-full">
                <a href="/membership-application">Apply for Membership</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/membership">View Membership Portal</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Membership Plan Card */}
            <div className="flex justify-center mb-8">
              <Card className="w-full max-w-md border-green-500 border-2 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Approved
                  </div>
                </div>
                <CardHeader className="text-center pb-4 pt-6">
                  <CardTitle className="text-xl sm:text-2xl text-gray-900 capitalize">
                    {approvedMembership.membership_type} Membership
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Your application has been approved
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl sm:text-4xl font-bold text-green-600">
                      ₹{Number(approvedMembership.amount).toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <ul className="space-y-2 sm:space-y-3 mb-6">
                    {[
                      'Access to all journals and publications',
                      'Full conference access and discounts',
                      'Professional networking opportunities',
                      'Research support and collaboration',
                      'Member directory access'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full py-2 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700"
                    onClick={handlePayment}
                    disabled={loading}
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : `Pay ₹${Number(approvedMembership.amount).toLocaleString()}`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Payment Security */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                  Secure Payment with Razorpay
                </h2>
                <p className="text-sm sm:text-base opacity-90">
                  Your payment information is protected with bank-level security
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg sm:text-2xl">💳</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-xs sm:text-sm">Cards</h3>
                  <p className="text-xs opacity-90">All major cards</p>
                </div>
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg sm:text-2xl">🏦</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-xs sm:text-sm">Net Banking</h3>
                  <p className="text-xs opacity-90">50+ banks</p>
                </div>
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg sm:text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-xs sm:text-sm">UPI/Wallets</h3>
                  <p className="text-xs opacity-90">UPI, Paytm, PhonePe</p>
                </div>
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg sm:text-2xl">🔒</span>
                  </div>
                  <h3 className="font-semibold mb-1 text-xs sm:text-sm">Secure</h3>
                  <p className="text-xs opacity-90">SSL encrypted</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
