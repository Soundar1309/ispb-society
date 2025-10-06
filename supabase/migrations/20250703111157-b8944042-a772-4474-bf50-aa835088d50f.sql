
-- Create publications table if it doesn't exist (it should already exist based on types.ts)
-- Just ensuring it has all necessary columns
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'research',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Create gallery table for image management
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create office_bearers table to make office bearers data editable
CREATE TABLE IF NOT EXISTS public.office_bearers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  institution TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for gallery
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery items" 
  ON public.gallery 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage gallery" 
  ON public.gallery 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Add RLS policies for office_bearers
ALTER TABLE public.office_bearers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active office bearers" 
  ON public.office_bearers 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage office bearers" 
  ON public.office_bearers 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Insert default office bearers data from the current static data
INSERT INTO public.office_bearers (name, designation, institution, display_order) VALUES
('Dr. R. Ravikesavan', 'secretary', '', 1),
('Dr. S. Manickam', 'Vice secretary', '', 2),
('Dr. R. Pushpam', 'Secretary', 'Tamil Nadu Agricultural University, Coimbatore', 3),
('Dr. A. Subramanian', 'Chief Editor', 'University of Agricultural Sciences, Bangalore', 4),
('Dr. A. Manivannan', 'Editor', 'Chaudhary Charan Singh University, Meerut', 5),
('Dr. R. Suresh', 'Editor', 'Acharya N.G. Ranga Agricultural University, Hyderabad', 6),
('Dr. P. Shanthi', 'Treasurer', 'Maharana Pratap University of Agriculture, Udaipur', 7),
('Dr. S.R.Sreerangasamy', 'Executive Committee Member', '', 8),
('Dr. S. Sivakumar', 'Executive Committee Member', '', 9),
('Dr. N. Manivannan', 'Executive Committee Member', '', 10),
('Dr. R. Saraswathi', 'Executive Committee Member', '', 11),
('Dr. R. Kalaiyarasi', 'Executive Committee Member', '', 12),
('Dr. D. Kumaresan', 'Executive Committee Member', '', 13),
('Dr. K. Iyanar', 'Executive Committee Member', '', 14),
('Dr. S. Sheelamary', 'Executive Committee Member', '', 15),
('Dr. N. Premalatha', 'Executive Committee Member', '', 16),
('Dr. D. Kavithamani', 'Executive Committee Member', '', 17),
('Dr. Asish K Binodh', 'Executive Committee Member', '', 18),
('Dr. A.Thanga Hemavathy', 'Executive Committee Member', '', 19)
ON CONFLICT DO NOTHING;
