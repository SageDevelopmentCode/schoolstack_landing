# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Local Maestro E2E (local Supabase only): [`.agents/skills/mobile-e2e-local/SKILL.md`](../../.agents/skills/mobile-e2e-local/SKILL.md).

After mobile UI changes: visual screenshot capture + agent review — [`.agents/skills/mobile-ui-visual-verify/SKILL.md`](../../.agents/skills/mobile-ui-visual-verify/SKILL.md).

## Environment (production accounts)

Copy from the web app `.env.local` into the shell that starts Metro (or an `apps/mobile/.env` file if you use one):

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — must be the **same Supabase project** as the web app when testing real users (e.g. teacher memberships on production).
- `EXPO_PUBLIC_SITE_URL` — typically `https://trymudkitchen.com` so mobile API routes match production.

Local Supabase (`127.0.0.1` / `10.0.2.2`) only has seed/E2E users; production teachers will get “no access” if Expo still points at local. See `src/lib/env/mobile-public-env.ts` for helpers.
