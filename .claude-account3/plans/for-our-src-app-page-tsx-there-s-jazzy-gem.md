# Design System: Eden Palette + Typography Upgrade

## Context

The landing page currently uses warm beige neutrals + a single teal accent (`#244b46`) and two fonts (Inter body, Instrument Serif display). It reads as visually flat — there's no color contrast or typographic range to create hierarchy or emotion. The goal is to apply an Eden-inspired green color system and a 4-font palette that distinguishes interface text, editorial headings, technical labels, and handwritten accent moments.

---

## Changes

### 1. `src/app/layout.tsx`

Replace `Inter` + `Instrument_Serif` imports with the full font set:

```ts
import { Geist, Lora, Fragment_Mono, Delicious_Handrawn } from "next/font/google";
```

Configure each with a CSS variable:
- `Geist` → `variable: "--font-geist"` (subsets: latin, display: swap)
- `Lora` → `variable: "--font-lora"` (subsets: latin, weight: 400/500/600/700, style: normal + italic, display: swap)
- `Fragment_Mono` → `variable: "--font-fragment-mono"` (subsets: latin, weight: 400, display: swap)
- `Delicious_Handrawn` → `variable: "--font-delicious"` (subsets: latin, weight: 400, display: swap)

Pass all four variables to `<html className="...">`.

---

### 2. `src/app/globals.css`

**Replace all `@theme` color tokens** with the Eden palette:

```css
--color-bg:            #f4f2f0;   /* warm off-white page background */
--color-bg-alt:        #f1f1f1;   /* soft neutral gray */
--color-surface:       #ffffff;   /* pure white */
--color-surface-soft:  #eceeed;   /* very light cool neutral */
--color-surface-muted: #eceeed;
--color-border:        #ededed;   /* light border gray */
--color-border-strong: #a8a8a8;   /* medium gray */
--color-text:          #052415;   /* primary dark (near-black green) */
--color-text-muted:    #6f6f6f;   /* muted gray */
--color-text-faint:    #a8a8a8;   /* light gray */
--color-accent:        #284a3d;   /* mid dark green */
--color-accent-hover:  #052415;   /* darkest green on hover */
--color-accent-soft:   #99b7ab;   /* muted sage green */
--color-accent-highlight: #abffc0; /* bright mint (use sparingly) */
--color-dark-panel:    #253f31;   /* deep forest surface */
```

**Update font tokens:**

```css
--font-display: var(--font-lora), "Lora", serif;
--font-body:    var(--font-geist), "Geist", sans-serif;
--font-mono:    var(--font-fragment-mono), "Fragment Mono", monospace;
--font-handwritten: var(--font-delicious), "Delicious Handrawn", cursive;
```

**Update `h1, h2, h3` rule** — keep `-0.03em` letter-spacing, `0.98` line-height (they work well with Lora too).

---

### 3. Targeted component edits for new fonts

**`Fragment Mono`** — applied to technical/numeric elements:
- `src/components/sections/WorkflowSection.tsx`: step numbers (`text-[3.5rem]`) → add `font-mono` class
- `src/components/sections/ProductPreviewSection.tsx`: table header cells (the tiny uppercase labels like "COURSE", "STUDENT") → add `font-mono`

**`Delicious Handrawn`** — applied to one or two emotional accent moments:
- `src/components/sections/FounderStoryBridgeSection.tsx`: quote attribution line (the `"— Julius, founder"` text) → add `font-handwritten text-lg`
- `src/components/sections/HeroSection.tsx`: wrap a single emotionally-loaded word in the h1 in a `<span className="font-handwritten">` — e.g. the word that carries the most human weight in the headline

---

## Critical files

- `src/app/layout.tsx` — font loading
- `src/app/globals.css` — all design tokens
- `src/components/sections/WorkflowSection.tsx` — step numbers
- `src/components/sections/ProductPreviewSection.tsx` — table headers
- `src/components/sections/FounderStoryBridgeSection.tsx` — quote attribution
- `src/components/sections/HeroSection.tsx` — hero headline accent word

---

## Notes

- All section components use semantic token names (`bg-accent`, `text-text-muted`, etc.), so updating the CSS variables in `globals.css` cascades everywhere automatically — no mass component edits needed for color changes.
- "Feature Display Web" is likely proprietary to Eden and not publicly available; Lora is the recommended alternative (editorial serif, strong personality, Google Fonts).
- The `FinalCTASection` uses `bg-accent` as a full-width dark section — the new `#284a3d` makes it a deep forest green panel, which will have significantly more visual impact than the current teal.
- The `--color-accent-highlight: #abffc0` (bright mint) is not wired into existing components; after implementing, consider using it for hover states or a single decorative badge to add pop.

---

## Verification

1. `npm run dev` → open in browser
2. Check typography: headings should render in Lora (serif), body in Geist (clean sans), step numbers in Fragment Mono (monospace), quote attribution in Delicious Handrawn (handwritten)
3. Check color: page background should be warm off-white `#f4f2f0`, accents deep forest green, FinalCTA section a rich `#284a3d` panel
4. Check no layout regressions — Lora and Geist have different metrics than Instrument Serif and Inter; verify no text overflow
