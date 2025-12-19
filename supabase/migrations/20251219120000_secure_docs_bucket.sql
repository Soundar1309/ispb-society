-- Create a new private bucket for application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can upload their own files
CREATE POLICY "Users can upload application docs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'application-documents' 
    AND owner = auth.uid()
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own application docs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND owner = auth.uid()
);

-- Policy: Admins can view all files in this bucket
CREATE POLICY "Admins can view application docs" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
);

-- Policy: Admins can delete files (if needed)
CREATE POLICY "Admins can delete application docs" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'application-documents' 
    AND (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
);
