-- Drop the restrictive check constraint on membership_type
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_membership_type_check;
