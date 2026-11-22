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
| Admin data | `luff-learning-admin-demo.ts` → `LUFF_LEARNING_ADMIN_*`, `luffLearningAdminDemoConfig` |
| Parent data | `luff-learning-parent-demo.ts` → `LUFF_LEARNING_PARENT_*`, `luffLearningParentDemoConfig` |
| Teacher data | `luff-learning-teacher-demo.ts` → `LUFF_LEARNING_TEACHER_*`, `luffLearningTeacherDemoConfig` |
| Walkthrough admin (steps 3–4) | `src/components/demo/shared/DemoAdminGardenAdmissions.tsx` (real Garden admin portal) |
| Walkthrough parent (steps 5–6) | `DemoParentEnrollmentChecklist.tsx`, `DemoParentGardenPortal.tsx` (real Garden parent pages) |
| Walkthrough teacher (step 7) | `DemoTeacherGardenPortal.tsx` (real Garden staff portal) |
| Walkthrough chrome (Garden, no per-school edits) | `src/components/demo/DemoWalkthroughPanel.tsx`, `DemoWalkthroughStepList.tsx`, `DemoWalkthroughMobileSheet.tsx`, `src/lib/marketing/school-concept-walkthrough-theme.ts` |
| Shared portal demos | `SchoolAdminDashboardDemo.tsx` (Story) — other admin steps (committees, tuition, My School); `SchoolParentDashboardDemo.tsx` / `SchoolTeacherDashboardDemo.tsx` — Garden header (`DemoPortalGardenHeader`) with a mix of Garden and Story pages, for the non-Garden parent/teacher tabs and `/demo-school` |
| Shared loaders | `lazySchoolAdminDemo.tsx`, `lazySchoolParentDemo.tsx`, `lazySchoolParentGardenDemo.tsx`, `lazySchoolTeacherDemo.tsx` |
| Website template | `src/components/sections/WebsiteDashboardDemo.tsx` + `website-demo/site-garden-theme.ts` + `website-demo/garden/SiteKit.tsx` |
| Config types | `src/data/school-demos/demo-dashboard-types.ts` |
| Registry | `src/data/school-demos/dashboard-registry.ts` |
| Website component | `LuffLearningWebsiteDashboardDemo.tsx` (per-school website wrapper only) |
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
- [ ] `dashboard-registry.ts` — add slug to `schoolAdminDemoConfigs`, `schoolParentDemoConfigs`, and `schoolTeacherDemoConfigs`
- [ ] `admin-content/{slug}.ts` (optional) — school-specific leads/events/emails; wire via `contentOverrides` on admin config

### Scaled wiring (no per-school portal lazy files)

Admin/parent/teacher previews use shared loaders automatically once configs are in the registry. **Do not** add slug branches or per-school `lazy{Brand}Demos.tsx` for portal dashboards.

- [ ] `src/components/demo/shared/lazySchoolWebsiteDemo.tsx` — `WEBSITE_DEMO_LOADERS` (website wrapper only)
- [ ] `src/components/demo/ScaledMobileAppPreview.tsx` — `MOBILE_SHOWCASE_LOADERS`

No edits needed to `ScaledAdminDemoPreview.tsx`, `ScaledParentDemoPreview.tsx`, or `ScaledTeacherDemoPreview.tsx` for new schools (Rooted Meadows is already special-cased).

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

- [ ] `src/data/school-demos/walkthrough-placeholder.ts` — append `{camelCase}WalkthroughPlaceholder` (9 steps, including `mobile-app` before contact). Steps have no colour fields; the sidebar is themed from `config.theme`

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
4. Build a corrected mapping onto the **Garden roles** (`siteGardenScopeStyle` in `site-garden-theme.ts`):

| `DemoTheme` field | What it drives on the Garden website |
|---|---|
| `theme.dark` | **Action colour**: every CTA button, accent words in headings, the one dark panel. Must pass white text (`readableOn` falls back to ink if not, but choose a dark brand colour). |
| `theme.primary` | **Brand tint**: sticky notes, washi tape, marker highlights (mixed ~30% into paper). Bright yellows/oranges work well. Also the walkthrough sidebar accent (`buildSchoolConceptWalkthroughTheme`). |
| `theme.primaryHover`, `darkHover` | Not used by the site; keep them sensible for older surfaces |
| `theme.accentText`, `lightBg`, `lightBorder`, `muted`, `badgeBg`, `pageBg` | Not used by the Garden site (cream/paper/ink come from Garden); still required by the type |
| `*_ADMIN_COLORS.clay` | Walkthrough gold/warm accent |

