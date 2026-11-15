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
- **Top row:** an 11px uppercase kicker and a 28pt white icon circle with an ink ring.
- **Body:** bottom-aligned (`justifyContent: 'flex-end'`).
- **Number:** Bricolage 44.
- **Empty widgets:** still tappable, with a calm caption such as "No upcoming events right now.".

## Urgent strip (`sections/urgent-strip.tsx`)

```tsx
<GPressable
  accessibilityLabel={`${item.title}. ${item.subtitle}. Open`}
  haptic="press"
  onPress={() => openAttentionItem(ctx, item)}
  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, backgroundColor: accent.clay }}>
  <View style={{ flex: 1 }}>
    <Text style={{ fontFamily: GardenFonts.bodyExtra, fontSize: 17, color: Garden.white }}>{item.title}</Text>
    <Text style={{ fontFamily: GardenFonts.bodySemi, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{item.subtitle}</Text>
  </View>
  <OpenPill /> {/* visual-only white toy pill: ink underlay + 2px ink border */}
</GPressable>
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
<GSheet visible={open} onClose={close} kicker="From school" title="School bulletin" subtitle="3 posts">
  {posts.map((post) => <PostCard key={post.id} post={post} />)}
</GSheet>

// Virtualized feed: pass `list`, and the list MUST fill.
<GSheet
  visible={open}
  onClose={close}
  list
  kicker="Notifications"
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
