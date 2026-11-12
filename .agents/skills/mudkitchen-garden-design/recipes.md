# Garden recipes

Each recipe names the file that implements it. Open that file, copy its structure and swap in your page's copy; don't reinvent it. The snippets only show the moves that matter.

Recipes come from three places:

| Folder | Status |
|---|---|
| `src/components/home-garden/sections/` | **Live** home page |
| `src/components/home-garden/recipes/classroom-wall/` | Reference only, not mounted |
| `src/components/home-garden/recipes/field-guide/` | Reference only, not mounted |
| `src/components/home-garden/*.tsx` | Shared blocks |

All GSAP code follows this shape:

```tsx
import { gsap, useGSAP, MQ_MOTION, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";

useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add(MQ_DESKTOP_MOTION /* or MQ_MOTION */, () => { /* tweens */ });
  return () => mm.revert();
}, { scope: ref });
```

Pick **one** signature recipe per section. Every recipe below already has its phone fallback and a server-rendered final state; keep both when you adapt it.

---

## Live home page (`sections/`)

### 1. Split hero: live product with role tabs and popping stickers
**Source:** `sections/Hero.tsx`

- **Layout:** two columns, `lg:grid-cols-[0.92fr_1.08fr]`.
  - **Left:** a handwritten hello, then the `h1` (`WordsReveal immediate` for the lead, accent span with a butter `Squiggle`), then the lead paragraph, then `Magnetic` `btnPop` and `btnOutline`.
  - **Right:** a tablist of the three views (`motion.span layoutId` pill) above a `GardenDemoFrame active={view}`.
- **Stickers:** two `StickerNote` overlays, pulled from `STICKERS_BY_DEMO[view]`. Each sits in `AnimatePresence mode="popLayout"` keyed by sticker id: spring in, scale out.
- **Photo blob:** a `.sf-blob` Sage Field photo peeks out behind the frame's corner (`hidden lg:block`).
- **Entrance (`MQ_MOTION`):** the frame rises with `back.out(1.2)` and `rotate: 8`, the copy follows with `stagger 0.1` from `delay 0.35`, and the blob pops last.
- **Phones:** the columns stack and the overlays hide below `sm`.

### 2. Messy desk → one folder (pain section)
**Source:** `sections/MessyDesk.tsx`

- **Structure:** `section.lg:h-[250vh]` › sticky `lg:h-screen` grid of copy and a desk stage (`aspect-[5/4]`).
- **Final markup:** every tool "paper" sits in a tidy stack on top of the folder illustration (`ILLUSTRATIONS.folder`), and the folder has a MudKitchen label sticker.
- **Scrub:** one timeline on the section (`start: "top top"`, `end: "bottom bottom"`, `scrub: 0.7`). Each paper runs `fromTo` from a messy offset (a % of the stage, `rotate` jitter, `scale 1.15`) to `x:0, y:0, rotate:0`. The label pops in at 0.78, and "Scattered today" crossfades to "All in one shared system" at 0.62–0.66.
- **Body copy:** `ScrubWords` with the phrase "one shared system" highlighted in `MARK.mint`. The runs come from splitting `PAIN_COPY.body`, so no copy is retyped.
- **Keep left-side offsets small**, or papers will cover the heading (−16% x at most).
- **Phones:** the stage shows its tidy final state below the copy.

### 3. "A day at school" sideways track (product section)
**Source:** `sections/DayTrack.tsx`

- **Track:** `HorizontalTrack`. The header holds `SectionIntro` (`PRODUCT_INTRO_COPY`) and carries `id="product"`, so the nav link lands here.
- **Cards:** seven postcards, one per moment, in school-day order:
  - a handwritten time-of-day label (decorative)
  - a `StickerNote` sample notification
  - the module caption and description from `PRODUCT_PREVIEW_TABS`
  - an app slide (or a Sage Field polaroid)
- **The postcard grid is `grid-cols-[1fr_32%]`.** The pinned frame has to fit in 900px: header about 267px, cards about 406px, plus the progress bar.
- **End card:** a handwritten sign-off and a Book a Demo link.
- **Phones:** `HorizontalTrack` turns into a snap rail by itself.

