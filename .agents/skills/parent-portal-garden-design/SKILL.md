---
name: parent-portal-garden-design
description: >-
  "Garden dashboard" design system for the school-branded PARENT portal (web).
  Use whenever building, redesigning or restyling any parent portal page or tab
  under src/app/school/[slug]/parent/ or src/components/school-parent/ (Home,
  Billing, Messages, Calendar, Committees, Children, Forms, Photos, etc.), the
  admin family preview of those pages, or when asked to "make this tab match
  the new Home", "use the parent portal design", or migrate a tab off the old
  School Day Story look. Covers the ParentGardenFrame scope, the
  school-parent/garden kit, page anatomy, portal-feel rules, section recipes
  from the Home, and a tab migration checklist. Replaces parent-portal-story-design.
---

# Parent portal — Garden dashboard

The parent Home (`src/components/school-parent/ParentHomePage.tsx`) is the reference build. Every other parent tab should end up looking and behaving like it.

**The look in one line:** the marketing home page's materials (Bricolage display type, Nunito body, cream paper, pastel note tiles, tape, ticks, polaroids, toy buttons) at **portal density**, in the **school's own accent colour**.

It must feel like a calm app a parent uses every day, not a marketing page:
- Short header.
- The important things visible without scrolling.
- Everything in cards.
- Small headings.
- Almost no decoration on data.

Related skills:
- `.agents/skills/mudkitchen-garden-design/`: the Garden tokens, type and materials this builds on. Read §5–§7 of its `SKILL.md` for the palette and shapes.
- `.agents/skills/portal-responsive-verify/`, `.agents/skills/portal-qa/`: verification.
- `.agents/skills/admin-workspace-design/`: the admin and teacher portals still use School Day Story. Don't apply this skill there unless asked.

---

## 1. Where things live

| Path | What |
|---|---|
| `src/components/school-parent/garden/ParentGardenFrame.tsx` | `ParentGardenFrame` (scope + school-accent token mapping), `PortalIsland` |
| `src/components/school-parent/garden/ui.tsx` | The kit: `GCard`, `GNoteTile`, `GChip`, `GProgress`, buttons, … (§4) |
| `src/components/school-parent/garden/motion.tsx` | `gFade`, `GCountUp`, `useCelebrate`, `PORTAL_EASE` |
| `src/components/school-parent/garden/ParentGardenPageHeader.tsx` | The page header (the only `h1`) |
| `src/components/school-parent/ParentHomePage.tsx` | Reference page composition |
| `src/components/school-parent/header/*` | Garden portal header: `ParentGardenNav`, `ParentGardenMoreMenu`, `ParentGardenProfileMenu`, `ParentGardenPortalSwitcher`, `GardenBellButton`, `GardenHeaderPopover` |
| `src/components/school-parent/home/garden/*` | Reference sections (§6 recipes) |
| `src/components/school-parent/home/useParentHomeModel.ts` | Pattern for a page view-model hook (derived data + drawer state) |
| `src/components/garden/garden.css` | Tokens, `.sf-paper`, `.sf-ticket`, `.sf-polaroid`, `.sf-blob`, and the `.sf-parent-garden` type reset |
| `src/components/garden/ui.tsx` | `Tick` (hand-drawn check), `MARK` highlights, `Tape` (decorative only) |

## 2. The scope and colour

```tsx
const theme = useMemo(() => buildParentThemeTokens(branding), [branding]); // or useParentTheme().theme
return (
  <>
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS}>{/* header + cards */}</div>
    </ParentGardenFrame>
    {/* drawers / modals / side panels go OUTSIDE the frame */}
  </>
);
```

**What the frame does**
- Applies `.sf-garden` and `.sf-parent-garden` and loads the Garden fonts.
- Maps the school's accent onto the Garden action tokens:
  - `--sf-clay` → `theme.primary`
  - `--sf-clay-deep` → `theme.primaryDark`
  - `--sf-peach` → a 16% accent tint
  - `--sf-accent-wash` → an 8% accent wash

  Rooted Meadows renders purple; every school gets its own colour automatically.
- **Never hard-code Garden clay (`#A05C45`) or a school colour.** Use `var(--sf-clay)` and `var(--sf-clay-deep)`.

