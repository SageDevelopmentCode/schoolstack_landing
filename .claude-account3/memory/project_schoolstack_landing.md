---
name: School Stack Landing Page Project
description: Context on the schoolstack_landing Next.js project — stack, architecture, design system, and build state
type: project
---

School Stack landing page built from scratch in a single session. Fully functional, zero build errors.

**Why:** Julius needed the School Stack marketing site live to start selling to microschool founders. The landing page is the primary distribution vehicle for the business.

**How to apply:** When working in this project, understand that the design system is intentional Eden-inspired warm neutrals. Do not introduce colors or UI patterns outside the token system.

## Stack
- Next.js 16.2.4 (Turbopack default, async params)
- React 19.2.4
- Tailwind CSS 4.2.2 (CSS-only config via `@theme` in globals.css, no tailwind.config.js)
- TypeScript 5
- framer-motion (installed)

## Design Tokens
All in `src/app/globals.css` under `@theme`. Tailwind utilities auto-generated:
- `--color-accent: #244b46` → `bg-accent`, `text-accent`, `border-accent`
- `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-surface-soft`, `--color-surface-muted`
- `--color-border`, `--color-border-strong`
- `--color-text`, `--color-text-muted`, `--color-text-faint`
- `--color-accent-soft`, `--color-accent-hover`
- Radius: `rounded-pill` (9999px), `rounded-xl` (28px), `rounded-lg` (20px)
- Shadow: `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`
- Fonts: `font-display` (Instrument Serif), `font-body` (Inter)

## File Structure
```
src/
├── app/globals.css, layout.tsx, page.tsx
├── components/
│   ├── ui/ — FadeInView, Badge, Container
│   └── sections/ — Navbar, HeroSection, PainSection, FounderStoryBridgeSection,
│       ProductPreviewSection, WorkflowSection, StacksSection, ProofSection,
│       CustomSection, FinalCTASection, Footer
└── lib/motion.ts — shared framer-motion variants
```

## 'use client' Components
Navbar (scroll + drawer), HeroSection (mount animations), FadeInView, ProductPreviewSection (tab state)

## Images
All placeholder HTML/CSS mockups for now. Real Sage Field screenshots to be swapped in later.

## Dev Server
Already running. Use `http://localhost:3001` (or next available port).
