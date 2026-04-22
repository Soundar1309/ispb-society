-- Create article_submissions table
CREATE TABLE IF NOT EXISTS public.article_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    author_name TEXT NOT NULL,
    article_id TEXT NOT NULL,
    article_name TEXT NOT NULL,
    amount NUMERIC DEFAULT 500 NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_article_submissions_updated_at') THEN
        CREATE TRIGGER update_article_submissions_updated_at
            BEFORE UPDATE ON public.article_submissions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.article_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do anything
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on article_submissions') THEN
        CREATE POLICY "Admin full access on article_submissions"
            ON public.article_submissions
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Policy: Anyone can insert (to allow guest submissions)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert article_submissions') THEN
        CREATE POLICY "Public can insert article_submissions"
            ON public.article_submissions
            FOR INSERT
            TO public
            WITH CHECK (true);
    END IF;
END $$;