**What stays outside the frame**
- The portal header and nav (`SchoolParentHeader`) are Garden too, but they use `ParentGardenScope` (same tokens and fonts, no `min-h-full`, no overflow clip) instead of `ParentGardenFrame`. Don't wrap the header in a page frame. See the Header / nav recipe in §6.
- Drawers, modals and side panels (`ParentOnboardingSidebar`, `ParentDocumentationGuidePanel`, bulletin sidebar/dialogs, billing side panels) render **outside** the frame until they're migrated. Otherwise the Garden type reset restyles their headings.

**Not-yet-migrated blocks inside a page.** Wrap them in `<PortalIsland>`, which keeps the portal's Fraunces/DM Sans. The Home does this for Friday Branch and co-op families (`HomeProgramSections`).

**Inside marketing demos.** The parent Home also renders inside marketing demos (`DemoStage` → `DemoParentHomePage`, inside `.sf-demo`). The `.sf-parent-garden` rule in `garden.css` keeps the reset working there, so don't remove it.

**Dynamic classes.** The Garden colours are CSS variables, so Tailwind arbitrary values are fine (`bg-[var(--sf-mint)]`). Never build class names dynamically; use the constant maps (`NOTE_TINTS`, `CARD_TONES`, `CHIP_TONES`).

## 3. Portal-feel rules (non-negotiable)

These are what separate this from the marketing site. Each one was a correction on the Home redesign.

1. **Layout**
   - Use the portal container `PORTAL_HOME_CONTAINER_CLASS` (`src/lib/portal-home/layout.ts`: `max-w-[1250px]`, `gap-7`).
   - No full-bleed pastel bands and no `py-20/24` "sections". The page background is plain cream.
2. **Header** is `ParentGardenPageHeader`:
   - kicker
   - `h1` (`sf-display`, `text-[2rem] sm:text-[2.6rem]`)
   - muted subtitle
   - actions on the right

   No hero, no huge type, no squiggles.
3. **Above the fold.** At 1440×900 a parent sees the page's primary task, plus its key status, without scrolling. A main column plus rail is the default: `grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]`.
4. **Everything is in a `GCard`:**
   - `rounded-[24px]`, a 1.5px ink/12 border and a 3px soft hard shadow.
   - A small uppercase kicker and an `sf-display` `text-[1.4rem]` `h2`. Card-header actions are `gLinkSm`.
   - **No tilt on anything that holds data, forms or controls.** A slight tilt (±3°) is fine only on photos (`ChildThumb`).
5. **Type scale:**
   - `h1` 2–2.6rem
   - card `h2` 1.4rem
   - item titles 15–17px `font-extrabold`
   - meta 13px `font-semibold text-[var(--sf-soft)]`
   - kickers 11px uppercase `tracking-[0.18em]`

   Big numerals (`text-[2.8rem]`) only in stat tiles and summary figures.
6. **Toy depth** (2px ink border + hard offset shadow) goes on **one primary action per view**: `gBtnPopSm`, `gBtnPop` or `gBtnOnAccent`.
   - Secondary actions: `gBtnOutlineSm` (no hard shadow) or `gLinkSm`.
   - On the dark card: `gBtnButterSm`.
7. **Pastels go on small things only:** note tiles, icon chips, status chips, photo fallbacks. **At most one** dark card per page (`GCard tone="dark"`; the Home uses it for events).
8. **Handwriting** (`sf-hand`, Gochi Hand) appears at most once per page, only in an empty or celebration state, and is always `aria-hidden`, lowercase and non-factual (for example "enjoy the quiet ✿").
9. **Motion is portal timing:**
   - Cards fade/slide in with `gFade(index)` (built into `GCard`).
   - Panels swap with `AnimatePresence mode="wait"` at 220–350ms, using `PORTAL_EASE`.
   - The springy hover lift (`SPRINGY`) is for tiles and buttons.

   **Don't use the marketing GSAP helpers** (`Reveal`, `Draw`, `CountUp`, `HorizontalTrack`, Lenis). The portal scrolls inside `SchoolParentPageShell`'s `overflow-y-auto` container, not the window, so ScrollTrigger never fires below the fold. Use framer `whileInView` / IntersectionObserver.
10. **Celebrate only real success moments.** Use `useCelebrate(active, theme, key)` for things like all caught up, a payment completing or enrollment finishing. It skips itself under reduced motion and fires once per session per key.
11. **Copy.** Factual strings come from data or existing product copy. Don't invent claims, numbers or features.

