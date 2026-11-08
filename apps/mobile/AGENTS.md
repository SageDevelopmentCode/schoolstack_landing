# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Local Maestro E2E (local Supabase only): [`.agents/skills/mobile-e2e-local/SKILL.md`](../../.agents/skills/mobile-e2e-local/SKILL.md).

After mobile UI changes: visual screenshot capture + agent review — [`.agents/skills/mobile-ui-visual-verify/SKILL.md`](../../.agents/skills/mobile-ui-visual-verify/SKILL.md).

## Expo Observe (production performance)

The app uses **`expo-observe`** for [Expo Observe](https://docs.expo.dev/eas/observe/introduction/) (startup and per-route metrics). It does **not** run in **Expo Go**; use a **development build** or **production EAS build** to send metrics.

- **Dashboard:** project on [expo.dev](https://expo.dev) → **Observe** tab.
- **Verify after changing instrumentation:** run a new EAS build (`npm run build:production:ios` / `build:production:android` from `apps/mobile` or your usual profile), install the build, open the app, then confirm data appears in Observe (allow a short delay).
- **AI agents — Expo Skills:** install the bundle that includes the **eas-observe** skill: `npx skills add expo/skills` (see [Observe: AI agents](https://docs.expo.dev/eas/observe/ai-agents/)). Optionally add the **Expo MCP** server (`https://mcp.expo.dev/mcp`) in Cursor for read-only metric queries; it uses your Expo account OAuth.

Unhandled JS errors for Observe (preview on SDK 57) are separate from **Sentry**; production source maps for Observe stacks use **`uploadSourceMaps`** on the EAS production profile in `eas.json`.

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
- **WebViews** must set `onError` (and ideally `onHttpError` / `onRenderProcessGone` / `onContentProcessDidTerminate`) and report through `reportError`. Callback-style failures never hit a `catch`, so they are invisible unless reported explicitly. PDFs go through `ParentEmbeddedPdfWebView` (reports `parent_pdf_viewer_*` operations with stage/elapsed/viewer diagnostics; each failure once per document load).
- **Opening links** (`openBrowserAsync`, `Linking.openURL`) must go through `openExternalUrlSafely` from `@/lib/open-external-url` (never throws; reports + friendly alert). Pass `null` as the reporter only before sign-in.
- **Large documents**: never download a whole PDF to cache or render every page up front. Curriculum books are 20-70 MB; use a signed URL (`/api/parent-portal/curriculum/pdf-url`) so pdf.js range-requests pages, and keep rendering lazy.
- Global safety net: `MobileGlobalErrorReportingBridge` chains `ErrorUtils.setGlobalHandler` (uncaught JS errors) and Sentry's rejection tracker (`beforeSend`) into the same reporter; media load failures use `reportMobileMediaLoadFailure` (throttled).
- `check-mobile-operational-errors.sh` also fails the build for any `<WebView` without `onError` + reporting and for bare `openBrowserAsync(` / `Linking.openURL(` under `components/`.
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

After keyboard sheet/scroll changes (phase 2+), spot-check on a physical iPhone:

- School admin Friday Branch class edit — lower fields and save row while typing
- School admin committee workspace — settings/about inline text fields
- Parent committee task sheet — description field
- Parent child pickup contact — multiline Notes
- Parent enrollment checklist item — text/signature fields in bottom sheet

Repo check: `npm run check:mobile-keyboard-patterns` from the monorepo root (also runs in CI).

### Shared sheet primitives

`BottomSheetShell` (and `StoryBottomSheet` / `ParentBottomSheet` built on it) is used by dozens of sheets, and `scrollable={false}` + `keyboardAvoiding` take a different layout path from the default. Before merging a change to the shell, `use-bottom-sheet-motion.ts`, or `use-bottom-sheet-keyboard-scroll-style.ts`:

- `rg -l 'BottomSheetShell|StoryBottomSheet|ParentBottomSheet' src` and check each prop combination you affect.
- Run `npm run mobile:visual:capture -- school-admin-messages` (and `parent-messages`, `teacher-messages`); these open New message and type into its search.
- Open at least one sheet per affected combination on a physical iPhone and type into every field.

`.maestro/*-messages-new-conversation.yaml` log in as each portal and fail if the New message search cannot be focused and typed into. They run on Android and iOS after merge to `main` (not on PRs, to keep PR CI short); run them locally with `maestro test` when changing messages.

### Sheet gallery visual diff

`src/app/dev/sheet-gallery.tsx` (dev and E2E builds only) renders every `BottomSheetShell` prop combination with fixture data. `schoolstack://dev/sheet-gallery?case=<id>` opens one case directly; with no `case` it shows a list for manual testing.

- `.maestro/sheet-gallery.yaml` screenshots each case, with the keyboard open for cases that have text fields.
- `scripts/compare-sheet-gallery.mjs` diffs them against `visual-baselines/sheet-gallery/<platform>/`. It ignores the status bar and fails when more than 1% of pixels change. Red-highlighted diffs are written to `.artifacts/sheet-gallery/<platform>/diff/`.
- On PRs, Android runs the gallery only when shared sheet code changes (the `sheets` path filter in `.github/workflows/mobile.yml`: `components/story/**`, `**/messages/**`, `use-bottom-sheet*`, `constants/**`, the gallery itself, and similar). After merge to `main` it always runs on Android and iOS. Each run uploads the `sheet-gallery-<platform>` artifact (current screenshots, diffs, summary).
- Local: `npm run mobile:visual:gallery -- ios` with the app running on a simulator (no backend needed). Local devices differ from CI, so a size mismatch is a warning locally.

**Intentional UI change or first run (no baselines yet):** download the `sheet-gallery-android` artifact from the PR's Mobile run, review the PNGs, then commit them with:

```bash
node apps/mobile/scripts/compare-sheet-gallery.mjs --platform android --update --from ~/Downloads/sheet-gallery-android
```

**New sheet variant:** add a case to `SHEET_GALLERY_CASES` in `src/components/dev/sheet-gallery-screen.tsx`, add matching steps to `.maestro/sheet-gallery.yaml`, and commit its baseline the same way.
