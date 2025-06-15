
-- First, let's see what the current check constraint allows
-- and update it to include the membership types we're using in the form

-- Drop the existing check constraint
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_membership_type_check;

-- Add a new check constraint that includes all the membership types we need
ALTER TABLE public.memberships 
ADD CONSTRAINT memberships_membership_type_check 
CHECK (membership_type IN ('annual', 'lifetime', 'student', 'institutional'));

-- Also ensure the status and payment_status constraints are correct
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_status_check;
ALTER TABLE public.memberships 
ADD CONSTRAINT memberships_status_check 
CHECK (status IN ('pending', 'active', 'expired', 'cancelled'));

ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_payment_status_check;
ALTER TABLE public.memberships 
ADD CONSTRAINT memberships_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'manual'));