## 4. Kit reference (`school-parent/garden/ui.tsx`)

| Export | Use |
|---|---|
| `GCard` | Every section. Props: `kicker`, `title`, `action`, `tone` (`white` \| `paper` \| `dark`), `index` (entrance stagger), `id`, `headingLevel`, `data-testid`. |
| `GKicker` | Uppercase label (also used in the header). |
| `GNoteTile` | Pastel note with a tape strip; `href` turns it into a link and `onClick` into a button. Use for to-dos, announcements and short choices. `tint` takes `NOTE_TINTS[i % NOTE_TINTS.length]`. |
| `GIcon` | Lucide icon in a white circle with an ink ring (`sm` \| `md` \| `lg`). |
| `GChip` | Status/count chip with `tone`: `success` \| `warning` \| `alert` \| `info` \| `neutral`. Replaces `ParentChip`. |
| `StatusChip` | A child's enrollment status chip. |
| `GProgress` | Ink-outlined progress bar (accent, or forest when `done`). Needs a `label`. |
| `GStatTile` | Big-number tile with count-up, optionally a button. For summary strips (billing totals, counts). |
| `ChildPhoto` / `ChildThumb` | A child's photo or initials; `ChildThumb` is a small polaroid. |
| `DateStamp` / `eventWhen` | Postage-stamp date (`sm` \| `md`, `dark`) and the "Friday, Nov 14 · 3:00 PM" string. |
| `QuickLinks` | Feature shortcut grid from `ParentQuickAction[]` (`buildParentQuickActions`). |
| `GSkeleton` | Deferred-content placeholder. |
| `gBtnPopSm` / `gBtnPop` | The primary toy button (one per view). |
| `gBtnOutlineSm` | Secondary button. |
| `gBtnButterSm` | Button on the dark card. |
| `gBtnOnAccent` | White toy pill on a solid accent strip; use inside a `group` link (see Start here). |
| `gLinkSm` | Text link / card action. |
| `G_FOCUS` | The focus ring (accent at 35%). Add it to every custom interactive element. |
| `SPRINGY` | Springy transition for hover lifts. |
| `NOTE_TINTS`, `PANEL_TINTS`, `TAPE_COLORS` | Literal tint classes and colours. |
| `GTabBar` | Segmented `role="tablist"` with a gliding accent pill (Billing tabs, Messages All/Unread). |

From `school-parent/garden/GDialog.tsx`:
- `GDialog`: portalled Garden dialog (own `ParentGardenFrame`, bottom sheet on phones, Escape, focus trap + return). Safe to mount from inside a page frame.
- `GConfirmDialog`: outline Cancel + one toy confirm (spinner + `aria-busy` while `loading`; `destructive` for deletes/discards).

Toasts: the parent portal mounts `ParentToaster appearance="garden"` (`garden/GardenToaster.tsx`). Call `parentToast.success|error|info(title, { description, action, id })` from `src/lib/school-parent/parent-toast.ts`: title = what happened, description = what it means / what to do next. Teacher keeps the story toaster. In the apply portal, `ApplyPortalPageShell toasterAppearance="garden"` turns on Garden toasts (the apply dashboard uses it; form and enrollment pages still use story).

From the shared Garden kit (`@/components/garden/ui`):
- `Tick` for done states.
- `MARK.butter|peach|mint|sky` to highlight one phrase.
- `Tape` only for decoration.

## 5. Page anatomy

```tsx
<ParentGardenFrame theme={theme}>
  <div className={PORTAL_HOME_CONTAINER_CLASS}>
    <ParentGardenPageHeader
      kicker="Billing / tuition"
      title={<>Tuition for <span className="text-[var(--sf-clay)]">the Cecilia family</span></>}
      subtitle="…existing subtitle copy…"
      actions={<button className={gBtnOutlineSm}>…</button>}
    />
    <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
      <GCard index={1} kicker="…" title="…" action={<Link className={gLinkSm}>…</Link>}>…main task…</GCard>
      <div className="flex flex-col gap-5">{/* rail: status, next dates, shortcuts */}</div>
    </div>
    {/* full-width cards below: lists, history, help */}
  </div>
</ParentGardenFrame>
```

