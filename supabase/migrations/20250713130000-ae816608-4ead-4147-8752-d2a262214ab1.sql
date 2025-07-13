-- Remove early_bird_fee and early_bird_deadline from conferences table
ALTER TABLE public.conferences 
DROP COLUMN early_bird_fee,
DROP COLUMN early_bird_deadline;

-- Add registration_required and attachment_url columns to conferences
ALTER TABLE public.conferences 
ADD COLUMN registration_required BOOLEAN DEFAULT false,
ADD COLUMN attachment_url TEXT,
ADD COLUMN registration_form_url TEXT;

-- Create gallery_categories table for admin-managed categories
CREATE TABLE public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for gallery_categories
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_categories
CREATE POLICY "Anyone can view active gallery categories" 
ON public.gallery_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage gallery categories" 
ON public.gallery_categories 
FOR ALL 
USING (is_admin(auth.uid()));

-- Insert default categories
INSERT INTO public.gallery_categories (name, display_order) VALUES
('Events', 1),
('Conferences', 2),
('Awards', 3),
('General', 4);

-- Add image_size and file_format columns to gallery table
ALTER TABLE public.gallery 
ADD COLUMN image_size TEXT DEFAULT '405x256',
ADD COLUMN file_format TEXT DEFAULT 'jpg';

-- Create conference_registrations table if not exists (for registration and payment)
CREATE TABLE IF NOT EXISTS public.conference_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  registration_type TEXT DEFAULT 'regular',
  amount_paid NUMERIC,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for conference_registrations if not already enabled
ALTER TABLE public.conference_registrations ENABLE ROW LEVEL SECURITY;

-- Update gallery category to use foreign key reference
ALTER TABLE public.gallery 
ADD COLUMN category_id UUID REFERENCES gallery_categories(id);

-- Update existing gallery records to reference the new categories
UPDATE public.gallery 
SET category_id = (
  SELECT id FROM gallery_categories 
  WHERE LOWER(name) = LOWER(gallery.category) 
  LIMIT 1
)
WHERE category IS NOT NULL;

-- Set default category for records without a category
UPDATE public.gallery 
SET category_id = (SELECT id FROM gallery_categories WHERE name = 'General' LIMIT 1)
WHERE category_id IS NULL;