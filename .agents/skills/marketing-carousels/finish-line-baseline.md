# Finish-line baseline (default carousel layout)

Use this when the user wants a LinkedIn carousel that looks like **The application isn’t the finish line** ([`application-finish-line.tsx`](../../../src/components/admin/marketing/carousels/application-finish-line.tsx)) — alternating paper/forest product slides, one narrative break, real MudKitchen demo windows, forest promo close.

Read [reference.md](reference.md) for the demo window catalog and file map.

## Visual rhythm

| Position | Pattern | Notes |
|----------|---------|--------|
| Slide 1 | `CarouselProductSlide` default `tone` (`paper`) + laptop demo | First product proof (often admin inbox) |
| Slide 2 (recommended) | `SlideCanvas` with `background={SLIDE.forest}` — narrative only | Numbered steps or chapter; no laptop |
| Middle product slides | Alternate `tone` on `CarouselProductSlide`: **paper → forest → paper → forest** | Forest = green slide backing; demo canvas inside laptop stays `#F8F8F3` |
| Final slide | `variant="promo"`, `demoPresentation="phones"`, forest backing | White CTA pill; use `promoDensity: "compact"` for 7+ slides |

`CarouselProductSlide` props:

- `tone="paper"` (default) — copy on warm paper (`DEMO_SLIDE_PAPER`).
- `tone="forest"` — white/muted copy on `SLIDE.forest`.
- `crop?: CarouselDemoCrop` — `{ zoom, originX, originY }`; define named constants at top of carousel file and tune in Marketing Studio.

## Story constants (admissions / enrollment carousels)

- **Spotlight family:** demo submission lead **`l3`** (Sarah Mitchell / Emma Mitchell). Reuse across slides for one coherent story.
- **Do not** edit `DEMO_ADMIN_SUBMISSION_LEADS` in place for marketing-only row sets — add helpers like `buildDemoMarketingSlide1Leads()` in [`demo-admin-admissions-fixtures.ts`](../../../src/data/school-demos/demo-admin-admissions-fixtures.ts).
- **`DEMO_CONTENT_HEIGHT = 920`** for product slides unless the brief overrides.
- **Admin drawer slides:** `initialSelectedLeadId="l3"`, `compactForMarketing` (default on marketing window). Drawer scrim matches production via `DemoApplicationSubmissionDetailPanel` `showBackdrop` (default `true`).
- **Fonts:** parent demos use `DemoSchoolParentStoryProvider`; admin demos use `DemoSchoolAdminStoryProvider` inside demo pages.

## Copy → demo mapping (infer when user pastes copy only)

| User intent (keywords in title/body) | Demo window | Starter props |
|--------------------------------------|-------------|----------------|
| New submission, inbox, who owns the next step | `MarketingAdmissionsSubmissionsDemoWindow` | `leads={buildDemoMarketingSlide1Leads()}`, `highlightLeadId="l3"`, **no** `initialSelectedLeadId` |
| Review application, answers, form tab | Same | `initialSelectedLeadId="l3"`, `initialDetailTab="application"`, crop for list + drawer |
| Next action clear, overview, staff owns step | Same | `initialSelectedLeadId="l3"`, `initialDetailTab="overview"`, `tone="forest"` on slide |
| Checklist builder, agreements, fees setup | `MarketingEnrollmentFlowsDemoWindow` | `MARKETING_DEMO_CHECKLIST_FLOW_SELECTION`, `wrapOutlineLabels` |
| Family progress, what’s left, enrollment checklist | `MarketingParentEnrollmentDemoWindow` | `initialActiveItem="registration-fee"`, `tone="forest"` |
| Tuition, rates, catalog, billing | `MarketingTuitionDemoWindow` | See [reference.md](reference.md) |
| Parent portal home / billing teaser | `MarketingParentDemoWindow` | `tab`: `home` \| `enrollment` \| `billing`, `hideNav` |
| Stages, three steps, connected path | Narrative only | Copy `StagesSlide` pattern in finish-line file |
| Book a demo, product close | Promo slide | `MarketingMobilePromoCluster` `variant`: `admissions` or `tuition` |

When copy is ambiguous, prefer the **admin submissions** window for admissions story beats and **enrollment** windows for post-acceptance beats.

## Reference crop starting points (finish-line)

Tune per carousel in Marketing Studio; copy constants into new carousel files:

