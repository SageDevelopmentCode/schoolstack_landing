# E2E tests (Playwright)

End-to-end tests run against **local Supabase only** — never production. Stripe is not used.

For agent workflows, see [`.agents/skills/e2e-local/SKILL.md`](../.agents/skills/e2e-local/SKILL.md). Schema DDL must live in `supabase/migrations/` — see [`.agents/skills/supabase-migrations/SKILL.md`](../.agents/skills/supabase-migrations/SKILL.md).

`globalSetup` seeds the database; the `setup` project signs in test users and writes `e2e/.auth/` before authenticated tests run.

**Important:** Stop any dev server on port 3000 before running E2E, or ensure it uses local Supabase — Playwright passes E2E env vars to `dev:next` via `webServer.env`.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [Supabase CLI](https://supabase.com/docs/guides/cli): `brew install supabase/tap/supabase`

## One-time setup

```bash
supabase start
supabase db reset
cp .env.e2e.example .env.e2e.local
# Fill keys from `supabase status` (Publishable + service_role)
npm run test:e2e:install
```

## Run tests

```bash
npm run test:e2e:setup   # optional: reset local DB
npm run test:e2e         # 41 tests (setup + smoke + admin + parent + API)
npm run test:e2e:ui      # interactive mode
```

## Test suites

| Project | Tests | Auth |
|---------|-------|------|
| `setup` | Seed + authenticate test users | — |
| `smoke` | Platform admin redirect, school admin redirect, parent auth gate | None |
| `school-admin` | Admissions submissions list, detail panel, answers, status change, PDF | `e2e-admin@schoolstack.test` |
| `non-admin` | Access denied for user without membership | `e2e-nonadmin@schoolstack.test` |
| `parent` | Apply dashboard, submit, mobile flows | `e2e-parent@schoolstack.test` |
| `api-parent` | Admissions submit, bootstrap, checkout API routes | `e2e-parent@schoolstack.test` |
| `api-admin` | Admissions status API routes | `e2e-admin@schoolstack.test` |

Seeded password (local only): `E2eTestPassword123!` — override via `.env.e2e.local`.

## Safety

- Loads `.env.e2e.local` when present; CI uses workflow env vars
- `e2e/global-setup.ts` blocks production Supabase host `rxrmlfyoqzdpjxztluyd`
- Stripe env vars cleared in Playwright web server
- Outbound email disabled via `DISABLE_OUTBOUND_EMAIL=1` (Zoho/SMTP keys cleared)
- Admissions Discord alerts route to `DISCORD_E2E_ALERTS_WEBHOOK_URL` from `.env.e2e.local`; prod `ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL` is cleared in Playwright web server

## CI

GitHub Actions runs the same suite on PRs to `main` (see [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)).

Roll out branch protection gradually: run informational checks first, then require `e2e` after several green runs.

## Lighthouse performance CI (authenticated)

Performance CI reuses the same E2E seed and auth storage states. See [`.github/workflows/performance.yml`](../.github/workflows/performance.yml).

```bash
supabase start && supabase db reset
npm run performance:ci:prepare   # seed + e2e/.auth/*.json + scripts/lhci-auth-routes.json
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from supabase status> \
SUPABASE_SERVICE_ROLE_KEY=<from supabase status> \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run build
npm run performance:ci
```

`scripts/lhci-puppeteer-auth.cjs` injects cookies from `e2e/.auth/school-admin.json` or `parent.json` before each Lighthouse audit.

## Troubleshooting

**`supabase db reset` fails:** See [`supabase/migrations/README.md`](../supabase/migrations/README.md).

**Auth tests fail:** Delete `e2e/.auth/` and re-run — `globalSetup` recreates sessions.

**Playwright browser missing:** `npm run test:e2e:install`

## Tuition billing cron (staging smoke)

After deploying tuition automation to staging:

1. Set `CRON_SECRET` and mail env vars (`ZOHO_*` or your SMTP provider).
2. Insert or identify a test charge due exactly **3 days** from today for a family with `primary_email`.
3. Call the cron route manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$NEXT_PUBLIC_SITE_URL/api/cron/tuition-billing"
```

4. Confirm the family receives a due reminder email and, if configured, the Discord tuition billing summary webhook fires.

Local unit coverage for reminder date windows and cron orchestration lives in `src/lib/tuition/reminders.test.ts` and `src/lib/tuition/billing-cron.test.ts`.
