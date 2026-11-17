---
name: teacher-portal-garden-design
description: >-
  "Garden" design system for the school-branded STAFF / TEACHER portal (web).
  Use whenever building, redesigning or restyling a teacher page or tab under
  src/app/school/[slug]/teacher/ or src/components/school-teacher/ (Dashboard,
  My Students, Messages, Calendar, Forms & documents, Classroom signups and My
  Hours are done; Attendance is next), the admin staff preview of those
  pages, or when asked to "match the staff Dashboard", "use the teacher Garden
  design", or migrate a teacher page off School Day Story. Covers the
  "classroom day" feel, the day rhythm, guided one-at-a-time flows (roll
  call), the feedback contract, the view-model pattern, recipes, a migration
  checklist and how to verify behind the staff login. Web counterpart of
  teacher-mobile-garden-design.
---

# Staff (teacher) portal: Garden

The staff **Dashboard** is the reference build:
- `src/components/school-teacher/TeacherDashboardPage.tsx`
- its model `home/useTeacherDashboardModel.ts`
- its sections in `home/garden/*`

**The look in one line:** the parent Garden kit in the school's accent, tuned for a teacher's day. The parent portal is about the family, and the admin portal is a command centre. The teacher portal is about **running today's class**: today's rhythm, the to-do list and the faces in the room.

**Read first:**
- `.agents/skills/parent-portal-garden-design/SKILL.md`, for the kit, `ParentGardenFrame`, motion, accessibility and anti-patterns (§2–§4, §8–§9).
- `.agents/skills/admin-portal-garden-design/SKILL.md`, for the feedback contract (§4) and the logic pattern (§5).

This file lists only what is different for teachers. Keep copy and behaviour in parity with the mobile teacher Home (`.agents/skills/teacher-mobile-garden-design/`).

---

## 1. Where things live

| Path | What |
|---|---|
| `src/components/school-teacher/TeacherDashboardPage.tsx` | Reference page: `AttendanceApiProvider` (teacher API) → frame + header + sections, overlays outside the frame |
| `…/home/useTeacherDashboardModel.ts` | View-model. It holds all state and rules from the old page: focus items kept in step with live counts, workspace tabs (+ `?workspace=` via `replaceState`), unread refresh on focus, drawers, guides. It also calls the shared `useDashboardAttendanceModel` with `silentLoadErrors`. |
| `…/home/garden/TeacherDayRhythm.tsx` | Day rhythm strip (Roll call → In class → Pickup) |
| `…/home/garden/TeacherStartHereCard.tsx` | Work queue: lead strip + numbered rows + caught-up state |
| `…/home/garden/TeacherSnapshotRail.tsx` | The one dark card (snapshot, linked figures, next-date ticket) + messages note row |
| `…/home/garden/TeacherWorkspace.tsx` | `GTabBar` workspace: Attendance (shared `GardenAttendanceBoard` + roll call button), Classrooms, Your students |
| `…/home/garden/TeacherRollCallDialog.tsx` | Guided roll call (`GDialog`) |
| `…/home/garden/TeacherGuidesCard.tsx` | Index of help → `TeacherDocumentationGuidePanel` |
| `…/home/garden/parts.tsx` | Focus icons/tints/CTA verbs, `StudentFace` (photo or initials), `plural` |
| `src/lib/school-teacher/teacher-dashboard-day.ts` | `teacherDashboardStatusLine`, `buildTeacherDaySteps` (pure, tested) |
| `src/components/school-teacher/TeacherClassroomStudentsSidebar.tsx` | Classroom roster drawer on `GSidePanel` |
| `src/components/school-teacher/SchoolTeacherHeader.tsx` | Garden staff header (every teacher page): `ParentGardenScope`, the parent `ParentGardenNav` with `ariaLabel="Staff portal"`, `isItemActive={isTeacherNavItemActive}`, `testIdPrefix="teacher-header"`, `GardenBellButton`, `GardenHeaderPopover` + `header/TeacherGardenProfileMenu` (photo upload, account portals, How-to guides, Log out hidden in preview, as before) |
| `src/components/school-teacher/TeacherToaster.tsx` | `GARDEN_TEACHER_ROUTES`: teacher routes that get Garden toasts |
| `TeacherMyStudentsPage.tsx` + `my-students/useTeacherMyStudentsModel.ts` | My Students: scope `GTabBar` (mine / whole school, lazy), classroom group cards as toggle filters, linked strip figures (Health flags filters), program chips + search (`/` focuses it), table / phone cards, `GardenLoadError` + Try again |
| `TeacherStudentDetailPanel.tsx` | Student drawer on `GSidePanel` (Overview / Family / Health via `GTabBar`, inline load error). Shared by Dashboard, My Students, Messages. `open` prop keeps it mounted so it animates out |
| `TeacherMessagesPage.tsx` + `messages/useTeacherMessagesFeedback.ts` | Messages: `MessagesInboxLayout variant="parent-garden"` + staff toasts (`lib/messages/teacher-messages-feedback.ts`). `actions.openStudent` on the view model makes thread student names open the drawer (only when the thread carries student summaries) |
| `TeacherCalendarPage.tsx` | Read-only staff: `ParentCalendarPage eventsComplete` (all events loaded, no parent-API month fetches). Event managers: `OrganizationEventsCalendarManager garden` inside frame + `AdminGardenSkin` |
| `forms-documents/TeacherFormsDocumentsPage.tsx` | The admin `FormsDocumentsWorkspace` / `useFormsDocumentsModel` with `apiBase`, `fetchDownloadUrl`, `surface="teacher_portal"`, `previewMode`, `rowTestIdPrefix="teacher-form-row"`, no creator column |
| `classroom-signups/teacher/*` | Signups: `useTeacherClassroomSignupsModel`, Garden list + lead strip, `GSidePanel` drawer (`?signup=`), two-step wizard with real Save as draft, `ClassroomSignupNotifyModal` (real reminders), CSV export, close confirm |
| `api/teacher-portal/classroom-signups/[signupId]/remind` + `lib/classroom-signups/signup-reminders.ts` | Real reminders: email + push (`classroom_signup.reminder`) to audience families without a confirmed response, activity `classroom_signup.reminder_sent`, one per signup per hour (429) |
| Shared, from admin | `GardenAttendanceBoard` (`headerAction`, controlled `filter`), `GardenAttendanceSheets`, `ROW_INTERACTIVE`, `GardenLoadError` |

