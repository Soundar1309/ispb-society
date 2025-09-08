-- Add new columns and modify existing ones for life_members table
ALTER TABLE public.life_members 
ADD COLUMN life_member_no TEXT,
ADD COLUMN address TEXT,
ADD COLUMN date_of_enrollment DATE;

-- Rename existing columns to match new format
ALTER TABLE public.life_members 
RENAME COLUMN designation TO occupation;

ALTER TABLE public.life_members 
RENAME COLUMN phone TO mobile;

-- Remove columns that are no longer needed
ALTER TABLE public.life_members 
DROP COLUMN IF EXISTS institution,
DROP COLUMN IF EXISTS specialization,
DROP COLUMN IF EXISTS member_since;

-- Add unique constraint on life_member_no
ALTER TABLE public.life_members 
ADD CONSTRAINT unique_life_member_no UNIQUE (life_member_no);

-- Update existing data to have life member numbers
UPDATE public.life_members 
SET life_member_no = 'LM-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE life_member_no IS NULL;