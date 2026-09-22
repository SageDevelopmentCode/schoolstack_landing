-- Raise committee resource bucket limit to 100 MB (match co-op curriculum).
-- Run after: 20260802_add_committee_resource_files.sql
--
-- IMPORTANT: Supabase applies min(global_limit, bucket_limit). Bucket SQL alone
-- is not enough for files over 50 MB. Also set in Dashboard:
--   Storage → Settings → Global file size limit → 100 MB or higher (Pro plan).
--
-- Verify current bucket limit:
--   select id, file_size_limit from storage.buckets
--   where id = 'committee-resource-files';

update storage.buckets
set file_size_limit = 104857600
where id = 'committee-resource-files';
