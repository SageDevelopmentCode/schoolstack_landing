# E2E tests (Playwright)

End-to-end tests run against **local Supabase only** — never production. Stripe is not used.

For agent workflows, see [`.agents/skills/e2e-local/SKILL.md`](../.agents/skills/e2e-local/SKILL.md).

`globalSetup` seeds the database; the `setup` project signs in test users and writes `e2e/.auth/` before authenticated tests run.

**Important:** Stop any dev server on port 3000 before running E2E, or ensure it uses local Supabase — Playwright passes E2E env vars to `dev:next` via `webServer.env`.

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
npm run test:e2e         # 7 tests (setup + smoke + admin + parent)
npm run test:e2e:ui      # interactive mode
```

## Test suites

| Project | Tests | Auth |
|---------|-------|------|
| `setup` | Seed + authenticate test users | — |
| `smoke` | Platform admin redirect, school admin redirect, parent auth gate | None |
| `school-admin` | Admissions submissions page | `e2e-admin@schoolstack.test` |
| `non-admin` | Access denied for user without membership | `e2e-nonadmin@schoolstack.test` |
| `parent` | Apply dashboard | `e2e-parent@schoolstack.test` |

Seeded password (local only): `E2eTestPassword123!` — override via `.env.e2e.local`.

## Safety

- Loads `.env.e2e.local` when present; CI uses workflow env vars
- `e2e/global-setup.ts` blocks production Supabase host `rxrmlfyoqzdpjxztluyd`
- Stripe env vars cleared in Playwright web server

## CI

GitHub Actions runs the same suite on PRs to `main` (see [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)).

Roll out branch protection gradually: run informational checks first, then require `e2e` after several green runs.

## Troubleshooting

**`supabase db reset` fails:** See [`supabase/migrations/README.md`](../supabase/migrations/README.md).

**Auth tests fail:** Delete `e2e/.auth/` and re-run — `globalSetup` recreates sessions.

**Playwright browser missing:** `npm run test:e2e:install`
