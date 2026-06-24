-- Create the private resumes storage bucket.
-- Runs via: supabase db seed (against a local stack) or manually in Supabase dashboard > SQL editor.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Only the authenticated user who owns the folder can upload or read.
-- Path convention: resumes/<user-uuid>/<filename>
CREATE POLICY "owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
