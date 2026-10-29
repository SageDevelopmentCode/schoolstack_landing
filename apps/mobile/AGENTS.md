# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Local Maestro E2E (local Supabase only): [`.agents/skills/mobile-e2e-local/SKILL.md`](../../.agents/skills/mobile-e2e-local/SKILL.md).

After mobile UI changes: visual screenshot capture + agent review — [`.agents/skills/mobile-ui-visual-verify/SKILL.md`](../../.agents/skills/mobile-ui-visual-verify/SKILL.md).

## Environment (production accounts)

Copy from the web app `.env.local` into the shell that starts Metro (or an `apps/mobile/.env` file if you use one):

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — must be the **same Supabase project** as the web app when testing real users (e.g. teacher memberships on production).
- `EXPO_PUBLIC_SITE_URL` — typically `https://trymudkitchen.com` so mobile API routes match production.

Local Supabase (`127.0.0.1` / `10.0.2.2`) only has seed/E2E users; production teachers will get “no access” if Expo still points at local. See `src/lib/env/mobile-public-env.ts` for helpers.

## Operational errors (Discord)

Unexpected failures in mobile UI should reach Discord via `POST /api/mobile/operational-errors`:

- In components, use **`useMobileErrorReporter(organizationId)`** — do not call `createSchoolAdminErrorReporter` / `createParentPortalErrorReporter` / `createTeacherPortalErrorReporter` directly (eslint enforced under `src/components/`).
- In `catch` blocks for user-facing async work, call `reportError('operation_name', err, { entityType, entityId, metadata })`. Expected 4xx / benign codes are filtered client-side and are not notified.
- Critical initial loads (workspace/detail screens) should use a timeout (see `committee-workspace-load.ts`) so hung requests emit `*_timeout` operations instead of spinning forever without a report.
- `check-mobile-operational-errors.sh` enforces catch reporting under `components/school-admin/committees`, `components/school-admin/friday-branch`, and the full `components/parent` and `components/teacher` trees. Routes under `app/parent` and `app/teacher` are thin shells and are not scanned separately.

Repo check: `npm run check:mobile-operational-errors` from the monorepo root.

## Keyboard and TextInput

Nested `KeyboardAvoidingView` inside portal `SafeAreaView` often **passes the simulator** and **covers bottom fields on a physical iPhone**. Route keyboard UI through approved layouts — do not add raw KAV on full screens without offset/lift.

| Scenario | Use |
|----------|-----|
| Chat thread (header + list + bottom compose) | `MessageThreadKeyboardLayout` (`src/components/messages/message-thread-keyboard-layout.tsx`) |
| Parent scroll form (floating tab bar) | `ParentKeyboardAwareScrollView` |
| Parent modal sheet with fields | `ParentBottomSheet` (keyboard avoiding + scroll inset) |
| Admin/story modal sheet with fields | `BottomSheetShell` with `keyboardAvoiding` or `StoryBottomSheet` (keyboard-enabled) |
| Pre-auth login / choose school | `SafeAreaView` + KAV with `keyboardVerticalOffset={insets.top}` |
| Explicit lift math | `useKeyboardHeight` (`src/hooks/use-keyboard-height.ts`) |

**Device test:** When adding or changing `TextInput` near the **bottom** of the screen or in a sheet, verify on a **physical iPhone** (type 2–3 lines). Simulator alone is not sufficient.

Repo check: `npm run check:mobile-keyboard-patterns` from the monorepo root.
