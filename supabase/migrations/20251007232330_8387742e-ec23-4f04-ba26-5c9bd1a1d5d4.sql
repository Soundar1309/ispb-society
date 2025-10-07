-- Remove validity fields from memberships table as they're no longer needed
-- Update member_code to auto-continue from last code

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS trigger_update_membership_validity ON memberships;
DROP FUNCTION IF EXISTS public.update_membership_validity();

-- Update the member code generation function to check both tables
CREATE OR REPLACE FUNCTION public.generate_member_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    member_code TEXT;
BEGIN
    -- Get the highest existing member code number from both life_members and memberships
    SELECT COALESCE(
        GREATEST(
            (SELECT MAX(CAST(SUBSTRING(life_member_no FROM 4) AS INTEGER)) 
             FROM life_members 
             WHERE life_member_no IS NOT NULL AND life_member_no ~ '^LM-[0-9]+$'),
            (SELECT MAX(CAST(SUBSTRING(member_code FROM 4) AS INTEGER)) 
             FROM memberships 
             WHERE member_code IS NOT NULL AND member_code ~ '^LM-[0-9]+$')
        ), 0) + 1
    INTO next_number;
    
    -- Format the member code with leading zeros
    member_code := 'LM-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN member_code;
END;
$$;

-- Update the trigger to generate member code for all paid/manual memberships
CREATE OR REPLACE FUNCTION public.auto_generate_member_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate member code for paid/manual memberships that don't already have one
    IF (NEW.payment_status IN ('paid', 'manual') AND NEW.status = 'active' AND NEW.member_code IS NULL) THEN
        NEW.member_code := generate_member_code();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create application_status field for new membership application flow
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'draft';
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS application_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS admin_review_notes TEXT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMPTZ;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID REFERENCES auth.users(id);

-- Add comment to explain the new application flow
COMMENT ON COLUMN memberships.application_status IS 'Values: draft, submitted, under_review, approved, payment_pending, active, rejected';