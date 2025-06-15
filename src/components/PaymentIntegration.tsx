
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const membershipPlans = [
    {
      type: 'student',
      title: 'Student Membership',
      price: 500,
      duration: '1 Year',
      features: [
        'Access to all journals',
        'Conference discounts',
        'Student networking events',
        'Research support'
      ]
    },
    {
      type: 'regular',
      title: 'Regular Membership',
      price: 2000,
      duration: '1 Year',
      features: [
        'All student benefits',
        'Full conference access',
        'Publication opportunities',
        'Professional networking',
        'Expert consultations'
      ]
    },
    {
      type: 'life',
      title: 'Life Membership',
      price: 25000,
      duration: 'Lifetime',
      features: [
        'All regular benefits',
        'Lifetime access',
        'Priority support',
        'Exclusive events',
        'Legacy recognition'
      ]
    }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (membershipType: string, amount: number) => {
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
        body: { membershipType, amount }
      });

      if (error) throw error;

      const options = {
        key: 'rzp_test_your_key_here', // Replace with your Razorpay key
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Indian Society of Plant Breeders',
        description: `${membershipType} Membership`,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Membership Plans</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join the Indian Society of Plant Breeders and become part of a thriving community
            of researchers, scientists, and professionals dedicated to advancing plant breeding science.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipPlans.map((plan, index) => (
            <Card key={plan.type} className={`relative ${index === 1 ? 'border-green-500 border-2' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription>{plan.duration}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">₹{plan.price.toLocaleString()}</span>
                  {plan.type !== 'life' && <span className="text-gray-500">/year</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handlePayment(plan.type, plan.price)}
                  disabled={loading || !user}
                  variant={index === 1 ? 'default' : 'outline'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Please <a href="/auth" className="text-green-600 hover:underline">login</a> to purchase a membership.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentIntegration;
