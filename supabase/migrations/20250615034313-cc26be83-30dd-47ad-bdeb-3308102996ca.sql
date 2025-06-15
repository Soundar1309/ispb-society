
-- Add a manual_membership flag to memberships table to distinguish manual vs payment-based memberships
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN public.memberships.is_manual IS 'Indicates if this membership was manually created by admin';

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Admins can insert manual memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can update all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can delete memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;

-- Create RLS policies for admin management of memberships
CREATE POLICY "Admins can manage memberships insert" ON public.memberships
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage memberships update" ON public.memberships
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage memberships delete" ON public.memberships
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to view their own memberships and admins to view all
CREATE POLICY "Users and admins can view memberships" ON public.memberships
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on memberships table
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