| Constant role | Typical starting values |
|---------------|-------------------------|
| Inbox / slide 1 list | `zoom ~1.2`, `originX: 0`, `originY: 0` |
| Drawer + application tab | `zoom ~1.2`, `originX ~0.21`, `originY: 0` |
| Drawer + overview / next step | `zoom ~1.25`, `originX ~0.23`, `originY ~0.1` |
| Checklist builder | `zoom ~1.35`, `originX: 0`, `originY ~0.05` |
| Parent enrollment | `zoom ~1.45`, `originX: 0`, `originY: 0` |

## Seven-slide skeleton (admissions → enrollment)

Use as a starting outline when the user provides ~7 slides of copy without specifying types:

| # | slide `id` (example) | `slideType` | Demo / layout |
|---|----------------------|-------------|----------------|
| 1 | `submitted` | product (paper) | Admissions inbox — `buildDemoMarketingSlide1Leads()`, `highlightLeadId="l3"` |
| 2 | `stages` | narrative (forest) | Numbered handoff steps |
| 3 | `review` | product (paper) | Submissions drawer, `application` tab |
| 4 | `next-action` | product (forest) | Submissions drawer, `overview` tab |
| 5 | `checklist` | product (paper) | Enrollment flows checklist builder |
| 6 | `family-progress` | product (forest) | Parent enrollment checklist |
| 7 | `promo` | promo | **Required close** — see [Promo close slide](#promo-close-slide-required-default) below |

Adjust slide count: keep **promo last**; insert or drop narrative/product slides but preserve **paper/forest alternation** on product slides where possible.

## Promo close slide (required default)

Unless the brief sets **Last slide is promo: no**, the **final slide** is always `slideType: promo` for finish-line-baseline carousels.

**Rule:** One forest-green marketing close with three phones, site chip, user title/body, and a **Book a demo** CTA pill (match [`PromoSlide`](../../../src/components/admin/marketing/carousels/application-finish-line.tsx)).

**Checklist**

- `CarouselProductSlide` with `variant="promo"` and `demoPresentation="phones"`
- `promoSiteLabel="trymudkitchen.com"` (default unless brief overrides)
- `promoDensity="compact"` when the deck has **6+ slides total** (including promo); otherwise `default` is OK for short decks
- Centered `title` and `body` from user copy
- `footer`: white pill — `SLIDE.white` background, `SLIDE.forest` text, `borderRadius: 999`, `padding: 18px 40px`, `fontSize: 28`, label **`Book a demo`** (or brief `ctaLabel`)
- Child: `<MarketingMobilePromoCluster variant="admissions" />` for admissions/enrollment stories, or `variant="tuition"` for tuition-focused decks
- `fileName`: highest index, e.g. `07-from-application-to-enrollment.png`; `id` usually `promo`

**Scaffold snippet** (import `SLIDE`, `CarouselProductSlide`, `MarketingMobilePromoCluster` like finish-line):

```tsx
function PromoSlide() {
  return (
    <CarouselProductSlide
      variant="promo"
      demoPresentation="phones"
      promoDensity="compact"
      promoSiteLabel="trymudkitchen.com"
      title="…user title…"
      body="…user body…"
      footer={
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: SLIDE.white,
              color: SLIDE.forest,
              borderRadius: 999,
              padding: "18px 40px",
              fontSize: 28,
              fontWeight: 750,
            }}
          >
            Book a demo
          </span>
        </div>
      }
    >
      <MarketingMobilePromoCluster variant="admissions" />
    </CarouselProductSlide>
  );
}
```

If the user omits a final slide in copy-only input, **append** this promo slide with sensible title/body summarizing the carousel topic.

## Implementation file shape

Mirror [`application-finish-line.tsx`](../../../src/components/admin/marketing/carousels/application-finish-line.tsx):

- `"use client"`
- Shared constants: `DEMO_CONTENT_HEIGHT`, `SPOTLIGHT_LEAD_ID = "l3"`, crop constants
- `export const MY_TOPIC_CAROUSEL = { … } satisfies MarketingCarousel`
- One small function component per slide at bottom of file
- Register in [`registry.ts`](../../../src/components/admin/marketing/carousels/registry.ts)

## Verification

- Marketing Studio: preview every slide; export PNGs (`fileSlug` + `fileName`)
- `npx tsc --noEmit`
- Readable demos at carousel crop (no clipped chips; status labels single-line via `AdminChip` `whitespace-nowrap`)
