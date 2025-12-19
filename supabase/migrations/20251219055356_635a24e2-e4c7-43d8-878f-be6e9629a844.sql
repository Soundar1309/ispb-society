-- Ensure the application-documents bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;