-- Add pdf_url to ispb_awards and make recipient_name optional for award-level listings
ALTER TABLE public.ispb_awards ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- If recipient_name was NOT NULL, make it nullable so awards can exist as award-level records
ALTER TABLE public.ispb_awards ALTER COLUMN recipient_name DROP NOT NULL;

-- If award_number was NOT NULL, make it nullable or give default empty string
ALTER TABLE public.ispb_awards ALTER COLUMN award_number DROP NOT NULL;
