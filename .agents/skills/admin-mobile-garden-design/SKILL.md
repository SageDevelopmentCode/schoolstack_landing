---
name: admin-mobile-garden-design
description: >-
  "Garden" design system for the school-branded SCHOOL ADMIN portal in the Expo
  app (apps/mobile). Use whenever building, redesigning or restyling any admin
  screen under apps/mobile/src/app/school-admin/** or
  apps/mobile/src/components/school-admin/** (Dashboard, Admissions, Students,
  Messages and most More screens are done; Bulletin and Friday Branch are
  next), the shared attendance
  roster (components/attendance), or when asked to "match the admin mobile
  Dashboard", "use the admin mobile Garden kit", or migrate an admin mobile
  screen off School Day Story. Covers what differs from the parent mobile kit:
  admin density, the work queue, linked KPIs, web-only links, the save/retry
  feedback contract, the controller → feedback → view split, recipes and a
  migration checklist. Mobile counterpart of admin-portal-garden-design (web).
---

# School admin on mobile: Garden

The admin **Dashboard** is the reference build:
- `apps/mobile/src/components/school-admin/dashboard/garden/admin-garden-dashboard-screen.tsx`
- its sections in `…/dashboard/garden/sections/`

**The look in one line:** the parent mobile Garden kit in the school's accent, tuned for *running* a school from a phone. It's denser, every screen says what to do next, every number opens the thing behind it, and every action gets visible feedback.

**Read `.agents/skills/parent-mobile-garden-design/SKILL.md` first.** Tokens, type, the kit, phone-first rules (one toy button, 44pt targets, `GPressable`, reduced motion, sheets outside the ScrollView, no eyebrows) all apply unchanged. This file only lists what is different for admin.

Related skills:
- `.agents/skills/admin-portal-garden-design`: the web admin Garden. Use the same copy, the same recipes and the same behaviour where both exist.
- `apps/mobile/AGENTS.md`: keyboard layouts, operational error reporting, WebViews and links. All of it still applies.
- `.agents/skills/mobile-e2e-local`, `.agents/skills/mobile-ui-visual-verify`: verification.

Detailed snippets are in **`recipes.md`**.

---

## 1. Where things live

All paths are under `apps/mobile/src/`.

| Path | What |
|---|---|
| `components/parent/garden/*` | **The shared kit** (`GCard`, `GChip`, `GSegmented`, `GSheet`, `GStepList`, `GProgress`, `GErrorCard`, `GCelebrate`, toasts, `feedback.ts`, tokens). Import it as is from admin screens; it has a `parent` path for history only. |
| `components/school-admin/garden/admin-ui.tsx` | Admin-only pieces: `AdminWorkRow`, `AdminLeadStrip`, `AdminIconChip`, `AdminKpiTiles`, `AdminStatStrip`, `AdminLiveDot` |
| `components/school-admin/garden/use-admin-action.ts` | `useAdminAction(orgId).run(fn, { key, success, error, failed, operation, retry, silent })` → pending key, success / error toast pair with an error-specific id + Retry, mint `flashKey`, haptics, `reportError` |
| `components/school-admin/garden/admin-feedback.ts` | `notifyWebOnly(toast, { webPath, reportError })`, `ctaText`, `metricRoute` / `metricWebPath`, `setupStepWebPath`, `webAdminPath` |
| `components/school-admin/dashboard/garden/*` | Reference screen: `use-admin-dashboard-controller.ts` (data + routes, no UI), `use-admin-dashboard-feedback.ts` (wraps callbacks with feedback), `admin-garden-dashboard-screen.tsx` (skeleton / error / view), `sections/*` |
| `components/attendance/*` | Garden roster board shared by admin Dashboard › Attendance, admin More › Attendance and teacher Home › Attendance: `attendance-garden-ui.tsx`, `use-attendance-save.ts`, detail and pickup sheets |
| `components/school-admin/garden/admin-tab-header.tsx` | `AdminTabHeader` (title + accent word, data status line, "Updated N min ago", toolbar) and `useAdminTopBleed` for tab screens |
| `components/school-admin/garden/admin-ui.tsx` (more) | `AdminToolbarButton`, `AdminSearchField`, `AdminFilterChips`, `AdminEmptyPanel`, `AdminEndLine`, `AdminInfoRow`, `AdminRowSkeleton` |
| `components/school-admin/garden/admin-sheet.tsx` | `AdminFormSheet` (Garden form sheet on the approved keyboard path: header + "Not saved yet" chip, notice banner, footer status line + Cancel + one toy Save, hidden while typing), `AdminSheetHeader`, `READ_ONLY_NOTICE`, `errorText` |
| `components/school-admin/garden/admin-picker-sheet.tsx` | `AdminPickerSheet`: searchable single / multi select with group headers, skeleton + load error with Try again, live footer status, Save that resolves `true` (stays open with `notice` on failure) |
| `components/school-admin/garden/admin-people.tsx` | `AdminInitialsAvatar` (pastel initials), `AdminCopyLinkRow` (copy-link recipe row) |
| `components/school-admin/{staff,classrooms,staff-hours,more,gallery,schedule,committees}/garden/*` | More screens on Garden. Staff and Classrooms push the Garden student detail (`/students/[id]`). Committees reuse the parent Garden workspace sections in admin mode (`isAdmin`, `portalApiNamespace="school-admin"`) plus admin-only Home / Role & Duties / Members / Settings / Activity |
| `components/school-admin/garden/guardians-card.tsx` | Garden guardians list (application + student detail) |
| `components/school-admin/admissions/garden/*` | Admissions list + application detail: controller / feedback / screen per view, Garden step/checklist/payment sheets |
| `components/school-admin/students/garden/*` | Students roster + student detail, `AdminClassroomAssignSheet`, `AdminHealthFormSheet`, `StudentHealthPanel` |
| `components/school-admin/messages/garden/*` | Inbox, compose menu, `AdminNewConversationSheet` (All / Parents / Staff), `AdminBroadcastSheet` (stepper, in-sheet banners), thread; reuses the parent Garden bubble / composer / header / mutation sheets |
| `app/school-admin/[slug]/_layout.tsx` | Mounts `GestureHandlerRootView` + `GardenToastProvider` (bottom offset above the tab bar). The teacher layout does the same for the shared roster. |

## 2. Admin feel rules (on top of the parent rules)

1. **Header.** Date on the left of the toolbar row (no eyebrow), 42pt toolbar (bulletin, bell with `GBadge`, avatar), greeting with the admin's first name in `accent.clay`, then a **status line built only from data** ("3 items need you today · 9 of 14 not marked yet") with "· Updated N min ago" appended. Keep the header compact (greeting 27pt) when it is pinned above sub-tabs.
2. **Rows, not note tiles, for work.** Lists of things to do use `AdminWorkRow`: the whole row is the button, title 15 / meta 13, CTA label in `clayDeep` + chevron. Pastels only on icon chips and status chips.
3. **One lead strip per view.** The first item of a work queue is `AdminLeadStrip` ("Do this first", solid accent, white toy pill). It counts as the view's one toy button; everything else is outline / link / row.
4. **Every number leads somewhere.** KPI tiles (`AdminKpiTiles`) push the native route for the metric (`metricRoute`), or call `notifyWebOnly` with the web path. Label: "Active applications: 22. Open". Use `fontVariant: ['tabular-nums']` on every count, time and money figure.
5. **Nothing is a silent no-op.** A tap whose href has no native route (`resolveSchoolAdminNativeRoute` → `null`) calls `notifyWebOnly`: "This opens on the web portal" + an "Open on web" action through `openExternalUrlSafely`. Web-only setup steps get a specific title ("Finish "Payments" on the web portal").
6. **One dark card per screen:** the School signal on the Dashboard. Its label goes in a small white-on-dark pill in the card's `action` slot (a neutral `GChip` is dark-on-dark there).
7. **Handwriting at most once:** the caught-up state ("enjoy the quiet ✿"), with `GCelebrate` only for that real all-done moment (skipped in preview).
8. **Copy:** factual strings from data or existing web/mobile copy. Strip trailing "→" from server CTA labels with `ctaText`.

## 3. Feedback contract (non-negotiable)

| Moment | What the admin sees |
|---|---|
| Action in flight | Row / button spinner (`pendingKey` or the feature's own saving id), `accessibilityState.busy`. Other rows stay usable. |
| Action succeeded | `toast.success(title, { description, id: key })`. Title says what happened ("Ava marked present."), description what it means / what's next ("Tap Pickup when they head home."). Row flashes mint (`flashKey`, ~1.6s). Counts and progress update in place. |
| Action failed | `toast.error` with **error-specific id** (`${key}-error`) + Retry, description says what did *not* change. `haptic.error`. Success dismisses the error id. Thrown errors go to `reportError(operation)`; pass no `operation` when the data layer already reports (attendance context) so Discord doesn't get duplicates. |
| Inside a sheet | Toasts sit behind native modals. Pass `silent: true`, show a `GChip` in `headerAside` ("Marked present") or a `GInlineBanner` (error), and after a successful close use `closeThen(onClose, () => announce(...))`. |
| Screen failed to load | `GErrorCard` (or a custom card with a toy primary) with Try again. **Never toast load failures.** |
| Pull to refresh | `useGardenPullRefresh({ refresh, error, label, id })` → "Dashboard is up to date" / "Couldn't refresh dashboard" + Try again. Focus reloads and background polls stay silent. |
| Copy to clipboard | Row switches to "Link copied" with a check, success toast. On failure the error toast shows the URL so it can be copied by hand. |
| Filtered to nothing | Existing empty copy + a "Show everyone" link that clears filter and search. |
| Loading | A skeleton shaped like the screen, never a bare spinner. |

## 4. Screen anatomy

```
<Route>                                  thin: providers + <XScreen orgId slug>
  controller = useXController()          data, fetches, polling, routes, sheet state (no UI, no toasts)
  status loading → XSkeleton | error → XError | ready ↓
  feedback = useXFeedback(controller)    wraps callbacks (toasts, haptics, web-only, pending); never changes behaviour
  <View cream, top bleed>
    header + GSegmented (pinned)          sub-tabs keep their own content scroll
    <Animated.View key={tab} FadeIn>
      <ScrollView RefreshControl={feedback.pullRefreshing}>  cards
    <GCelebrate/>
    sheets (siblings at the root)
```

- Move logic into the controller **verbatim** first; diff it against the old screen.
- Hold callbacks passed into effects stable (`useCallback`), e.g. `onMarkedRead`: an inline arrow re-runs the sheet's fetch effect on every parent render.
- Use the previous-value pattern (`if (prev !== next) setState(...)` during render) instead of reset effects; wrap state set at the start of an async effect in `queueMicrotask`.
- Sheets read the **live** record (`students.find(id)`), not a snapshot, so status chips update after a save.

## 5. Migrating an admin mobile screen (checklist)

One screen per PR. Done: Dashboard, Admissions, Students, Messages, and the More screens Staff, Classrooms, Staff hours, Transactions, Photos, Attendance (admin header via `headerVariant="admin"`), Schedule, Committees (use them as templates too). Next: Bulletin, Friday Branch. The More stack paints cream only for Garden routes (`more/_layout.tsx` `GARDEN` options + `GARDEN_SURFACE_PATH`); add a route to both when it migrates.

Patterns from the Admissions / Students / Messages migration:
- **KPI tiles filter the list.** A tile with no permanent chip (e.g. "Ready to review", "New enrollments") adds a temporary chip while active so the filter is visible and clearable.
- **Saves inside a sheet** run `useAdminAction` with `silent: true`, show failures as an in-sheet `GInlineBanner`, then `closeThen(close, toast)` + mint row flash on success.
- **A failed status change toasts with Retry and keeps the page** (controllers report and rethrow; feedback passes no `operation`). Closing decisions (Decline / Withdraw) confirm first.
- **A failed message send restores the draft** to the composer; the toast's Retry resends it.
- **Stack screens can't bleed under the status bar**: the admin layout paints cream behind `/(dashboard|admissions|students|messages)` instead.

1. Split into controller → screen → sections → feedback. Use the Dashboard files as templates.
2. Map the primitives:

   | Story / admin | Garden |
   |---|---|
   | `AdminCard`, `StoryCard` | `GCard` |
   | Kicker + heading | `GCard` `title` (no eyebrow) |
   | Focus / work list | `AdminLeadStrip` + `AdminWorkRow` |
   | `AdminMetricCard` | `AdminKpiTiles` (linked) |
   | `SetupProgressBar` | `GProgress` + `GStepList` |
   | `SubmissionStoryTabBar` | `GSegmented` |
   | `PrimaryButton` | `GToyButton` (one per view) / `GOutlineButton` |
   | `BottomSheetShell` read-only | `GSheet` (`list` + `flex: 1` for lists) |
   | `Alert.alert` for failures | toast via `useAdminAction` |
   | `Pressable` + opacity | `GPressable` |

3. Replace `useAdminTheme()` colours with `Garden.*` / `useGardenAccent()`; fonts with `GardenFonts`.
4. **Keep behaviour identical:** every `testID` and accessibility label, every `reportError` operation, Maestro text taps (the tab bar's "Dashboard" label is what flows wait on), preview gating.
5. Apply the feedback contract (§3) to every action and load.
6. Text fields: keep the approved keyboard layouts (`ParentBottomSheet`, `BottomSheetShell keyboardAvoiding`); device-test bottom fields on a physical iPhone.
7. Delete the Story pieces the screen no longer uses (grep `src` and `.maestro` first).
8. Verify (§6).

## 6. Verification

From `apps/mobile`:

```bash
node_modules/.bin/tsc --noEmit -p .
npx eslint <changed paths>
npx jest src/components/school-admin src/components/attendance
```

From the repo root: `npm run check:mobile-operational-errors` and `npm run check:mobile-keyboard-patterns`.

The admin portal needs a sign-in. Run against **local Supabase** (`.agents/skills/mobile-e2e-local`) and sign in as the seeded E2E admin from `.maestro/school-admin-logged-in.yaml` (test fixture values only; never a real admin's credentials). Then in the iOS Simulator (`mcp__Claude_Code_iOS_Simulator__control`): open the screen, every row / tile / step, each sheet, pull to refresh, a forced failure (airplane mode) for Retry, reduced motion. Finish with `npm run mobile:visual:capture -- school-admin-dashboard` (or the screen's slug). Ask the user to check the real production admin on a device.

## 7. Anti-patterns

- Parent-style note-tile grids for admin work lists.
- Numbers or links that do nothing when tapped (use `notifyWebOnly`).
- Toasting load failures, or a spinner instead of a skeleton.
- An error toast and a success toast sharing one id.
- Reporting the same failure twice (data layer + `useAdminAction` `operation`).
- Toasts while a sheet is open (they render behind it).
- `Alert.alert` for routine failures.
- Garden markup with its own copy of fetching or saving logic.
- More than one toy button or dark card in a view; eyebrows above titles.
