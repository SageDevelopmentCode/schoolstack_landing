---
name: mobile-eas-deploy
description: >
  Build and submit the Expo mobile app with EAS for TestFlight, App Store, and
  Play Store. Use when the user asks about EAS build, eas submit, production
  mobile release, TestFlight, App Store, Play Store, mobile deploy, or
  EXPO_PUBLIC_SITE_URL for production builds.
---

Human reference: [`apps/mobile/DEPLOY.md`](../../apps/mobile/DEPLOY.md).

# Mobile EAS production deploy

Release the MudKitchen mobile app ([`apps/mobile/`](../../apps/mobile/)) via **Expo Application Services (EAS)**. The app calls **production Next.js** at `EXPO_PUBLIC_SITE_URL` for school-admin APIs and **Supabase** for auth. Public env vars are baked in at build time.

Local Maestro testing is separate — see [`.agents/skills/mobile-e2e-local/SKILL.md`](../mobile-e2e-local/SKILL.md).

## Safety rules (follow first)

1. **Do not edit `apps/mobile/.env` for a release** — that file is for day-to-day dev (LAN IP + remote Supabase). Production `EXPO_PUBLIC_*` values live on the **EAS `production` environment** (same source for store builds and OTA).
2. **Never use `.env.e2e.local` for production builds** — E2E only (local Supabase + port 3100).
3. **Do not put Supabase keys in `eas.json`** — use `eas env:create` on the **`production`** environment with **`plaintext` or `sensitive`** visibility (not `secret`; secrets are not inlined into OTA JS bundles).
4. **Deploy web before mobile** when the release depends on new API routes or server logic — production mobile hits `https://trymudkitchen.com`.
5. **Run assert before cloud build** — `assert-production-mobile-env.sh` blocks localhost, `192.168.x.x`, dev ports (`:3000`, `:3100`), and URLs whose `/api/health` redirects (redirects strip the auth header). Production npm scripts set `EXPO_PUBLIC_SITE_URL` for this check automatically.

## Env matrix

| Context | `EXPO_PUBLIC_SITE_URL` | Supabase | Source |
|---------|------------------------|----------|--------|
| Day-to-day dev | Mac LAN IP `:3000` | Same project as web | [`apps/mobile/.env`](../../apps/mobile/.env) |
| Maestro E2E | `127.0.0.1` / `10.0.2.2` `:3100` | Local Supabase | `.env.e2e.local` |
| EAS production (build + OTA) | `https://trymudkitchen.com` | Production Supabase | EAS **`production`** environment; [`eas.json`](../../apps/mobile/eas.json) `production.environment` |

Documented production values (reference only — not loaded from a file during EAS build): [`apps/mobile/.env.production.example`](../../apps/mobile/.env.production.example).

## Prerequisites

