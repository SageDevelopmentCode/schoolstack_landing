# Sentry and performance env vars (mudkitchenweb)

Use project **mudkitchenweb** in Sentry. Set these on **Vercel** (Production + Preview) and in local `.env.local` (never commit secrets).

## Where to copy values in Sentry

| Variable | Sentry UI path |
|----------|----------------|
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | **Settings → Projects → mudkitchenweb → Client Keys (DSN)** — same URL for both vars |
| `SENTRY_ORG` | **Organization Settings → General** — organization slug (also in settings URL) |
| `SENTRY_PROJECT` | `mudkitchenweb` |
| `SENTRY_AUTH_TOKEN` | See **Auth token types** below |

`SENTRY_AUTH_TOKEN` must **not** be prefixed with `NEXT_PUBLIC_`.

### Auth token types

| Token | Typical use | MudKitchen admin observability |
|-------|-------------|--------------------------------|
| **Organization token** (`org:ci` only) | CI, Vercel source maps, releases | **Issues** may work; **Performance** tab usually **403** (no Discover / events API) |
| **Personal token** | Local dev + admin API proxy | **Required** for both tabs if you use one token everywhere |

Create a **personal** token under **Developer Settings → Auth Tokens → Create New Token** and set:

- **Project** → Read  
- **Issue & Event** → **Read** (required for `/admin/observability` → **Sentry performance**; uses Sentry Discover)  
- **Organization** → Read  
- **Release** → Admin (optional; add if the same token uploads source maps in CI)

The **Sentry issues** tab calls the project issues API (`project:read` + issue access). The **performance** tab calls Sentry Explore (`GET …/organizations/{org}/events/` with `dataset=spans` and `is_transaction:true`) and needs **Organization → Read** (`org:read`) plus **Issue & Event → Read** (`event:read`). An org token with only `org:ci` is expected to return **403** on performance.

If **issues** load but **performance** showed permission denied while your token already has `event:read`, the cause was usually the retired `dataset=transactions` POST API—not missing scopes. After the app uses the spans Explore API, the same token should work.

After changing `.env.local`, **restart** `next dev` (env is read at server start). On Vercel, update the variable and redeploy.

## Vercel

1. Project → **Settings → Environment Variables**
2. Add each variable for **Production** and **Preview**
3. Redeploy preview or production

## After deploy — verification checklist

### Errors (Issues)

- Open preview or production, trigger a known 500 or use an existing failure path
- Sentry → **Issues** — new or updated issue within a few minutes

### Load time — Sentry Performance (Traces)

- As a parent, open `/school/{slug}/parent/committees` (and open a committee if possible)
- Sentry → **Explore → Traces** (or Performance)
- Filter transactions containing `committees` or `parent-portal`
- Note: production uses `tracesSampleRate: 0.1` — only ~10% of requests appear

### Load time — Vercel Speed Insights

- Vercel project → **Speed Insights**
- Filter routes containing `parent/committees`
- Requires traffic after `<SpeedInsights />` is deployed

### Application Metrics (custom)

- After code emits `api.request.duration`, load parent committee workspace a few times
- Sentry → **Explore → Metrics** — search `api.request.duration`
- Complete Sentry onboarding **step 3 (Verify)** when the metric appears

### MudKitchen admin

- `/admin/observability` — needs `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (personal token with **Issue & Event: Read** for performance)
- **Sentry performance** tab reads traces from the **mudkitchenweb** project in Sentry (not “this laptop” unless you filter **development**). Default is all environments mixed; use the environment dropdown for local (`development`) vs deployed (`production`, `vercel-production`).
- If **performance** still shows a permission message, confirm `SENTRY_ORG` (slug `mudkitchen`) and token scopes; use **Open in Sentry Performance** on that tab as a fallback
- `/admin/performance` — Lighthouse audits (separate from Sentry)
