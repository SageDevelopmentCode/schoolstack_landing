-- Promoted to:
--   supabase/migrations/20260824_add_guardian_message_participants.sql (Step 1)
--   supabase/migrations/20260825_add_guardian_message_participants.sql (Step 2)
--
-- Run in Supabase SQL Editor on remote. PostgreSQL requires the new enum value
-- to be committed before it can be used — run Step 1 first, then Step 2.

-- =============================================================================
-- STEP 1 — Add enum value (run this block alone, wait for success)
-- Run after: 20260823_family_notification_emails_max_three.sql
-- =============================================================================

ALTER TYPE public.message_participant_kind ADD VALUE IF NOT EXISTS 'guardian';

-- =============================================================================
-- STEP 2 — DDL, RLS, and data migration (run after Step 1 succeeds)
-- Run after: 20260824_add_guardian_message_participants.sql
-- =============================================================================

ALTER TABLE public.message_thread_participants
  ADD COLUMN IF NOT EXISTS guardian_id uuid REFERENCES public.guardians(id) ON DELETE CASCADE;

ALTER TABLE public.message_thread_participants
  DROP CONSTRAINT IF EXISTS message_thread_participants_identity_check;

ALTER TABLE public.message_thread_participants
  ADD CONSTRAINT message_thread_participants_identity_check CHECK (
    (
      participant_kind = 'family'
      AND family_id IS NOT NULL
      AND staff_member_id IS NULL
      AND guardian_id IS NULL
    )
    OR (
      participant_kind = 'guardian'
      AND guardian_id IS NOT NULL
      AND family_id IS NULL
      AND staff_member_id IS NULL
    )
    OR (
      participant_kind = 'staff_member'
      AND staff_member_id IS NOT NULL
      AND family_id IS NULL
      AND guardian_id IS NULL
    )
    OR (
      participant_kind = 'school_office'
      AND family_id IS NULL
      AND staff_member_id IS NULL
      AND guardian_id IS NULL
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS message_thread_participants_guardian_uidx
  ON public.message_thread_participants (thread_id, guardian_id)
  WHERE participant_kind = 'guardian';

CREATE INDEX IF NOT EXISTS message_thread_participants_guardian_id_idx
  ON public.message_thread_participants (organization_id, guardian_id)
  WHERE guardian_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.user_is_guardian(p_guardian_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guardians g
    WHERE g.id = p_guardian_id
      AND g.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_message_thread(p_thread_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.message_threads t
    WHERE t.id = p_thread_id
      AND (
        public.is_platform_admin()
        OR public.user_is_org_admin(t.organization_id)
        OR EXISTS (
          SELECT 1
          FROM public.message_thread_participants p
          WHERE p.thread_id = t.id
            AND p.participant_kind = 'guardian'
            AND public.user_is_guardian(p.guardian_id)
        )
        OR EXISTS (
          SELECT 1
          FROM public.message_thread_participants p
          WHERE p.thread_id = t.id
            AND p.participant_kind = 'family'
            AND public.user_is_guardian_for_family(p.family_id)
        )
        OR EXISTS (
          SELECT 1
          FROM public.message_thread_participants p
          WHERE p.thread_id = t.id
            AND p.participant_kind = 'staff_member'
            AND p.staff_member_id = public.user_staff_member_id_for_org(t.organization_id)
        )
      )
  );
$$;

-- Migrate family participants to primary/first guardian per family.
-- Legacy family threads become visible only to that guardian after migration.
WITH primary_guardian AS (
  SELECT DISTINCT ON (mtp.id)
    mtp.id AS participant_id,
    g.id AS guardian_id
  FROM public.message_thread_participants mtp
  JOIN public.guardians g
    ON g.family_id = mtp.family_id
   AND g.organization_id = mtp.organization_id
  LEFT JOIN LATERAL (
    SELECT a.primary_guardian_id
    FROM public.applications a
    WHERE a.organization_id = mtp.organization_id
      AND a.family_id = mtp.family_id
      AND a.primary_guardian_id IS NOT NULL
    ORDER BY a.updated_at DESC
    LIMIT 1
  ) primary_app ON true
  WHERE mtp.participant_kind = 'family'
  ORDER BY
    mtp.id,
    CASE WHEN g.id = primary_app.primary_guardian_id THEN 0 ELSE 1 END,
    g.created_at ASC
)
UPDATE public.message_thread_participants mtp
SET
  participant_kind = 'guardian',
  guardian_id = pg.guardian_id,
  family_id = NULL
FROM primary_guardian pg
WHERE mtp.id = pg.participant_id;

UPDATE public.message_threads t
SET participant_signature = sig.signature
FROM (
  SELECT
    p.thread_id,
    string_agg(
      CASE
        WHEN p.participant_kind = 'guardian' THEN 'guardian:' || p.guardian_id::text
        WHEN p.participant_kind = 'family' THEN 'family:' || p.family_id::text
        WHEN p.participant_kind = 'staff_member' THEN 'staff:' || p.staff_member_id::text
        WHEN p.participant_kind = 'school_office' THEN 'school_office'
      END,
      '|'
      ORDER BY
        CASE
          WHEN p.participant_kind = 'guardian' THEN 'guardian:' || p.guardian_id::text
          WHEN p.participant_kind = 'family' THEN 'family:' || p.family_id::text
          WHEN p.participant_kind = 'staff_member' THEN 'staff:' || p.staff_member_id::text
          WHEN p.participant_kind = 'school_office' THEN 'school_office'
        END
    ) AS signature
  FROM public.message_thread_participants p
  GROUP BY p.thread_id
) sig
WHERE t.id = sig.thread_id;