- **Order:** primary task → status → secondary lists → help and guides.
- **Mobile:** grids collapse to one column (`grid` without a base `cols` class), card-header actions stay inline, and header actions wrap under the title. No horizontal page scroll; horizontal rails need `overflow-x-auto` inside a card.

## 6. Section recipes (from the Home)

| Recipe | Source | Reuse it for |
|---|---|---|
| **Start here**: the urgent first item as a solid accent strip that's one `<Link>` with a `gBtnOnAccent` "Open" pill; the rest as a 2-col `GNoteTile` grid; a dashed footer with progress dots + "N of M complete" + "+N more" | `home/garden/HomeStartHereCard.tsx` | Any "what needs doing" list: unpaid invoices, unsigned forms, open signups |
| **Caught-up state**: mint panel + `Tick` + the existing sentence + one hand line + `useCelebrate` | same | Empty-but-good states |
| **Ticket list on the dark card**: `.sf-ticket` rows with `DateStamp sm` → dashed perforation → title/time; `gBtnButterSm` footer | `home/garden/HomeRail.tsx` › `HomeEventsCard` | Upcoming dates, due dates, pickups |
| **Note-row launcher**: a butter/sky taped row button with `GIcon`, title, one-line preview and chevron | `HomeRail.tsx` › `HomeBulletinTile`, `HomeMessagesTile` | Opening a drawer or a related tab |
| **Jump to**: `QuickLinks` in a kicker-only `GCard` | `HomeRail.tsx` › `HomeJumpToCard` | Tab shortcuts |
| **Person mini-cards**: `ChildThumb` + `sf-display` name + `StatusChip` + meta + `GProgress` + outline/secondary links, on a paper inner card | `home/garden/HomeChildrenCard.tsx` | Children, family members, committee members |
| **Notebook list**: `.sf-paper` list with `Tick` (done) / empty ring (to do), title + meta, chevron; counts as `GChip`s above | `home/garden/HomeLowerCards.tsx` › `HomeFormsCard` | Forms, documents, receipts, payment history |
| **Index of help**: category columns of button rows that open a side panel | `HomeLowerCards.tsx` › `HomeGuidesCard` | How-to guides, FAQs |
| **Legacy block**: `PortalIsland` around an unmigrated component | `HomeLowerCards.tsx` › `HomeProgramSections` | Anything not yet migrated |
| **Full-height app tab** (exception to §3.2/§3.4): the tab IS the page — full-bleed panes (list \| detail \| xl details rail) with 1.5px ink/10 dividers, no page header (sr-only `h1`), primary actions in the list column header; shared layout hands a view-model to a Garden view via a new variant | `messages/garden/ParentGardenMessagesView.tsx` (`MessagesInboxLayout variant="parent-garden"`) | Inbox-style tabs (committees chat, curriculum discussion) |
| **Header / nav**: pill links with an accent pill that glides to the active tab (framer `layoutId`) and `aria-current="page"`; "More" shows the active hidden tab ("More · Photos") and the unread total of hidden tabs; More = pastel icon tiles with arrow-key grid nav and a "How-to guides" footer; account menu = "you" card, radio-style Program rows, account portals, settings links, log out. All popovers use `GardenHeaderPopover` (anchored card from `sm`, bottom sheet on phones, Escape + focus return, `[data-roving]` arrow keys, `[data-autofocus]` start item) | `school-parent/header/*` | Any portal chrome menu or switcher |
| **Notifications drawer**: `GSidePanel` (with `bodyRef` as the infinite-scroll root and a `headerAside` status chip: "N new" → "✓ Marked as read", or the preview chip); rows grouped under sticky "Today / Yesterday / Earlier this week / Earlier" kickers; newest N rows (the bell count at open) get a "New" dot + chip; each row ends with the notification's own `ctaLabel` →; caught-up state on mint; dashed "That's everything…" end line; footer link to notification settings | `ParentActivityNotificationsPanel.tsx`, `ParentActivityNotificationRow.tsx` | Any activity/feed drawer |
| **Numbered "how it works" steps** with the current step on the accent wash | `messages/garden/GardenThreadPane.tsx` › `StartHere`, `billing/garden/BillingSetupCard.tsx`, `admissions/PostSubmitStepCard.tsx` | First-run / empty detail panes, multi-step flows |
| **Journey stepper**: 5 ticked dots joined by a line, reached stages in accent (forest when complete), labels under it from `sm` | `admissions/apply-dashboard/garden/ApplyJourneySteps.tsx` | Status pipelines (applications, enrollment) |

