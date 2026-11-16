# Parent mobile Garden: recipes

Copy-ready patterns from the Home Hub (`apps/mobile/src/components/parent/home/`). The source file is named in each heading; open it for the full version.

---

## Screen frame: tab route with a cream background under the status bar (`parent-home-hub.tsx`)

```tsx
const insets = useSafeAreaInsets();
const accent = useGardenAccent();

return (
  // The parent layout's SafeAreaView pads the top. Pull only the background up so the
  // iOS refresh spinner (inside the ScrollView) stays below the status bar.
  <View style={{ flex: 1, backgroundColor: Garden.cream, marginTop: -insets.top, paddingTop: insets.top }}>
    <StatusBar style="dark" />
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}
      refreshControl={
        <RefreshControl refreshing={props.isRefreshing} onRefresh={props.onRefresh} tintColor={accent.clay} />
      }>
      {/* header, summary, cards */}
    </ScrollView>
    {/* sheets go here, outside the ScrollView */}
  </View>
);
```

Screens pushed inside the More stack are clipped by the native stack. Drop the negative margin there and use `paddingTop: 12`.

## Controller → Garden screen (`use-parent-home-screen-controller.ts`, `parent-home-garden-screen.tsx`)

```ts
export type XScreenController =
  | { status: 'loading'; data: null; error: string | null; refresh: () => Promise<void> }
  | { status: 'error'; data: null; error: string; refresh: () => Promise<void> }
  | { status: 'empty'; data: null; error: string | null; refresh: () => Promise<void> }
  | { status: 'ready'; data: XData; error: string | null; refresh: () => Promise<void>; props: XProps };
```

- The controller owns data hooks, fetches, `reportError` and every `router.push` / `replace`. It returns plain props and callbacks.
- It takes an `onUnresolvedNavigation` option, so the screen can toast when a route resolves to `null`.
- The Garden screen picks the state to render:
  - `loading` → a `GSkeleton` layout
  - `error` → `GErrorCard` + `haptic.error`
  - `ready` → the view

```tsx
export function XScreen({ slug }: { slug: string }) {
  const toast = useGardenToast();
  const controller = useXScreenController(slug, {
    onUnresolvedNavigation: () => notifyUnresolvedNavigation(toast),
  });
  return <XGardenScreen controller={controller} />;
}
```

## Feedback hook: refresh toast (`use-parent-home-feedback.ts`)

```ts
const pendingRefresh = useRef(false);
const wasRefreshing = useRef(props.isRefreshing);

const refreshWithFeedback = useCallback(() => {
  haptic.select();
  pendingRefresh.current = true;
  props.onRefresh();
}, [props.onRefresh]);

useEffect(() => {
  const finished = wasRefreshing.current && !props.isRefreshing;
  wasRefreshing.current = props.isRefreshing;
  if (!finished || !pendingRefresh.current) return;
  pendingRefresh.current = false;
  if (error) {
    toast.error("Couldn't refresh Home", {
      id: 'home-refresh',
      description: 'Check your connection, then try again.',
      action: { label: 'Try again', onPress: refreshWithFeedback },
    });
  } else {
    toast.info('Home is up to date', { id: 'home-refresh', durationMs: 2600 });
  }
}, [error, props.isRefreshing, refreshWithFeedback, toast]);
```

The data context already reports the load error. The toast is only for the parent.

## Widget grid (`parent-home-hub.tsx` › `Widget`)

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
  <Widget
    kicker="Forms"
    tint={Garden.mint}
    icon="document-text-outline"
    accessibilityLabel={`Forms, ${counts.needsAction} need action, ${counts.signed} signed`}
    accessibilityHint="Shows your family's forms"
    onPress={() => setFormsOpen(true)}>
    <GCountUp value={counts.needsAction} style={styles.bigNumber} />
    <Text style={styles.widgetCaption}>Needs action</Text>
    <Text style={styles.widgetMeta}>Signed · {counts.signed}</Text>
  </Widget>
  {/* 3 more */}
