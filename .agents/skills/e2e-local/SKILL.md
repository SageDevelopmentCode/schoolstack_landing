---
name: e2e-local
description: >
  Start local Supabase and run Playwright E2E tests for schoolstack_landing.
  Use when the user asks to run E2E tests, start the test environment, debug
  failing Playwright tests, set up .env.e2e.local, run supabase db reset for
  tests, or mentions test:e2e / local testing / Playwright locally.
---

# E2E Local Testing

Run Playwright E2E tests against **local Supabase only**. Never use production Supabase or Stripe.

## Safety rules (follow first)

1. **Local Supabase only** — `NEXT_PUBLIC_SUPABASE_URL` must be `http://127.0.0.1:54321`
2. Use `.env.e2e.local` (copy from `.env.e2e.example`). Do not point E2E at `.env.local` / prod credentials
3. Prod host `rxrmlfyoqzdpjxztluyd` is blocked in `e2e/global-setup.ts`
4. **No Stripe** — Playwright runs `dev:next` (not `npm run dev`). `STRIPE_*` keys are cleared in `playwright.config.ts`
5. **No outbound email** — `DISABLE_OUTBOUND_EMAIL=1` is set for the Playwright web server; Zoho/SMTP keys are cleared so application-submit tests do not send mail
6. **Admissions Discord** — set `DISCORD_E2E_ALERTS_WEBHOOK_URL` in `.env.e2e.local`; prod `ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL` is cleared in `playwright.config.ts` so submit/payment/visit alerts do not hit the school channel
7. If port 3000 has a dev server that may use prod `.env.local`, stop it before `npm run test:e2e`

## Prerequisites

- Docker Desktop running
- Supabase CLI: `brew install supabase/tap/supabase`
- `npm install` completed
- Playwright browser (once): `npm run test:e2e:install`

## One-time setup

```bash
supabase start
supabase db reset
cp .env.e2e.example .env.e2e.local
```

Fill `.env.e2e.local` from `supabase status`:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret / service_role key)

```bash
npm run test:e2e:install
```

`supabase db reset` applies 54 timestamped migrations, including `202601010054_grant_postgrest_api_access.sql` (required for local PostgREST). See `supabase/migrations/README.md` if reset fails.

## Run tests

```bash
npm run test:e2e:setup   # optional: supabase db reset
npm run test:e2e         # 41 tests; starts dev:next automatically
npm run test:e2e:ui      # interactive mode
```

**Expected:** 41 passed (1 setup + 5 smoke + 9 school-admin + 1 non-admin + 11 parent + 14 API).

## Integration tests (no Playwright)

```bash
npm run test:integration:setup   # optional: supabase db reset
npm run test:integration         # webhook handlers + route signature (local Supabase)
```

Uses `.env.e2e.local` when present. Does not call Stripe's API — fixtures and `generateTestHeaderString` only.

## What runs

1. **globalSetup** (`e2e/global-setup.ts`) — env guards + seed users/data via `e2e/fixtures/seed.ts` (writes `e2e/.seed-manifest.json` with application IDs)
2. **webServer** — `dev:next` with E2E Supabase env from `playwright.config.ts`
3. **setup project** (`e2e/auth.setup.ts`) — password login UI → `e2e/.auth/*.json`
4. **Tests** — smoke, school-admin, non-admin, parent, and API projects

## Test users (local only)

| Email | Role |
|-------|------|
| `e2e-admin@schoolstack.test` | School admin with membership |
| `e2e-parent@schoolstack.test` | Parent/guardian |
| `e2e-nonadmin@schoolstack.test` | Authenticated, no admin access |

Password: `E2eTestPassword123!` (override via `E2E_TEST_PASSWORD` in `.env.e2e.local`)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `supabase db reset` fails | See `supabase/migrations/README.md` |
| 404 on `/school/*` routes | Run `supabase db reset`; confirm grants migration applied |
| `Invalid login credentials` in setup | Stop port-3000 server; verify `.env.e2e.local` has local keys |
| Empty `e2e/.auth/*.json` | `rm -rf e2e/.auth` and re-run |
| Playwright browser missing | `npm run test:e2e:install` |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` then re-run |
| Prod block error in globalSetup | Fix `NEXT_PUBLIC_SUPABASE_URL` in `.env.e2e.local` |
| Zoho bounce emails after E2E | Stop any `npm run dev` on port 3000 so Playwright starts its own server with `DISABLE_OUTBOUND_EMAIL=1` |
| Admissions Discord in school channel | Add `DISCORD_E2E_ALERTS_WEBHOOK_URL` to `.env.e2e.local`; stop reused port-3000 dev server |
| `Node.js 20 detected without native WebSocket support` | Ensure `ws` is installed (`npm install`); seed uses it as Realtime transport |

## More detail

- Human docs: `e2e/README.md`
- CI workflows: `.github/workflows/e2e.yml`, `.github/workflows/integration.yml`
