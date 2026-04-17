# School Stack Landing Page — Implementation Plan

## Context

The School Stack marketing site is currently a blank canvas (`src/app/page.tsx` has only `<h1>schoolstack</h1>`). The goal is to build the complete landing page per the revised spec — a high-fidelity, conversion-focused marketing page that combines the Eden-inspired design system with School Stack's founder-origin narrative. The page should feel like a premium creative software experience, not a generic SaaS template.

Stack: **Next.js 16.2.4 · React 19 · TypeScript · Tailwind CSS 4.2.2**. Framer-motion is not yet installed.

---

## Step 0 — Install Framer Motion

```bash
npm install framer-motion
```

Framer-motion v12+ supports React 19. Types are bundled — no `@types` package needed.

---

## File Structure

```
src/
├── app/
│   ├── globals.css              ← @theme design tokens + base styles
│   ├── layout.tsx               ← Instrument Serif + Inter via next/font/google
│   └── page.tsx                 ← composes all sections
│
├── components/
│   ├── ui/
│   │   ├── FadeInView.tsx       ← 'use client' — reusable framer-motion entrance wrapper
│   │   ├── Button.tsx           ← primary / secondary / ghost variants
│   │   ├── Badge.tsx            ← eyebrow chips
│   │   └── Container.tsx        ← max-width wrapper
│   │
│   └── sections/
│       ├── Navbar.tsx                      ← 'use client' — scroll state + mobile drawer
│       ├── HeroSection.tsx                 ← 'use client' — mount animations
│       ├── PainSection.tsx                 ← server — uses FadeInView children
│       ├── FounderStoryBridgeSection.tsx   ← server
│       ├── ProductPreviewSection.tsx       ← 'use client' — tab state + AnimatePresence
│       ├── WorkflowSection.tsx             ← server
│       ├── StacksSection.tsx               ← server
│       ├── ProofSection.tsx                ← server
│       ├── CustomSection.tsx               ← server
│       ├── FinalCTASection.tsx             ← server
│       └── Footer.tsx                      ← server
│
└── lib/
    └── motion.ts                ← shared framer-motion variants + inViewProps
```

---

## globals.css

Tailwind v4 maps `@theme` tokens to utility classes. Critical naming rule: only `--color-*` keys auto-generate `bg-*`, `text-*`, `border-*` utilities. Others (radius, shadow, font) need their own namespace.

```css
@import "tailwindcss";

@theme {
  /* Colors — accessible as bg-accent, text-text-muted, border-border, etc. */
  --color-bg:            #f6f5f2;
  --color-bg-alt:        #f1efe9;
  --color-surface:       #ffffff;
  --color-surface-soft:  #fbfaf7;
  --color-surface-muted: #f3f1ec;
  --color-border:        #e7e3dc;
  --color-border-strong: #d9d4cc;
  --color-text:          #1f1e1a;
  --color-text-muted:    #6f6b65;
  --color-text-faint:    #9a958d;
  --color-accent:        #244b46;
  --color-accent-hover:  #1d3d39;
  --color-accent-soft:   #dfe8e5;

  /* Radius — accessible as rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-pill */
  --radius-sm:   10px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-xl:   28px;
  --radius-pill: 9999px;

  /* Shadows — accessible as shadow-xs, shadow-sm, shadow-md, shadow-lg */
  --shadow-xs: 0 1px 2px rgba(20,20,20,0.04);
  --shadow-sm: 0 6px 24px rgba(20,20,20,0.05);
  --shadow-md: 0 14px 40px rgba(20,20,20,0.08);
  --shadow-lg: 0 24px 60px rgba(20,20,20,0.10);

  /* Fonts — accessible as font-display, font-body */
  /* These reference the CSS vars injected by next/font/google in layout.tsx */
  --font-display: var(--font-instrument-serif), "Instrument Serif", serif;
  --font-body:    var(--font-inter), "Inter", sans-serif;
}

html { scroll-behavior: smooth; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  line-height: 0.98;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## layout.tsx — Font Setup

`Instrument_Serif` (underscore, not space) from `next/font/google`. Weight `'400'` only — this font has no bold. Both fonts use `variable` mode so their CSS custom properties get injected on `<html>`.

```tsx
import { Inter, Instrument_Serif } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

