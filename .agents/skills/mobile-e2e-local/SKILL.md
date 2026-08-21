---
name: mobile-e2e-local
description: >
  Run Maestro native E2E tests for the Expo mobile app against local Supabase only.
  Use when the user asks to run mobile E2E, Maestro tests, mobile test:e2e,
  set up apps/mobile/.env.e2e.local, debug failing Maestro flows, or test the
  mobile app on iOS/Android simulators locally.
---

# Mobile E2E local testing (Maestro)

Run Maestro flows in [`apps/mobile/.maestro/`](../../apps/mobile/.maestro/) against **local Supabase only**. Never use production Supabase or [`apps/mobile/.env`](../../apps/mobile/.env) for E2E.

Web Playwright E2E is separate — see [`.agents/skills/e2e-local/SKILL.md`](../e2e-local/SKILL.md).

## Safety rules (follow first)

1. **Local Supabase only** — `EXPO_PUBLIC_SUPABASE_URL` must be:
   - iOS simulator: `http://127.0.0.1:54321`
   - Android emulator: `http://10.0.2.2:54321`
2. **Block prod host** — refuse `rxrmlfyoqzdpjxztluyd` (enforced by [`assert-mobile-e2e-env.sh`](../../apps/mobile/scripts/assert-mobile-e2e-env.sh))
3. **Never use `apps/mobile/.env` for Maestro** — that file is for day-to-day dev against remote Supabase; use **`apps/mobile/.env.e2e.local`** only
4. **Local API only** — `EXPO_PUBLIC_SITE_URL` must be `http://127.0.0.1:3100` (iOS) or `http://10.0.2.2:3100` (Android) — port **3100**, not 3000
5. **Shared seed** — `supabase db reset` then `npm run seed:e2e` (same users/data as web Playwright)
6. **No outbound email** — start Next.js with `DISABLE_OUTBOUND_EMAIL=1` when running E2E servers

The assert script **hard-fails** before Maestro if env points at prod or non-local hosts.

## Prerequisites

- Docker Desktop running
- Supabase CLI: `brew install supabase/tap/supabase`
- [Maestro CLI](https://maestro.mobile.dev/)
- `npm install` at repo root
- iOS: Xcode + Simulator; Android: Android SDK + emulator

## One-time setup

```bash
supabase start
supabase db reset
npm run seed:e2e
npm run mobile:e2e:env -- ios > apps/mobile/.env.e2e.local
# Android: npm run mobile:e2e:env -- android > apps/mobile/.env.e2e.local
```

## Run E2E locally

**Terminal 1 — database + API**

```bash
supabase start && supabase db reset && npm run seed:e2e
DISABLE_OUTBOUND_EMAIL=1 npm run dev:next -- -p 3100
```

**Terminal 2 — Expo (with E2E env loaded)**

```bash
cd apps/mobile
set -a && source .env.e2e.local && set +a
npm run ios    # or npm run android
```

**Terminal 3 — Maestro**

```bash
npm run mobile:test:e2e:ios       # iOS
npm run mobile:test:e2e:android   # Android
```

Or from `apps/mobile`: `maestro test .maestro`

## Maestro flows

| Flow | Covers |
|------|--------|
| `intro-to-login.yaml` | Intro → school login |
| `school-admin-logged-in.yaml` | School admin password login → dashboard |
| `dashboard.yaml` | Dashboard shell |
| `submissions-list.yaml` | Admissions list |
| `submission-detail.yaml` | Submission detail + back |
| `submission-status-filter.yaml` | Status filter chips |
| `tab-navigation.yaml` | Dashboard ↔ Admissions ↔ Students |
| `students-list.yaml` | Empty students list |
| `platform-admin-login.yaml` | Platform admin login |
| `platform-admin-enter-school.yaml` | Enter school as platform admin |

## Test users (local only)

| Email | Role |
|-------|------|
| `e2e-admin@schoolstack.test` | School org admin |
| `e2e-platform-admin@schoolstack.test` | Platform admin (`profiles.role = admin`) |
| `e2e-parent@schoolstack.test` | Parent (web E2E; not used in mobile Maestro yet) |

Password: `E2eTestPassword123!`

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Mobile E2E aborted: refusing blocked Supabase host` | Fix `.env.e2e.local` — use local URLs, not prod |
| `EXPO_PUBLIC_SITE_URL should use port 3100` | Point site URL at `:3100`, not `:3000` |
| No schools on login screen | Run `npm run seed:e2e` after `supabase db reset` |
| Platform admin login fails | Seed creates `e2e-platform-admin@schoolstack.test`; re-run seed |
| Metro not running | Start Expo with `.env.e2e.local` sourced |
| Android cannot reach host | Use `10.0.2.2`, not `127.0.0.1`, in `.env.e2e.local` |
| CI: `Connection reset` downloading `gradle-9.3.1-bin.zip` | Transient network on cache miss — re-run workflow; CI builds APK in a dedicated step with retries before the emulator starts |

## More detail

- Human docs: [`apps/mobile/README.md`](../../apps/mobile/README.md)
- CI: [`.github/workflows/mobile.yml`](../../.github/workflows/mobile.yml)
- Web E2E skill: [`.agents/skills/e2e-local/SKILL.md`](../e2e-local/SKILL.md)
