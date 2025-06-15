
-- Create membership_plans table for admin to manage plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type text NOT NULL UNIQUE,
  title text NOT NULL,
  price numeric NOT NULL,
  duration_months integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for membership_plans
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active membership plans" 
  ON public.membership_plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage membership plans" 
  ON public.membership_plans 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Insert default membership plans (only if table is empty)
INSERT INTO public.membership_plans (plan_type, title, price, duration_months, features)
SELECT 'annual', 'Annual Membership', 500, 12, '[
  "Access to all conferences",
  "Digital publications", 
  "Networking opportunities",
  "Technical resources"
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE plan_type = 'annual');

INSERT INTO public.membership_plans (plan_type, title, price, duration_months, features)
SELECT 'lifetime', 'Lifetime Membership', 5000, 0, '[
  "All annual benefits",
  "Priority conference registration",
  "Exclusive member events", 
  "Legacy member recognition",
  "No renewal required"
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE plan_type = 'lifetime');

-- Add Razorpay fields to memberships table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memberships' AND column_name = 'razorpay_order_id') THEN
    ALTER TABLE public.memberships ADD COLUMN razorpay_order_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memberships' AND column_name = 'razorpay_payment_id') THEN
    ALTER TABLE public.memberships ADD COLUMN razorpay_payment_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memberships' AND column_name = 'currency') THEN
    ALTER TABLE public.memberships ADD COLUMN currency text DEFAULT 'INR';
  END IF;
END $$;

-- Add Razorpay fields to payment_tracking table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_tracking' AND column_name = 'razorpay_order_id') THEN
    ALTER TABLE public.payment_tracking ADD COLUMN razorpay_order_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_tracking' AND column_name = 'razorpay_payment_id') THEN
    ALTER TABLE public.payment_tracking ADD COLUMN razorpay_payment_id text;
  END IF;
END $$;

-- Add RLS policies for existing orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" 
  ON public.orders 
  FOR ALL 
  USING (public.is_admin(auth.uid()));
