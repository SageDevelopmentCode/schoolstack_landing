# GitHub Actions workflows

## CI checks

| Workflow | Trigger | What it runs |
|----------|---------|--------------|
| [lint.yml](./lint.yml) | PR / push | `npm run lint:errors`, typecheck, unit tests (web) |
| [mobile.yml](./mobile.yml) | PR / push when `apps/mobile/**` changes | Mobile lint, typecheck, Jest; Maestro E2E on PRs to `main` |
| [e2e.yml](./e2e.yml) | PR / push to `main` | Playwright E2E with local Supabase |
| [performance.yml](./performance.yml) | PR / push to `main` | Lighthouse CI — PRs audit changed pages only; `main` runs the full suite. Skipped when a PR only changes docs/SQL/migrations. |

## Performance CI

The [performance.yml](./performance.yml) workflow:

**When it runs**

- **Pull requests:** only when perf-relevant files change (`src/`, `public/`, `package.json`, `next.config.ts`, `middleware.ts`, performance scripts, `e2e/`, etc.). PRs that touch only `supabase/`, `*.sql`, or markdown/docs skip the entire workflow.
- **Push to `main`:** always runs the full 13-page Lighthouse suite (mobile + desktop).

**Page selection on PRs**

A resolver ([`resolve-ci-pages-from-diff.ts`](../../src/lib/performance/resolve-ci-pages-from-diff.ts)) maps the git diff to a subset of [`CI_LHCI_PAGE_PATHS`](../../src/lib/performance/page-manifest.ts). Changed files are matched to page clusters and **unioned** — a tuition component plus a `src/lib/school-admin/` helper no longer expands to the full suite.

| Changed files | CI pages audited |
|---------------|------------------|
| `src/components/school-parent/*` | Parent portal cluster (4 paths + auth index) |
| `src/components/school-admin/tuition/*` or `src/lib/tuition/*` | Admin login + `/admin/my_school/tuition` |
| `src/components/school-admin/*`, `src/lib/school-admin/*`, `src/components/admin/*` | School admin cluster (login, dashboard, admissions/submissions) |
| `src/lib/organization-settings/*` | Admin + parent + admissions clusters |
| `layout.tsx`, `middleware.ts`, `package.json`, … | Full 13-page suite |
| Unmatched `src/` or `public/` file (no cluster match) | Full 13-page suite (safe fallback) |
| SQL/docs only (no perf-relevant paths) | Lighthouse skipped (0 pages resolved) |

Example: a change to `ParentBillingPage.tsx` audits the parent portal CI paths only (~4 URLs × 2 form factors instead of 13 × 2).

**Steps (when triggered)**

1. Starts local Supabase (`supabase start` + `supabase db reset`) and exports E2E env vars
2. Resolves Lighthouse page paths (`scripts/resolve-performance-ci-pages.ts`) and sets `PERFORMANCE_CI_PAGE_PATHS`
3. Seeds the database and creates Playwright auth storage states (`npm run performance:ci:prepare`)
4. Builds the production Next.js app with local `NEXT_PUBLIC_SUPABASE_*` baked in (`npm run build`)
5. Runs Lighthouse CI twice via `npm run performance:ci` (`lhci autorun` with `PERFORMANCE_FORM_FACTOR=mobile` then `desktop`) — a Puppeteer script injects E2E cookies per URL so admin dashboard/submissions and parent portal pages audit real authenticated shells
6. Uploads mobile and desktop results to Supabase (`environment: ci`, separate `form_factor` per run) when repository secrets are set
7. Uploads `.lighthouseci/` reports as a workflow artifact (7-day retention; desktop pass overwrites the artifact from the mobile pass)

**Auth mapping** (from [`page-manifest.ts`](../../src/lib/performance/page-manifest.ts)):

| URL group | Session |
|-----------|---------|
| Marketing + admissions + school admin login | None (public) |
| School admin dashboard, admissions submissions, tuition | `e2e-admin@schoolstack.test` |
| Parent portal routes | `e2e-parent@schoolstack.test` |

**Local reproduction:**

```bash
supabase start && supabase db reset
# Fill .env.e2e.local from supabase status (or export vars inline)
npm run performance:ci:prepare
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from supabase status> \
SUPABASE_SERVICE_ROLE_KEY=<from supabase status> \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run build
npm run performance:ci:mobile
PERFORMANCE_FORM_FACTOR=mobile npm run performance:ci:upload   # requires production Supabase env vars
npm run performance:ci:desktop
PERFORMANCE_FORM_FACTOR=desktop npm run performance:ci:upload
```

Assertions start at **warn** level (performance score ≥ 60, LCP ≤ 5s, etc.) so baselines can be established before tightening to hard failures.

## Mobile CI

