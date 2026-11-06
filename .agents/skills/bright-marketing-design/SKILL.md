---
name: bright-marketing-design
description: >-
  Bright Product-led design system for MudKitchen public marketing pages, taken
  from the redesigned home page. Use when restyling or building marketing pages
  (about, customers, blog, tools, get-started, tuition planner, landing pages)
  so they match the home page look and feel: bold Poppins headings, white canvas
  with pastel blocks, dark ink pills, clay accent highlight, scaled live demos.
---

# Bright Marketing Design (home page look and feel)

The home page at `/` is the reference implementation. Its components live in
`src/components/home/`, and the page is assembled in `src/app/page.tsx`.
When in doubt, open the matching component and copy the pattern instead of
inventing a new one.

## When to use

- Restyling or building a **public marketing page** so it matches the home page.
- Adding a new section to the home page.
- Not for logged-in portals (parent, teacher, school admin). Those use
  [`parent-portal-story-design`](../parent-portal-story-design/SKILL.md) and
  [`admin-workspace-design`](../admin-workspace-design/SKILL.md).

## Design principles

1. **White canvas, pastel blocks.** Page background is white. Sections alternate
   between plain white and large rounded pastel or ink blocks.
2. **Bold sans headings.** Poppins bold, tight tracking, highlighter underline on
   the key phrase. No serif headings on bright pages.
3. **Ink pills for action.** Primary button is a dark pill; secondary is an outline
   pill. One primary action per section, almost always "Book a Demo".
4. **Show the product.** Real interactive demos scaled into a frame, not static
   mockups.
5. **Calm motion.** Entrances are small fades and rises. Heavier motion (3D tilt,
   convergence) only on large screens and never when the user prefers reduced motion.

## Tokens

Defined in `src/components/home/bright-styles.ts` and `src/app/globals.css`.
Import the constants rather than retyping class strings.

| Token | Value | Use |
|-------|-------|-----|
| Ink (`INK`) | `#1d1a16` | Headings, dark pills, dark bands |
| Page | `#FFFFFF` | Default section background |
| Clay accent | `clay` (`#A05C45`) | Eyebrows, highlighted phrase, links, hover on dark pills |
| Highlight | `#F8DDCF` | Highlighter underline behind accent phrase, hover on white-on-dark buttons |
| Neutral chip / well | `#F4F1EC`, `#F7F5F2` | Badges, bullet chips, inset notes |
| Group tint: website | `#EEF3EC` | Tiles and panels for website |
| Group tint: parent | `#EAF1FD` | Parent / family |
| Group tint: teacher | `#E4F5EC` | Teacher |
| Group tint: admin | `#FDEFE4` | Admin / operations |
| Story green | `#E9F2E4` | Customer story block |
| Role colors | `PRODUCT_PREVIEW_GROUP_COLORS` | Icons, active progress bars, dots |

Shape: `rounded-pill` for buttons, chips, tabs; `rounded-[24px]` to `rounded-[32px]`
for cards; `rounded-[40px]` for full-width section blocks (`max-w-[1400px]` with
`px-3 lg:px-6` page gutter so the block floats inside the viewport).

Text colors: body copy is `text-[#1d1a16]/70`, captions `/60`, on dark `text-white/65`.

## Typography

- Headings: Poppins (`font-secondary`) bold with `-0.04em` tracking and `1.03` leading.
  Use the shared constant:

  ```tsx
  import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

  <h2 className={`mt-4 text-[clamp(2rem,4.4vw,3.6rem)] ${BOLD_HEADING}`}>
    Start with what you need. <span className={ACCENT_HIGHLIGHT}>Grow when you&rsquo;re ready.</span>
  </h2>
  ```

- **Gotcha:** `globals.css` has unlayered `h1, h2, h3 { font-family: Lora; ... }` and
  `p { font-family: Poppins }`. Unlayered CSS beats Tailwind utilities, so heading
  overrides need Tailwind v4 trailing `!` (`font-secondary!`, `font-bold!`,
  `tracking-[-0.04em]!`, `leading-[1.03]!`). `BOLD_HEADING` already does this. For an
  `h3`, apply the same `!` utilities.
- Hero h1: `text-[clamp(2.6rem,6.4vw,5.6rem)]`. Section h2: `clamp(2rem,4.2vw,3.5rem)`.
- Eyebrow: `font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay`.
- Body: 16 to 19px, `leading-relaxed`, 70% ink.
- Buttons and labels: `font-secondary`, 14 to 15px, `font-semibold`.
- Accent phrase: wrap the last clause of the heading in `ACCENT_HIGHLIGHT`
  (clay text plus a 36% highlighter underline).

## Buttons and chips

```tsx
import { DARK_PILL, OUTLINE_PILL } from "@/components/home/bright-styles";
```

- `DARK_PILL`: primary. Ink fill, white text, lifts on hover and turns clay.
- `OUTLINE_PILL`: secondary. White fill, `border-black/15`.
- On dark blocks use a white pill (`bg-white text-[#1d1a16] hover:bg-[#F8DDCF]`).
- Chips: `rounded-pill bg-[#F4F1EC] px-4 py-2 text-[14px]`.
- Book a Demo links use `BOOK_DEMO_HASH_HREF` when the target form is on the same
  page, and `BOOK_DEMO_HREF` (`/#book-demo`) from any other page.

## Navigation and footer

- `BrightNavbar` (`src/components/home/BrightNavbar.tsx`): flat, full width, fixed;
  transparent at the top, white blur once scrolled; Poppins wordmark; dark "Book a
  Demo" pill; mobile menu below `md`. Product link is `#product`, so on other pages
  pass the `/#product` form or give the page its own product anchor.
