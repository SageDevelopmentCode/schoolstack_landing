-- Mud School portal branding colors → match homepage product preview demos (Luff Learning palette).
-- Paste into Supabase SQL Editor. Idempotent. Safe to re-run.
-- Date: 2026-10-04
--
-- Updates organization_settings.branding.colors only (logo + typography unchanged on update).
-- Source: src/data/school-demos/luff-learning-admin-demo.ts → LUFF_LEARNING_ADMIN_COLORS
--
-- Prerequisites: organization slug mud-school exists.

-- ── Homepage demo colors (keep in sync with LUFF_LEARNING_ADMIN_COLORS) ───────

insert into public.organization_settings (organization_id, branding, features)
select
  o.id,
  jsonb_build_object(
    'colors',
    '{
      "bg": "#f7fafc",
      "border": "#eeeeee",
      "borderStrong": "#769a61",
      "accent": "#769a61",
      "accentBright": "#5f824f",
      "accentLight": "rgba(118, 154, 97, 0.10)",
      "secondaryBtnBorder": "rgba(118, 154, 97, 0.22)",
      "accentGlow": "rgba(118, 154, 97, 0.12)",
      "accentMid": "#644268",
      "accentDark": "#1e141f",
      "clay": "#efad1f",
      "clayBg": "rgba(239, 173, 31, 0.12)",
      "clayBorder": "rgba(239, 173, 31, 0.35)",
      "textPrimary": "#1e141f",
      "textSecondary": "#718096"
    }'::jsonb,
    'logo',
    jsonb_build_object(
      'src', '',
      'alt', coalesce(o.name, 'Mud School'),
      'width', 220,
      'height', 52
    ),
    'typography',
    jsonb_build_object('headingFont', '', 'bodyFont', '')
  ),
  '{}'::jsonb
from public.organizations o
where o.slug = 'mud-school'
on conflict (organization_id) do update
set
  branding = jsonb_set(
    coalesce(public.organization_settings.branding, '{}'::jsonb),
    '{colors}',
    excluded.branding -> 'colors',
    true
  ),
  updated_at = now();

-- ── Verification (optional) ───────────────────────────────────────────────────
-- select o.slug, os.branding -> 'colors' ->> 'accent' as accent
-- from public.organization_settings os
-- join public.organizations o on o.id = os.organization_id
-- where o.slug = 'mud-school';
