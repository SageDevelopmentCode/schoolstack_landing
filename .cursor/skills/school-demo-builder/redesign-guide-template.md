# {School Name} redesign extraction guide

This document consolidates brand signals, reusable copy, and practical redesign directions based on the public {School Name} website. It is intended as a working reference for building a spec-demo landing page that feels recognizably close to their current brand while presenting a stronger modern redesign.

## Brand snapshot

- Current positioning: {one-line positioning from homepage}
- Core message: {key themes — e.g. fine arts, belonging, hybrid model}
- Visual identity: {typography personality, color mood, tone of voice}

## Extracted brand colors

> **Important:** Verify hex values visually against the logo and live site. WP/Kadence scrapes often mislabel palette roles.

### Primary palette (from live site)

| Token | Value | Likely role |
|---|---|---|
| Primary | `#______` | Main CTA / buttons |
| Primary hover | `#______` | CTA hover / pressed |
| Secondary | `#______` | Headings, dark nav |
| Accent | `#______` | Badges, highlights |
| Text | `#______` | Body copy |
| Text muted | `#______` | Captions, metadata |
| Page bg | `#ffffff` | Main canvas |
| Soft section bg | `#______` | Alternating sections |
| Border | `#______` | Dividers, form outlines |

### Recommended demo palette mapping

Bright-layout demos (`WebsiteDashboardDemo`) map scraped colors into `SchoolWebsiteDemoConfig.theme`:

| Demo use | Config field | Bright token / notes |
|---|---|---|
| Primary CTA accent / eyebrows | `theme.primary` | `DEMO_ACCENT_HIGHLIGHT`, kicker text |
| Dark pills / stats ink band | `theme.dark` | `--demo-cta-bg`, `--demo-ink-band` |
| CTA hover | `theme.primaryHover` | `--demo-cta-hover` |
| Section pastel blocks | mix primary + `#EEF3EC` | `var(--demo-section-tint)` via `bright-demo-theme.ts` |
| Body / captions | `theme.muted` | body copy |
| Main page background | `theme.pageBg` | prefer `#FFFFFF` |
| Cards / borders | `theme.lightBorder` | `--demo-line` |

### Typography (bright demos)

- Shell: Poppins via `SchoolDemoWebsiteFonts` — not per-school Google font pairs on `/demo/*`.
- Headings: `BOLD_HEADING` + optional `headlineAccentLine` for hero highlighter.

## Typography signals (source school site)

- Fonts loaded on live site: {e.g. Open Sans, DM Serif Display}
- Note brand display face in the guide for copy tone; demo UI stays Poppins unless a future `typography` override is added.

## Content themes to reuse

### Home

- Source page: [{page title}]({url})
- {hero headline}
- {tagline / subhead}
- {key program names}
- {testimonial section title}

### Programs

- Source page: [{page title}]({url})
- {program 1 name and description}
- {program 2 name and description}
- {differentiators — e.g. SEL, small classes}

### About / Philosophy

- Source page: [{page title}]({url})
- {mission / motto}
- {founder or philosophy quotes}

### FAQ

- Source page: [{page title}]({url})
- {common question themes}

### Testimonials

- {Parent name} — {quote summary}
- {Parent name} — {quote summary}

### Contact

- Address: {street, city, state, zip}
- Email: {email}
- Phone: {phone}

## Messaging patterns

- {How the site opens — emotional vs logistical}
- {Key phrases to preserve — belonging, creativity, etc.}
- {Positioning differentiators — secular, hybrid, gifted, etc.}
- {Tone — warm, institutional, playful, etc.}

## Visual direction for the sales-demo landing page

### What to preserve

- {Primary brand color and accent}
- {Core copy themes}
- {Program framing}
- {Tone of voice}

### What to improve in the redesign

- Stronger hierarchy — one hero statement, one supporting paragraph, one clear CTA
- More intentional white space and alternating soft-tint sections
- Clearer conversion sections: hero, trust strip, programs, differentiators, testimonials, inquiry CTA
- Simplified typography (reduce font noise if current site is busy)

## Suggested landing page structure

1. Hero: {headline} with subhead about {location + positioning}
2. Trust strip: {location, key badges — e.g. secular, fine arts, enrolling}
3. Philosophy section: {empathy, safety, academic growth}
4. Program cards: {list 3–4 programs}
5. Differentiators: {why families choose this school}
6. Testimonials: {parent quotes with names}
7. Final inquiry / tour CTA in primary brand color

## CSS starter tokens

```css
:root {
  --{prefix}-primary: #______;
  --{prefix}-primary-hover: #______;
  --{prefix}-secondary: #______;
  --{prefix}-accent: #______;
  --{prefix}-text: #______;
  --{prefix}-text-muted: #______;
  --{prefix}-bg: #ffffff;
  --{prefix}-bg-soft: #______;
  --{prefix}-border: #______;
}
```

## Demo-copy examples

### Hero subhead rewrite

> {One paragraph combining positioning, location, and key differentiator}

### Differentiator bullets

- {Bullet 1}
- {Bullet 2}
- {Bullet 3}
- {Bullet 4}

## Implementation notes

- Mirror palette closely enough that the redesign feels familiar at first glance
- Keep the redesign cleaner than the current site — "same heart, better presentation"
- Do not over-saturate with too many accent colors; one primary should lead
- Frame as a conversion-focused refresh that preserves identity
