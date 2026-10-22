---
name: portal-responsive-verify
description: >
  After substantive web UI changes under src/, verify layout at mobile, tablet,
  and desktop. Capture screenshots (browser MCP and/or Playwright), then
  required visual review: Read PNGs and apply feature checklists before marking
  done. Layout-critical paths: committee workspace messages (Holly), parent inbox.
---

# Portal responsive verification

Use at the end of tasks that change **web UI** (`src/**/*.tsx`, `src/**/*.css`). Triggered by [web-ui-responsive-verification](.cursor/rules/web-ui-responsive-verification.mdc).

## Two different “Messages” surfaces

| User path | Nav / URL | Playwright spec |
|-----------|-----------|-----------------|
| **Committees → committee → Messages** (Tasks / Messages / Members sidebar) — **Holly regression** | `/school/{slug}/parent/committees?tab=mine&committee={id}&section=messages` | `e2e/parent/committee-messages-layout.spec.ts` |
| **Top nav “Messages”** (school inbox, MudKitchen Support) | `/school/{slug}/parent/messages` | `e2e/parent/parent-messages-layout.spec.ts` |

When fixing committee chat layout, run **committee** spec first. Do not treat a passing parent-messages spec as coverage for committee workspace.

## 1. Infer the route to verify

From the diff, pick one primary URL:

| Area | Example path |
|------|----------------|
| Parent portal | `/school/{slug}/parent/{feature}` |
| Teacher portal | `/school/{slug}/teacher/{feature}` |
| School admin | `/school/{slug}/admin/...` |
| Apply | `/school/{slug}/apply` |
| Family preview | `/admin/preview/{slug}/family/{familyId}/parent/...` (match live route per family-preview-parity rule) |

### Golden routes (local E2E org `rooted-meadows-school`)

Use these when the change is broad or the primary URL is unclear:

| Surface | URL |
|---------|-----|
| Parent home | `/school/rooted-meadows-school/parent` |
| **Committees → Messages (Holly)** | `/school/rooted-meadows-school/parent/committees?tab=mine&committee={id}&section=messages` (id from `e2e/.seed-manifest.json` → `committees.parentWorkspace`) |
| Parent messages (top nav inbox) | `/school/rooted-meadows-school/parent/messages` |
| Apply dashboard | `/school/rooted-meadows-school/apply` |

### Golden scope (out of scope)

Responsive capture and §3 visual review apply to **parent**, **teacher**, **school-admin**, and **apply** portal routes (and matching family preview paths per family-preview-parity). **Platform admin** (`/admin/...`, platform-admin mobile flows) is **not** golden scope unless explicitly tasked — do not treat Lighthouse/Playwright platform routes as required PNG review by default.

Use local dev base URL (`http://localhost:3000` or the port from the running `dev:next` / Playwright server). For E2E-only flows, use `http://localhost:3100` when following Playwright below.

Create `e2e/.artifacts/responsive/` if missing (gitignored).

## 2. Browser MCP (default — always when this skill runs)

When browser MCP is available:

1. `browser_navigate` to the inferred route (log in first if the page is auth-gated).
2. `browser_lock` before a sequence of actions; `browser_lock` unlock when done.
3. For each viewport, set device metrics (CDP `Emulation.setDeviceMetricsOverride` or equivalent), then `browser_take_screenshot`:
   - **mobile:** 375×812 → `e2e/.artifacts/responsive/{feature}-mobile.png`
   - **tablet:** 768×1024 → `e2e/.artifacts/responsive/{feature}-tablet.png`
   - **desktop:** 1280×800 → `e2e/.artifacts/responsive/{feature}-desktop.png`

Use a short `{feature}` slug (e.g. `committee-messages`, `parent-messages-inbox`, `admin-billing`). Overwrite the same filenames when re-verifying the same feature.

**Quick checks:** main content uses reasonable height below the header (no thin horizontal strip for inbox/chat layouts); no obvious horizontal overflow. On **committee workspace** viewports below `lg` (~1024px), section links live in the **hamburger menu** (`committee-mobile-menu-button`); the aside should be a compact bar (back + truncated title + menu), not a full vertical section list.

If browser MCP is unavailable (no tab, auth blocker), say so in the summary and rely on CI artifact `portal-responsive-screenshots` after push.

## 3. Visual review (required)

Whenever this skill runs and PNGs were produced (browser MCP and/or Playwright), **do not mark the task done** until visual review passes.

### Steps (non-optional for agents)

1. Confirm files exist (optional helper): `npm run verify:responsive-artifacts -- {feature}` (e.g. `committee-messages`).
2. **Read** each image with the Read tool:
   - `e2e/.artifacts/responsive/{feature}-mobile.png`
   - `e2e/.artifacts/responsive/{feature}-tablet.png`
   - `e2e/.artifacts/responsive/{feature}-desktop.png`
