# Marketing carousels — reference

Repo paths are relative to `schoolstack_landing` root.

## File map

| Purpose | Path |
|---------|------|
| Carousel types | `src/components/admin/marketing/carousels/types.ts` |
| Registry (add new carousel here) | `src/components/admin/marketing/carousels/registry.ts` |
| Product + promo layout | `src/components/admin/marketing/carousels/carousel-product-slide.tsx` |
| Slide canvas / tokens | `src/components/admin/marketing/slide-frame.tsx` |
| Demo wrappers | `src/components/admin/marketing/screens/marketing-demo-windows.tsx` |
| Mobile promo phones | `src/components/admin/marketing/screens/marketing-mobile-promo-cluster.tsx` |
| Mobile demo data | `src/components/admin/marketing/screens/mobile/marketing-mobile-demo-data.ts` |
| Admissions fixtures | `src/data/school-demos/demo-admin-admissions-fixtures.ts` |
| Studio UI | `src/components/admin/marketing/MarketingStudio.tsx` |

## Slide types

| slideType | Component pattern | When to use |
|-----------|-------------------|-------------|
| `product` | `CarouselProductSlide` + child demo window | Copy beside laptop chrome showing real admin/parent demo |
| `narrative` | `SlideCanvas` on `DEMO_SLIDE_PAPER`, custom layout | Lists, steps, cover-style story without laptop |
| `promo` | `CarouselProductSlide` `variant="promo"` `demoPresentation="phones"` + `MarketingMobilePromoCluster` | Final CTA slide on forest green |

### Product slide defaults

- `contentHeight`: `920` (`DEMO_CONTENT_HEIGHT`)
- `cropFocus`: `top` (use `center` when framing vertical center of demo matters)
- Alternate `side` between slides for visual rhythm (`copyLeft` / `copyRight`)

### Promo slide options

| Prop | Values | Notes |
|------|--------|--------|
| `promoSiteLabel` | e.g. `trymudkitchen.com` | Top row URL chip |
| `promoDensity` | `default` \| `compact` | Compact: smaller type + more phone gutter (finish-line slide 8) |
| `phoneCluster` | `tuition` \| `admissions` | `MarketingMobilePromoCluster` `variant` |

CTA footer: white pill on forest — copy styles from `PromoSlide` in `application-finish-line.tsx` (compact) or `HomePromoSlide` in `tuition-review.tsx` (default).

## Demo window catalog

All wrap content in `DemoCanvas` at `CAROUSEL_DEMO_INNER_WIDTH` (1100px).

| Export | Underlying demo | Common props |
|--------|-----------------|--------------|
| `MarketingStudentsDemoWindow` | `DemoAdminStudentsPage` | `contentHeight` |
| `MarketingTuitionDemoWindow` | `DemoAdminTuitionPage` | `initialDashboardTab` (`catalog`, `families`, …), `initialRateCatalogTab`, `initialFamilyId`, `initialOpenAdjust`, `contentHeight` |
| `MarketingAdmissionsSubmissionsDemoWindow` | `DemoAdminAdmissionsSubmissionsPage` | `initialSelectedLeadId` — lead ids `l0`–`l8` in `DEMO_ADMIN_SUBMISSION_LEADS` |
| `MarketingEnrollmentFlowsDemoWindow` | `DemoAdminEnrollmentFlowsPage` | `initialFlowSelection`: `MARKETING_DEMO_APPLY_FLOW_SELECTION` or `MARKETING_DEMO_CHECKLIST_FLOW_SELECTION` |
| `MarketingEnrollmentChecklistPreviewDemoWindow` | `DemoAdminEnrollmentChecklistPreviewPage` | `contentHeight` |
| `MarketingParentEnrollmentDemoWindow` | `DemoParentEnrollmentTab` | `contentHeight` |
| `MarketingParentDemoWindow` | `ParentDashboardDemo` | `tab`: `home` \| `enrollment` \| `billing`, `hideNav`, `contentHeight` |

Constants `MARKETING_DEMO_APPLY_FLOW_SELECTION` and `MARKETING_DEMO_CHECKLIST_FLOW_SELECTION` live in `marketing-demo-windows.tsx` and tie to `demo-admin-admissions-fixtures.ts`.

## Narrative slides

Use `SlideCanvas`, `displayStyle`, and `SLIDE` from `slide-frame.tsx`. Paper background: `DEMO_SLIDE_PAPER` from `carousel-product-slide.tsx`.

Reference implementations:

- Step list: `HandoffSlide` in `application-finish-line.tsx`
- Cover / checklist / margin story: early slides in `tuition-review.tsx`

## Mobile promo cluster

| variant | Left | Center | Right |
|---------|------|--------|-------|
| `tuition` (default) | Parent home | Parent billing | Admin transactions |
| `admissions` | Parent home | Admin admissions list | Admin application review |

New phone UI: add screen under `screens/mobile/`, data in `marketing-mobile-demo-data.ts`, wire variant in `marketing-mobile-promo-cluster.tsx`.

## New UI not in catalog

1. `DemoAdmin*Page` in `src/components/demo/shared/` — use `previewMode` / fixture props, no Supabase in Marketing Studio.
2. Export wrapper in `marketing-demo-windows.tsx`.
3. Optional fixtures in `src/data/school-demos/`.

Follow `application-finish-line` + `demo-admin-admissions-fixtures.ts` patterns.

## Registry

```ts
import { MY_CAROUSEL } from "@/components/admin/marketing/carousels/my-topic";

export const MARKETING_CAROUSELS: MarketingCarousel[] = [
  // existing…
  MY_CAROUSEL,
];
```

Do not change `DEFAULT_CAROUSEL_ID` unless the brief requests it.

## Carousel export shape

```ts
export const MY_TOPIC_CAROUSEL = {
  id: "my-topic",
  title: "…",
  description: "…",
  fileSlug: "mudkitchen-my-topic",
  slides: [
    { id: "…", fileName: "01-….png", render: () => <SlideOne /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
```

Each slide component: small function at bottom of same file; shared constants at top.

## Examples to read first

| Carousel | File | Pattern |
|----------|------|---------|
| Tuition planning story | `tuition-review.tsx` | Narrative + product + default promo phones |
| Admissions → enrollment | `application-finish-line.tsx` | Product demos + handoff narrative + compact admissions promo |

## Verification

- `npx tsc --noEmit`
- Admin Marketing Studio: pick carousel, preview each slide, export PNGs (`fileSlug` + `fileName`)
