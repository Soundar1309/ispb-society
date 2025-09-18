
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, CheckCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentIntegration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // const membershipPlan = {
  //   type: 'annual',
  //   title: 'Annual Membership',
  //   price: 5000,
  //   duration: '1 Year',
  //   features: [
  //     'Access to all journals and publications',
  //     'Full conference access and discounts',
  //     'Professional networking opportunities',
  //     'Research support and collaboration',
  //     'Expert consultations',
  //     'Publication opportunities',
  //     'Priority event registration',
  //     'Member directory access'
  //   ]
  // };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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

    setLoading(true);

    try {
      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // Create order
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: { membershipType: membershipPlan.type, amount: membershipPlan.price }
      });

      if (error) throw error;

      const options = {
        key: 'rzp_test_your_key_here', // Replace with your Razorpay key
        amount: membershipPlan.price * 100, // Amount in paise
        currency: 'INR',
        name: 'Indian Society of Plant Breeders',
        description: `${membershipPlan.title}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const verifyResult = await supabase.functions.invoke('verify-payment', {
              body: {
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              }
            });

            if (verifyResult.data?.success) {
              toast.success('Payment successful! Membership activated.');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#16a34a'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Join ISPB Membership
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            Become part of India's premier plant breeding community. Connect with researchers, 
            access exclusive resources, and advance your career in agricultural sciences.
          </p>
        </div>

        {/* Membership Plan Card */}
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-md border-green-500 border-2 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Best Value
              </div>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl text-gray-900">
                {membershipPlan.title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {membershipPlan.duration}
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl sm:text-4xl font-bold text-green-600">
                  ₹{membershipPlan.price.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">/year</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ul className="space-y-2 sm:space-y-3 mb-6">
                {membershipPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full py-2 sm:py-3 text-sm sm:text-base"
                onClick={handlePayment}
                disabled={loading || !user}
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Join Now - Pay ₹5,000'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Why Join ISPB?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Research Access</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Access to cutting-edge research papers and publications
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Networking</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Connect with leading scientists and researchers
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Professional Growth</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Career development and learning opportunities
              </p>
            </div>
          </div>
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

        {/* Login Prompt */}
        {!user && (
          <div className="text-center bg-white rounded-lg p-4 sm:p-6 shadow-md">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Please login to purchase your membership
            </p>
            <Button asChild variant="outline">
              <a href="/auth" className="text-sm sm:text-base">
                Login / Sign Up
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
