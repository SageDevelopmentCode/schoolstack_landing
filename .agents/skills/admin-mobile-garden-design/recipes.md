# Admin mobile Garden: recipes

Copy-ready patterns from the admin Dashboard (`apps/mobile/src/components/school-admin/dashboard/garden/`) and the shared roster (`apps/mobile/src/components/attendance/`). Open the named file for the full version.

---

## Work queue: lead strip + numbered rows + caught-up (`sections/overview-sections.tsx` › `FocusQueueCard`)

```tsx
const [lead, ...rest] = items;
<GCard title={focusTitle(items.length)} testID="dashboard-focus-queue">
  {lead ? (
    <>
      <AdminLeadStrip
        testID={`dashboard-focus-${lead.id}`}
        icon={FOCUS_ICONS[lead.icon]}
        title={lead.title}
        subtitle={lead.subtitle}
        pillLabel={ctaText(lead.ctaLabel)}
        onPress={() => feedback.openHref(lead.href)}
      />
      {rest.map((item, i) => (
        <AdminWorkRow key={item.id} step={i + 2} divider={i > 0} icon={FOCUS_ICONS[item.icon]}
          tint={FOCUS_TINTS[item.icon]} title={item.title} meta={item.subtitle}
          ctaLabel={ctaText(item.ctaLabel)} onPress={() => feedback.openHref(item.href)} />
      ))}
    </>
  ) : (
    <CaughtUpPanel />   // mint, GTick, one GHand line
  )}
</GCard>
<GCelebrate active={items.length === 0 && !isPreview} celebrationKey={`admin-dashboard-caught-up-${slug}`} />
```

Reuse for: applications to review, unpaid invoices, unsigned forms, open sign-ups.

## Web-only taps (`use-admin-dashboard-feedback.ts`)

```ts
const openHref = (href: string) => {
  if (!navigateToHref(href)) notifyWebOnly(toast, { webPath: href, reportError });
};
```

`navigateToHref` (controller) returns `false` when `resolveSchoolAdminNativeRoute` has no route.

## Setup stepper (`SetupStepsCard`)

`GProgress` + `n/N` chip, then `GStepList` with `state` `done | current | todo`, a "Next" chip on the current step, an "In progress" chip and a live note (`AdminLiveDot` + "Watching for Stripe updates every minute") while the controller polls. Each step's `onPress` calls `notifyWebOnly` with `setupStepWebPath(slug, step.id)`.

## Linked KPI tiles (`KpiCard`, `admin-ui.tsx` › `AdminKpiTiles`)

```tsx
<AdminKpiTiles tiles={metrics.map((m) => ({
  id: m.id, label: m.label, value: m.value, barColor: METRIC_BARS[m.accent],
  onPress: () => feedback.openMetric(m),   // metricRoute → push, else notifyWebOnly
}))} />
```

Values count up (`GCountUp`) when they parse as numbers ("$1,250", "22"), keeping prefix, suffix, decimals and grouping.

## Live people list (`sections/staff-hours-card.tsx`)

`AdminStatStrip live` (pulsing dot on the first stat) → "Clocked in" group (`GKicker` + count chip; rows with a pastel initials avatar and a live `GChip` timer from `useLiveElapsed`) → "Completed today" (tabular in–out and duration) → "+N more on Staff hours" `GLink`. Empty groups keep the existing copy on paper.

## Copy-link row (`QuickActionsCard` + `copyApplyLink`)

```ts
action.run(() => Clipboard.setStringAsync(url), {
  key: `copy-apply-link-${quick.id}`,
  operation: 'school_admin_copy_apply_link',
  success: { title: 'Apply link copied', description: 'Paste it anywhere families will see it.' },
  error: { title: "Couldn't copy the link", description: `Copy it by hand: ${url}` },
  retry: true,
});
// Row: copied = flashKey === key → "Link copied", check icon, mint wash.
```

## Activity feed sheet (`dashboard/admin-activity-notifications-sheet.tsx`)