// Apply both variable classes to <html>
// globals.css @theme picks up --font-instrument-serif and --font-inter
```

---

## lib/motion.ts

Shared variants used across all sections:

- `fadeUp` — y: 18 → 0, opacity 0 → 1, 550ms ease-standard
- `fadeIn` — opacity only, 450ms
- `scaleIn` — scale 0.97 → 1 + fade, 600ms (hero product frame)
- `staggerContainer` — 80ms stagger between children
- `staggerContainerSlow` — 120ms stagger (workflow steps, stack cards)
- `inViewProps` — `{ initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } }`

---

## Section Implementations

### Navbar (`'use client'`)
- `useEffect` scroll listener: transparent at 0px, `bg-surface shadow-xs` past 40px
- `useState` for mobile drawer (open/close)
- Logo: `font-display text-[18px] text-text`
- Nav links: `hidden md:flex gap-8` — `text-sm text-text-muted hover:text-text`
- CTA: `bg-accent text-white rounded-pill px-[18px] h-10 text-sm hover:bg-accent-hover hover:-translate-y-0.5`
- Mobile drawer: framer-motion `x: '100%' → 0`, slides from right, full-screen

### HeroSection (`'use client'`)
- Grid: `grid-cols-1 lg:grid-cols-[45fr_55fr]`, `pt-[140px] pb-[120px]`
- Eyebrow chip, H1 `clamp(2.75rem,5.5vw,5.25rem)`, body `max-w-[52ch]`, CTA row
- Animations: `initial/animate` (above fold, not `whileInView`). Stagger eyebrow→H1→body→CTAs at 80ms intervals
- Product frame: `h-[540px] rounded-xl bg-surface border border-border shadow-lg overflow-hidden`
- Placeholder hero visual: sidebar nav + admin kanban layout (see Product Preview Admin tab spec below)
- Product frame uses `scaleIn` variant (scale 0.97→1, 320ms delay)

### PainSection (server)
- `bg-bg-alt py-24`, narrow `max-w-[680px] mx-auto text-center`
- H2: Instrument Serif `clamp(2rem,4vw,3rem)`
- Pain strip: `flex-wrap justify-center gap-2 mt-10`; on mobile `flex-nowrap overflow-x-auto`
- Each tool pill: `rounded-pill bg-surface-muted border border-border text-xs text-text-faint px-3 py-1.5`
- Tools: Google Forms · Venmo · Gmail · Excel · Wix · Dropbox · SignNow · PDFs · Stripe · Google Docs
- Animation: `staggerContainer` wrapping H2, body, strip — `whileInView once:true`

### FounderStoryBridgeSection (server)
- 2-col asymmetric `grid-cols-1 lg:grid-cols-[1fr_1fr] gap-20 items-center`
- Left: eyebrow, H2 `clamp(1.9rem,3.5vw,2.6rem)`, body, 4 bullet points with accent dot icons
- Right: editorial collage using `relative h-[480px]`
  - Product crop frame: `absolute inset-0 right-12 bottom-20 rounded-xl bg-surface border shadow-md`
  - Founder note card: `absolute bottom-16 right-0 w-[220px] bg-surface border rounded-lg p-4 shadow-md`; quote in `font-display italic`
  - School facts card: `absolute bottom-0 left-4 w-[200px] bg-accent-soft border border-accent/20 rounded-lg p-4`
- On `< lg`: collage converts to stacked 2-card grid, product frame above
- Animation: left `fadeUp whileInView`, right collage 120ms delay

### ProductPreviewSection (`'use client'`)
- `useState<TabId>` for active tab; default: `'admin'`
- Tab bar: `bg-surface border border-border rounded-pill shadow-xs p-1.5 flex gap-1 overflow-x-auto`
- Active tab: `bg-accent text-white rounded-pill`; inactive: `text-text-muted rounded-pill hover:bg-surface-muted`
- Keyboard: left/right arrows cycle tabs; `useRef` for scroll-into-view on mobile
- Frame: `h-[560px] rounded-xl border border-border-strong shadow-lg overflow-hidden relative`; mobile `h-[280px]`
- `AnimatePresence mode="wait"` → each panel `motion.div key={activeTab}` opacity 0→1 220ms
- Caption bar: `absolute bottom-0 inset-x-0 px-5 py-3.5 bg-[rgba(15,14,12,0.75)] backdrop-blur-sm`

#### Tab mockup compositions (HTML/CSS placeholder UIs):

**Admin (default)** — Kanban pipeline:
`flex h-full` → sidebar 150px (nav items: Dashboard, Applications●, Students, Parents, Teachers, Payments, Leads) + main with 3-column kanban (New Inquiry / Reviewing / Enrolled). Application cards show student name, program badge, date. Column headers with count badges.

**Enrollment** — Multi-step form:
Centered form card `max-w-[480px] rounded-xl border p-8`. Step progress indicator (steps 1-5, step 2 active in accent). Section: "Parent & Guardian Information". Fields: First Name / Last Name grid, Email, Phone, Relationship dropdown. Back + Continue buttons.

**Website** — School site preview:
Stacked layout: top nav bar with "Sage Field" logo + nav links + "Apply Now" pill. Hero band `bg-bg-alt` with H1 "Welcome to Sage Field" in `font-display`. Below: 3 program cards.

**Parents** — Portal dashboard:
Sidebar (avatar + nav: Dashboard●, Forms, Billing, Messages) + main with "Hello, Emma" greeting, enrollment checklist card (✓ Application, ✓ Health form, ○ Contract, ○ Tuition), billing preview card.

**Teachers** — Student cards + notes:
Sidebar (Students●, Notes, Hours, Feed) + main with 2×2 student card grid + note list below. Each card: student name, program badge, note count. Notes show category badge + excerpt.

**Payments** — Transaction table:
Table with columns: Student | Type | Amount | Date | Status. 5-6 rows. Status pills: `bg-green-50 text-green-700` for paid. Right sidebar showing selected transaction detail.

**Leads** — CRM table:
Header with "Leads CRM" + search + "New Lead" button. Status tabs (All 14 / New / Contacted / Touring / Enrolled). Table: Name | Interest | Status | Tags | Last Contact. Tag pills in `bg-accent-soft text-accent`.

### WorkflowSection (server)
- `bg-bg-alt py-24`, centered heading
- 3-card `grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative`
- Connecting line (desktop only): `absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-border pointer-events-none`
- Step cards: `bg-surface border border-border rounded-lg p-8 shadow-xs`
  - Step number `text-[11px] font-medium text-text-faint uppercase tracking-widest`
  - Large decorative number `text-[3rem] font-display text-border-strong leading-none mt-1`
  - Title `text-[17px] font-medium text-text mt-3`
  - Body `text-sm text-text-muted mt-2 leading-relaxed`
- `staggerContainerSlow` wrapping 3 cards, `whileInView once:true`

### StacksSection (server)
- `bg-bg py-24`, centered heading (no pricing shown, CTA-only)
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-start`
- Standard card: `bg-surface border border-border rounded-xl p-8 shadow-xs`
- Featured (Growth): `border-2 border-accent shadow-md md:-mt-4 relative` + `"Recommended"` badge `absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] rounded-pill px-4 py-1`
- Feature list bullets: `w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0`
- CTAs: Featured gets `bg-accent text-white`; others get `border border-border text-text`
- Tiers: Starter (solo, 20 students), Growth (3–5 teachers, 20–60 students), Academy (60+ students)
- Below all cards: "Need something custom?" text link in accent

