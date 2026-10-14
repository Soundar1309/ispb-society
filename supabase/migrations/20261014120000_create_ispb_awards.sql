-- ISPB Awards table (year-wise awards, managed from admin panel)
CREATE TABLE IF NOT EXISTS public.ispb_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    award_year INTEGER NOT NULL,
    award_number TEXT NOT NULL,
    award_name TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    affiliation TEXT,
    location TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_ispb_awards_year ON public.ispb_awards (award_year DESC, display_order);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ispb_awards_updated_at') THEN
        CREATE TRIGGER update_ispb_awards_updated_at
            BEFORE UPDATE ON public.ispb_awards
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

ALTER TABLE public.ispb_awards ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active ispb_awards') THEN
        CREATE POLICY "Public can view active ispb_awards"
            ON public.ispb_awards
            FOR SELECT
            TO public
            USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on ispb_awards') THEN
        CREATE POLICY "Admin full access on ispb_awards"
            ON public.ispb_awards
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;
