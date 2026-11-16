---
name: teacher-mobile-garden-design
description: >-
  "Garden" design system for the school-branded TEACHER / staff portal in the
  Expo app (apps/mobile). Use whenever building, redesigning or restyling any
  teacher screen under apps/mobile/src/app/teacher/** or
  apps/mobile/src/components/teacher/** (Home, My Students, Calendar and
  Messages are done; Bulletin, My Hours and the More screens are next), or when asked to
  "match the teacher mobile Home", "use the teacher Garden kit", or migrate a
  teacher mobile screen off School Day Story. Covers what differs from the
  parent and admin mobile kits: the "classroom day" feel, the time clock, the
  today list, the class photo grid, the feedback contract, the controller →
  feedback → view split, recipes and a migration checklist.
---

# Teacher portal on mobile: Garden

The teacher **Home** is the reference build:
- `apps/mobile/src/components/teacher/home/garden/teacher-garden-home-screen.tsx`
- its sections in `…/home/garden/sections/` and sheets in `…/home/garden/sheets/`

**The look in one line:** the parent mobile Garden kit in the school's accent, tuned for a teacher's day. The parent portal is about the family. The admin portal is a command centre. The teacher portal is about **running today's class**, so it centres on three things: the clock, the to-do list and the faces in the room.

**Read `.agents/skills/parent-mobile-garden-design/SKILL.md` first.** Tokens, type, the kit, the phone-first rules and the "no eyebrows" rule all apply unchanged: one toy button per view, 44pt targets, `GPressable`, reduced motion, sheets outside the ScrollView. Then skim `.agents/skills/admin-mobile-garden-design/SKILL.md`. Teacher screens borrow its feedback contract and several of its pieces (`useAdminAction`, `notifyWebOnly`, `AdminWorkRow`, `AdminKpiTiles`). This file lists only what is different for teachers.

Related:
- `apps/mobile/AGENTS.md`: keyboard layouts, operational error reporting, WebViews and links. All of it still applies.
- `.agents/skills/mobile-e2e-local`, `.agents/skills/mobile-ui-visual-verify`: verification.

Detailed snippets are in **`recipes.md`**.

---

## 1. Where things live

All paths are under `apps/mobile/src/`.

| Path | What |
|---|---|
| `components/parent/garden/*` | The shared kit. Import it as is. |
| `components/school-admin/garden/admin-ui.tsx` | `AdminWorkRow` (to-do rows), `AdminKpiTiles` (linked numbers), `AdminIconChip`, `AdminLiveDot`. Not admin-only despite the folder. |
| `components/school-admin/garden/use-admin-action.ts` | `useAdminAction(orgId).run(fn, { key, success, error, operation, retry, silent })`: pending key, success/error toast pair with Retry, haptics, `reportError` |
| `components/school-admin/garden/admin-feedback.ts` | `notifyWebOnly(toast, { webPath, reportError, title?, description? })`, `ctaText` |
| `components/teacher/home/garden/use-teacher-home-controller.ts` | Data, sheet state, feature flags and routes. No UI, no toasts. `openFocusHref` / `openDocumentationHref` return `false` when there is no in-app screen. |
| `components/teacher/home/garden/use-teacher-home-feedback.ts` | Wraps controller callbacks: pull to refresh, web-only notices, profile photo toast, jump to the Attendance sub-tab |
| `components/teacher/home/garden/use-teacher-time-clock.ts` | My Hours load + clock in/out through `useAdminAction`, read-only gate |
| `components/teacher/home/garden/teacher-home-status.ts` | `teacherStatusLine` (tested) |
| `components/teacher/home/garden/sections/*` | `TeacherHeader`, `TimeClockCard`, `TodayListCard`, `DayTilesCard`, `ClassroomSnapshotCard`, `ClassroomsCard`, `StudentsCard`, `GuidesCard`, `SupportCard` |
| `components/teacher/home/garden/sheets/*` | `TeacherNotificationsSheet` (feed), `ClassroomRosterSheet` (list), `TeacherGuideSheet` (walkthrough) |
| `components/teacher/home/teacher-home-sub-tabs.ts` | Overview / Attendance (badge) / Help items for `GSegmented` |
| `components/attendance/*` | The Garden roster board, shared with admin. Teacher Home › Attendance renders `<AttendanceRosterPanel embedded active />`. |
| `app/teacher/[slug]/_layout.tsx` | Mounts `GestureHandlerRootView` + `GardenToastProvider` above the Garden tab bar; cream (`Garden.cream`) behind every screen |
| `components/teacher/students/garden/*` | My Students (class photo, linked number strip, scope / classroom / roster chips, programs picker) and the full-screen student page (Overview / Family with "Message family" / Health). `StudentFaceTile` is shared with Home. Health reuses the admin `StudentHealthPanel` with a teacher `StudentHealthSource`. |
| `components/teacher/calendar/garden/*` | Calendar: the parent Garden calendar screen with `portal` (teacher testIDs, `teacher_calendar_*` operations, copy) and, for `canManageEvents`, `manage` (Add / Edit / Delete on `useOrganizationEventsManager`, admin `EventFormSheet`) |
| `components/teacher/messages/garden/*` | Messages: teacher controllers in the parent controllers' shapes, rendered by `ParentMessagesGardenScreen` / `ParentMessageThreadGardenScreen` (`useController`, `onStudentPress`); `messages/new?contactKey=` has its own Garden bootstrap screen |

Reusable pieces from other portals that fit teachers as they are: `ParentBulletinSheet` (bulletin card feed), `PortalAccountSheet`, `PortalSupportRequestSheet` (form, keyboard-safe).

## 2. Teacher feel rules (on top of the parent rules)

1. **The day is the unit.** The header is the date, then the greeting with the teacher's first name in `accent.clay`, then a **status line built only from today's data**: "2 things need you today · 9 of 14 not marked yet · On the clock since 8:02 AM", then "Updated N min ago". Leave out any part whose feature is off or hasn't loaded.
2. **The time clock is the signature.** When My Hours is on, it is the screen's **one dark card** and the Overview's **one toy button** (white toy on the dark card). It shows a big tabular live timer, "Started at", and this week against the goal with `GProgress`. Only the card ticks every second, never the whole screen: call `useLiveElapsed` inside the card.
3. **Rows for work, faces for people, tickets for time.**
   - To-dos are numbered `AdminWorkRow`s on a notebook panel (`Garden.notebook`).
   - Students are a class photo: a 3-column grid of `StudentPhoto` faces on pastel tiles, first name and subtitle, with the health marker kept.
   - Events are paper tickets: `DateStamp`, then a dashed perforation, then the title and `eventWhen`.
4. **No lead strip next to the clock.** The admin "Do this first" strip would be a second toy button. Teacher work queues are plain numbered rows.
5. **Every number leads somewhere.**
   - "Today at a glance" tiles: Not marked yet → the Attendance sub-tab, Unread messages → the Messages tab, Students in your care → the My Students tab.
   - A tile appears only when its feature is on.
6. **Walk the teacher through things.** Guides open as a step walkthrough: numbered rail, an "Up next" step, a tick per step, step actions as outline buttons, and an "N of M steps ticked off" progress footer. The ticks are local. They help the teacher keep their place and are never saved.
7. **Handwriting at most once.** It goes in the caught-up state ("enjoy the quiet ✿"), with `GCelebrate` once per session, skipped in preview.
8. **Copy** comes from data or existing web/mobile copy. Static labels may be renamed (e.g. category chips), but never invent counts or claims.

## 3. Feedback contract

The same contract as admin (`admin-mobile-garden-design` §3), applied to teachers:

| Moment | What the teacher sees |
|---|---|
| Clock in / out | The button's label changes ("Clocking in…") with a spinner. Success: `toast.success("Clocked in at 8:02 AM", "Your session is running…")` or `"Session saved · 3h 12m logged"` + "This week: …". Failure: an error toast with **Retry** that says what did *not* change ("You are not clocked in yet."). Never `Alert.alert`. |
| Read-only preview | A write action shows the "Read-only preview" toast (`useGardenReadOnlyGate`). Never a dead button. |
| Tap with no in-app screen | `notifyWebOnly`: "This opens on the web portal" + "Open on web" (`openExternalUrlSafely`). Never a silent no-op. |
| Pull to refresh | `useGardenPullRefresh({ label: 'Home' })` → "Home is up to date" / "Couldn't refresh home" + Try again. It also reloads the clock and the bell count. |
| Inside a sheet | Status goes in the sheet (`headerAside` chip: "3 new" → "Marked as read", "All done"). Close with `closeThen`, then navigate or toast. |
| Load failure | `GErrorCard` with Try again (+ `haptic.error`). Never toast load failures. Card-level failures (the clock) show an inline "Try again" outline button. |
| Loading | A skeleton shaped like the screen. Never a bare spinner. |
| Real success moment | `GCelebrate` (all caught up), skipped in preview. |

## 4. Screen anatomy

```
<Route>                                  thin: providers (AttendanceProvider) + <XScreen slug>
  controller = useXController(slug)      data, sheet state, routes (no UI, no toasts)
  status loading/empty → XSkeleton | error → GErrorCard | ready ↓
  feedback = useXFeedback(controller)    wraps callbacks (toasts, haptics, web-only); never changes behaviour
  <View cream, top bleed, StatusBar dark>
    header + GSegmented (pinned)          each sub-tab keeps its own ScrollView + RefreshControl
    <Animated.View key={tab} FadeIn>
      cards
    <GCelebrate/>
    sheets (siblings at the root)
```

- Move logic into the controller **verbatim** first and diff it against the old screen. Keep every `reportError` operation name.
- Use the previous-value pattern (`if (prev !== next) setState(...)` during render) instead of reset effects.
- A sheet whose content comes from a nullable selection keeps the last value while it animates closed (see `ClassroomRosterSheet`, `TeacherGuideSheet`).

## 5. Migrating a teacher mobile screen (checklist)

One screen per PR. Done: Home, My Students (+ student page), Calendar, Messages. Next, in order: Bulletin → My Hours (reuse `TimeClockCard` and `useTeacherTimeClock`) → More screens.

Patterns from the My Students / Calendar / Messages migration:
- **Reuse a portal screen through its controller shape.** Calendar and Messages render the parent Garden screens with a teacher controller of the same type; portal differences go in props (`portal`, `manage`, `useController`, `onStudentPress`), parent defaults unchanged.
- **Numbers filter in place.** On My Students the number strip filters the class photo (active cell outlined), says what it shows in a short toast, and explains itself when there is nothing to show ("No health notes on file").
- **Health edits sync everywhere.** `updateStudentHealthFlag` also records `healthFlagOverrides`, so the "All students" list shows the new marker without a reload.
- **Teacher Maestro waits on parent testIDs** in Messages (`parent-messages-inbox-header`, `parent-messages-new-button`); keep them.

1. Split into controller → screen → sections → feedback. Use the Home files as templates.
2. Map the primitives:

   | Story | Garden |
   |---|---|
   | `StoryCard` | `GCard` (no eyebrow) |
   | `StoryAttentionItem` focus list | `AdminWorkRow` numbered rows on a notebook panel |
   | `StoryCard variant="primary"` | `GCard tone="dark"`, only for the clock or the screen's one hero |
   | Student cards with "View profile" | A class-photo grid (the whole tile is the button) |
   | `SubmissionStoryTabBar` | `GSegmented` |
   | `StoryButton` primary | `GToyButton` (one per view) |
   | `StoryButton` outline / `StoryTextLink` | `GOutlineButton` / `GLink` |
   | `StoryBottomSheet` read-only | `GSheet` (`list` + `flex: 1` for lists) |
   | `Alert.alert` result popups | toasts through `useAdminAction` |
   | `ActivityIndicator` loading | `GSkeleton` |

3. Colours: `useParentTheme()` → `useGardenAccent()` / `Garden.*`. Fonts: `GardenFonts`.
4. Keep behaviour identical:
   - every `testID` (e.g. `teacher-home-my-hours-quick-card`, `teacher-home-my-hours-status`, `teacher-portal-ready` in the layout)
   - Maestro text waits (`.maestro/visual/teacher-home.yaml` waits on "Your students")
   - preview gating
   - feature flags (`isTeacherFeatureEnabled`)
5. Apply the feedback contract (§3) to every action and every load.
6. Delete the Story pieces the screen no longer uses. Grep `src` and `.maestro` first, and also check shared `components/portal/*` pieces that just lost their last caller.
7. Verify (§6).

## 6. Verification

From `apps/mobile`:

```bash
node_modules/.bin/tsc --noEmit -p .
npx eslint src/components/teacher src/app/teacher
npx jest src/components/teacher
```

From the repo root: `npm run check:mobile-operational-errors` and `npm run check:mobile-keyboard-patterns`.

The teacher portal needs a sign-in. Run against **local Supabase** (`.agents/skills/mobile-e2e-local`) and sign in as the seeded E2E staff user from `.maestro/teacher-logged-in.yaml` (fixture values only). Then in the iOS Simulator:
- every sub-tab
- clock in and out (toasts)
- each to-do row, tile, classroom → roster → student, a student face, a guide → step → web-only toast
- the bell, the bulletin, the avatar, Need help
- pull to refresh
- airplane mode for Retry
- reduced motion

Finish with `npm run mobile:visual:capture -- teacher-home`.

## 7. Anti-patterns

- A lead strip or a second toy button next to the clock.
- A whole-screen re-render every second for the live timer.
- `Alert.alert` for clock results or routine failures.
- Taps that silently do nothing (use `notifyWebOnly`).
- Parent-style polaroid carousels for a class roster (use the class-photo grid).
- Status-line text that isn't from data.
- Toasts while a sheet is open.
- More than one dark card, eyebrows above titles, spinners instead of skeletons.
