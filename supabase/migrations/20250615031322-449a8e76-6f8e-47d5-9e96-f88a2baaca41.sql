
-- Add additional user information columns to user_roles table (excluding created_at which already exists)
ALTER TABLE public.user_roles 
ADD COLUMN full_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN institution TEXT,
ADD COLUMN designation TEXT,
ADD COLUMN specialization TEXT,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate existing data from profiles to user_roles
UPDATE public.user_roles 
SET 
  full_name = profiles.full_name,
  email = profiles.email,
  phone = profiles.phone,
  institution = profiles.institution,
  designation = profiles.designation,
  specialization = profiles.specialization,
  updated_at = profiles.updated_at
FROM public.profiles 
WHERE user_roles.user_id = profiles.id;

-- Update the handle_new_user function to work with user_roles instead of profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_roles with default member role and user info
  INSERT INTO public.user_roles (user_id, role, full_name, email, phone, institution, designation, specialization)
  VALUES (
    NEW.id,
    'member',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'specialization'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the profiles table
DROP TABLE public.profiles;
