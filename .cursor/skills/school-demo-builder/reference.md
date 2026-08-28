# School Demo Builder — Reference

## Naming conventions

Given school **Luff Learning Fine Arts Academy** and slug **`luff-learning`**:

| Concept | Value |
|---|---|
| URL slug | `luff-learning` |
| Route folder | `src/app/demo/luff-learning/` |
| Component folder | `src/components/demo/lufflearning/` (lowercase, no hyphens) |
| Website config file | `src/data/school-demos/luff-learning.ts` |
| Config export | `luffLearningConfig` |
| Admin data | `luff-learning-admin-demo.ts` → `LUFF_LEARNING_ADMIN_*` |
| Parent data | `luff-learning-parent-demo.ts` → `LUFF_LEARNING_PARENT_*` |
| Teacher data | `luff-learning-teacher-demo.ts` → `LUFF_LEARNING_TEACHER_*` |
| Dashboard components | `LuffLearningAdminDashboardDemo.tsx`, etc. |
| Lazy loader | `lazyLuffLearningDemos.tsx` |
| Lazy exports | `LazyLuffLearningAdminDashboardDemo`, `prefetchLuffLearningAdminDemo` |
| Walkthrough | `luffLearningWalkthroughPlaceholder` |
| Page component | `LuffLearningDemoPage` |
| Images | `public/images/demo/lufflearning/` |

### Derivation rules

- **Slug**: kebab-case from school name (`The Woodlands Microschool` → `the-woodlands-microschool`)
- **Folder**: lowercase slug without hyphens (`lufflearning`, `lighthousehomeschool`)
- **Config export**: camelCase + `Config` (`luffLearningConfig`)
- **Constants prefix**: SCREAMING_SNAKE from slug (`LUFF_LEARNING_`)
- **Component prefix**: PascalCase brand (`LuffLearning`)

## File checklist

### Data layer (5 touch points)

- [ ] `src/data/school-demos/{slug}.ts`
- [ ] `src/data/school-demos/{slug}-admin-demo.ts`
- [ ] `src/data/school-demos/{slug}-parent-demo.ts`
- [ ] `src/data/school-demos/{slug}-teacher-demo.ts`
- [ ] `src/data/school-demos/index.ts` — export + import + registry key

### App route (2 files)

- [ ] `src/app/demo/{slug}/page.tsx`
- [ ] `src/app/demo/{slug}/layout.tsx`

### Components (2 files + optional mobile)

- [ ] `src/components/demo/{folder}/{Brand}WebsiteDashboardDemo.tsx`
- [ ] `src/components/demo/{folder}/{Brand}MobileAppShowcase.tsx` (microschool demos)

### Dashboard configs (register in `dashboard-registry.ts`)

- [ ] `{slug}-admin-demo.ts` → `{camelCase}AdminDemoConfig`
- [ ] `{slug}-parent-demo.ts` → `{camelCase}ParentDemoConfig`
- [ ] `{slug}-teacher-demo.ts` → `{camelCase}TeacherDemoConfig`
- [ ] `admin-content/{slug}.ts` (only if admin mock leads/events/emails differ from Luff)

### Mobile showcase (2 touch points)

- [ ] `src/components/demo/{folder}/{Brand}MobileAppShowcase.tsx`
- [ ] `src/components/demo/ScaledMobileAppPreview.tsx` — `MOBILE_SHOWCASE_LOADERS` entry

#### Mobile slide checklist (microschool demos)

Five tabs in order: **Messages** (Parent) · **Tuition** (Parent) · **Admissions** (Admin) · **Attendance** (Teacher) · **Students** (Teacher).

Do **not** use a Committees tab for microschool demos — use the Admin Admissions submissions slide instead (Rooted Meadows prototype keeps its own committees slide).

| Slide | Key UI |
|---|---|
| Messages | Teacher thread, unread badge, message bubbles |
| Tuition | Balance card, child filters, Pay / Pay All, paid rows |
| Admissions | Lead cards, flow/status filters, detail sheet |
| Attendance | 8–10 students, day nav, Present/Pickup/Absent buttons |
| Students | Avatars, status, guardian contact, profile chips |

Factory: `createMicroschoolMobileSlides({ accentColor, teacherName, teacherTitle?, schoolName? })`.
Shared roster/leads: `src/components/demo/mobile/mobileDemoData.ts`.

### Walkthrough (1 touch point)

- [ ] `src/data/school-demos/walkthrough-placeholder.ts` — append `{camelCase}WalkthroughPlaceholder` (9 steps, including `mobile-app` before contact)

### Scaled wiring (4 files — slug maps to shared loaders; no per-school lazy files)

