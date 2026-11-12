-- Promoted to supabase/migrations/20261163_create_free_school_atomic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Run after: staff_hours_adjustment_superseded_status_2026_11_12.sql

create or replace function public.create_free_school_atomic(
  p_user_id uuid,
  p_school_name text,
  p_timezone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_name text;
  v_timezone text;
  v_existing_org_id uuid;
  v_existing_slug text;
  v_has_other_admin boolean;
  v_slug_base text;
  v_slug text;
  v_attempt int;
  v_suffix text;
  v_room int;
  v_organization_id uuid;
  const_slug_max constant int := 48;
  const_attempts constant int := 8;
begin
  if p_user_id is null then
    raise exception 'free_school:invalid_user';
  end if;

  perform pg_advisory_xact_lock(hashtext('free_school_signup:' || p_user_id::text));

  v_school_name := trim(regexp_replace(trim(coalesce(p_school_name, '')), '\s+', ' ', 'g'));
  if length(v_school_name) < 2 or length(v_school_name) > 200 then
    raise exception 'free_school:invalid_name';
  end if;

  v_timezone := trim(coalesce(p_timezone, ''));
  if v_timezone = '' then
    raise exception 'free_school:invalid_timezone';
  end if;

  select o.id, o.slug
  into v_existing_org_id, v_existing_slug
  from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = p_user_id
    and m.status = 'active'
    and m.role = 'owner'
    and o.plan = 'free'
    and o.status = 'onboarding'
  order by m.created_at asc
  limit 1;

  if found then
    return jsonb_build_object(
      'organization_id', v_existing_org_id,
      'slug', v_existing_slug,
      'idempotent', true
    );
  end if;

  select exists (
    select 1
    from public.organization_memberships m
    where m.user_id = p_user_id
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  )
  into v_has_other_admin;

  if v_has_other_admin then
    raise exception 'free_school:already_administers';
  end if;

  v_slug_base := lower(regexp_replace(v_school_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug_base := trim(both '-' from v_slug_base);
  if length(v_slug_base) > const_slug_max then
    v_slug_base := left(v_slug_base, const_slug_max);
    v_slug_base := regexp_replace(v_slug_base, '-+$', '');
  end if;
  if length(v_slug_base) < 2 then
    v_slug_base := 'school';
  end if;

  v_organization_id := null;

  for v_attempt in 0..(const_attempts - 1) loop
    if v_attempt <= 0 then
      v_slug := v_slug_base;
    else
      v_suffix := '-' || (v_attempt + 1)::text;
      v_room := const_slug_max - length(v_suffix);
      v_slug := left(v_slug_base, greatest(2, v_room));
      v_slug := regexp_replace(v_slug, '-+$', '');
      v_slug := v_slug || v_suffix;
    end if;

    begin
      insert into public.organizations (slug, name, status, timezone, plan)
      values (v_slug, v_school_name, 'onboarding', v_timezone, 'free')
      returning id into v_organization_id;

      exit;
    exception
      when unique_violation then
        if v_attempt = const_attempts - 1 then
          raise exception 'free_school:slug_exhausted';
        end if;
    end;
  end loop;

  if v_organization_id is null then
    raise exception 'free_school:slug_exhausted';
  end if;

  insert into public.organization_settings (organization_id, features)
  values (v_organization_id, '{}'::jsonb);

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    status
  )
  values (v_organization_id, p_user_id, 'owner', 'active');

  return jsonb_build_object(
    'organization_id', v_organization_id,
    'slug', v_slug,
    'idempotent', false
  );
end;
$$;

revoke execute on function public.create_free_school_atomic(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.create_free_school_atomic(uuid, text, text)
  to service_role;
