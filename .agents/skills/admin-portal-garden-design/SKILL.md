---
name: admin-portal-garden-design
description: >-
  "Garden" design system for the school-branded SCHOOL ADMIN portal (web).
  Use whenever building, redesigning or restyling an admin page or tab under
  src/app/school/[slug]/admin/ or src/components/school-admin/ in the Garden
  look (Dashboard is done; Admissions, My School, Attendance, Schedule,
  Messages, Finances, etc. are next), or when asked to "make this admin tab
  match the new Dashboard", "use the admin Garden design", or migrate an admin
  page off School Day Story. Covers the admin frame and theme, admin density
  rules, the feedback contract (toasts, saving, errors, retry), the view-model
  hook pattern, recipes from the Dashboard, a migration checklist, and how to
  verify behind the admin login.
---

# Admin portal — Garden

The admin Dashboard (`src/components/school-admin/dashboard/garden/AdminGardenDashboard.tsx`, the "Command center") is the reference build. Every admin tab that moves to Garden should look and behave like it.

**The look in one line:** the parent portal's Garden kit, tuned for running a school. It is denser and more operational, it gives clear next steps, and every action gets visible feedback, all in the school's accent colour.

This skill only lists what differs for admin. For the kit, tokens, motion and the general portal-feel rules, read `.agents/skills/parent-portal-garden-design/SKILL.md` first (§2–§4, §8–§9).

Related skills:
- `.agents/skills/parent-portal-garden-design/`: the kit (`GCard`, `GChip`, `GTabBar`, buttons…), `ParentGardenFrame`, motion and accessibility rules.
- `.agents/skills/admin-workspace-design/`: School Day Story. Admin pages that haven't moved to Garden still use it. Don't mix the two looks on one page except through `PortalIsland`.
- `.agents/skills/portal-responsive-verify/`, `.agents/skills/portal-qa/`: verification.

---

## 1. Where things live

| Path | What |
|---|---|
| `src/components/school-admin/dashboard/garden/AdminGardenDashboard.tsx` | Reference page: frame, header + tabs, Today panel, overlays |
| `…/garden/AdminGardenDashboardHeader.tsx` | Admin page header: kicker, greeting `h1`, data-built status line, Refresh + "Updated N min ago", `GTabBar` |
| `…/garden/AdminGardenDashboardSkeleton.tsx` | Suspense fallback in the page's shape |
| `…/garden/GardenFocusQueue.tsx` | Work queue: lead strip, numbered rows, caught-up state |
| `…/garden/GardenTodayCards.tsx` | Setup steps, linked KPI tiles (`tiles` \| `strip`), signal dark card, staff-hours `PortalIsland` |
| `…/garden/GardenAttendanceBoard.tsx` | Attendance board + `useGardenAttendance` + sheets (render outside the frame) |
| `…/garden/GardenSecondaryPanels.tsx` | Journey stepper, Activity list + quick actions, Guides index |
| `…/garden/shared.tsx` | `ADMIN_GARDEN_CONTAINER_CLASS`, `GardenLoadError`, `GardenPanelSkeleton`, `ROW_INTERACTIVE`, `useRelativeTime`, `metricHref` |
| `src/components/school-admin/dashboard/useAdminDashboardModel.ts` | Page view-model pattern (tabs in URL, lazy sections, focus refresh, polling, errors, retry) |
| `src/components/school-admin/attendance/useDashboardAttendanceModel.ts` | Feature view-model shared by Garden and story surfaces (admin, teacher, demos) |
| `src/components/school-admin/AdminToaster.tsx` | `GARDEN_ADMIN_ROUTES`: admin routes that get Garden toasts |
| `src/lib/school-admin/admin-toast.ts` | `adminToast` with `{ description, action, id }` |

## 2. Frame and theme