- [EAS CLI](https://docs.expo.dev/build/setup/): `npm i -g eas-cli`
- Expo account: `eas login`
- Apple Developer + App Store Connect (iOS / TestFlight)
- Google Play Console (Android)
- Production Supabase URL and publishable key (same as web production)
- Vercel production live at `https://trymudkitchen.com`

## One-time setup

### 1. Link Expo project

```bash
cd apps/mobile
eas login
eas build --profile production --platform ios   # first run prompts to create/link project
```

Accept linking; Expo may add `extra.eas.projectId` to app config.

### 2. EAS production environment (`EXPO_PUBLIC_*`)

Set once per Expo project on the **`production`** environment (values from production Supabase / Vercel `NEXT_PUBLIC_*`). Use **`plaintext` or `sensitive`** visibility.

```bash
cd apps/mobile
eas env:create production --name EXPO_PUBLIC_SITE_URL --value "https://trymudkitchen.com" --visibility plaintext
eas env:create production --name EXPO_PUBLIC_SUPABASE_URL --value "https://<project-ref>.supabase.co" --visibility plaintext
eas env:create production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<publishable-key>" --visibility sensitive
```

Verify: `eas env:list production` or `npm run assert:production-eas-env` from `apps/mobile`. [`eas.json`](../../apps/mobile/eas.json) `build.production.environment` is `production`.

### 3. Store credentials

- **iOS:** `eas credentials` — EAS can manage distribution cert + provisioning, or upload your own. App Store Connect app for bundle ID `com.mudkitchen.schoolstack.mobile` ([`app.json`](../../apps/mobile/app.json)).
- **Android:** EAS default signing is typical for first releases; configure in `eas credentials` if needed. Package `com.mudkitchen.schoolstack.mobile`.

## Release checklist

Before each store release:

1. Merge to `main` and confirm **Vercel production** is deployed with any API changes the app needs.
2. Quality gates (repo root):
   ```bash
   npm run mobile:lint
   npm run mobile:typecheck
   npm run mobile:test
   ```
3. Bump version when shipping user-visible release:
   - [`apps/mobile/app.json`](../../apps/mobile/app.json) — `expo.version` (user-facing, e.g. `1.0.0`)
   - iOS build number / Android `versionCode` — **auto-incremented** on production builds via [`eas.json`](../../apps/mobile/eas.json) (`cli.appVersionSource: remote`, `production.autoIncrement: true`). Do not bump these manually unless syncing an existing store app (`eas build:version:set`).
4. Production build (see below).
5. Submit to TestFlight / Play (see below).

## Production build

[`eas.json`](../../apps/mobile/eas.json) profiles:

| Profile | Channel | Use |
|---------|---------|-----|
| `development` | `development` | Dev client, internal distribution |
| `production` | `production` | Store / TestFlight builds; `environment: production` + EAS `production` env vars |

From `apps/mobile`:

```bash
npm run build:production:ios
# or
npm run build:production:android
```

Scripts run [`assert-production-mobile-env.sh`](../../apps/mobile/scripts/assert-production-mobile-env.sh) with production `EXPO_PUBLIC_SITE_URL`, then `eas build --profile production`.

Monitor: [expo.dev](https://expo.dev) → project → Builds.

## EAS Update (OTA)

[`app.json`](../../apps/mobile/app.json) configures `expo-updates` (`runtimeVersion` policy `appVersion`, updates URL for project `ad714022-2c84-4a66-b28e-49866d1f9878`). Production builds on channel `production` receive OTA bundles.

**Cutover:** one new `build:production:*` + submit after OTA is first merged — older store binaries without `expo-updates` ignore `eas update`.

JS-only fixes (no native / `expo.version` change). `update:production` runs `assert-production-eas-env.sh` then `eas update --environment production` so `EXPO_PUBLIC_*` match store builds:

```bash
cd apps/mobile
npm run update:production -- --message "fix: description"   # iOS only; skips web export
```

Deploy Vercel first when the fix needs new API behavior. Full runbook: [`DEPLOY.md`](../../apps/mobile/DEPLOY.md) § EAS Update.

## Submit to stores

After a successful production build:

```bash
cd apps/mobile
eas submit --platform ios      # TestFlight / App Store Connect
eas submit --platform android  # Google Play
```

First submit may prompt for Apple App Store Connect API key or Google service account. Optional later: add `submit.production` in `eas.json` to pin ASC app ID / Play track.

**CI note:** [`.github/workflows/mobile.yml`](../../.github/workflows/mobile.yml) runs lint, typecheck, Jest, and Maestro E2E — **no EAS builds**. Releases are manual via EAS CLI today (future: GitHub Actions + `EXPO_TOKEN`).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `EXPO_PUBLIC_SITE_URL is not set` (assert) | Use `npm run build:production:*` (sets URL in script) — do not rely on `.env` alone |
| Assert blocks localhost / `:3000` | Expected if `.env` leaked into shell; unset or use npm scripts |
| Build succeeds but app can't reach API | Confirm Vercel prod deployed; verify `EXPO_PUBLIC_SITE_URL` in build logs |
| Auth fails in production build | Re-check EAS `production` env vars match **production** Supabase, not local |
| Missing Supabase env in build or OTA | Run `eas env:list production` or `npm run assert:production-eas-env` |
| `eas build` asks to configure project | Run from `apps/mobile`; complete `eas build:configure` / link flow |
| API 404 on new feature | Web not deployed yet — ship Next.js production first |

## References

- Human runbook: [`apps/mobile/DEPLOY.md`](../../apps/mobile/DEPLOY.md)
- Dev setup: [`apps/mobile/README.md`](../../apps/mobile/README.md)
- EAS config: [`apps/mobile/eas.json`](../../apps/mobile/eas.json)
- Local E2E: [`.agents/skills/mobile-e2e-local/SKILL.md`](../mobile-e2e-local/SKILL.md)
- CI: [`.github/workflows/mobile.yml`](../../.github/workflows/mobile.yml)

## Out of scope (future)

- GitHub Actions `eas build` / `eas update` on merge to `main` (`EXPO_TOKEN`, Apple API key in repo secrets)
- Staging EAS profile (e.g. Vercel preview URL + `preview` channel)
