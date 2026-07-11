# GitHub Actions workflows

## CI checks

| Workflow | Trigger | What it runs |
|----------|---------|--------------|
| [lint.yml](./lint.yml) | PR / push to `main` | `npm run lint:errors` |
| [e2e.yml](./e2e.yml) | PR / push to `main` | Playwright E2E with local Supabase |

## Discord failure alerts

Lint, E2E, and failed Vercel deploy checks post to Discord when they fail.

### Setup (one-time)

1. Create a Discord webhook for your `#ci-alerts` channel.
2. Add the URL to `.env.local` as `DISCORD_CI_ALERTS_WEBHOOK_URL` (local reference only).
3. Add the **same URL** as a GitHub Actions repository secret:
   - **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DISCORD_CI_ALERTS_WEBHOOK_URL`

GitHub Actions cannot read `.env.local`; the repository secret is required for CI notifications.

### Workflows

| Workflow | When it alerts |
|----------|----------------|
| [lint.yml](./lint.yml) | Lint job fails |
| [e2e.yml](./e2e.yml) | E2E job fails |
| [vercel-discord.yml](./vercel-discord.yml) | Vercel GitHub check fails |

All three call the reusable [discord-notify.yml](./discord-notify.yml) workflow.

Alerts are **failure-only** (no message on green builds).
