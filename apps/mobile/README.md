# MudKitchen mobile app

Expo SDK 57 app for school admin and platform admin workflows.

## Development

From the repo root:

```bash
npm run mobile          # Expo dev server
npm run mobile:ios      # iOS simulator
npm run mobile:android  # Android emulator
```

Copy Supabase keys from the web `.env.local` into [`apps/mobile/.env`](.env). See [`.env.example`](.env.example):

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_SITE_URL=http://192.168.x.x:3000   # your Mac LAN IP, not localhost
```

Find your LAN IP: `ipconfig getifaddr en0`. The mobile app calls your Next.js API at `EXPO_PUBLIC_SITE_URL`; use the same Supabase project as the web app.

You do **not** need `.env.e2e` or `.env.e2e.local` for normal development, lint, unit tests, or CI.

## Releasing (TestFlight / App Store)

Do **not** change `.env` before a production build. Use EAS build profiles in [`eas.json`](eas.json):

1. Install EAS CLI: `npm i -g eas-cli` and `eas login`
2. Set production Supabase secrets (once per project):
   ```bash
   cd apps/mobile
   eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
   eas secret:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "..."
   ```
3. Build for production (sets `EXPO_PUBLIC_SITE_URL` to `https://trymudkitchen.com`):
   ```bash
   cd apps/mobile
   npm run build:production:ios
   # or: npm run build:production:android
   ```

`npm run assert:production-env` fails if `EXPO_PUBLIC_SITE_URL` looks local (`localhost`, `192.168.x.x`, `:3000`, `:3100`). See [`.env.production.example`](.env.production.example) for documented production values.

## Quality checks

From the repo root:

```bash
npm run mobile:lint       # ESLint (errors only)
npm run mobile:typecheck  # TypeScript
npm run mobile:test       # Jest unit tests
```

From `apps/mobile`:

```bash
npm run lint
npm run lint:errors
npm run typecheck
npm run test
npm run test:watch
```

## Maestro E2E (native)

Requires [Maestro CLI](https://maestro.mobile.dev/), local Supabase, and the Next.js dev server.

**Safety:** Maestro must use **local Supabase only**. Never point E2E at [`apps/mobile/.env`](.env) (remote/prod). Use [`.env.e2e.local`](.env.e2e.local) with `127.0.0.1` / `10.0.2.2` URLs on port **3100**. Run scripts hard-fail if env looks like production — see [`.agents/skills/mobile-e2e-local/SKILL.md`](../../.agents/skills/mobile-e2e-local/SKILL.md).

**Optional env file (local Maestro only):** copy [`.env.e2e.example`](.env.e2e.example) to `.env.e2e.local` and fill keys, or generate from Supabase:

```bash
npm run mobile:e2e:env -- ios > apps/mobile/.env.e2e.local
# Android: npm run mobile:e2e:env -- android > apps/mobile/.env.e2e.local
```

### Shared setup

```bash
# Terminal 1 — database + API
supabase start && supabase db reset
npm run seed:e2e
DISABLE_OUTBOUND_EMAIL=1 npm run dev:next -- -p 3100
```

### iOS simulator

Use `127.0.0.1` URLs in `.env.e2e.local` (see the iOS block in `.env.e2e.example`).

```bash
# Terminal 2 — Expo
cd apps/mobile
set -a && source .env.e2e.local && set +a
npm run ios

# Terminal 3 — Maestro (after Metro is up)
npm run mobile:test:e2e:ios
# or: cd apps/mobile && maestro test .maestro
```

Build the simulator app manually when needed:

```bash
cd apps/mobile && npm run test:e2e:ios:build
```

### Android emulator

Use `10.0.2.2` URLs in `.env.e2e.local` (see the Android block in `.env.e2e.example`).

```bash
cd apps/mobile
set -a && source .env.e2e.local && set +a
npm run android

npm run mobile:test:e2e:android
# or: cd apps/mobile && maestro test .maestro
```

### Maestro flows

| Flow | Covers |
|------|--------|
| `intro-to-login.yaml` | Intro → school login |
| `school-admin-logged-in.yaml` | School admin login → dashboard |
| `dashboard.yaml` | Dashboard shell |
| `submissions-list.yaml` | Admissions submissions list |
| `submission-detail.yaml` | Submission detail + back navigation |
| `submission-status-filter.yaml` | Status filter chips |
| `tab-navigation.yaml` | Dashboard ↔ Admissions ↔ Students |
| `students-list.yaml` | Empty students list |
| `platform-admin-login.yaml` | Platform admin login |
| `platform-admin-enter-school.yaml` | Enter school as platform admin |

Credentials reuse the shared E2E seed: `e2e-admin@schoolstack.test` (school admin), `e2e-platform-admin@schoolstack.test` (platform admin), password `E2eTestPassword123!`.

## CI

GitHub Actions workflow [`.github/workflows/mobile.yml`](../../.github/workflows/mobile.yml):

- **Every PR** (when `apps/mobile/**` changes): lint, typecheck, Jest
- **PRs to `main`**: Android + iOS Maestro E2E with local Supabase + Next.js

See [`.github/workflows/README.md`](../../.github/workflows/README.md) for the full CI map.