`GSheet list` + `SectionList` (`style={{ flex: 1 }}`) grouped with `notificationGroupLabel`, sticky `GKicker` headers on cream, `ActivityRow` (pastel category icon chip, category chip + relative time, title / detail, "{cta} →"). The newest *N* rows (unread count frozen at open) get a "New" chip and `accent.wash`; `headerAside` flips "N new" → "Marked as read". Skeleton rows, mint empty panel, error + toy Try again, dashed "That's everything for now" end line, paging on `onEndReached`.

## Roster board (`attendance-roster-panel.tsx`, `attendance-garden-ui.tsx`)

- `AttendanceDateStepper`: 44pt prev/next (`haptic.select`), date in Bricolage + "Today" chip, existing subcopy, `GProgress` "N left to mark" / "All marked", "Jump to today".
- `AttendanceSearchField` (pill, clear button), `AttendanceFilterChips` (radio chips "Label · N", zero counts hidden except All and the active one).
- `AttendanceStudentRow`: avatar + first name + status chip + time meta opens details; one action pill (accent "Mark Present", outline "Pickup", muted "Picked up"); `flash` mint after save.
- Saves go through `useAttendanceSave()` → `save(student, kind, { silent? })` and `announce()` for after a sheet closes.
- Empty: existing copy + "Show everyone" (filter/search) or "Try again" (error).

## In-sheet status (`attendance-detail-sheet.tsx`, `attendance-pickup-sheet.tsx`)

```ts
const ok = await save(student, 'pickup', { selection, pickupName, silent: true });
if (ok) closeThen(onClose, () => announce(student, 'pickup', pickupName));
else setSaveError("The pickup wasn't recorded. Check your connection, then try again.");
```

Detail sheet: status `GChip` in `headerAside` (→ "Marked present" after a save), day card, three action buttons with the original labels, history list that refetches when the record changes. Pickup sheet: radio contact cards, footer status line + one toy "Confirm pickup".

## Form sheet with in-sheet status (`garden/admin-sheet.tsx` › `AdminFormSheet`)

```tsx
<AdminFormSheet visible={open} onClose={close} title="Add staff" isDirty={dirty} saving={saving}
  canSave={valid} saveLabel="Add staff" statusLine={missing.length ? `Still needed: ${missing.join(', ')}` : 'Ready to add'}
  notice={notice} onSave={submit}>
  <GTextField … />
</AdminFormSheet>
```

Submit runs `action.run(fn, { silent: true, error: (err) => { failure = errorText(err, '…'); return {…}; } })`; on failure set `notice` (what did not change); on success `closeThen(close, () => toast.success(…))`. Used by Add staff, Add / Edit classroom, Events, Invite member, Duty role, Create committee.

## Picker sheet (`garden/admin-picker-sheet.tsx`)

`AdminPickerSheet items={[{ id, title, meta, group, searchText, leading }]} mode="multi" | "single"` with `loading` / `loadError` / `onRetryLoad`, `top` for extra controls (role chips), `saveLabel={(n) => \`Assign (${n})\`}`. `onSave` resolves `true` to let the parent close it; `false` keeps it open with `notice`. Replaces the Story staff / student / classroom pickers.

## Photo upload steps (`gallery/garden/admin-photo-upload-sheet.tsx`)

The pipeline lives in `lib/school-gallery/use-gallery-upload.ts` (shared with the teacher Story sheet). The Garden sheet shows it as `GStepList` (Photo date → Choose photos → Upload) + `GProgress` from `prepareIndex/prepareTotal` and `chunk`, an in-sheet error, and "Retry remaining (n)" for partial failures; `onComplete` closes and toasts the count.

## Schedule month grid (`schedule/garden/schedule-garden-ui.tsx`)

`AdminScheduleMonthGrid` = Garden version of `ScheduleMonthCalendar` (same day states): `editable` for availability (open accent wash, booked butter, open + booked stripe, closed dashed, past disabled) or dot mode for events; 44pt month nav, "Today" jump, spoken day labels. `AdminScheduleLegend` matches. Day sheets keep optimistic toggles with rollback and an in-sheet "Saved" chip, then one toast when the sheet closes.
