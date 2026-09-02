-- Promoted to supabase/migrations/20260844_admin_submissions_page_meta.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: 2026-09-02 — lean RPC for admissions submissions tab meta (status counts, form options, latest submitted).

create or replace function public.admin_submissions_page_meta(
  p_organization_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with status_counts as (
    select coalesce(
      jsonb_object_agg(status, count)::jsonb,
      '{}'::jsonb
    ) as counts
    from (
      select status::text as status, count(*)::int as count
      from public.applications
      where organization_id = p_organization_id
      group by status
    ) grouped
  ),
  form_options as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'key',
          coalesce(nullif(trim(afv.public_slug), ''), afv.title),
          'title',
          afv.title
        )
        order by afv.title
      ),
      '[]'::jsonb
    ) as options
    from (
      select distinct on (
        coalesce(nullif(trim(afv.public_slug), ''), afv.title)
      )
        afv.title,
        afv.public_slug
      from public.applications app
      inner join public.application_form_versions afv
        on afv.id = app.form_version_id
      where app.organization_id = p_organization_id
      order by
        coalesce(nullif(trim(afv.public_slug), ''), afv.title),
        afv.title
    ) afv
  ),
  latest_submitted as (
    select jsonb_build_object(
      'id',
      app.id::text,
      'submitted_at',
      app.submitted_at,
      'guardian_name',
      nullif(
        trim(
          concat_ws(
            ' ',
            g.first_name,
            g.last_name
          )
        ),
        ''
      )
    ) as payload
    from public.applications app
    left join public.guardians g on g.id = app.primary_guardian_id
    where app.organization_id = p_organization_id
      and app.status = 'submitted'
    order by app.submitted_at desc nulls last
    limit 1
  )
  select jsonb_build_object(
    'status_counts',
    (select counts from status_counts),
    'form_options',
    (select options from form_options),
    'latest_submitted',
    (select payload from latest_submitted)
  );
$$;

create index if not exists applications_org_status_updated_at_idx
  on public.applications (organization_id, status, updated_at desc);