The [mobile.yml](./mobile.yml) workflow:

**When it runs**

- **Pull requests / pushes:** lint, typecheck, and Jest when `apps/mobile/**` or `package-lock.json` changes
- **Pull requests to `main`:** Android (Ubuntu) + iOS (`macos-15-intel`) Maestro E2E with local Supabase + Next.js on port 3100 (11 flows: intro, school admin login/dashboard, admissions list/detail/filter, tab navigation, students, platform admin login/enter-school)

iOS E2E runs on `macos-15-intel` (not `macos-latest`) because local Supabase requires Docker via Colima, which needs nested virtualization unsupported on Apple Silicon GitHub runners.

**Colima bootstrap (iOS only)**

The `mobile-e2e-ios` job runs [`scripts/ci/start-supabase-colima.sh`](../../scripts/ci/start-supabase-colima.sh) before `supabase db reset`:

- Starts Colima with **virtiofs** (not sshfs), 8 GB RAM, and 100 GB disk — sshfs is unstable under parallel Supabase image pulls on CI
- Symlinks `~/.colima/default/docker.sock` → `/var/run/docker.sock` and sets `DOCKER_HOST` there (required by Supabase CLI 2.110+ for the vector/analytics container)
- Waits for `docker info` readiness, then retries `supabase start` up to 3 times with Colima restart on failure

Both Android and iOS E2E jobs pin Supabase CLI **2.110.0**.

**Local reproduction**

```bash
npm run mobile:lint
npm run mobile:typecheck
npm run mobile:test
```

Maestro E2E locally: see [`apps/mobile/README.md`](../../apps/mobile/README.md) and [`.agents/skills/mobile-e2e-local/SKILL.md`](../../.agents/skills/mobile-e2e-local/SKILL.md). No `.env.e2e.local` is required for CI; create one only for local Maestro runs (`npm run mobile:e2e:env -- ios`).

## Discord failure alerts

Lint, E2E, Mobile CI, Performance CI, and failed Vercel deploy checks post to Discord when they fail.

### Setup (one-time)

1. Create a Discord webhook for your `#ci-alerts` channel.
2. Add the URL to `.env.local` as `DISCORD_CI_ALERTS_WEBHOOK_URL` (local reference only).
3. Add the **same URL** as a GitHub Actions repository secret:
   - **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DISCORD_CI_ALERTS_WEBHOOK_URL`

GitHub Actions cannot read `.env.local`; the repository secret is required for CI notifications.

### Optional: Supabase upload for CI results

To surface PR Lighthouse scores in `/admin/performance` (CI tab), add repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Apply migration [`20260719_add_performance_ci_environment.sql`](../../supabase/migrations/20260719_add_performance_ci_environment.sql) on the target project first.

Historical CI rows are mobile-only until a PR runs after the mobile+desktop workflow ships; use the **Desktop** tab to view desktop scores once uploaded.

### Troubleshooting Performance CI

If Lighthouse fails with `Unable to connect to Chrome`, that is a **browser launch** issue in the GitHub Actions runner (Chrome path, sandbox flags, or Ubuntu AppArmor restrictions). Supabase secrets do not affect whether Lighthouse runs — they only control the optional upload step after a successful audit.

Common signals:

| Log message | Cause |
|-------------|-------|
| `ERR_CONNECTION_REFUSED` during `performance:ci:prepare` | Prepare delegates to Playwright's `webServer` to start Next.js — ensure `playwright.config.ts` `webServer` is intact and port 3000 is free in CI |
| `Unable to connect to Chrome` | Chrome did not start in CI — check `lighthouserc.js` `chromeFlags` and the workflow Chrome setup |
| `Protocol error (Page.enable)` or `frame_sequence` | Lighthouse/Chrome version mismatch — CI pins Chrome 141 to match Lighthouse 12.8.2; do not use `ubuntu-latest`'s system Chrome (often Chrome 150+) |
| `GitHub token not set` | Harmless — reports upload to `.lighthouseci/` on disk, not the LHCI server |
| Upload step skipped | Lighthouse step failed (`if: success()`), or Supabase secrets are not configured |

### Workflows

| Workflow | When it alerts |
|----------|----------------|
| [lint.yml](./lint.yml) | Lint job fails |
| [mobile.yml](./mobile.yml) | Mobile checks or Maestro E2E (Android/iOS) fails |
| [e2e.yml](./e2e.yml) | E2E job fails |
| [performance.yml](./performance.yml) | Lighthouse CI job fails |
| [vercel-discord.yml](./vercel-discord.yml) | Vercel GitHub check fails |

All five call the reusable [discord-notify.yml](./discord-notify.yml) workflow.

Alerts are **failure-only** (no message on green builds).
