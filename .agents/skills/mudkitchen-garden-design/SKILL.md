---
name: mudkitchen-garden-design
description: >-
  MudKitchen "Garden" design system: the look of the home page (src/app/page.tsx).
  Use whenever building, redesigning or restyling any MudKitchen page or screen
  so it stays consistent: marketing pages (about, customers, blog, tools,
  get-started, try, free tools, landing pages), and MudKitchen-owned app
  surfaces (login, signup, onboarding, upgrade dialogs, empty states,
  celebrations) on web and mobile. Also use when asked to "match the home page",
  "use our design system", "make it look like MudKitchen", or to pick between
  Garden and the school-branded portal style. Covers tokens, type, shape,
  components, section anatomy, motion, accessibility, gotchas and checks.
  Patterns are in recipes.md; in-app and mobile rules are in in-app.md.
---

# MudKitchen Garden design system

The home page is the reference build:
- `src/app/page.tsx` renders `src/components/home-garden/HomeGardenPage.tsx`.
- Its sections live in `src/components/home-garden/sections/`.

When unsure, open the matching home section and copy its structure. Two unused alternative designs are kept as working reference recipes:
- `src/components/home-garden/recipes/classroom-wall/`
- `src/components/home-garden/recipes/field-guide/`

Companion files:
- **`recipes.md`**: every layout and motion pattern we've built, with source paths and phone fallbacks.
- **`in-app.md`**: how Garden applies to the school-branded portals (admin, parent, teacher) and the Expo app. Read it before touching anything under `src/app/school/`, `src/components/school-*` or `apps/mobile/`.

---

## 1. Which system goes where

| Surface | System | Notes |
|---|---|---|
| Home page and public marketing pages (`/about`, `/customers`, `/blog`, `/tools` and the free tools, `/get-started`, `/try`, landing pages) | **Full Garden** (this file) | Pages not yet migrated still use Bright (`.agents/skills/bright-marketing-design`). Migrate them to Garden when you touch them. |
| MudKitchen-owned app surfaces: auth, `/try` signup, onboarding, free-plan upgrade, empty states, success moments, mobile onboarding | **Calm Garden** (`in-app.md`) | Same tokens and type, far less play. |
| School-branded portal content (school admin, parent, teacher; web and mobile) | **School Day Story** (`admin-workspace-design`, `parent-portal-story-design`) | The school's accent colour owns it. Borrow only the Garden craft rules in `in-app.md`. |
| Internal superadmin (`src/components/admin/AdminShell.tsx`) | `.admin-app` slate tokens | Don't restyle. |

## 2. The feel

**Warm, playful, premium.** MudKitchen was built inside a real microschool (Sage Field, Round Rock TX). The page should feel like that school's wall, not a SaaS template. It also has to be polished enough that a founder trusts it with their tuition and enrollment.

- **Real things carry the page:**
  - real Sage Field photos
  - the real, interactive product demos (`DemoStage`)
  - real app screens
  - the real sample notifications ("Tuition paid · October · autopay")
- **Frame them as classroom objects:** polaroids, sticky notes, washi tape, tickets, postcards, index cards, notebook paper, report cards.
- **Colour:**
  - Pastel papers on warm cream.
  - **Clay** is the action colour; **forest** is the calm anchor and the one dark panel.
- **Type:** chunky display (Bricolage Grotesque), rounded body (Nunito), and a little handwriting (Gochi Hand).
- **Motion is springy and tactile:** things drop in, tilt, wiggle, get crossed out, get filed away, draw themselves and tick off. Never slick parallax-for-its-own-sake.
- **Audience:** founders and school owners first, families second. Every section should answer "what does this do for my school?" with the real product.

## 3. Non-negotiables

