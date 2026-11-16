# Teacher mobile Garden: recipes

Copy-ready patterns from the teacher Home (`apps/mobile/src/components/teacher/home/garden/`). Open the named file for the full version.

---

## Time clock: dark card + live timer + one toy button (`sections/time-clock-card.tsx`)

```tsx
const clock = useTeacherTimeClock({ organizationId, slug, refreshKey, enabled: myHoursEnabled });

<GCard tone="dark" title="My hours" testID="teacher-home-my-hours-quick-card"
  action={<StatusPill clockedIn={clock.clockedIn} />}>      // white-on-dark pill, mint + AdminLiveDot when on
  {clock.clockedIn ? <Text style={timer}>{formatLiveElapsed(useLiveElapsed(start))}</Text> : <Text>Off the clock</Text>}
  <GKicker light>This week</GKicker>
  <GProgress value={clock.weekProgress} done={clock.weekProgress >= 1} label="This week: 12h 30m of 30h" />
  <GToyButton variant="white" size="md" label={clock.clockedIn ? 'Clock out' : 'Clock in'}
    loading={clock.clockActionPending != null} onPress={clock.clockedIn ? clock.clockOut : clock.clockIn} />
  <GLink label="View all hours" light onPress={openMyHours} />
</GCard>
```

- `useLiveElapsed` lives **in the card**, so only the card re-renders each second.
- `clockIn` / `clockOut` run through `useAdminAction` (`key: 'teacher-home-clock'`, `operation: 'my_hours.clock_in' | 'my_hours.clock_out'`, `retry: true`). The success spec is a function of the result, so the toast can say the real time and the logged minutes.
- In preview, `useGardenReadOnlyGate().notifyReadOnly()` replaces the action.

Reuse for: My Hours day view, shift check-in, anything with a running session.

## Today's list: numbered rows on notebook paper (`sections/today-list-card.tsx`)

```tsx
<GCard title="Start here" action={count > 0 ? <GChip label={`${count} to do`} tone="warning" /> : null}>
  <Text style={headline}>{focusHeadline(count)}</Text>
  {count > 0 ? (
    <View style={{ backgroundColor: Garden.notebook, borderRadius: 16, borderWidth: 1, borderColor: Garden.ink10, paddingHorizontal: 12 }}>
      {items.map((item, i) => (
        <AdminWorkRow key={item.id} step={i + 1} divider={i > 0} icon={focusItemIconName(item.icon)}
          tint={FOCUS_TINTS[item.icon]} title={item.title} meta={item.subtitle} ctaLabel="Open"
          onPress={() => feedback.openFocusItem(item.href)} />
      ))}
    </View>
  ) : (
    <CaughtUp />   // mint panel, GTick, existing copy, GHand "enjoy the quiet ✿"
  )}
</GCard>
```

`feedback.openFocusItem` pushes the native route, or calls `notifyWebOnly` when `resolveTeacherFocusHref` returns `null`.

## Class photo: faces grid (`sections/students-card.tsx`)

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
  {students.slice(0, 6).map((s, i) => (
    <GPressable accessibilityLabel={`${fullName}. ${subtitle}. View profile`} pressedScale={0.96}
      style={{ flexBasis: '30%', flexGrow: 1, maxWidth: '32%', borderRadius: 18, backgroundColor: PANEL_TINTS[i % 5] }}>
      <View style={{ padding: 3, borderRadius: 999, backgroundColor: Garden.white }}>
        <StudentPhoto name={fullName} photoUrl={s.profilePhotoUrl} size="lg" showHealthIndicator={s.hasStandingHealthItems} />
      </View>
      <Text>{firstName}</Text><Text numberOfLines={2}>{subtitle}</Text>
    </GPressable>
  ))}
</View>
{count > 6 ? <GLink label={`View all ${count} students`} onPress={openMyStudents} /> : null}
```

Reuse for: My Students, classroom rosters with photos, pickup lists. In a sheet with long lists, use `ClassroomRosterSheet` rows (`GSheet list` + `FlatList` `flex: 1`) instead.

## Linked day tiles (`sections/day-tiles-card.tsx`)

`AdminKpiTiles` with one tile per enabled feature. The bar colour signals state (butter = something to do, mint = done). A tile can switch a sub-tab (`feedback.showAttendance` → `setHomeTab('attendance')` with `haptic.select`) as well as push a route.

## Guide walkthrough sheet (`sheets/guide-sheet.tsx`)

- `GSheet` with the title, the summary as subtitle, and a `headerAside` chip ("4 steps" → "All done").
- Each step: a rail marker that is a checkbox (number → `GTick`), the current step's card with an accent border, `accent.wash` and an "Up next" chip, the description, the action as `GOutlineButton`, and a "Mark done" / "Undo" text action.
- Footer: "N of M steps ticked off" + `GProgress`. `haptic.success` when the last step is ticked.
- Step actions call `feedback.openGuideStep(closeSheet, href)`, which runs `closeThen` → route or `notifyWebOnly`.

Reuse for: onboarding checklists, how-tos, any multi-step help.

## Status line (`teacher-home-status.ts`)

```ts
teacherStatusLine({ focusCount, attendance /* null when off or not loaded */, clock /* null when off or not loaded */ })
// "2 things need you today · 9 of 14 not marked yet · On the clock since 8:02 AM"
```

Prefetch today's roster once (`queueMicrotask(() => void loadRoster())`) and keep the last summary per school + day in a module `Map` (cleared via `registerPortalMemoryClear`), so the line and the Attendance badge don't flicker when the provider remounts.

## Class photo with linked numbers (`students/garden/teacher-my-students-screen.tsx`)

- `FlatList numColumns={3}` of `StudentFaceTile` (tile width from `useWindowDimensions`), `ListHeaderComponent` = number strip → search → `GKicker` + `AdminFilterChips` rows → "Showing N of M · Clear".
- Number strip: one row of `GPressable` cells (value + label + coloured top bar); a cell sets the roster filter via `feedback.applyTileFilter`, and the active one gets `accent.clay` border + `accent.wash`.
- Footer: "Show more (N remaining)" `GOutlineButton`, else `AdminEndLine` ("That's everyone" / "That's every match").

## Reusing a parent Garden screen with a teacher controller

```tsx
<ParentCalendarGardenScreen controller={teacher.screen} agendaTitle="School agenda" portal={TEACHER_CALENDAR_PORTAL} manage={manage} />
<ParentMessagesGardenScreen controller={teacherInbox} onStudentPress={openStudent} />
<ParentMessageThreadGardenScreen {...props} useController={useTeacherMessageThreadController} onStudentPress={openStudent} />
```

Keep every teacher `reportError` operation in the teacher controller; the shared view never hard-codes a portal's operation names or testIDs.
