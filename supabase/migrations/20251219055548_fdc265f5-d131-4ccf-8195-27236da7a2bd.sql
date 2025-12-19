-- Drop the old constraint and add a more flexible one
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_membership_type_check;

-- Add updated constraint with all valid types
ALTER TABLE public.memberships ADD CONSTRAINT memberships_membership_type_check 
CHECK (membership_type = ANY (ARRAY['annual'::text, 'lifetime'::text, 'student'::text, 'institutional'::text, 'test'::text]));