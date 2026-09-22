-- Promoted to supabase/migrations/20261015_update_committee_resource_file_limit.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-21
--
-- IMPORTANT: Supabase applies min(global_limit, bucket_limit). Bucket SQL alone
-- is not enough for files over 50 MB. Also set in Dashboard:
--   Storage → Settings → Global file size limit → 100 MB or higher (Pro plan).

update storage.buckets
set file_size_limit = 104857600
where id = 'committee-resource-files';
