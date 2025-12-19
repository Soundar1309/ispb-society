-- Create payment_settings table for Razorpay config
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_key_id text,
  razorpay_key_secret_encrypted text, -- Stored as provided
  is_test_mode boolean DEFAULT true,
  is_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage (Select, Insert, Update, Delete)
-- DROP first to avoid "already exists" error
DROP POLICY IF EXISTS "Admins can manage payment settings" ON public.payment_settings;

CREATE POLICY "Admins can manage payment settings" ON public.payment_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