- Footer and floating Questions button are the existing shared components
  (`Footer`, `FloatingQuestionButton`), loaded lazily and gated with
  `InViewSectionGate`. See `HomeShell` for the wrapper.

## Section recipes

Each recipe maps to a component in `src/components/home/`.

| Section | Component | Recipe |
|---------|-----------|--------|
| Hero | `BrightHero` | Centered badge, huge bold headline with highlighted clause, body, two pills. Pastel blurred blobs behind. Below: Parent / Teacher / Admin segmented tabs (white pill bar, ink active tab, role-colored icons, icons hidden below `sm`) driving a `DemoStage` with `tour` inside a browser-chrome frame and `FloatingStickers`. At `lg` and up the frame starts tilted (`rotateX 24` to `0`, scale `0.86` to `1`) and flattens on scroll with a pastel glow behind it. |
| Stats | `BrightStats` | Full-width ink block, three huge bold numbers, location link with a circular arrow. |
| Product bento | `BrightBento` (`id="product"`) | Centered eyebrow + heading + bullet chips. Left: module tiles tinted by group, active tile fills with its role color, horizontal scroll on mobile. Right: tinted panel with caption and an interactive `DemoStage`. |
| Problem | `BrightPain` | Peach block. "Scattered today / All in one shared system" toggle animates `ToolHub variant="converge"`. Below `md` it is a plain list. Auto-flips to unified after entering view unless the user interacts. |
| Roles | `BrightPersonas` | Three role cards; the active card grows (`lg:flex-[1.9]`) and fills with the role color. Detail panel has copy, bullets, sub-tab pills and an interactive demo. |
| Customer story | `BrightStory` | Soft green block: badge, headline, big semibold quote with clay left rule, author, plus white inset card with stats, case-study list, ink CTA. |
| Setup | `BrightSetup` | Header split, three step cards with an auto-rotating progress bar, ink visual panel showing the active step, CTAs. |
| Pricing | `BrightPricing` (`id="pricing"`) | Left: eyebrow, heading, body, inset note. Right: ink plan card with two-column check list and a white CTA. |
| Custom | `BrightPricing` (`id="custom"`) | Blue pastel block with two opposite-direction marquee rows of tags and an ink CTA. |
| FAQ | `BrightFaqSection` | Two columns, sticky heading left, `details` accordion right with a `+` that rotates open. |
| Tail | `HomeTail` | Free tools, get-started carousel, FAQ, Book a Demo form. |

## Demos and motion

- Use `DemoStage` (`src/components/home/DemoStage.tsx`) for any live demo. It scales a
  fixed design canvas to the container, lazily mounts each panel the first time it is
  shown, crossfades, and marks inactive or non-interactive panels `inert`. Pass
  `tour` only for the hero-style guided walkthrough, `interactive` when users should
  click inside.
- `DemoStage` height is pure CSS (container query units), so it is correct on first
  paint. Do not replace it with a JS-measured height: that shifts the layout after
  hydration and makes `/#product` links from other pages land too high.
- Auto-rotating UI uses `useAutoRotate` plus `RotateProgressBar` (framer-motion
  animates the bar so heavy children do not re-render every frame).
- Entrances use `FadeInView`; hero uses the `hero-enter` and `hero-frame-enter` classes.
- Always respect `useReducedMotion`. Gate tilt and scroll-driven effects with
  `useMediaQuery("(min-width: 1024px)")`.
- On phones, demos crop on the right rather than shrinking below `minScale`
  (default `0.42` to `0.5`). Keep tab bars short enough to fit 375px or make them
  horizontally scrollable.

## Copy rules

- User-facing brand is **MudKitchen** (see the `mudkitchen-branding` rule).
- Home page marketing copy lives in `src/components/home/home-copy.ts`. Reuse those
  constants instead of duplicating strings.
- Keep headings to one idea; put the accent phrase at the end.

## Apply to another page (checklist)

1. Use `BrightNavbar`, the shared `Footer`, and `FloatingQuestionButton`; wrap the
   body in `HomePageMain` if the page uses Book a Demo hash links.
2. White page background. Alternate white sections with `rounded-[40px]` tinted or
   ink blocks inside `max-w-[1400px]`.
3. Headings via `BOLD_HEADING` and `ACCENT_HIGHLIGHT`; eyebrow above each section.
4. Buttons via `DARK_PILL` and `OUTLINE_PILL`.
5. Reuse `DemoStage` and existing demos; never build a new scaled-demo wrapper.
6. Reuse existing marketing components where they fit (`HomeFreeToolsSection`,
   `GetStartedShowcaseCarousel`, `HomeBookDemoSection`).
7. Keep SEO intact: metadata, JSON-LD, one h1, heading order.
8. Run the verification below.

## Do and don't

- Do import style constants from `bright-styles.ts`.
- Do keep one primary CTA per section.
- Do keep copy identical to source-of-truth constants.
- Don't use Lora (`font-display`) headings, sage or forest backgrounds, or the old
  floating-pill `Navbar` on pages that adopt this look.
- Don't set heading fonts with plain Tailwind classes (they lose to the global
  `h1, h2, h3` rule); use the `!` utilities.
- Don't hide content behind hover only; keep tab and toggle controls keyboard
  accessible.
- Don't add horizontal overflow; check at 375px.

## Verification

After editing `src/**/*.tsx` or `src/**/*.css`, follow
[`portal-responsive-verify`](../portal-responsive-verify/SKILL.md): run
`npm run lint:errors` and `npm run typecheck`, capture mobile (375), tablet (768) and
desktop (1440) screenshots, read the PNGs, and report Pass or Issue per viewport.
For the home page, `e2e/.artifacts/capture-home-variant.mjs` captures full-page
scroll sequences:

```bash
PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright \
  node e2e/.artifacts/capture-home-variant.mjs / home all 18
```
