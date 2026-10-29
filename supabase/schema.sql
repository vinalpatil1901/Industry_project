-- Remove existing policies
DROP POLICY IF EXISTS "authenticated users can read marketplace assets"
ON storage.objects;

DROP POLICY IF EXISTS "users upload into their own folder"
ON storage.objects;

DROP POLICY IF EXISTS "users update own uploaded assets"
ON storage.objects;

DROP POLICY IF EXISTS "users delete own uploaded assets"
ON storage.objects;


-- Read marketplace assets
CREATE POLICY "authenticated users can read marketplace assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'campus360-assets');


-- Upload files into the user's own folder
CREATE POLICY "users upload into their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'campus360-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
);


-- Update the user's own uploaded assets
CREATE POLICY "users update own uploaded assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'campus360-assets'
    AND owner_id = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'campus360-assets'
    AND owner_id = auth.uid()::text
);


-- Delete the user's own uploaded assets
CREATE POLICY "users delete own uploaded assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'campus360-assets'
    AND owner_id = auth.uid()::text
);