```tsx
const { theme, C } = useSchoolAdminStoryTheme(); // theme: ParentThemeTokens, C: AdminThemeTokens
return (
  <>
    <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
      <div className={ADMIN_GARDEN_CONTAINER_CLASS}>{/* header + cards */}</div>
    </ParentGardenFrame>
    {/* sheets / drawers / guide panel OUTSIDE the frame, passed `theme` + `C` */}
  </>
);
```

- The admin shell stays as it is: the sidebar (`SchoolAdminStorySidebar`), `SchoolAdminBaseline`, and the notifications and support panels. Only page content goes inside the frame.
- The admin attendance sheets (`AttendanceStudentDetailSheet`, `AttendancePickupSheet`) and `AdminDocumentationGuidePanel` are **not portalled**. Render them after the frame, or the Garden type reset restyles them.
- Unmigrated blocks go inside a card wrapped in `<PortalIsland>`. The Dashboard does this for staff hours.
- The page owns its padding through `ADMIN_GARDEN_CONTAINER_CLASS` (`max-w-[1320px]`, `gap-5`, `px-4 sm:px-8 lg:px-10`). Don't wrap it in the old `max-w-[1350px] px-[clamp(…)]` div in `[feature]/page.tsx`.
- A Suspense fallback that imports from the kit must be a `"use client"` file. A server component that imports a constant from a client module gets a reference proxy, not the value.

## 3. Admin feel rules (on top of the parent rules)

