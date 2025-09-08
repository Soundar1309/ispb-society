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

-- Create a function to generate life member numbers for existing records
CREATE OR REPLACE FUNCTION update_existing_life_member_numbers()
RETURNS void AS $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM life_members WHERE life_member_no IS NULL ORDER BY created_at LOOP
        UPDATE life_members 
        SET life_member_no = 'LM-' || LPAD(counter::TEXT, 3, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update existing records
SELECT update_existing_life_member_numbers();

-- Drop the function as it's no longer needed
DROP FUNCTION update_existing_life_member_numbers();