### ProofSection (server)
- `bg-bg-alt py-24`, 2-col `grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-center`
- Left: eyebrow, H2 "The founder story is the product story.", body, pull quote card, "See the school →" link
- Pull quote card: `bg-surface-muted border border-border-strong rounded-lg p-6` — NO left border accent rail; instead a small `w-2 h-2 rounded-full bg-accent mb-4` dot above the quote
- Quote in `font-display text-[1.1rem] italic`
- Right: casually stacked 3-card collage using `relative h-[480px]`
  - Cards at slightly different rotations (`rotate-[-1.5deg]`, `rotate-[1deg]`, `rotate-[0deg]`)
  - Each contains a cropped product UI snippet
  - On `< lg`: converts to flat `grid grid-cols-1 gap-4` (no rotation/overlap)

### CustomSection (server)
- `bg-surface-muted py-24`, centered `max-w-[860px]`
- H2, body, tag cloud `flex flex-wrap justify-center gap-2.5 mt-10`
- Tag hover: `hover:bg-accent-soft hover:text-accent hover:border-accent/30`
- CTA primary pill below tags
- Tags stagger in with `staggerContainer` 40ms between each

### FinalCTASection (server)
- `bg-accent py-32`, centered `max-w-[720px]`
- H2 `clamp(2.2rem,4.5vw,3.5rem)` color `#f8f7f4`
- Body `text-[rgba(248,247,244,0.7)]`
- CTA: `bg-[#f8f7f4] text-accent rounded-pill px-8 h-12`
- Reassurance: `text-[rgba(248,247,244,0.5)] text-sm mt-5`

