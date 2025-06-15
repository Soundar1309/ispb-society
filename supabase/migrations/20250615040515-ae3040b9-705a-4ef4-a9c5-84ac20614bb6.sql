
-- Create mandates table for dynamic content management
CREATE TABLE public.mandates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create activities table for dynamic content management
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create payment_tracking table for admin payment management
CREATE TABLE public.payment_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id uuid REFERENCES public.memberships(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  payment_method text,
  razorpay_payment_id text,
  razorpay_order_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for mandates (admin can manage, users can read)
ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active mandates" 
  ON public.mandates 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage mandates" 
  ON public.mandates 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Add RLS policies for activities (admin can manage, users can read)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active activities" 
  ON public.activities 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage activities" 
  ON public.activities 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Add RLS policies for payment_tracking (admin only)
ALTER TABLE public.payment_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment tracking" 
  ON public.payment_tracking 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Insert some default mandates
INSERT INTO public.mandates (title, content, display_order) VALUES
('Research Excellence', 'Promote cutting-edge research in plant breeding, genetics, and biotechnology to address agricultural challenges and enhance crop productivity.', 1),
('Knowledge Dissemination', 'Facilitate the exchange of scientific knowledge through conferences, publications, workshops, and training programs.', 2),
('Professional Development', 'Support the professional growth of plant breeders and geneticists through continuing education and career advancement opportunities.', 3),
('Industry Collaboration', 'Foster partnerships between academic institutions, research organizations, and the agricultural industry to accelerate technology transfer.', 4);

-- Insert some default activities
INSERT INTO public.activities (title, content, display_order) VALUES
('Annual Conferences', 'National Plant Breeding Congress with technical sessions, workshops, poster presentations, and keynote lectures by eminent scientists.', 1),
('Training Programs', 'Specialized training in molecular breeding techniques, statistical methods, biotechnology applications, and intellectual property rights.', 2),
('Publications', 'Journal of Plant Breeding and Genetics, conference proceedings, technical bulletins, newsletters and updates.', 3),
('Awards & Recognition', 'ISPB Excellence Award, Young Scientist Award, Best Research Paper Award, and Lifetime Achievement Award.', 4);
