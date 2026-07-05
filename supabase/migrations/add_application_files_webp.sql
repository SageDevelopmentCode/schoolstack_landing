-- Allow WebP for compressed application image uploads.

update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'application-files';