1. **Real copy only, word for word.** Never invent claims, prices, numbers, dates, quotes, customer names or features. Copy comes from:

   | Source | Contents |
   |---|---|
   | `src/components/home/home-copy.ts` | `HERO_COPY`, `PRODUCT_INTRO_COPY`, `PAIN_COPY`, `FAMILY/ADMIN/TEACHER_COPY`, `WORKFLOW_COPY`, `PRICING_COPY`, `STORY_COPY`, `CUSTOM_COPY` |
   | `src/lib/faq.ts` | `HOME_FAQ` |
   | `src/lib/site.ts` | titles, descriptions, `SOFTWARE_FEATURES` |
   | `src/lib/marketing/product-preview-tabs.ts` | `PRODUCT_PREVIEW_TABS`, the module captions and descriptions |
   | `src/components/home/FloatingStickers.tsx` | `STICKERS_BY_DEMO`, the sample notifications |
   | `src/lib/marketing/download-app-slides.ts` | `DOWNLOAD_APP_SLIDES`, the app screen alt text and captions |
   | `src/lib/marketing/free-tools-hub-content.ts` | `FREE_TOOLS_HUB_TOOLS` |
   | `src/components/sections/PainSection.tsx` | `PAIRS`, tool → feature |

   - **New pages:** put new copy in a content file next to the page. Never put copy in the kit.
   - **Custom-build tags** (`CUSTOM_COPY.tags`): always present them as custom work, never as built-in features.
