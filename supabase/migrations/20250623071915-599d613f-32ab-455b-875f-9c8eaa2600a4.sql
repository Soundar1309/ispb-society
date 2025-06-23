
-- Add member_code column to memberships table
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE;

-- Create a function to generate the next member code
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    member_code TEXT;
BEGIN
    -- Get the highest existing member code number
    SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM memberships
    WHERE member_code IS NOT NULL AND member_code ~ '^LM-[0-9]+$';
    
    -- Format the member code with leading zeros
    member_code := 'LM-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN member_code;
END;
$$;

-- Create a trigger function to auto-generate member codes for paid memberships
CREATE OR REPLACE FUNCTION auto_generate_member_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate member code for paid/manual memberships that don't already have one
    IF (NEW.payment_status IN ('paid', 'manual') AND NEW.status = 'active' AND NEW.member_code IS NULL) THEN
        NEW.member_code := generate_member_code();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-generating member codes
DROP TRIGGER IF EXISTS trigger_auto_generate_member_code ON public.memberships;
CREATE TRIGGER trigger_auto_generate_member_code
    BEFORE INSERT OR UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_member_code();

-- Create a function to handle membership expiration logic
CREATE OR REPLACE FUNCTION update_membership_validity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- For lifetime memberships, extend valid_until by one year from current date
    IF NEW.membership_type = 'lifetime' AND NEW.status = 'active' THEN
        NEW.valid_until := CURRENT_DATE + INTERVAL '1 year';
    -- For other memberships, set validity to one year from valid_from date
    ELSIF NEW.membership_type != 'lifetime' AND NEW.status = 'active' AND NEW.valid_from IS NOT NULL THEN
        NEW.valid_until := NEW.valid_from + INTERVAL '1 year';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for membership validity updates
DROP TRIGGER IF EXISTS trigger_update_membership_validity ON public.memberships;
CREATE TRIGGER trigger_update_membership_validity
    BEFORE INSERT OR UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_validity();

-- Create a function to check and deactivate expired memberships
CREATE OR REPLACE FUNCTION deactivate_expired_memberships()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Deactivate non-lifetime memberships that have expired
    UPDATE memberships 
    SET status = 'expired'
    WHERE membership_type != 'lifetime' 
      AND status = 'active' 
      AND valid_until < CURRENT_DATE;
END;
$$;

-- Create index for better performance on member_code lookups
CREATE INDEX IF NOT EXISTS idx_memberships_member_code ON public.memberships(member_code);