- [ ] `src/components/demo/ScaledWebsiteDemoPreview.tsx` — uses `lazySchoolWebsiteDemo`
- [ ] `src/components/demo/ScaledAdminDemoPreview.tsx` — uses `lazySchoolAdminDemo` + registry
- [ ] `src/components/demo/ScaledParentDemoPreview.tsx` — uses `lazySchoolParentDemo` + registry
- [ ] `src/components/demo/ScaledTeacherDemoPreview.tsx` — uses `lazySchoolTeacherDemo` + registry

### Assets

- [ ] Logo in `public/images/demo/{folder}/`
- [ ] Optional: school-specific hero/program images (fallback: `/images/stock/`)

### Optional (only if user asks)

- [ ] `guides/demos/{school}_redesign_guide.md`
- [ ] Supabase `demo_slug` mapping
- [ ] `src/app/research/data.ts` entry

**Total: ~24 files/touch points**

## Color reconciliation

Redesign guides scraped from WordPress/Kadence often mislabel hex roles. Always verify visually:

1. Open the logo — identify primary accent (e.g. sage green heart)
2. Inspect live site CSS or computed styles
3. Cross-check guide's "Palette N" table — labels may not match actual colors
4. Build a corrected mapping:

| Demo use | Typical role |
|---|---|
| `theme.primary` | Main CTA / buttons |
| `theme.primaryHover` | CTA hover |
| `theme.dark` | Headings, dark nav |
| `theme.accentText` | Secondary accent |
| `theme.lightBg` | Soft section backgrounds |
| `theme.muted` | Captions |
| `*_ADMIN_COLORS.clay` | Walkthrough gold/warm accent |

Example correction (Luff Learning): guide labeled `#efad1f` as "primary purple" but it is gold; actual primary CTA is `#769a61` (sage green from logo).

## Testimonial shape

`socialProof.type` must be `"testimonials"`. Items use `DemoTestimonial`:

```ts
{
  quote: "Full testimonial text...",
  name: "Kim Spangler",
  detail: "Luff Learning Parent",
  stars: 5,
  avatar: "/images/stock/ImageTen.jpg",
}
```

**Wrong** (trust-item shape — will fail TypeScript or render incorrectly):

```ts
{ title: "Kim Spangler", desc: "...", icon: "star" }
```

## Admin color tokens

Copy structure from `luff-learning-admin-demo.ts`:

```ts
export const {PREFIX}_ADMIN_COLORS = {
  bg: "#f7fafc",
  border: "#eeeeee",
  borderStrong: "{primary}",
  accent: "{primary}",
  accentBright: "{primaryHover}",
  accentLight: "rgba(..., 0.10)",
  secondaryBtnBorder: "rgba(..., 0.22)",
  accentGlow: "rgba(..., 0.12)",
  accentMid: "{dark}",
  accentDark: "{darkHover}",
  clay: "{warmAccent}",
  clayBg: "rgba(..., 0.12)",
  clayBorder: "rgba(..., 0.35)",
  textPrimary: "{text}",
  textSecondary: "{muted}",
} as const;
```

## Teacher program IDs

Define in `{slug}-teacher-demo.ts`:

```ts
export const {PREFIX}_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  program_id_1: "Display Name",
  program_id_2: "Display Name",
};

export const {PREFIX}_TEACHER_PROGRAM_ORDER = [
  "program_id_1",
  "program_id_2",
] as const;
```

Then update teacher demo `DEMO_STUDENTS` program fields to use these IDs (replace forked school's IDs).

## High-visibility admin mock data

Prioritize these when forking admin demo — do not rewrite entire file:

- `DEMO_LEADS[0]` message and tags
- Admin dashboard subtitle (location + enrollment year)
- Email subject lines with school name
- Program names in dropdowns (if quick to find)
- Calendar/event names relevant to school (open house, performances)

## Scaled preview wiring pattern

```tsx
// Import
import {
  Lazy{Brand}WebsiteDashboardDemo,
  prefetch{Brand}WebsiteDemo,
} from "@/components/demo/{folder}/lazy{Brand}Demos";

// Slug check
const is{Brand} = demoSlug === "{slug}";

// Prefetch (first branch, before lighthouse/athena)
useEffect(() => {
  if (is{Brand}) prefetch{Brand}WebsiteDemo();
  else if (isLighthouseHomeschool) prefetchLighthouseHomeschoolWebsiteDemo();
  // ...
}, [is{Brand}, /* other deps */]);

// Component selection (first branch)
const DemoComponent = is{Brand}
  ? Lazy{Brand}WebsiteDashboardDemo
  : isLighthouseHomeschool
  ? LazyLighthouseHomeschoolWebsiteDashboardDemo
  // ...
  : LazyAthenaWebsiteDashboardDemo;
```

Repeat for admin, parent, teacher variants.

## Reference implementations

| School | Slug | Notes |
|---|---|---|
| Athena Micro-academy | `athena-microacademy` | Original template; default Scaled fallback |
| Lighthouse Homeschool | `lighthouse-homeschool` | Good fork source |
| Luff Learning | `luff-learning` | Most recent full example |
