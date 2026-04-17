# Plan: Set Up Latest Next.js with Boilerplate Cleanup

## Context
The `schoolstack_landing` repo is a clean slate — only a `.gitignore` and `README.md` exist. The goal is to scaffold a fresh Next.js project (latest version) with TypeScript, Tailwind CSS, and the App Router, then strip out all default boilerplate so the project starts from a truly blank state.

**Choices confirmed by user:**
- TypeScript
- Tailwind CSS
- App Router

---

## Phase 1: Scaffold with create-next-app

Run in `/Users/juliuscecilia/Desktop/schoolstack/schoolstack_landing`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Flags explained:
- `.` — install into current directory (preserves existing `.gitignore` / `README.md`)
- `--typescript` — TypeScript
- `--tailwind` — Tailwind CSS
- `--eslint` — ESLint config
- `--app` — App Router
- `--src-dir` — place source under `src/`
- `--import-alias "@/*"` — standard alias
- `--no-git` — skip reinitializing git (repo already exists)

---

## Phase 2: Boilerplate Cleanup

### Files to clean/replace

| File | Action |
|------|--------|
| `src/app/page.tsx` | Replace entire default hero/links page with a minimal blank page component |
| `src/app/layout.tsx` | Remove Geist font import & variable usage; simplify metadata title/description |
| `src/app/globals.css` | Remove all CSS custom properties (`:root` block); keep only the 3 Tailwind directives |
| `public/next.svg` | Delete |
| `public/vercel.svg` | Delete |

### Target state after cleanup

**`src/app/page.tsx`**
```tsx
export default function Home() {
  return (
    <main>
      <h1>schoolstack</h1>
    </main>
  );
}
```

**`src/app/layout.tsx`**
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schoolstack",
  description: "Schoolstack landing page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**`src/app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Critical Files

- `src/app/page.tsx` — main page
- `src/app/layout.tsx` — root layout
- `src/app/globals.css` — global styles
- `public/next.svg`, `public/vercel.svg` — to delete

---

## Verification

1. Run `npm run dev` — dev server should start without errors on `localhost:3000`
2. Visit `localhost:3000` — should show a clean page with just "schoolstack" text
3. Run `npm run build` — should complete with no TypeScript or ESLint errors
