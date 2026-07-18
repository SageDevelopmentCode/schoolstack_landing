# GitHub Actions workflows

## CI checks

| Workflow | Trigger | What it runs |
|----------|---------|--------------|
| [lint.yml](./lint.yml) | PR / push to `main` | `npm run lint:errors` |
| [e2e.yml](./e2e.yml) | PR / push to `main` | Playwright E2E with local Supabase |
| [performance.yml](./performance.yml) | PR / push to `main` | Lighthouse CI on production build (`/`, `/get-started`, `/customers`, mobile) |

## Performance CI

The [performance.yml](./performance.yml) workflow:

1. Builds the production Next.js app (`npm run build`)
2. Starts the server and runs `npm run performance:ci` (`lhci autorun` via [`lighthouserc.js`](../../lighthouserc.js))
3. Uploads `.lighthouseci/` reports as a workflow artifact (7-day retention)
4. Optionally uploads results to Supabase (`environment: ci`) when repository secrets are set

**Local reproduction:**

```bash
npm run build
npm run performance:ci
npm run performance:ci:upload   # requires Supabase env vars
```

Assertions start at **warn** level (performance score ≥ 60, LCP ≤ 5s, etc.) so baselines can be established before tightening to hard failures.

## Discord failure alerts

Lint, E2E, Performance CI, and failed Vercel deploy checks post to Discord when they fail.

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

### Troubleshooting Performance CI

If Lighthouse fails with `Unable to connect to Chrome`, that is a **browser launch** issue in the GitHub Actions runner (Chrome path, sandbox flags, or Ubuntu AppArmor restrictions). Supabase secrets do not affect whether Lighthouse runs — they only control the optional upload step after a successful audit.

Common signals:

| Log message | Cause |
|-------------|-------|
| `Unable to connect to Chrome` | Chrome did not start in CI — check `lighthouserc.js` `chromeFlags` and the workflow Chrome setup |
| `GitHub token not set` | Harmless — reports upload to `.lighthouseci/` on disk, not the LHCI server |
| Upload step skipped | Lighthouse step failed (`if: success()`), or Supabase secrets are not configured |

### Workflows

| Workflow | When it alerts |
|----------|----------------|
| [lint.yml](./lint.yml) | Lint job fails |
| [e2e.yml](./e2e.yml) | E2E job fails |
| [performance.yml](./performance.yml) | Lighthouse CI job fails |
| [vercel-discord.yml](./vercel-discord.yml) | Vercel GitHub check fails |

All four call the reusable [discord-notify.yml](./discord-notify.yml) workflow.

Alerts are **failure-only** (no message on green builds).
