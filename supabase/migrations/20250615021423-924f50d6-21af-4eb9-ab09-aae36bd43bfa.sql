

-- Insert admin role for a specific user
-- Replace 'demosoundarweb@gmail.com' with the actual email of the user you want to make admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'demosoundarweb@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

