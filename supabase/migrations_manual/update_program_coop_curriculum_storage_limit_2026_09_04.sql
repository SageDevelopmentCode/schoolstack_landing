-- Raise co-op curriculum bucket limit to 100 MB.
-- Date: 2026-09-04
--
-- IMPORTANT: Supabase applies min(global_limit, bucket_limit). Bucket SQL alone
-- is not enough for files over 50 MB. Also set in Dashboard:
--   Storage → Settings → Global file size limit → 100 MB or higher (Pro plan).
-- Free plan global max is 50 MB — 100 MB uploads require Pro or a smaller PDF.
--
-- Verify current bucket limit:
--   select id, file_size_limit from storage.buckets
--   where id = 'program-coop-curriculum-files';

update storage.buckets
set file_size_limit = 104857600
where id = 'program-coop-curriculum-files';
