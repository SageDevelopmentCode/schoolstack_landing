# E2E tests (Playwright)

End-to-end tests run against **local Supabase only** — never production. Stripe is not used.

For agent workflows, see [`.agents/skills/e2e-local/SKILL.md`](../.agents/skills/e2e-local/SKILL.md). Mobile Maestro E2E: [`.agents/skills/mobile-e2e-local/SKILL.md`](../.agents/skills/mobile-e2e-local/SKILL.md). Schema DDL must live in `supabase/migrations/` — see [`.agents/skills/supabase-migrations/SKILL.md`](../.agents/skills/supabase-migrations/SKILL.md). Branch code review: [`.agents/skills/branch-code-review/SKILL.md`](../.agents/skills/branch-code-review/SKILL.md).

`globalSetup` seeds the database; the `setup` project signs in test users and writes `e2e/.auth/` before authenticated tests run.

**Important:** E2E targets **port 3100** (not 3000/3001). Locally, Playwright runs **`next start` on 3100** so it can coexist with `npm run dev` on 3000 (Next.js allows only one `next dev` per repo). CI still uses `next dev` on 3100. Playwright passes E2E env vars via `webServer.env` ([`e2e/web-server-env.ts`](web-server-env.ts)).

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
npm run test:e2e:build   # required locally before first run (or after app code changes)
npm run test:e2e         # 41 tests (setup + smoke + admin + parent + API)
npm run test:e2e:ui      # interactive mode
```

**Keep dev on 3000 while testing:** build once, then either let Playwright start `next start` on 3100 automatically, or run `npm run test:e2e:server` in a second terminal and re-run tests (Playwright reuses an existing 3100 server when `reuseExistingServer` applies).

**Skip Playwright’s web server** (you already have something on 3100): `PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e`

**Responsive screenshots + agent visual review:** Layout specs write PNGs to `e2e/.artifacts/responsive/`. Agents must **Read and analyze** those images per [portal-responsive-verify SKILL](../.agents/skills/portal-responsive-verify/SKILL.md). Check files exist with `npm run verify:responsive-artifacts -- committee-messages` (or `parent-messages`).

**On-demand portal QA (branch-scoped):** [portal-qa SKILL](../.agents/skills/portal-qa/SKILL.md) — scope routes from git diff, capture golden scenarios, vision review + report.

```bash
npm run portal-qa:scope
PORTAL_QA_SCENARIOS=committee-messages npm run test:qa:portal
npm run verify:portal-qa-artifacts -- committee-messages
```

PNGs: `e2e/.artifacts/portal-qa/{scenario-id}-{mobile|tablet|desktop}.png`. Scenario catalog: [`e2e/qa/portal-scenarios.ts`](qa/portal-scenarios.ts), [`e2e/qa/parent-portal-scenarios.ts`](qa/parent-portal-scenarios.ts), and [`e2e/qa/teacher-portal-scenarios.ts`](qa/teacher-portal-scenarios.ts).

`PORTAL_QA_SCENARIOS=parent-all` runs every parent golden scenario (full `ParentFeatures` catalog on the E2E org, including co-op program routes). `PORTAL_QA_SCENARIOS=teacher-all` runs every teacher golden scenario (full `TeacherFeatures` catalog, including Coming Soon routes). Seed data: [`e2e/fixtures/portal-qa-parent-seed.ts`](fixtures/portal-qa-parent-seed.ts) (shared classroom signup, forms, and staff committee membership).

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
| `qa` | On-demand portal QA capture (`test:qa:portal`) | Per-scenario (parent / staff / school admin) |

Seeded password (local only): `E2eTestPassword123!` — override via `.env.e2e.local`.

| Email | Role |
|-------|------|
| `e2e-admin@schoolstack.test` | School org admin |
| `e2e-platform-admin@schoolstack.test` | Platform admin (`profiles.role = admin`) |
| `e2e-parent@schoolstack.test` | Parent/guardian |
| `e2e-nonadmin@schoolstack.test` | Authenticated, no admin access |

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
NEXT_PUBLIC_SITE_URL=http://localhost:3100 \
npm run build
npm run performance:ci
```

`scripts/lhci-puppeteer-auth.cjs` injects cookies from `e2e/.auth/school-admin.json` or `parent.json` before each Lighthouse audit.

## Troubleshooting

**`supabase db reset` fails:** See [`supabase/migrations/README.md`](../supabase/migrations/README.md).

**Auth tests fail:** Delete `e2e/.auth/` and re-run — `globalSetup` recreates sessions.

**Playwright browser missing:** `npm run test:e2e:install`

**`Another next dev server is already running`:** You are on an old flow that tried `next dev` on 3100 while `next dev` runs on 3000. Run `npm run test:e2e:build`, then re-run tests (local config uses `next start` on 3100).

**`E2E production server requires a build`:** Run `npm run test:e2e:build`.

**Port 3100 in use:** `lsof -ti:3100 | xargs kill -9` then re-run (or use `PLAYWRIGHT_SKIP_WEBSERVER=1` if you manage the server yourself).

**Missing responsive PNGs for visual review:** Run the layout spec (e.g. `committee-messages-layout.spec.ts`) or browser MCP capture, then `npm run verify:responsive-artifacts -- <feature-slug>`.

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
