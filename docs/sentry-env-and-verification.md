# Sentry and performance env vars (mudkitchenweb)

Use project **mudkitchenweb** in Sentry. Set these on **Vercel** (Production + Preview) and in local `.env.local` (never commit secrets).

## Where to copy values in Sentry

| Variable | Sentry UI path |
|----------|----------------|
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | **Settings → Projects → mudkitchenweb → Client Keys (DSN)** — same URL for both vars |
| `SENTRY_ORG` | **Organization Settings → General** — organization slug (also in settings URL) |
| `SENTRY_PROJECT` | `mudkitchenweb` (Next.js web) |
| `SENTRY_MOBILE_PROJECT` | `mudkitchen-mobile` (Expo app — admin observability + EAS source maps) |
| `EXPO_PUBLIC_SENTRY_DSN` | **Mobile project** DSN — set on EAS `production` environment and local `apps/mobile/.env` for testing (not Vercel) |
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

### MudKitchen mobile app (React Native)

1. Create Sentry project **mudkitchen-mobile** (React Native) in org `mudkitchen`.
2. **First release with Sentry requires a new native EAS build** (OTA cannot add the native SDK). Set on EAS `production` environment:
   - `EXPO_PUBLIC_SENTRY_DSN` — mobile project DSN
   - `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT=mudkitchen-mobile` — for release/source map upload during `eas build`
3. Local dev: add `EXPO_PUBLIC_SENTRY_DSN` to `apps/mobile/.env`, run the app, navigate a few screens.
4. Sentry → **mudkitchen-mobile** → Explore → Traces — filter `development` (simulator) or `production` (store builds).

#### EAS env in this monorepo (required)

`@sentry/react-native` is hoisted to the repo root while `expo` stays under `apps/mobile`. **Do not run bare `eas env:set`** — it fails loading `expo/config-plugins`.

From `apps/mobile`:

```bash
npm run eas:env:set -- --environment production --name EXPO_PUBLIC_SENTRY_DSN --value "<DSN>" --visibility sensitive
npm run eas:env:list -- --environment production
npm run assert:production-eas-env
```

Equivalent: `bash scripts/with-mobile-node-path.sh eas env:set …` (same wrapper as `npm run build:production:ios`). Quick check: `npm run expo:config` should exit 0.

Alternative: set `EXPO_PUBLIC_SENTRY_DSN` in the [Expo dashboard](https://expo.dev) → project → Environment variables → `production`.

### MudKitchen admin

- `/admin/observability` — needs `SENTRY_ORG`, `SENTRY_AUTH_TOKEN`, `SENTRY_PROJECT` (web), and optionally `SENTRY_MOBILE_PROJECT` (mobile admin tab)
- **Sentry performance → Web** reads **mudkitchenweb** (Next.js routes and server APIs).
- **Sentry performance → Mobile app** reads **mudkitchen-mobile** (on-device navigation + client HTTP spans). Requires `SENTRY_MOBILE_PROJECT` on Vercel.
- If **performance** still shows a permission message, confirm `SENTRY_ORG` (slug `mudkitchen`) and token scopes; use **Open in Sentry Performance** on that tab as a fallback
- `/admin/performance` — Lighthouse audits (separate from Sentry)
