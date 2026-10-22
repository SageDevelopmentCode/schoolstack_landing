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
4. **No Stripe** — Playwright’s web server uses E2E env (not your `.env.local` Stripe keys). `STRIPE_*` keys are cleared in `e2e/web-server-env.ts`
5. **No outbound email** — `DISABLE_OUTBOUND_EMAIL=1` is set for the Playwright web server; Zoho/SMTP keys are cleared so application-submit tests do not send mail
6. **Admissions Discord** — set `DISCORD_E2E_ALERTS_WEBHOOK_URL` in `.env.e2e.local`; prod `ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL` is cleared in `playwright.config.ts` so submit/payment/visit alerts do not hit the school channel
7. E2E uses **port 3100** by default — your `next dev` on **3000** can stay running: locally Playwright uses **`next start` on 3100** (after `npm run test:e2e:build`). CI uses `next dev` on 3100 only

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

`supabase db reset` applies timestamped migrations in `supabase/migrations/` (not `migrations_manual/`). See [`.agents/skills/supabase-migrations/SKILL.md`](../supabase-migrations/SKILL.md) when adding schema. Required grant migration: `202601010054_grant_postgrest_api_access.sql`. See `supabase/migrations/README.md` if reset fails.

## Run tests

```bash
npm run test:e2e:setup   # optional: supabase db reset
npm run test:e2e:build   # local: production build with E2E env (re-run after app changes)
npm run test:e2e         # 47 tests; starts next start on 3100 locally (next dev on CI)
npm run test:e2e:ui      # interactive mode
```

Optional: keep **3100** warm while iterating — `npm run test:e2e:server` in another terminal (still use 3000 for daily dev).

Power user: `PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e` when you already serve E2E on 3100.

**Expected:** 47 passed (1 setup + 5 smoke + 9 school-admin + 1 non-admin + 17 parent + 14 API).

**Responsive portal screenshots:** After web UI changes in `src/`, agents follow [portal-responsive-verify](../portal-responsive-verify/SKILL.md) (browser MCP at three viewports by default; optional layout spec below when Supabase is up).

```bash
npm run test:e2e -- e2e/parent/parent-messages-layout.spec.ts
npm run test:e2e -- e2e/parent/committee-messages-layout.spec.ts
```

Those specs write PNGs under `e2e/.artifacts/responsive/` when layout-critical portal files were touched.

After layout specs (or browser MCP capture), agents **must** complete **visual review**: `npm run verify:responsive-artifacts -- committee-messages` (file check), then Read each PNG and apply checklists in [portal-responsive-verify](../portal-responsive-verify/SKILL.md) §3.

## Integration tests (no Playwright)

```bash
npm run test:integration:setup   # optional: supabase db reset
npm run test:integration         # webhook handlers + route signature (local Supabase)
```

Uses `.env.e2e.local` when present. Does not call Stripe's API — fixtures and `generateTestHeaderString` only.

## What runs

1. **globalSetup** (`e2e/global-setup.ts`) — env guards + seed users/data via `e2e/fixtures/seed.ts` (writes `e2e/.seed-manifest.json` with application IDs)
2. **webServer** — local: `next start` on 3100 (`scripts/playwright-e2e-web-server.mjs`); CI: `dev:next` on 3100. Env from `e2e/web-server-env.ts`
3. **setup project** (`e2e/auth.setup.ts`) — password login UI → `e2e/.auth/*.json`
4. **Tests** — smoke, school-admin, non-admin, parent, and API projects

## Test users (local only)

| Email | Role |
|-------|------|
| `e2e-admin@schoolstack.test` | School admin with membership |
| `e2e-platform-admin@schoolstack.test` | Platform admin (`profiles.role = admin`) |
| `e2e-parent@schoolstack.test` | Parent/guardian |
| `e2e-nonadmin@schoolstack.test` | Authenticated, no admin access |

Password: `E2eTestPassword123!` (override via `E2E_TEST_PASSWORD` in `.env.e2e.local`)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `supabase db reset` fails | See `supabase/migrations/README.md` |
| 404 on `/school/*` routes | Run `supabase db reset`; confirm grants migration applied |
| `Invalid login credentials` in setup | Verify `.env.e2e.local` has local keys and `PLAYWRIGHT_BASE_URL=http://localhost:3100` |
| Empty `e2e/.auth/*.json` | `rm -rf e2e/.auth` and re-run |
| Playwright browser missing | `npm run test:e2e:install` |
| Port 3100 in use | `lsof -ti:3100 \| xargs kill -9` then re-run |
| Another `next dev` already running | Run `npm run test:e2e:build` then re-run tests (local uses `next start`, not a second dev server) |
| E2E production server requires a build | `npm run test:e2e:build` |
| Prod block error in globalSetup | Fix `NEXT_PUBLIC_SUPABASE_URL` in `.env.e2e.local` |
| Zoho bounce emails after E2E | Ensure Playwright starts its own server on 3100 with `DISABLE_OUTBOUND_EMAIL=1` |
| Admissions Discord in school channel | Add `DISCORD_E2E_ALERTS_WEBHOOK_URL` to `.env.e2e.local` |
| `Node.js 20 detected without native WebSocket support` | Ensure `ws` is installed (`npm install`); seed uses it as Realtime transport |

## More detail

- Human docs: `e2e/README.md`
- Mobile Maestro E2E: [`.agents/skills/mobile-e2e-local/SKILL.md`](../mobile-e2e-local/SKILL.md)
- CI workflows: `.github/workflows/e2e.yml`, `.github/workflows/integration.yml`, `.github/workflows/performance.yml`

## Lighthouse performance CI (local)

Same seed/auth as E2E — used by GitHub Actions Performance workflow:

```bash
supabase start && supabase db reset
npm run performance:ci:prepare
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from supabase status> \
SUPABASE_SERVICE_ROLE_KEY=<from supabase status> \
NEXT_PUBLIC_SITE_URL=http://localhost:3100 \
npm run build
npm run performance:ci
```

Requires Playwright Chromium (`npm run test:e2e:install`). Cookie injection: `scripts/lhci-puppeteer-auth.cjs`.