## 2. Teacher feel rules (on top of the parent rules)

1. **The day is the unit.**
   - Header kicker: `{School} · Staff` (the Dashboard is the only staff page with a header eyebrow; see rule 9).
   - `h1`: the greeting with the first name in `--sf-clay`. Keep the text `Good (morning|afternoon|evening), {First}.` because `e2e/teacher/login-redirect.spec.ts` reads it.
   - Subtitle: the existing sentence, then a role `GChip`, then a **status line built only from data** (`teacherDashboardStatusLine`, the same wording as mobile): "2 things need you today · 9 of 14 not marked yet · 3 unread messages".
2. **Today's rhythm sits under the header** whenever attendance is on:
   - Three connected steps: Roll call → In class → Pickup, from today's summary only.
   - The current step is on the accent wash with a "Now" chip. Done steps get `Tick`.
   - Each step opens the roster on its filter and scrolls the workspace into view.
   - Roll call complete turns the strip mint and celebrates once per day (`teacher-roll-call-done-{date}`).
3. **Rows for work, faces for people, tickets for time.**
   - To-dos are a lead strip + numbered `ROW_INTERACTIVE` rows.
   - Students always show their photo or initials (`StudentFace`); classrooms show an avatar stack.
   - Dates are `.sf-ticket` + `DateStamp`.
4. **Guided flows for repetitive work.** If a teacher does the same thing to many children (roll call, pickups, sign-offs), offer a one-at-a-time dialog with big choices, keyboard shortcuts, progress, Skip/Back, and a recap. The per-row buttons stay as they are; the guided flow is an extra path, never a replacement.
5. **One toy button per view.**
   - Dashboard: "Take roll call" (only while students are unmarked; "Mark this day" on another date).
   - The lead strip's `gBtnOnAccent` pill is the strip's affordance, not a second action.
   - "View attendance" is outline. On phones it's hidden in the header because the board footer links to the same page.