1. **Header.**
   - Kicker: `School workspace · {date}`, with the date shown from `sm` up.
   - `h1`: 1.75–2.1rem, with the accent on one word (the admin's name).
   - Subtitle: a status line built **only from data**, for example "3 items need you today · 9 of 14 students not marked yet".
   - Actions on the right: Refresh plus "Updated N min ago".
2. **Above the fold at 1440×900:** the work queue and the school's key status. Main plus rail: `grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]`.
3. **Density:**
   - Use rows rather than note tiles for lists of work (`ROW_INTERACTIVE`: 14px radius, accent-wash hover, inset focus ring).
   - Item titles are 14–15px `font-extrabold`; meta is 12–13px.
   - Use `tabular-nums` on every count and money figure.
4. **Pastels only on icon chips and status chips.** One dark card per page: the school signal on the Dashboard.
5. **One toy button per view.**
   - On the Dashboard it's "View attendance".
   - Inside a selected step or pane, that step's CTA can be the toy button, as long as no other toy button is visible.
   - Row actions use `gBtnOutlineSm`. Card-header links use `gLinkSm` plus `ArrowRight`.
6. **Every number leads somewhere.** KPI tiles are links to the page behind the number (`metricHref`), with an `aria-label` like "Active applications: 22. Open".
7. **Handwriting at most once:** the caught-up state ("enjoy the quiet ✿", `aria-hidden`).
8. **Copy:** factual strings come from data or existing product copy. Keep server CTA labels and strip a trailing "→" (`ctaText`), because the Garden UI draws its own arrow.

## 4. Feedback contract (non-negotiable)

| Moment | What the admin sees |
|---|---|
| Action in flight | The button changes to a spinner + "Saving…", `disabled`, `aria-busy`. Other rows stay usable. |
| Action succeeded | `adminToast.success(title, { description, id })`. The title says what happened ("Ava marked present."). The description says what it means now ("5 of 14 students present today."). The row flashes mint (`lastSavedStudentId`, about 1.6s). Counts, progress and the header status update in place. |
| Action failed | `adminToast.error(message, { description, action: { label: "Retry", … }, id: "…-error-…" })`. The description says what did *not* change. Use an **error-specific id**, because a success toast that reuses the error's id is swallowed after the admin clicks Retry. On success, `adminToast.dismiss(errorId)`. |
| Section failed to load | Show `GardenLoadError` inline with "Try again". **Never toast for load failures.** Never leave "Loading…" up forever. |
| Lazy section loading | A spinner on the tab (`data-testid="dashboard-tab-loading"`) and a `GardenPanelSkeleton` in the panel. |
| Background refresh | Refresh button and "Updated just now / N min ago". The manual refresh toasts its result. Window-focus refresh is silent. |
| Filtered to nothing | "No students match this filter." plus a "Show everyone" link. |
| Everything done | Mint panel + `Tick` + one hand line. Call `useCelebrate(true, theme, "admin-…")` only for real all-done moments. |
| Copy to clipboard | The row switches to "Link copied" with a check for 2s, plus a toast. On failure, the error toast shows the URL so it can be copied by hand. |

**Toaster:** when a tab moves to Garden, add its route segment to `GARDEN_ADMIN_ROUTES` in `AdminToaster.tsx`. Otherwise its toasts keep the story look.

## 5. Logic pattern (keep behaviour identical)

- Put state and fetching in a `use{Feature}Model` hook. Garden markup and any story or demo surface both read from the same hook. **Never fork business logic into the Garden view.**
- Keep tab state in the URL (`?tab=`), and pass `router.replace(…, { scroll: false })`.
- Lazy sections need `error` state and `retry*()`, not just `null`.
- Hold callback props in refs inside hooks (`onSummaryChange`, `onRecordSaved`). Otherwise inline callbacks change `loadX` identity on every render, and a "date changed → fetch" effect refetches in a loop.
- When server data changes, use the *previous-props* pattern (`if (prev !== next) setState…` during render) instead of reset effects. The repo enforces `react-hooks/set-state-in-effect`. If an effect has to start async work, wrap it in `queueMicrotask`.
- Guard races with a request-id ref, so the newest request wins when the admin steps dates quickly.
- Hooks that may have no data take `enabled`, so they never fetch for a disabled feature.
- `previewMode` / read-only disables actions; it never hides UI.

## 6. Recipes (from the Dashboard)

| Recipe | Source | Reuse it for |
|---|---|---|
| **Work queue**: a "Do this first" accent strip that is a single `<Link>` with a `gBtnOnAccent` pill, then numbered rows (icon chip, title, meta, CTA, chevron); caught-up mint state | `GardenFocusQueue.tsx` | Applications to review, unpaid invoices, unsigned forms, open signups |
| **Setup steps**: `GProgress` + n/N, numbered rows linking to each step, the current step on the accent wash with a "Next" chip, done steps struck through with a check, a live "Checking Stripe status…" note | `GardenTodayCards.tsx` › `GardenSetupProgress` | Go-live checklists, onboarding, multi-step config |
| **Linked KPI tiles**: a coloured bar, a big tabular value, a label, an arrow on hover; `strip` layout for a single divided card | `GardenTodayCards.tsx` › `GardenMetricTiles` | Summary numbers on any tab |
| **Signal dark card**: headline + body + `gBtnButterSm` | `GardenSignalCard` | The page's one "how are we doing" status |
| **Roster board**: date stepper (prev/next, Today chip, Jump to today), progress + "N left to mark", radio filter chips with counts (zero counts hidden), search over 6 items, roster as a 2-col row grid (`table`) or cards (`grid`), per-row primary action, row opens a detail sheet | `GardenAttendanceBoard.tsx` | Attendance, check-ins, pickups, any per-person daily status |
| **Journey stepper**: connected stage dots (current one raised in accent), stage descriptions from `md`, shortcut tiles below with a small banner image | `GardenSecondaryPanels.tsx` › `GardenJourneyPanel` | Pipelines (prospect → enrolled), program lifecycles |
| **Activity list**: category `GChip`, title/detail, relative time, CTA chevron; "View all" opens the notifications panel | `GardenActivityPanel` | Feeds, audit logs |
| **Quick actions**: rows with icon chips; copy-link row with a copied state | `GardenActivityPanel` › `CopyApplyLinkRow` | Shortcut lists |
| **Index of help**: category kickers with guide rows that open `AdminDocumentationGuidePanel` | `GardenGuidesPanel` | How-tos, FAQs |
| **Legacy block**: `GCard` › `PortalIsland` › story component | `GardenStaffHoursCard` | Anything not yet migrated |

## 7. Migrating an admin tab (checklist)

1. Find the tab's branch in `src/app/school/[slug]/admin/(protected)/[feature]/page.tsx` (or its own route) and its client page and story header.
2. Move state and fetching into a `use{Feature}Model` hook (§5) **before** restyling. The old view should keep working on the hook, which gives a clean diff and makes it easy to check behaviour.
3. Wrap the page in `ParentGardenFrame` + `ADMIN_GARDEN_CONTAINER_CLASS`. Move sheets and drawers outside the frame. Remove the old padding wrapper.
4. Build the header (§3.1), with `GTabBar` if the tab has sub-tabs. Keep the `data-testid`s.
5. Lay out main + rail. Pick the single primary action for the toy button.
6. Map the primitives:
   - `AdminCard` → `GCard`
   - `AdminSectionKicker` / `AdminDisplayHeading` → `GCard` `kicker` / `title`
   - `AdminChip` → `GChip`
   - `AdminMetricCard` → `GardenMetricTiles`
   - `AdminFocusQueue` → `GardenFocusQueue`
   - `ParentButton*` primary → `gBtnPopSm`; others → `gBtnOutlineSm` / `gLinkSm`
7. Apply the feedback contract (§4) to every action and load. Add the route to `GARDEN_ADMIN_ROUTES`.
8. Add a `"use client"` Garden skeleton for the Suspense fallback.
9. Check what else imports the old story components before deleting them. The marketing demos (`DemoAdminDashboardPage`, `src/components/demo/**`) and the teacher portal reuse many `ui/story/*` and attendance pieces.
10. Verify (§8).

## 8. Verification

- Run:

  ```bash
  ./node_modules/.bin/tsc --noEmit -p .
  ./node_modules/.bin/eslint <changed paths>
  ```

- **The live admin needs a real sign-in.** `.env.local` points at remote Supabase, and you must not type real credentials. To click through locally, add a **throwaway** client route (for example `src/app/dev-admin-<tab>/page.tsx`) and delete it before finishing:
  - Render it with `next/dynamic` and `ssr: false`, because it touches `window`.
  - Wrap it in `SchoolAdminStoryThemeProvider` (`ADMIN_DEMO_STORY_THEME` / `ADMIN_DEMO_STORY_COMPAT` from `src/components/demo/shared/admin-demo-runtime.ts`), `AdminNotificationsPanelProvider`, a `h-dvh overflow-y-auto` scroller, and `GardenToaster`.
  - Fixtures: `buildDemoAdminDashboardSummary()` and `DEFAULT_FEATURES`.
  - Stub `window.fetch` for `/api/school-admin/*` with in-memory state, a ~450ms delay, and `window.__lab.fail.<section>` switches to force errors and test Retry.
  - If the Browser pane is hidden, rAF stops and framer animations freeze mid-transition. Add a `?noanim=1` switch that sets `MotionGlobalConfig.skipAnimations = true`.
- Check 375 / 768 / 1440 (`.agents/skills/portal-responsive-verify`). At 375 the page scroller's `scrollWidth === clientWidth`; horizontal rails scroll inside their own container.
- Check `/demo-school` → Admin View still renders. It reuses the story pieces.
- Ask the user to check the real route while signed in. That's the one check you can't do locally.

## 9. Anti-patterns

- Parent-style note-tile grids for admin work lists. Use rows.
- Toasting load failures, or leaving "Loading…" with no error path.
- An error toast and a success toast sharing one id.
- Inline callbacks passed into fetch hooks without refs (refetch loops).
- Garden markup with its own copy of the fetching or saving logic.
- Mounting the attendance or detail sheets or the guide panel inside `ParentGardenFrame`.
- Numbers that don't link anywhere; invented stats or claims in status lines.
- Importing client-module constants into a server component.
