# Marketing carousel brief

Fill this in and paste into chat with: **Create this carousel using the marketing-carousels skill.**

User-facing copy must say **MudKitchen** (not SchoolStack). The agent should use your strings **verbatim** unless you ask for edits.

Omitted product-slide fields (`tone`, `demoWindow`, `crop`) default from [finish-line-baseline.md](finish-line-baseline.md).

---

## Copy-only quick start

You can skip the per-slide tables and paste something like this:

```
id: my-topic
title: Studio sidebar title
fileSlug: mudkitchen-my-topic

Slide 1 — product
kicker: Admissions
title: …
body: …

Slide 2 — narrative
title: …
body: …

…

Slide 7 — promo
title: …
body: …
cta: Book a demo
phones: admissions
```

You may **omit the final promo slide** — the agent will add the standard Marketing Studio close (forest background, three phones, `trymudkitchen.com`, white **Book a demo** pill) per [finish-line-baseline.md](finish-line-baseline.md).

The agent maps slides to demos using the finish-line baseline unless you specify otherwise.

---

## Carousel

| Field | Value |
|-------|--------|
| **id** | `kebab-case-id` |
| **title** | Studio sidebar label |
| **description** | Optional one-line note for Studio |
| **fileSlug** | `mudkitchen-topic-slug` (PNG export prefix) |

---

## Slides

Repeat one block per slide. Use zero-padded `fileName` indices (`01-…`, `02-…`).

### Slide 1

| Field | Value |
|-------|--------|
| **id** | `short-slide-id` |
| **fileName** | `01-short-slug.png` |
| **slideType** | `product` \| `narrative` \| `promo` |

**Copy** (omit fields that do not apply)

| Field | Value |
|-------|--------|
| kicker | |
| title | |
| body | |

**Product only**

| Field | Value |
|-------|--------|
| tone | `paper` (default) \| `forest` — slide backing for copy; alternate on product slides per [finish-line-baseline.md](finish-line-baseline.md) |
| side | `copyLeft` \| `copyRight` |
| cropFocus | `top` \| `center` (default `top`) |
| crop | Optional note, e.g. `zoom 1.22, originX 0, originY 0` for inbox list |
| demoWindow | See [reference.md](reference.md) — e.g. `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | JSON or bullets, e.g. `highlightLeadId: "l3"`, `leads: buildDemoMarketingSlide1Leads()` |

**Promo only**

| Field | Value |
|-------|--------|
| promoSiteLabel | `trymudkitchen.com` |
| promoDensity | `default` \| `compact` |
| phoneCluster | `tuition` \| `admissions` |
| ctaLabel | `Book a demo` |

### Slide 2

…

---

## Optional

| Question | Answer |
|----------|--------|
| Visual baseline | `finish-line` (default) \| `tuition-review` |
| New demo data or UI needed? | yes / no — if yes, describe |
| Last slide is promo? | **yes (default)** — if you omit it, agent adds Book a demo close / no to skip |
| Change default carousel in Studio? | no (default) / yes — set as `DEFAULT_CAROUSEL_ID` |

---

## Mini example (abbreviated)

Based on [application-finish-line](src/components/admin/marketing/carousels/application-finish-line.tsx).

### Carousel

| Field | Value |
|-------|--------|
| **id** | `application-finish-line` |
| **title** | The application isn’t the finish line |
| **description** | LinkedIn carousel for the path from application to enrollment. |
| **fileSlug** | `mudkitchen-application-finish-line` |

### Slide 1

| Field | Value |
|-------|--------|
| **id** | `submitted` |
| **fileName** | `01-application-submitted-who-owns-the-next-step.png` |
| **slideType** | `product` |
| tone | `paper` |
| kicker | Admissions |
| title | Application submitted. Who owns the next step? |
| body | Give staff and families a clear path from application to enrollment. |
| demoWindow | `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | `leads: buildDemoMarketingSlide1Leads()`, `highlightLeadId: "l3"`, `compactForMarketing` — drawer closed |
| crop | inbox list framing (~zoom 1.22, origin 0,0) |

### Slide 2

| Field | Value |
|-------|--------|
| **id** | `stages` |
| **fileName** | `02-three-stages-one-connected-path.png` |
| **slideType** | `narrative` |
| title | Three stages. One connected path. |
| body | Families apply. Staff review and decide. Accepted families complete enrollment. |

### Slide 3

| Field | Value |
|-------|--------|
| **id** | `review` |
| **fileName** | `03-review-the-application-in-one-place.png` |
| **slideType** | `product` |
| tone | `paper` |
| kicker | Admissions |
| title | Review the application in one place. |
| body | See the family’s answers, contact details, and status together. |
| demoWindow | `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | `initialSelectedLeadId: "l3"`, `initialDetailTab: "application"` |

### Slide 7 (promo)

| Field | Value |
|-------|--------|
| **id** | `promo` |
| **fileName** | `07-from-application-to-enrollment.png` |
| **slideType** | `promo` |
| title | From application to enrollment, in one place. |
| body | See how your school’s review steps and enrollment requirements fit together. |
| promoSiteLabel | `trymudkitchen.com` |
| promoDensity | `compact` |
| phoneCluster | `admissions` |
| ctaLabel | `Book a demo` |
