-- Drop existing policies that may not work correctly
DROP POLICY IF EXISTS "Users can upload application docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own application docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view application docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete application docs" ON storage.objects;

-- Policy: Authenticated users can upload files to their own folder
CREATE POLICY "Users can upload application docs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'application-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files (by folder path)
CREATE POLICY "Users can view own application docs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all files in this bucket
CREATE POLICY "Admins can view application docs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete application docs" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);