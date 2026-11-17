CREATE POLICY "APK files are managed only by the storage service"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'mcedit-apks')
WITH CHECK (bucket_id = 'mcedit-apks');