### 4. Expanding role panels
**Source:** `sections/RolePanels.tsx`

- **Desktop:** three pastel panels in a `flex` row at `lg:h-[600px]`. The open panel is `lg:flex-[3.2]` and the others `lg:flex-[1]`, animated with `transition-[flex-grow] duration-700`.
- **Collapsed panels** show a "spine": the accent half of the headline and a small polaroid.
- **Open content** is positioned absolutely at a fixed width (`lg:w-[min(820px,62vw)]`), so text doesn't reflow while the panel grows.
- **Opening:** `onPointerEnter`, `onClick` and `onFocus` all open a panel. The header is an `h3 > button[aria-expanded]`.
- **Phones:** it becomes an accordion, and closed panels show only their header.

### 5. App marquee
**Source:** `sections/AppStrip.tsx`

- **Heading:** `SectionIntro`. The heading and note come from `DOWNLOAD_APP_SLIDES[0]` (alt and caption), followed by `MobileAppDownloadBadges`.
- **Marquee:** `PhoneCard`s with alternating ±2° tilt and cycling tape colours, `duration={60}`. The "hover to pause" note is desktop-only and `aria-hidden`.

### 6. Customer story as a ticket
**Source:** `sections/StoryTicket.tsx`

- **The ticket:** a forest `.sf-ticket` (notched edges). The photo is on the left, then a dashed perforation, then the school logo, a `dl` of stats (`whitespace-nowrap` so "< 3 mo" never wraps), the body and a `btnButter` CTA.
- **Beside it:** the founder quote on a white toy card, then "Inside the case study" on a butter sticky note with `Tick`s.

### 7. Sticky-note steps joined by drawn arrows
**Source:** `sections/SetupNotes.tsx`

- **Notes:** three sticky notes in an `ol` (`Reveal as="ol"`): butter, then sky, then a solid clay highlight with white text and a white `Leaf` bleeding off the corner. They tilt −2°, 1.5° and −1°, with the `.sf-wiggle` hover.
- **Arrows:** two `Draw` + `Arrow` doodles sit absolutely between the notes (`left-[29%]` and `left-[63%]`), with staggered delays.
- **Footer:** the reassurance line, then `btnPop` and `btnOutline`.

### 8. Paper pricing and the custom sticker wall
**Source:** `sections/PricingPaper.tsx`

- **Pricing:** a `.sf-paper` card, `lg:grid-cols-[1.2fr_0.8fr]`. The left side has "Core plan" and the ticked features. The right side is a forest panel with the custom-config question and a `btnButter`.
- **Custom tags:** `CUSTOM_COPY.tags` as a wall of tilted toy stickers in a `Reveal as="ul"`. The tilt is deterministic from the index: `(((i*37)%9)-4)*1.1` degrees, so server and client match.

---

## Classroom wall recipes (`recipes/classroom-wall/`)

### 9. Polaroid scatter that gathers on scroll
**Source:** `recipes/classroom-wall/Hero.tsx`

- **Layout:** the centred `h1` sits between `ITEMS` (photos, phone cards and sticker notes) placed from a `SPOTS` array (`x`, `y`, rotation `r`, parallax depth `d`, width `w`).
- **Keep the centre clear:**
  - Left items: `x ≤ 18%`.
  - Right items: `x ≥ 73%`.
  - Every item: `y ≥ 19%`, so nothing hides under the navbar.
- **Layers:** `[data-spot]` (position plus CSS rotate) › `[data-gather]` (scroll tween) › `[data-par]` (mouse parallax via `gsap.quickTo`) › the object.
- **Entrance:** items drop in (`y: -140`, random rotate, `back.out(1.6)`, `stagger 0.07`). On scroll they gather toward bottom-centre (`scale 0.62`), and the headline fades to 0.15.
- **Phones:** the same items in a snap row under the headline.

### 10. Index cards drive the live demo
**Source:** `recipes/classroom-wall/Product.tsx`