6. **Every number leads somewhere.** Snapshot figures open the matching tab or roster filter and have an `aria-label` like "Learners in your care: 8. Show your students".
7. **Handwriting at most once:** the caught-up state. **Celebrate once per moment:** the caught-up card skips its burst when roll call is what cleared the queue.
8. **Copy** comes from data or existing product copy. CTA verbs (Reply / Open / Review / Mark) and static labels are fine. Never invent counts, claims or features (no "health note" chips the old UI didn't have).
9. **No eyebrow on tab pages.** Staff tabs (My Students, Messages, Calendar, Forms & documents, Classroom signups, and any new tab) open straight with the h1 title: don't pass `kicker` to `ParentGardenPageHeader`, and don't put a `GKicker` above a full-page title such as a create wizard. Only the Dashboard keeps `{School} · Staff` above the greeting. Kickers are still fine on cards (`GCard kicker`), drawers (`GSidePanel kicker`) and "Needs attention" lead strips.

## 3. Feedback contract

This is the admin contract (`admin-portal-garden-design` §4) plus:

| Moment | What the teacher sees |
|---|---|
| Per-row attendance save | Spinner + "Saving…" on that row, a mint flash, and the shared toast "Ava marked present. · 5 of 14 students present today." The header status, rhythm, Start-here item, tab badge and snapshot figures all update in place. |
| Save inside a guided flow | `saveAttendanceAction(student, action, undefined, { quiet: true })`: **no** per-child toast. The dialog confirms through an `aria-live` line and moves on. On failure it stays on that child with an inline error + Retry, and the standard error toast (error id + Retry) still fires. |
| Guided flow closes | **One** recap toast (`id: "teacher-roll-call"`): "Roll call saved: 4 students marked." or "Roll call paused: …". The description says what's left. Closing on everyone-marked also resets an empty "Not marked" roster filter to All. |
| Roster failed to load | `GardenLoadError` inline + Try again (`silentLoadErrors`). Never toast. The roll call button hides while the roster is loading or errored. |
| Preview (`previewMode`) | Actions stay visible but disabled, with a reason (`title="Roll call is off in preview"`). The marketing demo (`teacherBasePath="#"`) never writes the URL. |

**Toaster:** add each migrated route segment to `GARDEN_TEACHER_ROUTES` in `TeacherToaster.tsx`. It matches the last path segment, so the admin staff preview `/admin/preview/{slug}/teacher/{staffId}/{feature}` works too.

## 4. Recipes

| Recipe | Source | Reuse it for |
|---|---|---|
| **Group cards as filters**: pastel icon tile, `sf-display` name, "N students", avatar stack (xl+), `aria-pressed`, tap again to clear; 2-up on phones | `TeacherMyStudentsPage` › `ClassroomGroups` | Any list a teacher slices by room / pod |
| **Reminder dialog**: who it goes to (count from data), channels, editable message + counter, send button names the count, inline cooldown notice on 429, one toast with Retry | `ClassroomSignupNotifyModal` | Nudges to families (forms, payments) |
| **Two-step create**: step trail (number → `Check`), sticky footer that says what's missing, Save as draft on every step, confirm before leaving or overwriting with a template | `ClassroomSignupCreateWizard` | Any create flow with a draft state |
| **Day rhythm strip**: kicker + `sf-display` status h2 + `GProgress` "N left"; 3 step buttons (number dot / `Tick`, label, tabular detail, "Now" chip, chevron) joined by a short accent line; `aria-current="step"` | `TeacherDayRhythm` | Any ordered daily phases (arrival → lunch → dismissal, field trip check-in → out → back) |
| **Guided roll call**: `GDialog size="lg"` (bottom sheet on phones); `headerExtra` progress "3 of 8"; big face + name + meta; two big choice buttons (mint / butter, ink border, toy shadow, `<kbd>` hints); Back / Up-next faces / Skip; inline error + Retry; recap with `Tick`, 3 tiles and "Go back to N skipped" | `TeacherRollCallDialog` | Pickup check-out, permission-slip collection, reading-log sign-offs |
| **Snapshot dark card**: body copy, a strip of linked figures (`GCountUp`, white/10 tiles), "Next on the calendar" ticket, `gBtnButterSm` | `TeacherSnapshotRail` | The page's one "how is my class" status |
| **Classroom cards**: pastel icon chip, `sf-display` name, "N students", an avatar stack (max 4 + "+N"), outline "View students" with an `aria-label` naming the room | `TeacherWorkspace` › `ClassroomsPanel` | Groups, pods, committees |
| **Student mini-card**: `StudentFace md`, first name `h3`, `● Enrolled` chip, grade · programs, classroom, family, outline "View {name}'s profile"; dashed "View all N students" link | `TeacherWorkspace` › `StudentsPanel` | People lists capped on a dashboard |
| **Classroom drawer**: `GSidePanel` with search over 6 rows, `ROW_INTERACTIVE` rows with faces and an empty/no-match state. Its `onClose` ignores Escape while a student detail panel is open on top. | `TeacherClassroomStudentsSidebar` | List drawers that open a second panel |
| **Workspace tabs**: `GTabBar` with count suffixes, `teacher-dashboard-tab-{key}` ids, `role="tabpanel"`, tab in `?workspace=` | `TeacherWorkspace` | Sub-areas on one page |

## 5. Logic pattern

- Same as admin §5: state in `use{Feature}Model`, previous-props resets (no reset effects), callbacks held in refs, `queueMicrotask` for effect-started async, request-id races, and `enabled` for disabled features.
- Hooks that read `useAttendanceApiBasePath()` must render inside `AttendanceApiProvider apiBasePath="/api/teacher-portal/attendance"`. The page wraps its view in it, and the sheets and dialog inherit it through context.
- Server copy that a client action can make stale (focus items like "Mark attendance for N students", "Reply to N unread messages") is re-derived from the live counts in the model and dropped at 0.
- Overlays stay **outside** `ParentGardenFrame`: `GardenAttendanceSheets`, `TeacherRollCallDialog` (portalled), the classroom drawer, `TeacherStudentDetailPanel` (`z-[110]`, story) and `TeacherDocumentationGuidePanel` (story).

## 6. Migrating a teacher page (checklist)

Done: Dashboard, My Students, Messages, Calendar, Forms & documents, Classroom signups, My Hours (`my-hours/useTeacherMyHoursModel.ts` + `my-hours/garden/*`, paired with the mobile time clock). Next: Attendance (reuse `GardenAttendanceBoard variant="page"`).

Gotchas found on the way:
- A dialog that a toast's Retry can finish must close **inside** the retried action (not after `run()` returns), or a successful Retry leaves it open.
- e2e `getByText` is strict: a lead strip that repeats a row's title makes two matches, so scope the assertion to the list's `data-testid`.

1. Find the page's branch in `src/app/school/[slug]/teacher/(protected)/[feature]/page.tsx` and the admin preview route `src/app/admin/(preview)/preview/[slug]/teacher/[staffMemberId]/[feature]/page.tsx`. Both render the same component; `previewMode` + `teacherBasePath` must keep working.
2. Move state into a `use{Feature}Model` first, then restyle.
3. Frame: `ParentGardenFrame theme={useParentTheme().theme} className="bg-[var(--sf-cream)]"` + `PORTAL_HOME_CONTAINER_CLASS`; header via `ParentGardenPageHeader` with **no `kicker`** (§2 rule 9).
4. Map the primitives as in parent §7.5. `ParentStoryPillNav` → `GTabBar` (same `data-testid`).
5. Apply the feedback contract (§3) and add the route to `GARDEN_TEACHER_ROUTES`.
6. Keep every `data-testid` that `e2e/qa/teacher-portal-scenarios.ts` waits on (e.g. `teacher-my-students-page`, `teacher-attendance-page`, `teacher-my-hours-page`).
7. Delete story pieces only after grepping `src` (admin `DashboardAttendanceSection` still uses `TeacherDashboardAttendanceStudentCard`).

## 7. Verification

- Run:

  ```bash
  ./node_modules/.bin/tsc --noEmit -p .
  ./node_modules/.bin/eslint <changed paths>
  ```

  Also run the unit tests in `src/lib/school-teacher/teacher-dashboard-*.test.ts`.
- `/demo-school` → **Teacher View** renders the real page in preview mode (`DemoTeacherDashboardPage`). Check that no console errors appear.
- The signed-in teacher routes need a real login (remote Supabase). To click through actions locally, add a **throwaway** client route (e.g. `src/app/dev-teacher-<page>-lab/`) and delete it before finishing:
  - `next/dynamic` with `ssr:false`.
  - `ParentThemeProvider` with `buildDemoTeacherBranding()`, a `h-dvh overflow-y-auto` scroller and `GardenToaster`.
  - Fixtures from `buildDemoTeacherDashboardSummary`.
  - A module-level `window.fetch` stub for `/api/teacher-portal/*`: roster GET by date, `/records` POST mutating in memory, `/pickup-contacts`, `/history`, `messages/unread-count`. Add a ~450ms delay and `window.__teacherLab.fail.{save,load}` (or `?fail=load`) switches.
  - `?noanim=1` sets `MotionGlobalConfig.skipAnimations`. `?preview=1` checks read-only mode.
  - `TeacherStudentDetailPanel` reads Supabase directly and can't be faked with fetch stubs.
- Check 375 / 768 / 1440. At 375 the scroller's `scrollWidth === clientWidth`. Watch card-header actions: `GCard`'s action slot is `shrink-0`, so hide duplicates with `max-sm:!hidden` (plain `hidden` loses to the button's `inline-flex`).
- The marketing demo (`SchoolTeacherDemoShell`) draws its own header, so check `SchoolTeacherHeader` with a throwaway catch-all lab (`src/app/dev-teacher-header-lab/[[...rest]]/`) that passes `previewBasePath="/dev-teacher-header-lab"`: nav links then resolve inside the lab, and active pills / "More · X" can be clicked through.
- Ask the user to check the real `/school/{slug}/teacher/dashboard` while signed in.

## 8. Anti-patterns

- Replacing per-row actions with a guided flow (always add, never remove).
- A toast per child inside a guided flow, or no recap at the end.
- Stale server counts ("Mark attendance for 5 students" after marking them).
- Two confetti bursts for one moment.
- Mounting sheets, dialogs or drawers inside `ParentGardenFrame`.
- Status-line or figure text that isn't from data.