### Footer (server)
- `bg-bg border-t border-border py-16`
- 4-col grid: brand column + Product + Company + Legal
- Bottom bar: copyright left, "Built by the team at Sage Field" right in `text-accent`

---

## Tailwind v4 Gotchas

1. **`--color-*` is mandatory** to generate utilities. `--color-accent` → `bg-accent`, `text-accent`, etc. Defining `--accent` alone creates only a CSS var.
2. **No `tailwind.config.js`** — all tokens in `@theme {}` in globals.css.
3. **`rounded-pill`** works because `--radius-pill` is defined. In v3 you'd use `rounded-full`.
4. **`font-display`** works because `--font-display` is in `@theme`.
5. **Arbitrary values** work identically: `text-[clamp(...)]`, `bg-[rgba(...)]`, `h-[540px]`.
6. **`border-border`**: just works — no `border-[var(--color-border)]` needed.
7. **Opacity modifier**: `bg-accent/50` — v4 slash syntax works natively.

---

## Motion Summary

| Section | Trigger | Pattern |
|---|---|---|
| Navbar | scroll | CSS transition (no framer) |
| Hero | mount | `initial/animate` stagger, not `whileInView` |
| Pain | scroll | `staggerContainer whileInView` |
| FounderBridge | scroll | left `fadeUp`, right +120ms delay |
| Workflow steps | scroll | `staggerContainerSlow` 120ms |
| Stack cards | scroll | `staggerContainer` 100ms |
| Proof | scroll | left `fadeUp`, right collage +120ms |
| Custom tags | scroll | `staggerContainer` 40ms |
| FinalCTA | scroll | `fadeUp` then CTA +80ms |
| Product tab switch | click | `AnimatePresence mode="wait"` opacity 220ms |
| Mobile drawer | click | `x: '100%' → 0` ease-standard |

All `whileInView` use `viewport={{ once: true, amount: 0.2 }}`.

---

## Next.js 16 / React 19 Notes

- All async request APIs (`cookies`, `headers`, `params`) must be awaited — not relevant for this static marketing page
- `'use client'` components: Navbar, HeroSection, FadeInView, ProductPreviewSection
- All other sections are server components (React defaults)
- `Instrument_Serif` (underscore) is the correct `next/font/google` import name

---

## Verification

1. `npm run dev` — page renders at localhost:3000
2. Check at 375px (iPhone SE): no horizontal overflow, tab bar scrolls horizontally, hero stacks correctly
3. Check at 768px (tablet): grid transitions working
4. Check at 1440px (wide): max-width containers centered, collages render correctly
5. Scroll page: navbar transitions transparent → surface
6. Click all 7 product preview tabs — cross-fade works, caption bar updates
7. Open mobile menu — drawer slides in from right
8. Verify `prefers-reduced-motion: reduce` in DevTools disables animations
9. Check heading hierarchy: one `<h1>` in Hero, `<h2>` in each section
