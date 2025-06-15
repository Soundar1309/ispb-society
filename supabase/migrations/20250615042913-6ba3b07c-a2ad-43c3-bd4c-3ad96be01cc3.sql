
-- Add RLS policies for user_roles table to allow profile updates

-- Allow users to view their own user role record
CREATE POLICY "Users can view own user role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own user role record (for profile creation)
CREATE POLICY "Users can insert own user role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own user role record (for profile updates)
CREATE POLICY "Users can update own user role" ON public.user_roles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all user roles (using the existing is_admin function)
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

-- Allow admins to insert user roles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin());

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin());

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE USING (public.is_admin());