3. Apply the **checklist** for that `{feature}` (table below).
4. In the **task summary**, add a **Visual review** subsection: per viewport **Pass** or **Issue** + one line each. Any **Issue** → fix, re-capture, and re-read before finishing.

If browser MCP only: read the MCP screenshot result **or** the saved paths above — same checklist.

**If PNGs are missing:** run the matching Playwright spec (after `npm run test:e2e:build` per [e2e-local](../e2e-local/SKILL.md)) or capture via browser MCP, then Read again.

### Feature checklists

| Feature slug | Mobile / tablet (&lt;1024px) | Desktop (≥1024px) |
|--------------|------------------------------|-------------------|
| `committee-messages` | Compact committee bar (back + truncated title + **Messages** menu button); **no** long vertical section list above chat; messages area uses most of screen below portal nav; seeded welcome text readable; no obvious horizontal scroll | Sidebar section nav visible; messages panel tall; welcome text visible |
| `parent-messages-inbox` | Inbox list + thread not a thin strip; composer visible; no crushed layout under portal header | Two-column or full inbox layout reasonable at 1280px |
| **generic** `{feature}` | Primary content visible; no obvious overflow/clipping; touch targets not overlapping | Layout matches intent of change; no broken empty states |

Golden Playwright outputs:

| Spec | PNG prefix |
|------|------------|
| `e2e/parent/committee-messages-layout.spec.ts` | `committee-messages` |
| `e2e/parent/parent-messages-layout.spec.ts` | `parent-messages` |

## 4. Playwright (optional — layout-critical + E2E env)

Run **in addition** to browser MCP when **both** are true:

1. **Layout-critical** files changed in this task, e.g.:
   - `src/components/school-parent/SchoolParentBaseline.tsx`
   - `src/components/school-parent/SchoolParentPageShell.tsx`
   - `src/components/school-teacher/SchoolTeacherBaseline.tsx`
   - `src/components/school-admin/committees/CommitteeWorkspaceLayout.tsx`
   - `src/components/school-admin/committees/sections/CommitteeMessagesSection.tsx`
   - `src/components/school-parent/committees/` workspace shell
   - `src/components/messages/` (top-nav inbox layout)
   - Parent/teacher messages page shells under `src/components/school-parent/messages/` or `school-teacher/`
   - `src/app/school/**/parent/**`, `teacher/**`, or `admin/**` layout or feature pages
2. Local E2E env is ready: `supabase status` succeeds and `.env.e2e.local` exists (see [e2e-local](../e2e-local/SKILL.md)).

**Committee workspace messages (primary for committee/inbox-height bugs):**

```bash
npm run test:e2e -- e2e/parent/committee-messages-layout.spec.ts
```

**Top-nav parent Messages inbox (separate feature):**

```bash
npm run test:e2e -- e2e/parent/parent-messages-layout.spec.ts
```

Run both when baseline or shared flex-height shells changed.

Outputs (overwritten each run):

- `e2e/.artifacts/responsive/committee-messages-{mobile,tablet,desktop}.png`
- `e2e/.artifacts/responsive/parent-messages-{mobile,tablet,desktop}.png`

If Supabase/Docker is not running, **skip Playwright** and use browser MCP only (do not block the task).

Interactive debugging: `npm run test:e2e:ui -- e2e/parent/committee-messages-layout.spec.ts`

## 5. CI

Pull request E2E uploads artifact **`portal-responsive-screenshots`** (3-day retention). Full suite still runs on PR; this skill does not require `npm run test:e2e` without arguments locally.

## 6. Performance / load time (separate from layout screenshots)

| Tool | When | What |
|------|------|------|
| **Lighthouse CI** ([`.github/workflows/performance.yml`](../../.github/workflows/performance.yml), [`lighthouserc.js`](../../lighthouserc.js)) | Push to `main` (path-filtered) | Mobile Lighthouse on [`CI_LHCI_PAGE_PATHS`](../../src/lib/performance/page-manifest.ts) — score, LCP, TBT, CLS (mostly warn thresholds). Parent auth via [`scripts/lhci-auth-routes.json`](../../scripts/lhci-auth-routes.json). |
| **Platform admin UI** (`/admin/performance`) | Manual | On-demand audits against the full page manifest; results in `performance_audit_*`. |
| **Playwright** (`committee-messages-layout.spec.ts`) | Local/PR E2E | Soft **15s** budget until messages panel + seeded message visible; not a substitute for Lighthouse. |

Deep committee URLs (`?committee=&section=messages`) are seed-specific — layout E2E covers them; Lighthouse uses `/parent/committees` list only.

## 7. Lint / typecheck

Already required by post-change-verification; do not skip.

## Local cleanup

```bash
rm -rf e2e/.artifacts
```