Example correction (Luff Learning): guide labeled `#efad1f` as "primary purple" but it is gold; the sage green from the logo (`#769a61`) is the brand colour.

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

**One school colour across portals:** the accent becomes the school branding passed to the real Garden portals (`ParentThemeProvider` / `SchoolAdminBaseline` branding → `--sf-clay`). Keep the same accent hex in admin (`colors.accent`), parent (`colors.accent`) and teacher (`accent`) configs. The older Story demos still read it through `buildDemoParentThemeTokens()` in `src/components/demo/shared/demo-story-theme.ts`.

Typography: the website and the Garden portal steps use the Garden fonts (Bricolage / Nunito / Gochi); nothing per school.

Mobile slides are unchanged: paper interior `#F8F8F3`, story tab pills in `SchoolMobileAppShowcase.tsx`.

## Teacher program IDs

Define labels and order in `{slug}-teacher-demo.ts`, then pass them through `SchoolTeacherDemoConfig`:

```ts
export const {PREFIX}_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  program_id_1: "Display Name",
  program_id_2: "Display Name",
};

export const {PREFIX}_TEACHER_PROGRAM_ORDER = [
  "program_id_1",
  "program_id_2",
] as const;

export const {camelCase}TeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "{slug}",
  // ...
  programLabels: {PREFIX}_TEACHER_PROGRAM_LABELS,
  programOrder: {PREFIX}_TEACHER_PROGRAM_ORDER,
};
```

The shared `SchoolTeacherDashboardDemo` reads `programLabels` / `programOrder` from config at runtime. Do not edit `DEMO_STUDENTS` in the shared component for a new school.

## High-visibility admin mock data

Default mock data lives in `SchoolAdminDashboardDemo.tsx`. For school-specific content, use `admin-content/{slug}.ts` and wire via `contentOverrides` on the admin config:

- Lead messages and tags (`demoLeads`)
- Calendar events (`demoEvents`)
- Email subject lines (`demoEmails`)
- Admissions subtitle (`admissionsSubtitle`)

Set copy strings (school name, location subtitle, office name) on `SchoolAdminDemoConfig.copy`. Only edit the shared admin component for changes that apply to **all** schools.

## Scaled preview wiring

**Admin / parent / teacher:** No per-school `Scaled*` edits. Shared loaders look up config from `dashboard-registry.ts` by `demoSlug`. `ScaledAdminDemoPreview` sends the submissions / start-enrollment steps to `DemoAdminGardenAdmissions`, `ScaledParentDemoPreview` sends enrollment / billing / home to the Garden parent wrappers, and `ScaledTeacherDemoPreview` renders `DemoTeacherGardenPortal` — all for every school except Rooted Meadows.

**Website:** Register the school's website wrapper in `lazySchoolWebsiteDemo.tsx` → `WEBSITE_DEMO_LOADERS`.

**Mobile:** Register in `ScaledMobileAppPreview.tsx` → `MOBILE_SHOWCASE_LOADERS`.

**Do not** copy the old per-slug `is{Brand}` / `Lazy{Brand}AdminDashboardDemo` pattern — that caused duplicate ~24k-line portal forks and Vercel build OOM. Rooted Meadows is the only standard demo with custom portal forks (`src/components/demo/rootedmeadows/`); do not use that pattern for new schools.

## Reference implementations

| School | Slug | Notes |
|---|---|---|
| Athena Micro-academy | `athena-microacademy` | Original template; default Scaled fallback |
| Lighthouse Homeschool | `lighthouse-homeschool` | Good config source (`admin-content` overrides) |
| Luff Learning | `luff-learning` | Most recent full example |

## Maintenance scripts (optional)

For bulk registry updates only — not part of the normal add-one-school flow:

- `scripts/generate-dashboard-registry.mjs`
- `scripts/generate-parent-teacher-registry.mjs`