- **Cards:** the seven `PRODUCT_PREVIEW_TABS` as tilted toy index cards (`role="tab"`). The active one straightens, takes its group tint (`GROUP_TINT`) and gets a tape strip.
- **Demo:** the card maps through `TAB_TO_DEMO` to a `GardenDemoFrame`, with sticker overlays. The cards call `prefetchDemoStage` on pointer enter and focus.
- **Phones:** the cards become a horizontal snap rail.

### 11. Tools crossed out into one ring
**Source:** `recipes/classroom-wall/ToolsToOne.tsx`

- **Final markup:** the ten `PAIRS` sit as notes on an ellipse around a forest MudKitchen hub. Each note shows the tool name struck through, plus a mint feature chip.
- **Scrub:** each note travels from a scattered offset to its ring spot. Then the strike draws (`scaleX`), the tool name dims and the feature chip pops. Last, the hub scales up and the label swaps.
- **Keep left-side notes out of the copy column:** multiply their x push by `0.35` when `cos(a) < 0`.
- **Phones:** a list of "~~Tool~~ → Feature" rows.

### 12. Flip cards
**Source:** `recipes/classroom-wall/Roles.tsx`

```tsx
<div className="sf-flip h-[500px]" data-flipped={flipped}>
  <button onClick={toggle} aria-pressed={flipped} className="sf-flip-inner relative block h-full w-full">
    <div className="sf-face absolute inset-0">front: photo, eyebrow chip, h3</div>
    <div className="sf-face sf-back absolute inset-0">back: body + bullets (overflow-y-auto data-lenis-prevent)</div>
  </button>
</div>
```

- **Flipping:** on devices that hover, hover and `:focus-within` flip the card; a tap toggles it everywhere.
- **No links inside the button.** Put the CTA below the cards.

### 13. Split scroll with the tick-off sticky note
**Source:** `recipes/classroom-wall/Story.tsx`

- **Structure:** `section.lg:h-[280vh]` › sticky grid `lg:grid-cols-[1fr_1.75fr_1fr]`. The two side columns are polaroids, doubled so they never run out; one column moves `yPercent 0 → -48`, the other the reverse.
- **Centre column:** pill, h2, stat stickers that pop in, and a butter note whose rows tick off on the shared trigger (row opacity, `[data-tick]` dash offset, `[data-mark]` background size).
- **Fit:** the centre column must be no taller than 100vh.
- **Phones:** a polaroid `Marquee`. The ticks render already checked.

### 14. Seed-to-bloom growing plant
**Sources:** `recipes/classroom-wall/Setup.tsx`, plus `GrowingPlant.tsx`

- **Layout:** the sticky `GrowingPlant` sits on the left and the step cards on the right.
- **Scrub:** one timeline triggered by `[data-steps]` (`top 70%` → `bottom 60%`). The stem draws first, the seed shrinks, the sprouts scale from their bases at 0.6, 1.5 and 2.4, and the bloom spins in at 3.3.
- **Step cards** slide in from the right with `back.out(1.4)`.

### 15. Report-card pricing
**Source:** `recipes/classroom-wall/Pricing.tsx`

- **Layout:** an inset forest panel holding a `.sf-paper` card tilted −1.5°, with a "report card" note and a star stamp.
- **Motion:** the features tick one by one on view, and the card drops in with `back.out(1.3)`.

### 16. Opposing tag marquees
**Source:** `CustomBuild.tsx` (shared)

- **Rows:** two `Marquee`s in a `-rotate-2` wrapper, running in opposite directions, with the tag pills split between them.
- **Accessibility:** the marquees are `aria-hidden`, backed by an `sr-only` list of the same tags.

---

## Field guide recipes (`recipes/field-guide/`)

### 17. Editorial masthead, clip-revealed photo, floating demo
**Source:** `recipes/field-guide/Hero.tsx`

- **Masthead:** an uppercase tracked badge and a handwritten note above a 2px ink rule.
- **Headline:** huge, with a drawn `Ring` around the accent phrase.
- **Photo band:** a wide Sage Field photo unveils with `clipPath inset(18% 12% 0 12% round 44px) → inset(0)` and the image eases from `scale 1.25` to 1. On desktop it then drifts by `yPercent 12`.
- **Demo:** a `GardenDemoFrame` overlaps the band's bottom edge (`-mt-[38vh]`) and rises slightly on scroll.

