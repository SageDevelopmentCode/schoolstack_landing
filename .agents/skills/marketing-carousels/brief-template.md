# Marketing carousel brief

Fill this in and paste into chat with: **Create this carousel using the marketing-carousels skill.**

User-facing copy must say **MudKitchen** (not SchoolStack). The agent should use your strings **verbatim** unless you ask for edits.

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
| side | `copyLeft` \| `copyRight` |
| cropFocus | `top` \| `center` (default `top`) |
| demoWindow | See [reference.md](reference.md) — e.g. `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | JSON or bullets, e.g. `initialSelectedLeadId: "l3"` |

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
| New demo data or UI needed? | yes / no — if yes, describe |
| Last slide is promo? | yes (default) / no |
| Change default carousel in Studio? | no (default) / yes — set as `DEFAULT_CAROUSEL_ID` |

---

## Mini example (abbreviated)

Based on [application-finish-line](src/components/admin/marketing/carousels/application-finish-line.tsx) — not a full carousel.

### Carousel

| Field | Value |
|-------|--------|
| **id** | `application-finish-line-demo` |
| **title** | The application isn’t the finish line |
| **description** | LinkedIn carousel for the path from application to enrollment. |
| **fileSlug** | `mudkitchen-application-finish-line` |

### Slide 1

| Field | Value |
|-------|--------|
| **id** | `submitted` |
| **fileName** | `01-application-submitted-now-what.png` |
| **slideType** | `product` |
| kicker | Admissions |
| title | Application submitted. Now what? |
| body | The space between “interested” and “enrolled” is where families need clear next steps. |
| side | `copyLeft` |
| demoWindow | `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | (default — no lead selected) |

### Slide 2

| Field | Value |
|-------|--------|
| **id** | `review` |
| **fileName** | `02-review-the-familys-submission.png` |
| **slideType** | `product` |
| kicker | Admissions |
| title | Review the family’s submission. |
| body | Keep the application and its answers together for staff review. |
| side | `copyRight` |
| demoWindow | `MarketingAdmissionsSubmissionsDemoWindow` |
| demoProps | `initialSelectedLeadId: "l3"` |

### Slide 3

| Field | Value |
|-------|--------|
| **id** | `promo` |
| **fileName** | `03-from-application-to-enrollment.png` |
| **slideType** | `promo` |
| title | From application to enrollment, in one place. |
| body | Submissions, admissions workflows, and enrollment checklists—connected for your school. |
| promoSiteLabel | `trymudkitchen.com` |
| promoDensity | `compact` |
| phoneCluster | `admissions` |
| ctaLabel | `Book a demo` |
