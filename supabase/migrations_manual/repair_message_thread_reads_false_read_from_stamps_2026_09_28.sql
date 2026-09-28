-- One-off data repair: notification stamps that INSERTed message_thread_reads rows
-- used default last_read_at = now(), falsely clearing unread badges.
-- Run in Supabase SQL Editor after reviewing counts. Idempotent for epoch rows.
-- 2026-09-28: repair digest/email stamp false read state

-- Preview affected rows:
-- select thread_id, user_id, last_read_at, last_unread_digest_notified_at, last_email_notified_at
-- from public.message_thread_reads
-- where last_read_at <> '1970-01-01T00:00:00+00'::timestamptz
--   and (
--     (
--       last_unread_digest_notified_at is not null
--       and abs(extract(epoch from (last_read_at - last_unread_digest_notified_at))) <= 5
--     )
--     or (
--       last_email_notified_at is not null
--       and abs(extract(epoch from (last_read_at - last_email_notified_at))) <= 5
--     )
--   );

update public.message_thread_reads mtr
set last_read_at = '1970-01-01T00:00:00+00'::timestamptz
where mtr.last_read_at <> '1970-01-01T00:00:00+00'::timestamptz
  and (
    (
      mtr.last_unread_digest_notified_at is not null
      and abs(
        extract(
          epoch from (
            mtr.last_read_at - mtr.last_unread_digest_notified_at
          )
        )
      ) <= 5
    )
    or (
      mtr.last_email_notified_at is not null
      and abs(
        extract(
          epoch from (mtr.last_read_at - mtr.last_email_notified_at)
        )
      ) <= 5
    )
  );
