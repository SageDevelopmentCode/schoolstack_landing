---
name: parent-mobile-garden-design
description: >-
  "Garden" design system for the school-branded PARENT portal in the Expo app
  (apps/mobile). Use whenever building, redesigning or restyling any parent
  screen under apps/mobile/src/app/parent/** or
  apps/mobile/src/components/parent/** (Home, Billing, Messages, Calendar,
  Children, Forms, Committees, Photos, etc.), when asked to "match the mobile
  Home", "use the mobile Garden kit", or to migrate a parent mobile tab off
  School Day Story. Covers the components/parent/garden kit, colour and type,
  phone-first rules, the feedback contract (haptics, toasts, celebrate),
  screen anatomy, recipes from the Home Hub and a migration checklist.
  Mobile counterpart of parent-portal-garden-design (web) and
  mudkitchen-garden-design.
---

# Parent portal on mobile: Garden

The parent **Home Hub** is the reference build. Every parent mobile tab should end up looking and behaving like it:
- `apps/mobile/src/components/parent/home/parent-home-hub.tsx` (`ParentHomeHub`)
- its sections in `apps/mobile/src/components/parent/home/sections/`

**The look in one line:** the web parent Garden dashboard (Bricolage display type, Nunito body, cream paper, pastel note tiles, tape, toy buttons) in the **school's own accent colour**, rebuilt for a thumb: big tap targets, everything one tap away, and feedback on every action.

It must feel like a calm everyday app, not a marketing page:
- Short header, with no eyebrow above the title.
- The important things above the fold. On the Home that is a 2×2 widget grid.
- Everything in cards.
- Details open in sheets or pushed screens, not long inline lists.

Related skills:
- `.agents/skills/parent-portal-garden-design`: the web version. Use the same tokens and copy, and keep behaviour parity between web and mobile.
- `.agents/skills/mudkitchen-garden-design` (`in-app.md`): Garden tokens and the portal/brand split.
- `apps/mobile/AGENTS.md`: keyboard layouts, operational error reporting, WebViews and links. All of it still applies.
- `.agents/skills/mobile-ui-visual-verify`, `.agents/skills/mobile-e2e-local`: verification.
- School admin mobile screens use this kit through `.agents/skills/admin-mobile-garden-design` (admin density, work queue, linked KPIs, save/retry contract). The shared attendance roster (`components/attendance/*`) is Garden in every portal. Other teacher mobile screens stay on **School Day Story** (`apps/mobile/src/components/story/*`) unless asked.

Detailed snippets for each recipe are in **`recipes.md`**.

---

## 1. Where things live

All paths are under `apps/mobile/src/`.

| Path | What |
|---|---|
| `components/parent/garden/tokens.ts` | `Garden` hexes, `GardenFonts`, `NOTE_TINTS`, `PANEL_TINTS`, `CHIP_TONES`, `PORTAL_EASE`, `CARD_SHADOW`, `useGardenAccent()`, `mixIntoPaper`, `withAlpha` |
| `components/parent/garden/ui.tsx` | The kit (§4) |
| `components/parent/garden/segmented.tsx` | `GSegmented` (tab bar with a gliding accent pill) |
| `components/parent/garden/toast.tsx` | `GardenToastProvider`, `useGardenToast()` |
| `components/parent/garden/celebrate.tsx` | `GCelebrate` (confetti + success haptic, once per session per key) |
| `components/parent/garden/sheet.tsx` | `GSheet`: Garden bottom sheet (cream, Bricolage title + subtitle, 44pt close, optional status chip and footer, `enableDragToDismiss={false}` while there is unsaved work) |
| `components/parent/garden/accent-strip.tsx` | `GAccentStrip`: the urgent strip (solid accent, white Open pill, optional `children` such as progress pills) |
| `components/parent/garden/back-header.tsx` | `GBackHeader`: header for screens pushed inside the More stack (back link, title with one accent word, subtitle) |
| `lib/haptics.ts` | `haptic.tap / select / press / success / warning / error`. A safe no-op without the native module and under E2E. |
| `components/parent/parent-portal-shell.tsx` | Mounts `GestureHandlerRootView` and `GardenToastProvider` around the whole parent shell (screens, tab bar and More sheet) |
| `components/garden-nav/garden-tab-bar.tsx` | `GardenTabBar`: the bottom tab bar shared by **every** portal (parent, teacher, school admin, platform admin). Attached to the screen bottom (paper, hairline top rule, fills the home-indicator area by sitting at `bottom: -insets.bottom` inside the layout `SafeAreaView`); an accent pill glides to the active tab. Short labels ("Billing / tuition" → "Billing") with the full label as the a11y label, so Maestro text taps keep matching. `sheetOpen` turns the More icon into a chevron; `header` adds a row inside the bar (parent co-op chip). `GARDEN_TAB_BAR_HEIGHT` is the part above the safe-area edge: layouts pad content by it. |
| `components/garden-nav/garden-more.tsx` | The More sheet kit for every portal: `GardenMoreSheet`, `GardenMoreSectionTabs`, `GardenProfileCard`, `GardenMoreGrid` (equal-height pastel tiles in rows of two + "Open now"), `GardenSelectionRow` (Program / Account switchers), skeletons, `isMoreItemPathActive` |
| `constants/app-fonts.ts` | Registers Bricolage 800, Nunito 400/600/700/800 and Gochi Hand in `APP_FONTS` |
| `components/parent/home/*` | The reference screen. See §5 for the controller → model → view split. |

## 2. Colour and type

```tsx
const accent = useGardenAccent();
// accent.clay      → theme.primary (the school's colour; web --sf-clay)
// accent.clayDeep  → theme.primaryDark (small accent text, links)
// accent.peach     → 16% accent mixed into paper
// accent.wash      → 8% accent mixed into paper
```

- **Never hard-code a school colour or Garden clay.** Actions, pills, progress fills, badges and the dark card all use `accent.*`.
- **Pastels** (`Garden.butter / sky / lav / mint / peach`) are fixed Garden hexes. Use them for widgets, note tiles, chips and icon circles. Don't build pastels by mixing the accent: on a purple school `accent.peach` read as muddy grey, so the exact pastel won.
- **Neutrals:**

  | Token | Use |
  |---|---|
  | `Garden.cream` | Screen background |
  | `Garden.white` / `Garden.paper` | Cards |
  | `Garden.ink` | Text |
  | `Garden.soft` | Meta text |
  | `Garden.ink10`–`ink25` | Hairlines and borders |

- **Contrast:**
  - Small accent-coloured text on a pastel uses `accent.clayDeep`, never `accent.clay`.
  - On the accent strip and the dark card, text is white or `rgba(255,255,255,0.85)`.
- **Type** (`GardenFonts`):

  | Role | Font | Sizes |
  |---|---|---|
  | `display` | Bricolage 800 | Greeting (32 / 26 compact), card titles (22), big numbers (44), child names (21) |
  | `bodyExtra` | Nunito 800 | Item titles (15–17), buttons (14–16), field and group labels (`GKicker`: 11, uppercase, letterSpacing 2) |
  | `bodySemi` / `bodyBold` | Nunito 600 / 700 | Meta (12–13), body copy (14) |
  | `hand` | Gochi Hand | One decorative line, only in empty or celebration states, via `GHand`, which is hidden from screen readers |

## 3. Phone-first rules (non-negotiable)

1. **One `GToyButton` per view.** It has a 2px ink border and a hard ink offset. A visual "Open" pill inside a tappable strip counts as that one. Secondary actions use `GOutlineButton`; text actions use `GLink`.
2. **Tap targets of at least 44pt.** Small things get `hitSlop` (`GPressable` defaults to 4, `GLink` to 10). Whole rows and tiles are the tap target, and their `accessibilityLabel` contains the title.
3. **Everything tappable goes through `GPressable`.** It gives scale-on-press plus a haptic, and it requires an `accessibilityLabel`. Pick the haptic:

   | Haptic | When |
   |---|---|
   | `tap` (default) | Any press |
   | `select` | Tab, chip, pager or step changes |
   | `press` | The primary action |
   | `none` | No haptic |

4. **No tilt on data.** Only photos may tilt (±3°, as `ChildThumb` does). Note tiles are taped but never rotated.
5. **At most one dark card per screen** (`GCard tone="dark"`, background `accent.clayDeep`). Pastels go on small things only.
6. **Reduced motion.** Every animation reads Reanimated `useReducedMotion()` and renders the final state. Layout animations (`FadeInDown`, …) follow `ReduceMotion.System` by default.
7. **Motion timing:** entrance `FadeInDown.delay(40 + index*50).duration(320).easing(PORTAL_EASE)`, built into `GCard`. Springs only for press feedback and pill indicators.
8. **Android hard shadows:** don't rely on `shadowOffset` with `shadowRadius: 0`. `GToyButton` draws a real ink underlay `View` so it looks the same on both platforms. Copy that if you need a hard offset elsewhere.
9. **Dashed lines:** iOS can't dash a single border side. Use `<GDashedRule />` (or `vertical`).
10. **Lists inside sheets:** use `<GSheet list>` and give the `FlatList` / `SectionList` `style={{ flex: 1 }}`. Never `flexGrow: 0` there: the list then has no height and the sheet looks blank. (`BottomSheetShell`'s `scrollable={false}` path itself used to collapse to 0pt for the same reason; it now sets explicit `flexGrow: 1`.)
11. **Safe area:** the parent layout's `SafeAreaView` already pads the top edge.
    - On a **tab route** (Home, Billing, …) pull only the background up: root `marginTop: -insets.top, paddingTop: insets.top`. Cream then runs under the status bar. Keep the `ScrollView` below the inset or the iOS refresh spinner hides under the status bar.
    - Screens pushed inside the **More stack** are clipped, so the trick does nothing there. Just use `paddingTop: 12`.
    - `RefreshControl`'s `progressViewOffset` is Android-only.
12. **Status bar:** `<StatusBar style="dark" />` on cream screens.
13. **Copy:** factual strings come from data or existing web/mobile copy. Don't invent claims or numbers.
14. **No eyebrows.** Never put a small uppercase label above a screen, card or sheet title ("Account & preferences" over "Notification settings", "Family notifications" over "Notification emails"). It repeats the tab or the title and adds noise. `GBackHeader`, `GCard`, `GErrorCard` and `GSheet` have no `kicker` prop for this reason.
    - A card with only a label: make that label its `title`.
    - A label that carries data moves rather than disappears: a date goes in the subtitle or a meta line ("Today · Friday, Nov 14"), a type, term or status goes in a `GChip` (`action` on a card, `headerAside` on a sheet).
    - `GKicker` is still right for a **field label** inside a card ("Date", "Location", "Login email"), a **group label** in a list ("Today", "Earlier editions"), and the small label on a Home widget tile.

## 4. Kit reference (`components/parent/garden/ui.tsx` unless noted)

| Export | Use / key props |
|---|---|
| `GPressable` | Every tappable: `accessibilityLabel` (required), `haptic`, `pressedScale`, `hitSlop` |
| `GCard` | Every section: `title`, `action`, `tone` (`white` \| `paper` \| `dark`), `index` (entrance stagger), `onLayout(y)`, `testID`. No eyebrow (§3.14). |
| `GKicker` | Uppercase **field or group label** only (`light` on dark). Never above a title. |
| `GHand` | The one decorative handwritten line |
| `GChip` | Status/count chip: `tone` `success` \| `warning` \| `alert` \| `info` \| `neutral`, optional `icon` |
| `GIcon` | Ionicon in a white circle with an ink ring (`sm` 32 / `md` 44 / `lg` 56) |
| `GTick` / `GRing` | Done tick (forest on mint) and empty to-do ring |
| `GBadge` | Count badge, positioned absolutely on an icon button |
| `GDashedRule` | Dashed hairline (`vertical`) |
| `GTape` | Decorative tape strip |
| `GNoteTile` | Pastel note: `tint`, `title`, `subtitle`, `icon`, `onPress`, `tape`, `trailing`, `children` |
| `GProgress` | Animated ink-outlined bar: `value` 0..1, `label` (required, a11y), `done` (forest) |
| `GSegmentDots` | Setup pills: `done`, `total`, `max` |
| `DateStamp`, `eventWhen`, `parseEventDate` | Postage-stamp date and "Friday, Nov 14 · 3:00 PM" |
| `ChildThumb` | Polaroid photo or initials: `size`, `tilt`, `index` |
| `GToyButton` | The primary button: `variant` `accent` \| `white`, `size`, `icon`, `loading`, `disabled`, `fullWidth` |
| `GOutlineButton` | Secondary pill (`onDark` = butter) |
| `GLink` | Text action in `clayDeep` with an arrow (`light` on dark) |
| `GSkeleton` | Pulsing placeholder |
| `GErrorCard` | Load failure with a "Try again" toy button: `title`, `message`, `onRetry` |
| `GCountUp` | Number that counts up (instant under reduced motion) |
| `gText` | `display`, `itemTitle`, `meta`, `body` text styles |
| `GSegmented` (`segmented.tsx`) | `role=tablist` with a gliding accent pill: `items` `{id,label,icon?,badge?}`, `activeId`, `onChange`, `compact` |
| `GCelebrate` (`celebrate.tsx`) | `active` + `celebrationKey`. Only for real success moments. |
| `useGardenToast` (`toast.tsx`) | `success / error / info / warning(title, { description, action, id, durationMs })`, `dismiss(id)` |
| `GSheet` (`sheet.tsx`) | `visible`, `onClose`, `title`, `subtitle`, `headerAside` (status chip), `footer`, `list` (child is its own virtualized list), `enableDragToDismiss` |
| `GAccentStrip` (`accent-strip.tsx`) | `title`, `subtitle`, `pillLabel`, `onPress`, `accessibilityHint`, `children` |
| `GInlineBanner` (`fields.tsx`) | Status inside a sheet or a non-blocking load failure: `tone`, `title`, `description`, `action` |
| `closeThen`, `confirmDestructive`, `useGardenReadOnlyGate`, `useGardenPullRefresh` (`feedback.ts`) | Close a sheet then act; native discard/delete confirm; read-only toast gate; pull-to-refresh with toast |

Sheets: use `GSheet` for read-only sheets (feeds, details, lists). Use `ParentBottomSheet` (`components/parent/parent-bottom-sheet.tsx`) when the sheet has text fields: it handles the keyboard per `AGENTS.md`. Put sheets **outside** the `ScrollView`, as siblings at the screen root.

## 5. Screen anatomy

```
<Screen>                              thin route component
  controller = useXScreenController()  data + every navigation callback (no UI)
  <XGardenScreen controller>           loading → GSkeleton layout, error → GErrorCard, ready ↓
    feedback = useXFeedback(props)     wraps callbacks with toasts/haptics, never changes behaviour
    model    = useXModel(props)        sheet open state + derived data
    <View root cream>
      <ScrollView RefreshControl>      header → above-the-fold summary → cards
      <GCelebrate …/>
      <XSheets model …/>               every sheet the screen owns
```

- **Header** (`sections/home-header.tsx`, or `GBackHeader` on More-stack screens):
  - No eyebrow (§3.14).
  - A Bricolage greeting or title with one accent word.
  - A muted subtitle.
  - A toolbar of 42pt icon buttons (bulletin, bell with `GBadge`, avatar). Their labels match the old header ("Open notifications, N unread", "Account for {name}").
- **Order:** the primary task or summary first, then status, then lists, then help.
- **Keep the controller free of UI**, so the same screen can be backed by a different data source. The Home has two: `useParentHomeScreenController` (main portal) and `useParentProgramHomeScreenController` (program / co-op). They share one type, `ParentHomeScreenController`.

## 6. Feedback contract

| Moment | Feedback |
|---|---|
| Any press | `GPressable` scale + `haptic.tap`. Navigation fires on release. |
| Tab / chip / pager / step change | `haptic.select` |
| Pull to refresh | `haptic.select` on trigger. When it finishes: `toast.info('… is up to date', { id, durationMs: 2600 })`, or `toast.error("Couldn't refresh …", { action: { label: 'Try again' } })`. Track the request with a `pendingRefresh` ref and the `isRefreshing` true→false edge (see `use-parent-home-feedback.ts`). |
| A link with no in-app route | `notifyUnresolvedNavigation(toast)`: "This opens on the web portal". Never fail silently. |
| A disabled action in read-only preview | `toast.info('Read-only preview', { description: 'Actions are turned off while previewing.' })` instead of a dead button |
| Save / sign / pay / mark read succeeded | `toast.success(title)`. The title says what happened; the description says what it means or what to do next. |
| Failure | `toast.error` + `haptic.error` (automatic) **and** `reportError(...)` through `useMobileErrorReporter`. Toasts never replace reporting. |
| A real success moment (all caught up, payment done, enrollment complete) | `<GCelebrate active celebrationKey>`, which includes `haptic.success` |
| Loading | A skeleton shaped like the final layout (`GSkeleton`), never a bare spinner |

- **Toasts:** a reused `id` replaces the toast. At most 2 are visible; they're dismissable by swipe or ✕, and announced to screen readers. They render above the tab bar because the shell mounts the provider.
- **Sheets are native modals**, so toasts appear behind an open sheet. While a sheet is open, show status inside it instead (a `GChip` in `GSheet`'s `headerAside`, e.g. "3 new" → "Marked as read"). After closing, wait for the dismiss before navigating or toasting: `closeThen` in the Hub waits 220ms.

## 7. Recipes from the Home (details in `recipes.md`)

| Recipe | Source | Reuse it for |
|---|---|---|
| **Widget grid**: 2×2 pastel tiles (`flexBasis 45%`), tile label + icon circle on top, `GCountUp` number or content at the bottom, each tile opens a sheet | `parent-home-hub.tsx` › `Widget` | Billing summary, attendance, committee overview |
| **Urgent strip**: solid `accent.clay` row; the whole strip is one `GPressable` with a white "Open" pill | `sections/urgent-strip.tsx` | The one thing that needs doing now |
| **Ticket row**: paper ticket with notches, `DateStamp`, vertical `GDashedRule`, title + `eventWhen` | `sections/event-ticket.tsx` | Events, due dates, pickups, sessions |
| **Notebook list**: `GTick` / `GRing`, title + meta, chevron, hairline rows on `Garden.notebook`, with `GChip` counts above | `sections/family.tsx` › `FormsNotebookList`, `FormsCounts` | Forms, documents, receipts, sign-ups |
| **Polaroid carousel**: horizontal snap `ScrollView` of paper mini-cards with `ChildThumb` (±3°), status `GChip`, `GProgress`, outline + link actions; bleeds to the card edge with a peek | `sections/family.tsx` › `ChildrenSection` | Children, family members, committee members |
| **Jump-to grid**: 3-column tiles with pastel icon circles; tab routes `replace`, others `push` | `parent-home-hub.tsx` › `JumpToCard` | Feature shortcuts |
| **Detail sheet**: `ParentBottomSheet` + list + full-width `GToyButton`; close, then navigate | `parent-home-hub.tsx` (events and forms sheets) | Any "see all" for a widget |
| **Index of help**: category group labels, rows with a step-count chip, opening `ParentDocumentationGuideSheet` | `sections/more.tsx` › `GuidesSection` | Guides, FAQs |
| **Feed sheet**: `GSheet list` + `SectionList` (`flex: 1`) grouped Today / Yesterday / Earlier this week / Earlier with sticky group labels; rows with a pastel category icon, title, 2-line detail, relative time, `{ctaLabel} →`; newest N rows get a "New" dot + chip and accent wash; skeleton rows, mint caught-up panel, error + "Try again" toy button, dashed "That's everything for now" end line, settings link in the footer, pull to refresh | `home/sheets/parent-notifications-sheet.tsx`, `home/sheets/notification-groups.ts` | Notifications, activity logs, history |
| **Card feed sheet**: `GSheet` with white post cards (icon, date chip, title, excerpt, attachments, "Read more →" label; the whole card is the button); the newest card is butter with tape and a "Latest" chip | `home/sheets/parent-bulletin-sheet.tsx` | Bulletin, newsletters, announcements |
| **Legacy island**: an unmigrated Story component dropped into the flow as-is | `sections/more.tsx` › `FridayBranchIsland`, `CoopFamiliesIsland` | Anything not migrated yet |
| **Segmented tabs**: `GSegmented` with badges | `garden/segmented.tsx` | Sub-views within a tab (All / Unread, Upcoming / Past) |
| **Photo day grid**: per-day label row ("Today" / full date + count chip, "Latest" on the newest), 3-column rounded tiles with a `GSkeleton` per tile, `FlatList` of days with `onEndReached`, dashed end line | `photos/garden/photo-day-grid.tsx`, `parent-photos-garden-screen.tsx` | Galleries, attachments, any media list |
| **Choice sheet**: `GSheet` with radio option cards per person (pastel icon, label, description), Changed / Not saved chips, "apply to everyone", status line + one toy Save in the footer, discard confirm, `closeThen` → success toast, partial failures in a `GInlineBanner` | `photos/garden/photo-permissions-sheet.tsx` | Permissions, preferences, per-child choices |
| **Garden media viewer**: dark full-screen modal, 44pt round buttons, counter chip, swipe paging with `select` haptic, in-viewer status pill and error banner (toasts sit behind modals) | `photos/garden/parent-photo-viewer.tsx` | Photo and document previews |

## 8. Migrating a parent mobile tab (checklist)

One tab per PR. Suggested order: Billing → Messages → Calendar → Children → Forms & documents → Committees → the rest. Migrated so far include Home, Billing, Messages, Calendar, Children, Attendance, Forms & documents, Committees, Classroom signups, Newsletters, Notification settings and Photos.

1. Split the screen into **controller hook** (data + callbacks) → **Garden screen** (skeleton / error / view) → **model hook** (sheet state + derived data) → **feedback hook**. Reuse the Home files as templates.
2. Map the primitives:

   | Story | Garden |
   |---|---|
   | `StoryCard` | `GCard` |
   | `StorySectionKicker` / `StoryDisplayHeading` | `GCard` `title` (drop the eyebrow, §3.14) |
   | `StoryButton` primary | `GToyButton` (one per view) |
   | `StoryButton` soft / outline | `GOutlineButton` |
   | `StoryTextLink` | `GLink` |
   | `StoryChip` | `GChip` |
   | `StoryAttentionItem` | `GNoteTile` or an urgent strip |
   | `StoryProgressBar` | `GProgress` |
   | `SubmissionStoryTabBar` / `StoryPillNav` | `GSegmented` |
   | `showStoryToast` | `useGardenToast` |
   | `Pressable` + opacity | `GPressable` |
   | Story skeleton | `GSkeleton` layout |

3. **Colours:** replace `theme.primary` with `accent.clay`, hard-coded hexes with `Garden.*`, and Story fonts with `GardenFonts`.
4. **Keep behaviour identical:**
   - Every `testID` stays, including `parent-portal-ready` in the shell.
   - `.maestro` flows that use text or labels keep working.
   - Preview / read-only gating stays, plus the read-only toast.
5. **Keep the `apps/mobile/AGENTS.md` rules:**
   - Every `catch` reports through `useMobileErrorReporter`.
   - Links go through `openExternalUrlSafely`.
   - Text fields use the approved keyboard layouts (`ParentBottomSheet`, `ParentKeyboardAwareScrollView`).
   - Device-test bottom fields on a physical iPhone.
6. Add the feedback from §6 to every action on the tab.
7. Delete the Story components the tab no longer uses (grep `src` and `.maestro` first).
8. Verify (§9).

## 9. Verification

From `apps/mobile`:

```bash
node_modules/.bin/tsc --noEmit -p .        # no new errors in parent files
npx eslint src/components/parent <changed paths>
npm test -- src/components/parent
```

From the repo root: `npm run check:mobile-operational-errors` and `npm run check:mobile-keyboard-patterns`.

Then in the iOS Simulator, use `mcp__Claude_Code_iOS_Simulator__control` (attach, screenshot, tap). Expo Go works. Haptics need a rebuilt dev client or EAS build.
- Open the tab, then each widget and sheet.
- Pull to refresh and confirm the toast.
- Follow every navigation, then return.
- Check reduced motion (Settings › Accessibility › Motion).
- Screenshot the result.

Finally, `npm run mobile:visual:capture -- parent-home` (or the tab's slug) per `.agents/skills/mobile-ui-visual-verify`.

## 10. Anti-patterns

- Hard-coded school or Garden clay colours on actions.
- Pastels mixed from the accent.
- More than one toy button in a view.
- Tilted data or cards.
- Several dark cards.
- Handwriting outside empty or celebration states.
- Bare `Pressable` without a haptic or label.
- Tap targets under 44pt.
- Silent no-ops: an unresolved link or a disabled preview action with no toast.
- Toasts instead of `reportError`.
- Spinners instead of skeletons.
- `progressViewOffset` for iOS.
- Single-side dashed borders.
- Sheets inside the `ScrollView`.
- Using this kit on admin mobile screens without the admin rules (`admin-mobile-garden-design`), or on teacher screens (other than the shared roster) unless asked.
- Eyebrow text above a screen, card or sheet title (§3.14).
