
-- Create orders table for payment tracking
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conferences table
CREATE TABLE public.conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  date_from DATE,
  date_to DATE,
  registration_fee DECIMAL(10,2),
  early_bird_fee DECIMAL(10,2),
  early_bird_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conference registrations table
CREATE TABLE public.conference_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES public.conferences(id) ON DELETE CASCADE,
  registration_type TEXT CHECK (registration_type IN ('regular', 'early_bird', 'student')),
  amount_paid DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conference_id)
);

-- Create publications table
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT,
  journal TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  year INTEGER,
  doi TEXT,
  pdf_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for conferences
CREATE POLICY "Anyone can view active conferences" ON public.conferences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage conferences" ON public.conferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for conference registrations
CREATE POLICY "Users can view own registrations" ON public.conference_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registrations" ON public.conference_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" ON public.conference_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for publications
CREATE POLICY "Anyone can view publications" ON public.publications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage publications" ON public.publications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for contact messages
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages" ON public.contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO public.conferences (title, description, venue, date_from, date_to, registration_fee, early_bird_fee, early_bird_deadline) VALUES
('Annual Plant Breeding Conference 2024', 'Premier conference on plant breeding and genetics', 'IARI, New Delhi', '2024-12-15', '2024-12-17', 5000.00, 4000.00, '2024-11-15'),
('International Seed Technology Summit', 'Global summit on seed technology and innovation', 'Bangalore International Centre', '2025-03-20', '2025-03-22', 7500.00, 6000.00, '2025-02-20');

INSERT INTO public.publications (title, authors, journal, volume, year, is_featured) VALUES
('Advances in Rice Breeding Techniques', 'Dr. R.K. Singh, Dr. P. Sharma', 'Indian Journal of Plant Breeding', '45', 2023, true),
('Genetic Diversity in Wheat Varieties', 'Dr. A.K. Patel, Dr. M. Singh', 'Plant Genetics Review', '12', 2023, true),
('Sustainable Crop Improvement Strategies', 'Dr. S.K. Gupta, Dr. K. Reddy', 'Agricultural Science Today', '28', 2023, false);