### 18. Oversized numerals
**Source:** `recipes/field-guide/BigNumbers.tsx`

- **Stats:** a `dl` of `STORY_COPY.stats` between ink rules. The numbers use `text-[clamp(4.5rem,8vw,8.5rem)] whitespace-nowrap`, and numeric ones `CountUp`.
- **Below:** the founder polaroid and a large display-font quote.

### 19. Dark board where logos fade as words light up
**Source:** `recipes/field-guide/PainBoard.tsx`

- **Layout:** the one forest panel on the page. It shows the tool logo chips, then a `ScrubWords` paragraph.
- **Scrub:** one trigger on the body. Logos go to `opacity 0.18` and grayscale while a strike draws through them, and a butter "All in one shared system" chip pops in.

### 20. Scrollytelling with a sticky demo
**Source:** `recipes/field-guide/ModulesScrolly.tsx`

- **Layout:** the module chapters sit on the left (`lg:min-h-[52vh]` each). A sticky `GardenDemoFrame` sits on the right with an `01 / 07` counter and a progress bar.
- **Active chapter:** an `IntersectionObserver` (`rootMargin: "-48% 0px -48% 0px"`) sets the chapter and prefetches its demo, with no GSAP needed. Chapters are also buttons (`aria-pressed`).
- **Phones:** the demo moves above the list and is not sticky.

### 21. Field-guide rows
**Source:** `recipes/field-guide/FieldGuideRoles.tsx`

- **Rows:** one per role. Each has an illustration on a morphing `.sf-blob` (offset `animationDelay` so neighbours don't morph in sync), a "field note no. N" caption, an eyebrow chip, an h3, the body and a text-link CTA.
- **Alternating sides:** every other row flips using `lg:[direction:rtl]` on the row and `[direction:ltr]` on its children.

### 22. Numbered steps on a drawing line
**Source:** `recipes/field-guide/SetupEditorial.tsx`

- **Layout:** the intro is sticky on the left. On the right, an `ol` of butter number dots sits on a vertical forest line that scales from `scaleY 0 → 1` with scroll.
- **Each step:** a faint giant numeral behind the h3. The animation targets `[data-copy] > :not([data-num])`, so the numeral isn't animated twice.

### 23. Centred plan card
**Source:** `recipes/field-guide/PricingCentered.tsx`

- **Card:** a single white toy card with a huge "Core plan" heading, features in two columns and a `Magnetic` CTA.
- **Below:** a peach strip with the custom-config question.

---

## Shared blocks

### 24. Postcards
**Source:** `FreeToolsPostcards.tsx`

- **Cards:** tilted pastel toy cards. Each has a dashed "stamp" corner holding the icon, a handwritten kicker, an h3, the description, a time hint and a dashed-rule footer CTA.
- **Hover/focus:** they straighten and lift.

### 25. FAQ index cards
**Source:** `GardenFaq.tsx`

- **Layout:** a sticky intro on the left; on the right, white index cards with a toy shadow.
- **Open card:** cycles a pastel and grows a bigger shadow. The `+` rotates to `×` with a spring. The answer animates with framer height auto, `[0.22,1,0.36,1]`.

### 26. Book a demo on notebook paper
**Source:** `GardenBookDemo.tsx`

- **Flow:** the real `GetStartedDemoFlow` with `MUDKITCHEN_MARKETING_GARDEN_THEME`, inside a `.sf-paper` toy card with two tape strips and a "pull up a chair!" note. The flow fires confetti on success itself.
- **Width:** follows the step (`max-w-[780px]`, then `1020px`, then `620px`).

### 27. The product in a frame
**Source:** `GardenDemoFrame.tsx`

- **Frame:** browser chrome with peach, butter and mint dots, plus a "MudKitchen · {view}" label.
- **Styling:** 2px ink border, a 10px ink shadow, optional tape and tilt. Overlays (sticker notes) go in as children.
- **Demo:** `DemoStage` scales a 1100×680 canvas. Lower `designHeight` (640) and `minScale` (0.3) for tighter frames.
