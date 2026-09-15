-- Bootstrap Sage Field product organization.
-- Paste this entire file into Supabase SQL Editor and run it.
-- Safe to re-run (idempotent).
-- Date: 2026-09-13
--
-- Creates:
--   organizations row: slug sage-field, status live
--   organization_settings row: Sage Field branding + default features
--
-- After running:
--   1. Refresh /admin/organizations — Sage Field should appear under Live
--   2. Use Settings tab to review branding (/images/SageFieldLogo.png)
--   3. Use Access tab to assign owner/admin membership if needed

insert into public.organizations (slug, name, status, timezone, crm_school_id)
values (
  'sage-field',
  'Sage Field',
  'live',
  'America/Chicago',
  null
)
on conflict (slug) do nothing;

insert into public.organization_settings (organization_id, branding, features)
select
  o.id,
  '{
    "logo": {
      "src": "/images/SageFieldLogo.png",
      "alt": "Sage Field",
      "width": 180,
      "height": 52
    },
    "colors": {
      "bg": "#F2F7F3",
      "border": "#E0EDE2",
      "borderStrong": "#BFD8C0",
      "accent": "#374B3F",
      "accentBright": "#5E7C68",
      "accentLight": "rgba(55, 75, 63, 0.10)",
      "secondaryBtnBorder": "rgba(55, 75, 63, 0.22)",
      "accentGlow": "rgba(94, 124, 104, 0.12)",
      "accentMid": "#7FA888",
      "accentDark": "#374B3F",
      "clay": "#f29a8f",
      "clayBg": "rgba(242, 154, 143, 0.12)",
      "clayBorder": "rgba(242, 154, 143, 0.30)",
      "textPrimary": "#333333",
      "textSecondary": "#6D6257"
    }
  }'::jsonb,
  '{}'::jsonb
from public.organizations o
where o.slug = 'sage-field'
on conflict (organization_id) do update
set
  branding = excluded.branding,
  updated_at = now();


-- ── Verification (run separately after bootstrap) ───────────────────────────

-- select slug, name, status, timezone
-- from public.organizations
-- where slug = 'sage-field';

-- select o.slug, os.branding->'logo' as logo, os.features
-- from public.organization_settings os
-- join public.organizations o on o.id = os.organization_id
-- where o.slug = 'sage-field';
