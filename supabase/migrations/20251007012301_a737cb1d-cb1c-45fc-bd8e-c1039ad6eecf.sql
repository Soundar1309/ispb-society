-- Add foreign key constraints for orders and payment_tracking tables
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
  ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE payment_tracking
  DROP CONSTRAINT IF EXISTS payment_tracking_user_id_fkey,
  ADD CONSTRAINT payment_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create storage bucket for publications PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('publications', 'publications', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for publications bucket
CREATE POLICY "Anyone can view publication files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'publications');

CREATE POLICY "Admins can upload publication files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'publications' AND
    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Admins can update publication files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'publications' AND
    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );

CREATE POLICY "Admins can delete publication files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'publications' AND
    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );