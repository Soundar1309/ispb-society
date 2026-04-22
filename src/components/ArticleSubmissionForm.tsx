
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle, CreditCard, BookOpen, User, Mail, Hash, FileText, ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  author_name: z.string().min(2, 'Author name is required'),
  article_id: z.string().min(1, 'Article ID is required'),
  article_name: z.string().min(2, 'Article name is required'),
});

type FormValues = z.infer<typeof formSchema>;

const ArticleSubmissionForm = () => {
  const [loading, setLoading] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [successData, setSuccessData] = useState<{ submissionId: string; paymentId: string; articleName: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      author_name: '',
      article_id: '',
      article_name: '',
    },
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
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



  const handlePayment = async (values: FormValues) => {

    setLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Please check your connection.');
        setLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-article-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ ...values }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        const errorMsg = orderData.error || orderData.message || 'Payment initialization failed';
        const details = orderData.details || '';
        throw new Error(`${errorMsg}${details ? ` (${details})` : ''}`);
      }





      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ISPB Society',
        description: `Article Submission: ${values.article_name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          setPaymentVerifying(true);
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-article-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                submissionId: orderData.submissionId,
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            setSuccessData({
              submissionId: orderData.submissionId,
              paymentId: response.razorpay_payment_id,
              articleName: values.article_name
            });
            toast.success('Payment successful! Article submitted.');
          } catch (error: any) {
            console.error('Verification error:', error);
            toast.error(error.message || 'Payment verification failed');
          } finally {
            setPaymentVerifying(false);
            setLoading(false);
          }
        },
        prefill: {
          name: values.name,
          email: values.email,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-xl overflow-hidden rounded-lg animate-in fade-in zoom-in duration-500">
          <div className="h-1.5 bg-emerald-600 w-full" />
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-serif text-slate-900 mb-2">Submission Successful</h1>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Your research article metadata has been registered with the Indian Society of Plant Breeders.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Article Title</span>
                <span className="text-slate-900 font-medium text-right max-w-xs truncate">{successData.articleName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Submission ID</span>
                <span className="text-slate-900 font-mono text-sm">{successData.submissionId.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Payment Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Paid
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Transaction Reference</span>
                <span className="text-slate-900 font-mono text-sm">{successData.paymentId}</span>
              </div>
            </div>

            <Button
              className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
              onClick={() => window.location.href = '/'}
            >
              Back to Portal
            </Button>
          </div>
        </div>

        <footer className="mt-12 text-slate-400 text-xs tracking-tight">
          © 2026 EJPB. All rights reserved. | Developed by Codeficorp
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Scientific Portal Header */}
          <div className="mb-10 sm:mb-12 border-l-4 border-emerald-600 pl-4 sm:pl-6">
            <h1 className="text-3xl font-serif text-slate-900 tracking-tight sm:text-4xl md:text-5xl mb-3">
              Manuscript Submission Fee Payment Portal
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-3xl">
              Electronic Journal of Plant Breeding (EJPB). Please provide accurate metadata
              as provided in your submitted manuscript.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-6 px-6 sm:py-8 sm:px-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900 font-semibold mb-1">Registration form</CardTitle>
                  <CardDescription className="text-slate-400">All fields are required for indexed records.</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-md border border-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Secure Portal</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-6">
                  <div className="flex flex-col gap-8 sm:gap-10">

                    {/* Section 1: Researcher Information */}
                    <section>
                      <div className="flex items-center gap-3 mb-8 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-slate-100 rounded text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Researcher Information</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-slate-700 font-medium mb-2 min-h-[1.5rem] flex items-end">Full name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Full legal name"
                                  {...field}
                                  disabled={loading}
                                  className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-shadow bg-slate-50/30"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-slate-700 font-medium mb-2 min-h-[1.5rem] flex items-end">Contact mail</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="researcher@university.edu"
                                  {...field}
                                  disabled={loading}
                                  className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-shadow bg-slate-50/30"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </section>

                    {/* Section 1 & 2 Separator - handled by flex gap */}
                    <div className="h-px bg-slate-100 w-full md:hidden" />

                    {/* Section 2: Manuscript Metadata */}
                    <section>
                      <div className="flex items-center gap-3 mb-8 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-slate-100 rounded text-slate-500">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Manuscript Metadata</h2>
                      </div>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <FormField
                            control={form.control}
                            name="author_name"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-slate-700 font-medium mb-2 min-h-[2.5rem] flex items-end">Corresponding author</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Full name of corresponding author"
                                    {...field}
                                    disabled={loading}
                                    className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-shadow bg-slate-50/30"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="article_id"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-slate-700 font-medium mb-2 min-h-[2.5rem] flex items-end">Article ID (Reference Number)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                      placeholder="Internal tracking ID"
                                      {...field}
                                      disabled={loading}
                                      className="pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-shadow bg-slate-50/30"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="article_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-medium">Complete Article Title</FormLabel>
                              <FormControl>
                                <div className="relative mt-2">
                                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input
                                    placeholder="As printed on the manuscript header"
                                    {...field}
                                    disabled={loading}
                                    className="pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-shadow bg-slate-50/30"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="pt-6">
                    <div className="bg-slate-50 border border-slate-200 rounded p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fee Amount</p>
                        <p className="text-xl sm:text-2xl font-serif text-slate-900">₹500.00 <span className="text-xs sm:text-sm font-sans text-slate-500 font-normal ml-1">(incl. all taxes)</span></p>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || paymentVerifying}
                        className="w-full sm:w-auto h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                      >
                        {loading || paymentVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {paymentVerifying ? 'Verifying Receipt...' : 'Connecting...'}
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Initialize Payment
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Secure transaction via Razorpay Gateway
                      </p>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Required Footer */}
      <footer className="py-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm tracking-tight">
          © 2026 EJPB. All rights reserved. | Developed by Codeficorp
        </p>
      </footer>
    </div>
  );
};

export default ArticleSubmissionForm;