2. **Handwritten microcopy is decorative only.**
   - Keep it short, lowercase, `aria-hidden`, and never factual or in a real person's voice.
   - ✅ "scroll to tidy up ↓", "psst — it's interactive. click around!", "pick a card, any card →", "flip me ↻", "pull up a chair!"
   - ❌ "it's the real thing" (the demo is a demo), "A+" grade stickers (an implied rating), "our classroom" (puts words in Sage Field's mouth), "loved by 100 schools" (a claim).
3. **Accessibility:**
   - One `h1` per page; section headings are `h2`, card titles `h3`.
   - Hover effects also work on `:focus-visible`.
   - Decorative SVGs and duplicates get `aria-hidden`.
   - Photos get honest alt text (use the `alt` in `assets.ts`), or `alt=""` when decorative.
4. **Motion is optional:**
   - All GSAP runs inside `gsap.matchMedia()` with `MQ_MOTION` or `MQ_DESKTOP_MOTION`.
   - The server-rendered markup must already show the **final, readable state**: ticks drawn, cards in place, labels visible.
   - Below `lg`, heavy scroll effects become stacked layouts, snap rails or a `Marquee`.
5. **Images:**
   - Use `next/image` with an accurate `sizes`.
   - Use `preload` (not the deprecated `priority`) only for above-the-fold hero images.
6. **Don't restyle shared portal components** to make a marketing page look right. The marketing demos render the real portal code (see `in-app.md`).

## 4. Quick start: a new Garden page

```tsx
// src/app/<route>/page.tsx — server component
import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import { pageMetadata } from "@/lib/metadata";
import MyPage from "@/components/<area>/MyPage";

export const metadata: Metadata = pageMetadata({ title: "…", description: "…", path: "/<route>" });

export default function Page() {
  return (
    <GardenRoot>
      <MyPage />
    </GardenRoot>
  );
}
```

```tsx
// src/components/<area>/MyPage.tsx
"use client";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenFaq from "@/components/home-garden/GardenFaq";

export default function MyPage() {
  return (
    <HomeGardenShell>
      {/* hero (the only h1) → sections → */}
      <GardenFaq />
      <GardenBookDemo /> {/* keeps id="book-demo" so every Book a Demo CTA lands here */}
    </HomeGardenShell>
  );
}
```

- **`GardenRoot`** (server) loads the fonts (`src/components/garden/fonts.ts`) and applies `.sf-garden` plus `garden.css`. Every `--sf-*` token and `sf-*` class only works inside it.
- **`HomeGardenShell`** (client) provides:
  - Lenis smooth scroll (`SmoothScroll`)
  - `GardenNavbar`
  - the `#book-demo` hash handling (`HomePageMain`)
  - the shared `Footer`
  - `FloatingQuestionButton`
  - `overflow-x-clip`, so tilted things can bleed off the edge safely
- **Book a Demo links:** use `BOOK_DEMO_HASH_HREF` (`#book-demo`) when the page has `GardenBookDemo`, otherwise `GET_STARTED_PAGE_PATH` (`/get-started`). Both come from `src/lib/marketing/book-demo.ts`.

### Kit map

| Path | What's in it |
|---|---|
| `src/components/garden/garden.css` | tokens, utility classes, the global-type reset |
| `src/components/garden/fonts.ts` | Bricolage / Nunito / Gochi via `next/font/google` |
| `src/components/garden/GardenRoot.tsx` | scope wrapper (server) |
| `src/components/garden/HomeGardenShell.tsx`, `GardenNavbar.tsx`, `SmoothScroll.tsx` | page chrome |
| `src/components/garden/gsap.ts` | `gsap`, `ScrollTrigger`, `useGSAP`, `MQ_MOTION`, `MQ_DESKTOP_MOTION` |
| `src/components/garden/ui.tsx` | buttons, `MARK`, `Pill`, `Tape`, `Draw` and the doodles, `Tick` |
| `src/components/garden/motion.tsx` | scroll and motion building blocks |
| `src/components/home-garden/*.tsx` | content blocks (§8) |
| `src/components/home-garden/sections/` | the live home page sections |
| `src/components/home-garden/recipes/` | unmounted reference sections |
| `src/lib/marketing/mudkitchen-garden-marketing-theme.ts` | `ParentThemeTokens` in Garden colours, for `GetStartedDemoFlow` |

## 5. Tokens

All tokens are CSS variables on `.sf-garden`. Write them in Tailwind as `bg-[var(--sf-butter)]`, `text-[var(--sf-soft)]`, `bg-[var(--sf-mint)]/45` or `shadow-[0_6px_0_0_var(--sf-ink)]`.

| Token | Hex | Role | Text that passes AA on it |
|---|---|---|---|
| `--sf-cream` | `#F7F1E7` | page background | ink 13.6, soft 5.3, clay-deep 6.7, forest 8.6, clay 4.5 (borderline; large text) |
| `--sf-paper` | `#FFFAF4` | raised surfaces, product section, navbar pill | ink, soft, clay 4.9, forest |
| `--sf-ink` | `#2B241D` | headings, primary text, borders, toy shadows | — |
| `--sf-soft` | `#6D6257` | body copy, secondary text | — |
| `--sf-clay` | `#A05C45` | **primary action**, accent words | white 5.1 (buttons OK) |
| `--sf-clay-deep` | `#7E4533` | clay button shadow; small clay text on tints | — |
| `--sf-forest` | `#2E4A3C` | calm anchor, the dark panel, secondary CTA, success | white 9.7, cream 8.6, butter 7.8 |
| `--sf-forest-deep` | `#1F3329` | forest button shadow | — |
| `--sf-moss` | `#A6B89A` | quiet lines, underline decoration | decoration only |
| `--sf-butter` | `#FFE58A` | sticky notes, tape, highlights, "look here" | ink 12.3, clay-deep 6.0, forest 7.8 |
| `--sf-mint` | `#DDEBD5` | forest-family tint, success, teacher | ink, forest 7.8 |
| `--sf-sky` | `#E3EDFB` | calm tint, parents and families | ink, `#24507a` |
| `--sf-lav` | `#ECE2F3` | playful tint, FAQ and custom | ink, `#5e3a78` |
| `--sf-peach` | `#F8DDCF` | warm tint, admin, pricing callouts | ink, clay-deep 5.8 |

**Contrast rules**
- Small clay text on any pastel fails (≈4.0). Use **clay-deep** for small text on tints. Plain clay is fine for display-size headings and on white or paper.
- `soft` on pastels is about 4.6–5.0. That's OK for body text, but never go lighter than `soft`.
- On forest panels use cream, white or butter. Never use clay text on forest (1.9).

**Section rhythm**
- Alternate plain cream with pastel washes at 35–50% opacity: `bg-[var(--sf-butter)]/40`, `bg-[var(--sf-mint)]/45`, `bg-[var(--sf-sky)]/35`, `bg-[var(--sf-peach)]/40`, `bg-[var(--sf-lav)]/40`. Use `bg-[var(--sf-paper)]` for product-heavy sections.
- **One** solid forest panel per page at most. Inset it as a rounded card: `px-3 lg:px-6` › `rounded-[44px] bg-[var(--sf-forest)]`.
- Use `.sf-grid` (dot-grid paper) behind heroes or product stages, and `.sf-paper` (ruled notebook) for forms and pricing.

**Never build class names dynamically.** Tailwind only generates classes it can see as literal strings. ``bg-[linear-gradient(…${color}…)]`` silently produces nothing. Put variants in a constant map, as `MARK`, `TINTS`, `NOTE_TINTS` and `GROUP_TINT` already do.

## 6. Typography

| Role | Class | Size |
|---|---|---|
| Hero `h1` | `sf-display` | `text-[12.5vw] sm:text-7xl lg:text-[4.2rem] xl:text-[4.75rem]` in a split hero; up to `lg:text-[6.6rem] xl:text-[7.4rem]` in a centred or editorial hero. `leading-[0.86–0.9]` |
| Section `h2` | `sf-display` (usually through `SectionIntro`) | `text-5xl md:text-7xl leading-[0.95]`; inside pinned 100vh frames, `lg:text-[3.2rem] xl:text-[3.5–3.9rem]` |
| Card `h3` | `sf-display` | `text-3xl leading-[1–1.05]`; big feature cards `text-4xl` |
| Big numerals and prices | `sf-display` | `text-[clamp(4.5rem,8vw,8.5rem)] whitespace-nowrap` or sticker size `text-[1.7rem]` |
| Lead paragraph | body | `text-lg leading-relaxed text-[var(--sf-soft)]` |
| Body in cards | body | `text-[15–16.5px] leading-relaxed text-[var(--sf-ink)]/75–85` |
| UI labels and buttons | body | `font-extrabold` (Nunito 800) |
| Eyebrow and meta | body | `text-sm font-extrabold uppercase tracking-[0.18–0.22em]` (editorial) or a `Pill` |
| Handwritten note | `sf-hand` | `text-xl`–`text-2xl`, coloured `text-[var(--sf-forest)]` or `text-[var(--sf-soft)]` |

- **`.sf-display`:** Bricolage, weight 800, tracking −0.035em, line-height 0.95. It's in `@layer components`, so `leading-*` and `tracking-*` utilities override it.
- **Accent phrase:** colour the second half of a headline (`headlineAccent`) clay or forest. Optionally put a drawn `Squiggle` underneath in butter, mint or lav: `SectionIntro` does this through its `accent` and `squiggle` props.
- **Highlighted phrase in body copy:** use `MARK.butter | peach | mint | sky` from `ui.tsx` (a marker swipe under the words). Use it for the one phrase that matters, such as "one shared system".
- **Gochi Hand:** subtitles, captions, step labels ("step 01"), little notes. **Never paragraphs.** One or two per section.
- **The type reset you get for free:**
  - `src/app/globals.css` has unlayered `h1,h2,h3 {font-family: Lora; weight 500; …}`, `p {Poppins}` and `button {Poppins}`. Those beat Tailwind's layered utilities.
  - `garden.css` hands those properties back to the cascade inside `.sf-garden` with `revert-layer`, excluding `.sf-demo`.
  - Never fight the global rules with `!important`. If a heading renders in Lora, it's outside `GardenRoot`.

## 7. Shape and depth

- **Radius:**
  - chips and pills: `rounded-full`
  - small notes: `rounded-md`
  - buttons and inputs: `rounded-full` / `rounded-2xl`
  - cards: `rounded-[26px]`–`rounded-[34px]`
  - big panels: `rounded-[40px]`–`rounded-[44px]`
  - photos inside polaroids: `rounded-[3px]`
- **"Toy" depth** is the signature: `border-2 border-[var(--sf-ink)]` plus a hard offset shadow `shadow-[0_8px_0_0_var(--sf-ink)]`.
  - Buttons: the shadow is `0_6px` in the deeper shade of their fill. They lift on hover (`-translate-y-0.5`, shadow `0_8px`) and press on `active` (`translate-y-1`, shadow `0_2px`).
  - Index cards and chips: 2–5px shadows.
  - Hero frames and big cards: 8–12px shadows.
- **Soft depth** is for photos and paper things without borders: `shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]`, or `sf-polaroid` for photos.
- **Tilt:** set rotation with inline `style={{ rotate: "-1.5deg" }}` and straighten on `hover:!rotate-0` (and `focus-visible:!rotate-0` for links).
  - Cards and frames: ±0.6–2.5°.
  - Scattered wall items: ±4–10°.
  - Alternate the sign between neighbours so it never looks like a bug.
- **Tape:** `<Tape color="var(--sf-butter)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />`. One strip per object, slightly rotated. Cycle `TAPES` from `assets.ts`.
- **Dashed lines** (`border-dashed border-[var(--sf-ink)]/20`) are perforations and separators inside tickets, postcards and pricing.

## 8. Components

### Kit: `src/components/garden/ui.tsx`

| Export | Use |
|---|---|
| `btnPop` | Clay primary CTA (Book a Demo). One per view. |
| `btnForest` | Forest secondary (Read the case study). |
| `btnOutline` | Ink outline secondary (Try the product, See how setup works). |
| `btnButter` | Primary CTA **on forest panels**. |
| `MARK.{butter,peach,mint,sky}` | Marker highlight class for a phrase. |
| `Pill` (`tint`: `clay`, `forest`, `butter`, `sky`, `lav`, `ink`) | Section eyebrow with an emoji (`<Pill tint="forest">🌱 Guided setup</Pill>`); `ink` is for dark panels. |
| `Tape` | Washi tape strip. |
| `Draw` + `Squiggle`, `Sun`, `Leaf`, `Arrow`, `Star`, `Ring` | Hand-drawn doodles that draw themselves on view. `Draw`'s `className` controls display (`hidden lg:block`). Decorative, so they're `aria-hidden`. |
| `Tick` (`tick` prop adds `data-tick`) | Hand-drawn check for lists. Renders checked; pass `tick` to animate the draw-on yourself. |

### Motion: `src/components/garden/motion.tsx`

| Export | Use |
|---|---|
| `Reveal` | Fade and slide its **direct children** in on view (`y`, `x`, `stagger`, `as`). The default wrapper for card grids and copy blocks. |
| `WordsReveal` | Masked word-by-word heading. `immediate` for above-the-fold, `as="span"` inside a heading. |
| `ScrubWords` | Paragraph that lights up word by word with scroll; takes `Run[]` with `highlight`. |
| `CountUp` | Numbers count up on view. Server-renders the final value. Numeric only ("< 3 mo" stays static). |
| `Magnetic` | Primary CTA leans toward the cursor (fine pointers only). |
| `Marquee` | Endless row; speeds up with scroll, pauses on hover and focus. |
| `HorizontalTrack` | Pinned sideways scroll with a progress bar (`header`, `footer`, children are cards). Becomes a snap rail below `lg`. |
| `Parallax`, `ClipReveal` | Image drift and clip-wipe unveil. |
| `useMediaQuery` | SSR-safe media query, e.g. drag only on `(pointer: fine)`. |
| `Runs` | Renders `Run[]` with highlighted phrases. |

### Content blocks: `src/components/home-garden/`

| Block | Use |
|---|---|
| `SectionIntro` | The standard heading stack: Pill → h2 (`lead` + coloured `accent` + optional squiggle) → `note` → `body`. Props: `align`, `dark`, `headingClassName`. **Use this for every section heading.** |
| `GardenDemoFrame` | The live interactive product (`DemoStage`) in a taped browser frame with tilt. `active` is a `DemoStageKey`. Children are overlays (sticker notes). |
| `StickerNote` | A sample notification (`STICKERS_BY_DEMO[key][i]`) as a pastel note. `size="sm"` for overlays. |
| `Polaroid` | Taped photo with an optional handwritten caption. |
| `PhoneCard` | App store slide (`DOWNLOAD_APP_SLIDES[i]`) in a white phone card with its caption. |
| `GrowingPlant` | Seed-to-bloom SVG for scroll scrubs (`recipes.md`). |
| `GardenFaq` | `HOME_FAQ` as index-card accordions with a sticky intro. |
| `GardenBookDemo` | The real `GetStartedDemoFlow` on notebook paper, `id="book-demo"`. |
| `FreeToolsPostcards` | The three free tools as postcards. |
| `CustomBuild` | "We build custom, too" with opposing tag marquees and an `sr-only` list. |
| `assets.ts` | `SAGEFIELD_PHOTOS` (with alt text), `TAPES`, `NOTE_TINTS`, `ILLUSTRATIONS`, logos. |
| `roles.ts` | `ROLES`: family, admin and teacher with copy, demo key, photo, illustration and tints. |
| `product-tabs.ts` | `TAB_TO_DEMO` (module → live demo) and `GROUP_TINT` (Web, Parent, Teacher, Admin colours). |

### Reused from the rest of the app
- `DemoStage` and `prefetchDemoStage` (`src/components/home/DemoStage.tsx`). Prefetch on `pointerenter` and `focus` of whatever switches the demo.
- `MobileAppDownloadBadges` (`src/components/download/`).
- `JsonLd` and `FaqJsonLd` (`src/components/seo/`).
- `pageMetadata` (`src/lib/metadata.ts`).

## 9. Section anatomy and page rhythm

```tsx
<section className="py-24 lg:py-32 bg-[var(--sf-mint)]/45">
  <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
    <SectionIntro pill="🌱 Guided setup" tint="forest" lead={COPY.headlineLead} accent={COPY.headlineAccent}
      accentColor="text-[var(--sf-forest)]" squiggle="var(--sf-mint)" body={<p>{COPY.body}</p>} />
    <Reveal className="mt-16 grid gap-8 md:grid-cols-3" stagger={0.12} y={50}>{/* cards */}</Reveal>
    <div className="mt-14 text-center"><a href={BOOK_DEMO_HASH_HREF} className={btnPop}>{COPY.cta}</a></div>
  </div>
</section>
```

- **Order:** Pill → heading → handwritten note → body → content → CTA.
- **Alignment:** left-aligned, two-column layouts are fine when there's text plus a visual.
- **Widths:** `max-w-7xl` for most sections, `max-w-[1320px]` for wide editorial or split layouts. Copy stays under about `max-w-xl`/`2xl`.
- **One idea and one signature interaction per section**, picked from `recipes.md`. Calm sections in between are what make the loud ones land.
- **Reference flow (home page):** hero with the live product → pain (messy desk) → product as a school day → built for every role → app → customer story → setup → pricing and custom → free tools → FAQ → book a demo. Every section ends with, or is near, a Book a Demo path.

## 10. Imagery and icons

- **Photos:**
  - Use real Sage Field photos (`SAGEFIELD_PHOTOS`). Prefer them over `/images/stock/*` and `/images/people/*`.
  - Frame them as polaroids, blobs (`.sf-blob`), tickets or full-bleed `ClipReveal` bands.
  - The photos are about 1024px. Don't stretch them past about 1200px wide, and keep wide bands inside rounded containers.
- **Product:**
  - Prefer the live `GardenDemoFrame`.
  - For static product shots use the app slides (`/images/mobileapp/*.webp`, aspect 960×2078) in `PhoneCard` or a bordered rounded rect.
- **Illustrations:** `/images/illustrations/*.webp` (`ILLUSTRATIONS`) are transparent cut-outs. Use them in blobs, on spines, or as a prop, like the folder in the messy desk.
- **Tool logos:** `/images/competitors/*` via `PAIRS`. Only use them in "tools you replace" contexts.
- **Icons:**
  - lucide at `strokeWidth` 2.2–2.6.
  - Put them inside a white circle or rounded square with `ring-2 ring-[var(--sf-ink)]`, coloured by context.
  - **Emoji** only lead pills and labels (🌿 🧺 🌱 🌼 🌳 💬 🛠️ 📱), one per label, and never in body copy.

## 11. Motion

- **Gating:**
  - Use `MQ_MOTION` for entrances, draw-ons and simple scrubs.
  - Use `MQ_DESKTOP_MOTION` (≥1024px and motion OK) for pinned and scrubbed scenes and pointer effects.
  - Lenis is disabled entirely for reduced motion.
- **Easings:**
  - Entrances: `power3.out` (copy), `back.out(1.2–1.6)` (objects dropping in), `back.out(2–3)` (stickers and dots popping).
  - Scrubs: `ease: "none"` with `scrub: 0.6–0.8`.
  - Framer: springs `{ stiffness: 380–420, damping: 18–32 }` for tab pills and stickers; `[0.22,1,0.36,1]` for accordions.
  - CSS hover: `duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]` (springy).
- **Timing:**
  - Entrances 0.8–1.3s with stagger 0.06–0.12.
  - Hero copy delays 0.2–0.7s, so the frame lands first and the copy follows.
- **Pinned scenes:**
  - Structure: `section.lg:h-[220–280vh]` › `div.lg:sticky.lg:top-0.lg:h-screen`.
  - One timeline on `{ trigger: section, start: "top top", end: "bottom bottom", scrub }`.
  - End with a short `tl.to({}, { duration: 0.1–0.15 }, 0.9)` hold so the final state is readable.
  - **The pinned frame must fit within 100vh at 1440×900** (measure it; §15).
- **Popping overlays** (sticker notes on a frame): use framer `AnimatePresence mode="popLayout"`, keyed by sticker id, and pass `initial={reduce ? false : …}`.
- **Never animate something only to hide it at rest.** The rest state is the content.

## 12. Responsive

- **Gutters:** `px-6 sm:px-10 lg:px-16`. Vertical rhythm: `py-24 lg:py-32` (editorial `lg:py-36`).
- **Phone fallbacks:**

  | Desktop pattern | Phone version |
  |---|---|
  | Scattered or pinned scene | Stacked layout, or a tidy list ("Google Forms → Enrollment") |
  | Horizontal track | Snap rail (`snap-x snap-mandatory` plus `[scroll-padding-inline:1.5rem]`) |
  | Photo columns | `Marquee` |
  | Expanding panels | Accordion |
  | Sticky demo | Demo above the list |

- **Snap rails** need `scroll-padding-inline` equal to their padding, or the first card snaps flush to the edge.
- **Overlays:** sticker overlays on frames are `hidden sm:block` or `xl:block`. Don't let them cover the demo on small screens.
- **Navbar:** `GardenNavbar` is a transparent bar that becomes a floating paper pill after scroll. It has a mobile menu with `data-lenis-prevent`.

## 13. Accessibility

- **Focus:** every interactive element gets `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30` (or `/40` on buttons, forest or ink as appropriate). Tilted links straighten on focus too.
- **Tab switchers** (role views, module cards):
  - `role="tablist"`, then `role="tab"` with `aria-selected` and `aria-controls`, then `role="tabpanel"`.
  - The active pill is a framer `motion.span layoutId`.
- **Toggles:**
  - Flip cards are a `<button aria-pressed>`.
  - Expanding panels use `aria-expanded` plus `aria-controls`, and open on `onFocus` as well as hover.
- **Decorative duplicates** (marquees, scattered walls) are `aria-hidden`. Give the real content once elsewhere: `CustomBuild` renders an `sr-only` `<ul>` of the tags.
- **Hover-only details** must also be reachable by tap and keyboard.
- **Known issue:** `GetStartedIntroductionForm` (inside `GardenBookDemo`) hardcodes an `h1`, so pages with the booking flow have two. Fixing it means adding a heading-level prop to that shared component.

## 14. Gotchas we hit (read before writing motion)

1. **Never put Tailwind `translate-*`, `scale-*` or `rotate-*` on an element GSAP animates.** GSAP folds them into its transform and the class states stop working. Position or rotate a **wrapper** and animate an inner `data-*` element.
2. **Inline CSS `rotate` and GSAP `rotate` add up.** They're separate properties. If an element has `style={{ rotate }}`, animate GSAP `rotate` to `0`, not to the same angle (that doubles it).
3. **No dynamic Tailwind classes** (§5). Copy a literal class or use a constant map.
4. **Lenis plus interactive demos:**
   - With `allowNestedScroll`, wheeling over an interactive `GardenDemoFrame` scrolls the demo first.
   - Don't put interactive demos in pinned scroll scenes.
   - For purely decorative frames pass `interactive={false}`.
5. **Sticky and ScrollTrigger:** triggers measure the pre-stick layout. Inside a sticky frame, trigger off the **section** (`start: "top top"`), not the inner element.
6. **Draw-on SVG paths:** `pathLength={1}` with `strokeDasharray="1 2"`, animating `strokeDashoffset` from 1 to 0. Plain `"1"` leaves a round-cap dot.
7. **`.sf-demo` isolation:** the live demos keep the app's fonts. Don't remove that wrapper (it's in `GardenDemoFrame`).
8. **Headless and hidden-tab testing:** rAF is throttled, so scrubs only advance with real wheel scrolling. The dev server's first compile of a Garden page can take minutes; curl the route first.
9. **Child effects run before parent effects.** Create pinned triggers top to bottom in DOM order, or call `ScrollTrigger.refresh()`. `SmoothScroll` already refreshes on height changes and font load.

## 15. Pre-ship checklist

- [ ] Every string comes from a copy source (§3). New microcopy is decorative, short and `aria-hidden`.
- [ ] One `h1`. Section headings `h2` (through `SectionIntro`).
- [ ] No small clay text on pastels; clay-deep instead (§5).
- [ ] Each section has at most one signature interaction; at most one forest panel per page.
- [ ] At 1440×900, pinned frames fit and scrub forwards and backwards.
- [ ] At 375px there's no horizontal scroll, the fallbacks render, and the navbar menu works.
- [ ] Reduced motion: everything readable, nothing stuck mid-animation.
- [ ] Hover details are reachable by focus and tap; the focus ring is visible.

Verification:

```bash
npx tsc --noEmit
npx eslint <changed paths>
npm run build
```

Paste these in the browser console on the page:

```js
// No horizontal scroll (run at 375px):
document.documentElement.scrollWidth === document.documentElement.clientWidth
// Pinned frame fits (run while pinned):
[...document.querySelectorAll("[data-pin], .lg\\:sticky")].map((e) => [e.scrollHeight, innerHeight])
// Heading outline:
[...document.querySelectorAll("h1")].map((h) => h.textContent.slice(0, 40))
```

Then run the repo's `portal-responsive-verify` skill for the three-viewport screenshots.
