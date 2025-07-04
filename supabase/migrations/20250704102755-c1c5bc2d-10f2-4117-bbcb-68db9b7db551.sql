
-- Add missing columns to conferences table
ALTER TABLE conferences 
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Add missing columns to publications table
ALTER TABLE publications 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS pdf_file_url TEXT;

-- Update conferences table to rename registration_fee to fee for consistency
ALTER TABLE conferences RENAME COLUMN registration_fee TO fee;