## 7. Migrating a tab (checklist)

Suggested order: Billing → Messages → Calendar → Committees → Children → Forms & documents → the rest. One tab per PR.

1. Find the tab's client page (for example `billing/ParentBillingPage.tsx`) and its story header (`Parent{Feature}StoryHeader.tsx`).
2. Wrap the page content in `ParentGardenFrame` with the theme from `useParentTheme()` or `buildParentThemeTokens(branding)`. Move drawers, modals and side panels **outside** the frame.
3. Replace the story header with `ParentGardenPageHeader`. Keep the existing copy; colour one accent word with `text-[var(--sf-clay)]` if it helps.
4. Lay out the main task + rail grid (§5). Identify the page's single primary action; it gets the toy button.
5. Map the primitives:
   - `ParentCard` → `GCard`
   - `ParentSectionKicker` / `ParentDisplayHeading` → `GCard` `kicker` / `title` (or `GKicker`)
   - `ParentButton` / `ParentButtonLink` primary → `gBtnPopSm` (one), others → `gBtnOutlineSm`
   - `ParentTextLink` → `gLinkSm` with an `ArrowRight` icon
   - `ParentChip` → `GChip`
   - `ParentAttentionItem` → `GNoteTile` or a Start-here strip
   - `ParentStoryPillNav` → keep it inside a `PortalIsland` until a Garden tab bar exists. If you build one: `role="tablist"`, a framer `layoutId` pill in `--sf-clay`, and add it to the kit.
6. **Shared layouts** with a `variant` (for example `MessagesInboxLayout variant="parent-story"`): wrap them in `PortalIsland` first. Restyle by adding a new variant (`parent-garden`). Never fork the business logic, and never restyle admin or teacher variants.
7. **Keep behaviour identical:**
   - Every `data-testid` stays.
   - Link names that E2E relies on stay. When you turn a row into a strip, make the whole strip the `<Link>` so its accessible name contains the title.
   - Preview parity (`.cursor/rules/family-preview-parity.mdc`): the live route and `/admin/preview/{slug}/family/{familyId}/parent/{feature}` share the same component. `previewMode`/`readOnly` disables actions; it never hides UI.
8. Data and fetch logic stays in `src/lib/`; put derived view state in a `use{Feature}Model` hook like `useParentHomeModel`.
9. If the tab renders in marketing demos (`src/components/demo/shared/*`, `DemoStage`), re-check `/` and `/demo/*`.
10. Verify (§8).

## 8. Accessibility and verification

- **Headings:** one `h1` (the header). Card titles are `h2` and items inside cards are `h3`.
- **Focus:** every custom interactive element includes `G_FOCUS`. Inset rings (`focus-visible:ring-inset`) go on full-width rows.
- **Contrast:** never put small `--sf-clay` text on a pastel. Use `--sf-clay-deep`. On the dark card use white, white/80 or butter.
- **Reduced motion:** all kit motion reads `useReducedMotion()`. New motion must too, rendering the final state.
- **Decorative pieces** (tape, hand lines, doodles) get `aria-hidden`.
- **Run:**

  ```bash
  ./node_modules/.bin/tsc --noEmit -p .
  ./node_modules/.bin/eslint <changed paths>
  ```

  Then do the three-viewport check with `.agents/skills/portal-responsive-verify` (375 / 768 / 1440). At 375, `document.documentElement.scrollWidth === document.documentElement.clientWidth`. Run the relevant `e2e/parent/*.spec.ts` (see `.agents/skills/e2e-local`).

## 9. Anti-patterns (each one was tried and rejected on the Home)

- **Marketing sections:** full-bleed pastel bands, hero layouts, `text-5xl+` section headings, a `Pill` above every heading, handwritten notes everywhere. They read as a public marketing page.
- **Tilt on data:** tilted sticky notes for to-dos, tilted forms or tilted cards.
- **Toy buttons everywhere:** more than one hard-shadow button in a view.
- **School-blind colour:** hard-coded Garden clay or butter on actions. Actions use `var(--sf-clay)` (the school accent).
- **Window scroll motion:** GSAP ScrollTrigger, Lenis, pinned or scrubbed scenes.
- **Unscoped drawers:** mounting drawers or modals inside `ParentGardenFrame`, or wrapping the portal header in it.
