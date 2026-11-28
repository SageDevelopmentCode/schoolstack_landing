---
name: admin-portal-garden-design
description: >-
  "Garden" design system for the school-branded SCHOOL ADMIN portal (web).
  Use whenever building, redesigning or restyling an admin page or tab under
  src/app/school/[slug]/admin/ or src/components/school-admin/ in the Garden
  look (Dashboard, Admissions, every My School tab and Communication — Newsletters,
  Committees, Messages — and Finances (Transactions, Revenue) are done; Schedule etc. are next), or when asked to "make this admin tab
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
- `.agents/skills/teacher-portal-garden-design/`: the staff portal's Garden rules. The teacher Dashboard reuses `GardenAttendanceBoard` (`headerAction`) and `useDashboardAttendanceModel` (`saveAttendanceAction(..., { quiet: true })`), so keep both backwards-compatible.
- `.agents/skills/portal-responsive-verify/`, `.agents/skills/portal-qa/`: verification.

---

## 1. Where things live

| Path | What |
|---|---|
| `src/components/school-admin/dashboard/garden/AdminGardenDashboard.tsx` | Reference page: frame, header + tabs, Today panel, overlays |
| `…/garden/AdminGardenDashboardHeader.tsx` | Admin page header: kicker, greeting `h1`, data-built status line, Refresh + "Updated N min ago", `GTabBar` |
| `…/garden/AdminGardenDashboardSkeleton.tsx` | Suspense fallback in the page's shape |
| `…/garden/GardenFocusQueue.tsx` | Work queue: lead strip, numbered rows, caught-up state |
| `…/garden/GardenTodayCards.tsx` | Setup steps, linked KPI tiles (`tiles` \| `strip`), signal dark card |
| `…/garden/GardenStaffHoursCard.tsx` | Staff hours · Today: stat strip with a live dot, "On the clock" (live timers) and "Finished today" lists |
| `…/garden/GardenAttendanceBoard.tsx` | Attendance board + `useGardenAttendance` + sheets (render outside the frame) |
| `…/garden/GardenSecondaryPanels.tsx` | Journey stepper, Activity list + quick actions, Guides index |
| `…/garden/shared.tsx` | `ADMIN_GARDEN_CONTAINER_CLASS`, `GardenLoadError`, `GardenPanelSkeleton`, `ROW_INTERACTIVE`, `useRelativeTime`, `metricHref` |
| `src/components/school-admin/dashboard/useAdminDashboardModel.ts` | Page view-model pattern (tabs in URL, lazy sections, focus refresh, polling, errors, retry) |
| `src/components/school-admin/attendance/useDashboardAttendanceModel.ts` | Feature view-model shared by Garden and story surfaces (admin, teacher, demos) |
| `src/components/school-admin/AdminToaster.tsx` | `GARDEN_ADMIN_ROUTES`: admin routes that get Garden toasts |
| `src/components/school-admin/garden/kit.tsx` | Kit for every tab after the Dashboard: `AdminGardenPage` (frame + skin + container + `overlays`), `AdminGardenPageHeader` (kicker, h1, data status line, Refresh + "Updated", `GTabBar`), `GardenField` / `GardenSelect` / `GardenSwitch` / `gInputClass`, `GardenFilterChips` ("Label · N" names), `GardenStatTiles` (href or onClick), `GardenSteps`, `GardenNotice`, `GardenEmptyState`, `GardenSaveBar`, `GardenSection`, `BusyLabel`, `AdminGardenPageSkeleton`, `gIconBtn`, `gBtnDangerSm` |
| `src/components/school-admin/garden/skin.tsx` | `AdminGardenSkin` + `useAdminGardenSkin`: story primitives render Garden inside it (§2.1); `SkinPortalScope` for portalled overlays |
| `src/components/school-admin/garden/useAdminAction.ts` | `run(fn, { key, success, error, retry })`: pending key, toast pair with error-specific id + Retry, mint flash |
| `src/components/school-admin/admissions/**` | Admissions reference: Payments (`payments/*`), Submissions (`submissions/*`, Garden drawer), Programs (`programs/useProgramsModel`), Enrollment Flows (`EnrollmentFlowsStoryShell` = Garden full-height shell, `EnrollmentFlowsOverview`) |
| `src/components/school-admin/garden/blocks.tsx` | My School blocks: `GardenRecordList` + `GARDEN_LIST_DETAIL_GRID` (list + detail; search, filter chips, no-match reset, mint flash, scroll-to-detail on phones), `GardenPickerSheet` (single/multi picker drawer that only closes when `onSave` returns `true`), `GardenLeadStrip`, `GardenSearchInput`, `G_TABLE` / `G_TH` / `G_TD` / `gRowClass` / `GardenRefetchVeil`, `GardenFacts`, `GardenGroupHeading`, `GardenAvatar`, `GardenCopyRow`, `GardenOverlayScope` (portal into the Garden scope + skin) |
| `src/components/school-admin/garden/useAdminConfirm.tsx` | Promise confirm (`await confirm({ title, confirmLabel })`) that replaces `window.confirm`; renders `ConfirmDialog` → `GConfirmDialog` under the skin |
| `src/components/school-admin/garden/AdminGardenRouteSkeleton.tsx` | `"use client"` route skeleton for `next/dynamic` `loading` in `[subtab]/page.tsx` |
| My School references | Staff + Classrooms (`staff/*`, `classrooms/*`: list + detail, pickers, Undo), My Students (`students/*`: table + drawer), Staff Hours (`staff-hours/*`), Attendance (`attendance/GardenAttendancePage` on `GardenAttendanceBoard variant="page"`), Forms & Documents (`forms-documents/*`), Friday Branch (`friday-branch/*`), School Profile, Tuition (`TuitionDashboard` shell; panels via the skin), Newsletters (`newsletter/*`: checklist-style builder — outline, the real newsletter with click-to-edit regions + `GSidePanel` editors or Compact list, `FlowReadinessRail`, Review & publish stage; state in `useNewsletterEditorModel`; the newsletter itself is one HTML renderer, `newsletter-render.ts` + `newsletter-styles.ts`, drawn in-app by `NewsletterArticle` and used by every parent/staff viewer, the mobile WebView and downloads) |
| Communication references | Messages: `variant="admin-garden"` renders the parent Garden inbox (`school-parent/messages/garden/*`) with `model.admin` (section rows, compose banner, Bulk message); `onFeedback` → `useAdminMessagesFeedback` (`lib/messages/admin-messages-feedback.ts`, events carry `retry`); `AdminMessagesBroadcastModal` = 3-step `GDialog`. Committees: `useCommitteesModel` + `garden/CommitteesGardenOverview`, workspace on the shared `GardenCommitteeWorkspaceLayout` with `CommitteeSurfaceProvider value="admin-garden"` (Garden sections + admin toasts), `garden/GardenCreateCommitteeDialog` (shares `useCommitteeCreateWizard` with the demo's story wizard) |
| Finances references | Transactions: `finances/useFinancesTransactionsModel` (server-paginated ledger, meta, attention dismiss, filters in the URL via `writeFilterParams`) + `FinancesTransactionsPage`. Revenue: `FinancesRevenuePage` on `usePaymentsHistoryModel` (`initialStatusFilter` / `initialTypeFilter`). Shared: `finances/garden/GardenPaymentsLedger` (table + phone cards, row opens drawer), `PaymentDetailDrawer` (read-only `GSidePanel`, status next step, Stripe ID `GardenCopyRow`), `FinancesStatusGuide`, `ledger-parts` |
| MudKitchen workspaces (not school-branded) | `/admin/research` and `/admin/marketing` use this kit with `MUDKITCHEN_ADMIN_GARDEN_THEME` (`src/components/admin/garden/theme.ts`). Marketing: shared header + route tab bar (`admin/marketing/garden/MarketingGardenHeader`, `compact` for studios), full-height studio frame (`MarketingStudioFrame`: rail + dot-grid stage, `overlays` render outside the Garden scope), `marketing-ui.tsx` (`MarketingCanvas` shield, `CopyChip`, `GardenSegmented` radiogroup, `StatusSegmented`, `SlideThumb` with an overlay link), models `useMarketingStudioModel`, `useMarketingScheduleModel`, `useBrandMarkStudioModel`, `useWebsiteBlogModel`, `useBlogTopicsModel`. The layout mounts one `GardenToaster`. |
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

- The admin shell stays as it is: the sidebar (`SchoolAdminStorySidebar`) and `SchoolAdminBaseline`. Only page content goes inside the frame. The shell's two overlays are already Garden and take `theme` from the Baseline: the Activity drawer (`AdminActivityNotificationsPanel` on `GSidePanel`, logic in `activity/useActivityNotifications`) and Get help (`AdminSupportRequestModal` on `GDialog`, logic in `support/useSupportRequestForm`). Get help is shared with the parent portal and the public apply/enrollment pages through `PortalHelpFab`, which needs `theme` too (`buildParentThemeTokens(branding)` where no parent theme exists).
- The admin attendance sheets (`AttendanceStudentDetailSheet`, `AttendancePickupSheet`) and `AdminDocumentationGuidePanel` are **not portalled**. Render them after the frame, or the Garden type reset restyles them.
- Unmigrated blocks go inside a card wrapped in `<PortalIsland>`. This is a temporary bridge; the Dashboard no longer has any.
- The page owns its padding through `ADMIN_GARDEN_CONTAINER_CLASS` (`max-w-[1320px]`, `gap-5`, `px-4 sm:px-8 lg:px-10`). Don't wrap it in the old `max-w-[1350px] px-[clamp(…)]` div in `[feature]/page.tsx`.
- A Suspense fallback that imports from the kit must be a `"use client"` file. A server component that imports a constant from a client module gets a reference proxy, not the value.

### 2.1 The skin (deep editors without forking)

Big tabs have deep story editors (form builders, checklists, co-op panels) shared with other admin pages. Don't rewrite them for Garden. `AdminGardenPage` (and `EnrollmentFlowsStoryShell`) mount `AdminGardenSkin` plus the `.sf-admin-garden-skin` class, and the shared primitives switch look only inside it:

- `AdminCard`, `AdminButton` (primary → solid accent, not toy), `AdminChip` → `GChip`, `AdminSectionKicker`, `AdminDisplayHeading`, `AdminTextLink`, `BuilderQuestionCard` / `BuilderSectionIntro`, `ConfirmDialog` → `GConfirmDialog`, `SchoolAdminSelect` → `GardenSelect`, `SchoolAdminDatePicker` → native date, `TuitionSubTabBar` → `GTabBar` (same test ids).
- Also skin-aware: `SchoolAdminSlideOverShell` → portalled `GSidePanel` (same props; ≥36rem widths become `size="xl"`), `SchoolAdminModalShell` → portalled into the Garden scope, `AdminMetricCard` → Garden tile, `SchoolAdminSegmentedControl` → Garden pills, `ParentChip` → `GChip`, `ParentCard` (default variant) → Garden card. Outside the skin they render exactly as before.
- Sheets passed in `AdminGardenPage overlays` only see the skin with `skinOverlays` (opt-in, so un-migrated overlays keep their look). Turn it on once every overlay on the page is skin-aware.
- Raw `<button style={getAdminButtonStyle(C, kind)}>` in admissions files became `DetailButton` (`admissions/detail-garden.tsx`); it reads the skin or the `SubmissionDetailStoryContext` "garden" variant.
- `garden.css` skin rules restyle raw inputs/textareas/selects, hand-rolled `[role=dialog][aria-modal]` panels, 9–11px story type and the Flows outline/canvas (`data-flows-*`). Opt out with `data-garden-skip`; `.sf-demo` is never touched.
- Anything that `createPortal`s to `<body>` must wrap its content in `SkinPortalScope`, or skinned buttons lose the Garden tokens.
- Outside the skin (Schedule, Teacher, the dashboard's attendance sheets) everything stays School Day Story. Shared components that need a different shell take `appearance="garden"` (`ApplicationSubmissionDetailPanel`, `StartEnrollmentModal`) or read the detail variant.

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
| **Live people list**: a paper stat strip (`<dl>`, tabular values, a pulsing forest `LiveDot` when someone is live, respecting `motion-reduce`); two lists side by side, each with a kicker and a count `GChip`; rows with initials avatar, name, meta, and a live `GChip` timer (`StaffHoursLiveElapsed`) or a tabular duration; paper empty state with the existing copy; a "+N more" `gLinkSm` that links to the full page; the repeated summary sentence kept as `sr-only` | `GardenStaffHoursCard.tsx` | Staff on shift, check-ins, pickups waiting, anyone "live right now" |
| **Legacy block**: `GCard` › `PortalIsland` › story component | (none left on the Dashboard) | Anything not yet migrated |
| **Lead strip**: solid accent `<button>` with ink border + toy shadow, kicker "Needs attention", one sentence from data, `gBtnOnAccent` pill | `ApplicationSubmissionsPageShell` › `ReviewNextStrip`, `EnrollmentFlowsOverview` | "Review next", "N programs need attention" |
| **Setup steps with inline CTA**: `GardenSteps`, the current step holds the toy CTA + requirement chips, `LiveDot` "Watching for updates" while polling, "Last checked" + Check status | `PaymentsSetupPage` › `StripeConnectCard` | Connect/onboarding flows |
| **Split editor**: list `GCard` (rows with status chip + meta) + editor `GCard` (`GTabBar`, Garden fields, inline validation) + `GardenSaveBar` (sticky only while dirty; Discard / toy Save) | `ProgramsPage` | Any list + edit page |
| **Review drawer**: `GSidePanel size="xl"` with `headerBelow` `GTabBar`, status chip in `headerAside`, sections as Garden cards via the detail variant, dialogs as `GDialog` | `ApplicationSubmissionDetailPanel appearance="garden"` | Record review / detail drawers |
| **Garden table**: `border-separate` table inside a `GCard`, uppercase 11px headers, accent-wash hover, selected wash, mint flash, refetch veil; stacked tappable cards below `md` | `ApplicationSubmissionsPageShell`, `GardenPaymentsHistory`, `students/StudentsPage` (`G_TABLE` / `gRowClass`) | Data tables |
| **List + detail**: strip `GardenStatTiles` that filter, a data `GardenNotice` ("N profiles to finish" → open the first), `GardenRecordList` + a detail card with `GTabBar`, inline edit with a toy Save, `?id=` in the URL | `staff/StaffPage`, `classrooms/ClassroomsPage` | Records with a profile + sub-sections |
| **Picker that keeps the selection on failure**: `GardenPickerSheet` with groups, search, "N selected", busy Save; `onSave` returns `run(...).ok` | Staff learners, Classroom staff/roster, Student classrooms | Any assign / add-to picker |
| **Undo instead of a confirm**: removals whose inverse API exists pass `successAction: { label: "Undo", … }` to `run` (toast stays 8s) | Staff unassign, Classroom remove staff/student, Friday Branch local deletes | Reversible removals |
| **Data-loss guard**: a failed load shows `GardenLoadError` and renders no editable form, so defaults can't be saved over real data | `friday-branch/useFridayBranchModel`, `tuition/TuitionLateFeeSettingsPanel`, School Profile | Any page that saves a whole document |
| **Two save modes made visible**: autosaving edits toast immediately; batched edits show `GardenSaveBar` with "N changed" + Discard | Friday Branch | Mixed immediate + batched editors |
| **Activity drawer**: `GSidePanel` with "N new" chip + Refresh + "Updated N min ago" in `headerAside`, category `GardenFilterChips` in `headerBelow` (no counts on a paginated list), day groups (`GardenGroupHeading`), `ROW_INTERACTIVE` rows with a pastel icon chip and an accent bar + "New" chip on the first N unread (count snapshotted on mount), inline load-more spinner / "Couldn't load older activity · Try again" that keeps the list, end-of-list note | `AdminActivityNotificationsPanel` | Feeds, inboxes, audit logs |
| **Server filters that roll back**: the model's `applyFilters` returns `"ok" \| "error" \| "stale"` (request-id ref, newest wins); on error with rows on screen the previous filters (and URL) come back and the page toasts "Couldn't filter payments · You're still seeing the previous list" + Retry. Load-more and Refresh return the same result; their error toasts say what stayed on screen | `useFinancesTransactionsModel` + `FinancesTransactionsPage` | Any paginated, server-filtered list |
| **Filters in the URL without a navigation**: `writeFilterParams({ status, type })` (`history.replaceState`, no server refetch, no history entry); read once on mount. Don't `router.replace` for filter chips on force-dynamic routes: it re-renders the server page, and comparing `useSearchParams` to state during render races the replace | `useFinancesTransactionsModel` | Filter chips, sort, view toggles |
| **Ledger + read-only drawer**: Garden table whose rows (and a title button for keyboard) open a `GSidePanel` with the amount, a `GardenNotice` saying what the status means now, `GardenFacts`, copyable references, and a link out | `GardenPaymentsLedger`, `PaymentDetailDrawer` | Payments, invoices, audit rows |
| **Mix card**: stacked share bar (`role="img"` with an `aria-label` of the shares) + one `ROW_INTERACTIVE` row per part (icon chip, amount, share bar, %) that filters the ledger below; rail card of outstanding counts that filter in place, with a link to the page that works them | `FinancesRevenuePage` | Breakdown of a total by category |
| **Long money values in tiles**: `GardenStatTiles valueClassName="text-[1.45rem] min-[420px]:text-[1.7rem] sm:text-[2rem] xl:text-[2.2rem]"`; put "count · amount" pairs as count value + amount `hint` so tiles fit at 375 | Finances tabs | Money KPIs |
| **Stage builder**: one editor at a time instead of outline + canvas + rail. `FlowStageStepper` (numbered stages, free navigation, amber dot from readiness) + `FlowStageFooter` (Back / Next, solid accent, not toy) + a final "Review & publish" stage that reuses `FlowReadinessSummary`. Stage is derived from focus (`builder-stages.ts`: `stageOfFocus`, `stageStatuses` from readiness items only), mirrored to `?stage=` with `history.replaceState`; live forms open on Questions, drafts on the first stage with a blocking item | `ApplicationFormsPage` (apply branch), `ApplicationFormReviewStage` | Long multi-part builders (the enrollment checklist builder is next) |
| **Family view editor**: the step drawn with the family Garden renderer itself (`ApplicationGardenSection` inside `ParentGardenScope theme={buildParentThemeTokens(branding)}`), so it can't drift from the family form; dashed tiles + an always-visible "✎ Edit" chip at rest; real inputs inside `inert` wrappers, a full-size overlay button per item opens its side panel, hover toolbar (move ↑/↓, Required, Delete); `data-family-preview` opts the subtree out of the skin's input/type rules; "Family view / Compact list" toggle in `localStorage` | `StepFamilyCanvas`, `ApplicationFormFocusCanvas` › `StepView`, `ChecklistItemFamilyView` (form items reuse the canvas; other types render the real `EnrollmentChecklistItemPanel mode="preview"` under one Edit overlay), toggle in `builder-view-mode.tsx` | Any builder whose output families see (signups, forms) |
| **Guided form dialog**: `GDialog` with a step strip in `headerExtra` (numbers turn into checks), numbered `StepSection`s, `G_TOGGLE` radiogroup with arrow keys instead of a select, dropzone with a drag-over state + paste-to-attach + thumbnail tiles, "We'll include" facts, footer status line + toy submit with `BusyLabel`, inline "Discard this request?" guard when dirty, in-dialog success with a recap and "Send another" | `AdminSupportRequestModal` | Support, feedback and report-a-problem forms |

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

- Admissions tabs read Supabase directly as well as `/api/*`. In a throwaway lab route, also stub `/rest/v1/<table>` (return arrays; return one object when `Accept` has `vnd.pgrst.object`). The Flows builders can be checked through `DemoAdminEnrollmentFlowsPage` (preview mode).

## 9. Anti-patterns

- Parent-style note-tile grids for admin work lists. Use rows.
- Toasting load failures, or leaving "Loading…" with no error path.
- An error toast and a success toast sharing one id.
- Inline callbacks passed into fetch hooks without refs (refetch loops).
- Garden markup with its own copy of the fetching or saving logic.
- Mounting the attendance or detail sheets or the guide panel inside `ParentGardenFrame`.
- Numbers that don't link anywhere; invented stats or claims in status lines.
- Importing client-module constants into a server component.
- Export art (marketing slides, brand marks, product demos drawn as images) inside the frame without a `.sf-demo` shield: the Garden type reset and the skin's 12.5px meta rule change what the preview shows. Keep the PNG export slots outside the frame entirely.
- Wrapping a slide or demo thumbnail in a `<Link>`: demos contain links, so nested `<a>` breaks hydration. Put the link on an absolutely positioned overlay sibling (`SlideThumb`).
