-- Add recipient photo to ISPB awards
ALTER TABLE public.ispb_awards ADD COLUMN IF NOT EXISTS image_url TEXT;