</View>
```

Each `Widget` is a `GPressable` with `pressedScale={0.96}`, `flexBasis: '45%'`, `minHeight: 150`, `borderRadius: 22`, a 1.5 `ink12` border and a 3px soft shadow:
- **Top row:** an 11px uppercase tile label and a 28pt white icon circle with an ink ring. (A tile label is the tile's only name, so it is not an eyebrow.)
- **Body:** bottom-aligned (`justifyContent: 'flex-end'`).
- **Number:** Bricolage 44.
- **Empty widgets:** still tappable, with a calm caption such as "No upcoming events right now.".

## Urgent strip (`sections/urgent-strip.tsx`)

```tsx
// Kit version: garden/accent-strip.tsx
<GAccentStrip
  title="Set photo permissions"
  subtitle="Choose how the school may use photos of Maya and Leo."
  pillLabel="Start"
  onPress={openSheet}>
  <GSegmentDots done={1} total={2} onDark /> {/* optional extra content */}
</GAccentStrip>
```

The strip itself is the one button. Don't nest a real `GToyButton` inside another pressable.

## Ticket row (`sections/event-ticket.tsx`)

- A paper row, radius 16, `overflow: 'hidden'`.
- Two 18pt circles at `left: -9` / `right: -9`, coloured like the surface behind the ticket, make the notches.
- Contents: `<DateStamp date={event.date} />`, then `<GDashedRule vertical color={Garden.ink25} />`, then the title (Nunito 800 15) and `eventWhen(event)` (13 soft).
- The whole row is a `GPressable` labelled `"{title}, {when}. Open family calendar"`.

## Notebook list (`sections/family.tsx` › `FormsNotebookList`)

- Container: `Garden.notebook` background, radius 14, 1px `ink10` border, `overflow: 'hidden'`.
- Rows: `GPressable` with `pressedScale={0.99}` and `minHeight: 56`. Every row except the first gets a `borderTopWidth: 1` in `rgba(46,74,60,0.1)`.
- Left: `GTick` when done, `GRing` when not. Middle: title + meta (`names · Due Nov 20`, overdue in `#7E4533`). Right: a chevron.
- Above the list: `GChip` counts (`Needs action · n` warning, `Signed · n` success).

## Polaroid carousel (`sections/family.tsx` › `ChildrenSection`)

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  snapToInterval={cardWidth + 12}
  decelerationRate="fast"
  style={{ marginHorizontal: -18 }}                  // bleed to the GCard edge
  contentContainerStyle={{ gap: 12, paddingHorizontal: 18, paddingVertical: 4 }}>
  {children.map((child, i) => <ChildMiniCard key={child.applicationId} width={cardWidth} index={i} … />)}
</ScrollView>
```

- `cardWidth = Math.min(320, windowWidth - 32 - 36 - 28)`, which leaves a peek of the next card.
- With only one item, render it stacked instead of in a carousel.

## Detail sheet from a widget (`parent-home-hub.tsx`)

```tsx
const closeThen = (close: () => void, action: () => void) => {
  close();
  setTimeout(action, 220); // let the native modal dismiss before navigating or toasting
};

<ParentBottomSheet visible={formsOpen} onClose={() => setFormsOpen(false)} title="Your family's forms" subtitle="Forms & documents">
  <FormsCounts snapshot={snapshot} />
  <FormsNotebookList snapshot={snapshot} max={10}
    onOpenForm={(id) => closeThen(() => setFormsOpen(false), () => props.onOpenForm(id))} />
  <GToyButton label="View all forms" fullWidth
    onPress={() => closeThen(() => setFormsOpen(false), props.onViewAllForms)} />
</ParentBottomSheet>
```

## Jump-to grid (`parent-home-hub.tsx` › `JumpToCard`)

- Build the links from data. Resolve each one with `resolveParentWebParentHrefToMobileRoute(slug, href, { programSlug })` and drop any that are `null`, as well as the current screen.
- Bottom-tab routes `router.replace` (like the tab bar); everything else `router.push`.
- Tile: `flexBasis: '30%'`, paper background, 1.5 `ink10` border, radius 16, a 36pt pastel icon circle with an ink ring, and a 13px label.

## Read-only preview

```tsx
onPress={() => {
  if (ctx.feedback.readOnly) return ctx.feedback.notifyReadOnly();
  props.onOpenChildDetails(child.applicationId);
}}
```

Only gate the actions that were already disabled in preview (`StoryButton` without `previewSafe`). Navigation that was allowed stays allowed.

## Celebration

```tsx
<GCelebrate
  active={model.isCaughtUp && !props.isPreview}
  celebrationKey={`parent-home-caught-up-${slug}-${programSlug ?? 'main'}`}
