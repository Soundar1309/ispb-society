-- Create invoices storage bucket for PDF invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for invoices bucket
CREATE POLICY "Users can view their own invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices' AND public.is_admin(auth.uid()));

CREATE POLICY "Service role can upload invoices"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "Public can view invoices"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices');

-- Add invoice_url column to orders table if not exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Create payment_settings table for admin Razorpay configuration
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_key_id TEXT,
  razorpay_key_secret_encrypted TEXT,
  is_test_mode BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write payment settings
CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings
FOR ALL
USING (public.is_admin(auth.uid()));

-- Insert default row if not exists
INSERT INTO public.payment_settings (is_test_mode, is_enabled)
SELECT true, true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_settings LIMIT 1);