/>
```

Mount it once at the screen root, as an absolute overlay. It fires once per app session per key and is skipped under reduced motion and E2E.

## Garden sheet (`garden/sheet.tsx`)

```tsx
// Card feed: the shell scrolls for you.
<GSheet visible={open} onClose={close} title="School bulletin" subtitle="3 posts">
  {posts.map((post) => <PostCard key={post.id} post={post} />)}
</GSheet>

// Virtualized feed: pass `list`, and the list MUST fill.
<GSheet
  visible={open}
  onClose={close}
  list
  title="Recent school activity"
  headerAside={markedRead ? <GChip label="Marked as read" tone="success" icon="checkmark" /> : <GChip label="3 new" tone="info" />}
  footer={<GLink label="Notification settings" icon="settings-outline" onPress={openSettings} />}>
  <SectionList style={{ flex: 1 }} sections={sections} stickySectionHeadersEnabled … />
</GSheet>
```

Day groups for feeds (`home/sheets/notification-groups.ts`):

```ts
notificationGroupLabel(createdAt) // 'Today' | 'Yesterday' | 'Earlier this week' | 'Earlier'
```

## No eyebrows (skill §3.14)

```tsx
// ✗ Repeats the tab and the title
<GBackHeader kicker="Account & preferences" title="Notification settings" … />
<GCard kicker="Family notifications" title="Notification emails">

// ✓ The title says it
<GBackHeader title="Notification settings" accentWord="Notification" subtitle="…" … />
<GCard title="Notification emails" action={<GChip label="2 of 3" />}>

// ✓ A label that carried data moves into the title, subtitle or a chip
<GCard title={isToday ? `Today · ${heading}` : heading}>
<GSheet title={resource.title} headerAside={<GChip tone="neutral" label={typeLabel} />}>
```

## Photo day grid (`photos/garden/photo-day-grid.tsx`)

- The screen is a `FlatList` of day groups (`groupGalleryPhotosByDate`), not a `ScrollView` with a hand-rolled scroll threshold: `onEndReached` loads more, `ListHeaderComponent` holds the header and cards, `ListFooterComponent` holds a 3-tile skeleton, a load-more `GInlineBanner` with "Try again", or a dashed "That's every photo for now" line.
- Day row: Nunito 800 16 label ("Today", "Yesterday", or the full date), a "Latest" success chip on the newest day, and a count chip pushed right.
- Tiles: `photoTileSize(contentWidth)` with a 6pt gap, radius 14, 1pt `ink10` border. Each tile is a `GPressable` (press and long-press open the viewer) labelled "Photo 2 of 6 from Friday, November 14, 2026". A `GSkeleton` sits under the image until `onLoad`; a failed image shows a placeholder and calls `reportMobileMediaLoadFailure`.
- The viewer gets the photos in grid order, so swiping matches what the parent sees.

## Choice sheet (`photos/garden/photo-permissions-sheet.tsx`)

```tsx
<GSheet
  visible={open}
  onClose={requestClose}                 // dirty → confirmDestructive('Discard your changes?')
  enableDragToDismiss={!dirty && !saving}
  title="Photo permissions"
  subtitle="… Nothing changes until you save."
  headerAside={<GChip tone={allChosen ? 'success' : 'info'} label={`${chosen} of ${total}`} />}
  footer={
    <>
      <Text accessibilityLiveRegion="polite">{statusText}</Text>   {/* "2 changes ready to save." */}
      <GToyButton label="Save permissions" size="md" fullWidth loading={saving} disabled={!canSave} … />
    </>
  }>
  {/* per person: name + "Saved: Full consent", then radio option cards (accessibilityRole="radio", haptic="select") */}
</GSheet>
```

- Drafts reset each time the sheet opens. Only changed rows are saved (`Promise.allSettled`), rows that saved stay saved, and failures stay selected with a "Not saved" chip and a `GInlineBanner` naming them.
- All saved: `closeThen(close, () => toast.success('Photo permissions saved', { description: 'Maya: Full consent · Leo: Limited consent' }))`. Saved rows on the screen get a mint wash and a "Saved" chip for 2.6s; the first time everything is set, `GCelebrate` fires.
- Gate the button that opens the sheet with `useGardenReadOnlyGate().guard` so a preview toasts instead.
