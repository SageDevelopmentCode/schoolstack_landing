---
name: mobile-ui-visual-verify
description: >
  After substantive Expo mobile UI changes under apps/mobile/, capture Maestro
  screenshots on iOS Simulator, verify artifact files exist, and required visual
  review (Read PNGs + checklists). Android optional for platform-specific changes.
---

# Mobile UI visual verification (Expo / Maestro)

Use at the end of tasks that change **mobile UI** (`apps/mobile/src/**/*.tsx`). Triggered by [mobile-ui-visual-verification](../../.cursor/rules/mobile-ui-visual-verification.mdc).

Web portal screenshots use [portal-responsive-verify](../portal-responsive-verify/SKILL.md). If you changed **both** `src/` web UI and `apps/mobile/`, complete **both** skills.

## Golden feature slugs

| Feature slug | Maestro visual flow | Screen anchor |
|--------------|---------------------|---------------|
| `school-admin-dashboard` | `.maestro/visual/school-admin-dashboard.yaml` | `Dashboard` |
| `school-admin-admissions-list` | `.maestro/visual/school-admin-admissions-list.yaml` | `Alpha Child` |
| `school-admin-submission-detail` | `.maestro/visual/school-admin-submission-detail.yaml` | `Decision` |
| `school-admin-students` | `.maestro/visual/school-admin-students.yaml` | `Search students` |
| `parent-home` | `.maestro/visual/parent-home.yaml` | `parent-portal-ready` (after login) |
| `parent-messages` | `.maestro/visual/parent-messages.yaml` | `Messages` |
| `parent-billing` | `.maestro/visual/parent-billing.yaml` | `Family tuition` |
| `parent-committees` | `.maestro/visual/parent-committees.yaml` | `E2E Volunteer Committee` |
| `teacher-home` | `.maestro/visual/teacher-home.yaml` | `Your students` |
| `teacher-messages` | `.maestro/visual/teacher-messages.yaml` | `Messages` |
| `parent-coop-teaching-schedule` | `.maestro/visual/parent-coop-teaching-schedule.yaml` | `parent-coop-teaching-schedule-ready` (after platform-admin parent preview) |
| `parent-coop-more-menu` | `.maestro/visual/parent-coop-more-menu.yaml` | `Curriculum` + `Supply list` in More sheet |

**Co-op program bundle:** `npm run mobile:visual:capture:coop-program` runs both co-op slugs; checklist via `npm run verify:parent-coop-visual`. See [README-parent-coop-program.md](../../apps/mobile/.maestro/visual/README-parent-coop-program.md) for demo-data prerequisites.

Outputs (gitignored):

- `apps/mobile/.artifacts/responsive/{feature}-ios.png` (required)
- `apps/mobile/.artifacts/responsive/{feature}-android.png` (optional)

### Golden scope (out of scope)

**Platform admin** (`platform-admin-*.yaml` functional CI flows) is **not** part of golden visual capture or agent visual review. Do not add platform-admin slugs to this table unless explicitly tasked.

Login helpers (not visual slugs): `.maestro/parent-logged-in.yaml`, `.maestro/teacher-logged-in.yaml`.

## 1. Prerequisites (local E2E stack)

Same as [mobile-e2e-local](../mobile-e2e-local/SKILL.md):

1. `supabase start && supabase db reset && npm run seed:e2e`
2. API on **3100**: `DISABLE_OUTBOUND_EMAIL=1 npm run dev:next -- -p 3100` (or `npm run test:e2e:server` after `test:e2e:build`)
3. Expo with `apps/mobile/.env.e2e.local` (`npm run mobile:e2e:env -- ios`)
4. iOS Simulator booted with the app running via Metro

## 2. Capture (iOS required)

From repo root:

```bash
npm run mobile:visual:capture -- school-admin-dashboard
npm run mobile:visual:capture -- parent-home
npm run mobile:visual:capture -- teacher-messages
# Android (optional): npm run mobile:visual:capture -- parent-home android
```

Pick the slug that matches the screen you changed.

Confirm files:

```bash
npm run verify:mobile-artifacts -- school-admin-dashboard
# With Android capture: ANDROID=1 npm run verify:mobile-artifacts -- school-admin-dashboard
```

This does **not** replace functional Maestro E2E (`npm run mobile:test:e2e:ios`).

## 3. Visual review (required)

Whenever PNGs were produced:

1. **Read** `apps/mobile/.artifacts/responsive/{feature}-ios.png` (and `-android.png` if captured).
2. Apply the checklist for that feature.
3. Task summary: **Visual review** with **Pass** or **Issue** per platform; any Issue → fix, re-capture, re-read.

### Feature checklists

| Feature slug | iOS (required) | Android (when captured) |
|--------------|----------------|-------------------------|
| `school-admin-dashboard` | Tab bar readable; dashboard content not clipped under header; no obvious overlap | Same; check Android nav/status insets |
| `school-admin-admissions-list` | Submission rows readable; list scroll area usable; filter/header not crushed | Same |
| `school-admin-submission-detail` | Overview/decision sections visible; back affordance present; no horizontal overflow | Same |
| `school-admin-students` | Students header + search visible; empty/workspace state intentional | Same |
| `parent-home` | Floating tab bar visible (Home, Billing, Messages, More); home content not clipped under header/preview banner | Same |
| `parent-messages` | Inbox header `Messages`; thread list or empty state intentional; composer not clipped above tab bar | Same |
| `parent-billing` | `Family tuition` header; summary cards readable; tab bar visible | Same |
| `parent-committees` | `Your committees` + seeded `E2E Volunteer Committee` row; not an empty-state-only screenshot when seed ran | Same |
| `teacher-home` | `Your students` section visible; tab bar (Home, My Students, Messages) readable | Same |
| `teacher-messages` | Messages shell loaded; list/workspace not crushed under tab bar | Same |
| `parent-coop-teaching-schedule` | Stats grid + filter pills; week cards readable; no duplicate Open in preview; Schedule tab active | Same |
| `parent-coop-more-menu` | Co-op kicker; Curriculum + Supply list rows; sheet not skeleton-only | Same |
| **generic** | Primary content visible; touch targets not overlapping; no broken empty states | Platform-specific safe areas OK |

## 4. Lint / typecheck

When TSX changed:

```bash
npm run mobile:lint
npm run mobile:typecheck
```

## 5. CI

v1: visual capture is **agent-local** only. PR CI still runs functional Maestro ([`.github/workflows/mobile.yml`](../../.github/workflows/mobile.yml)).

## Dry-run (no simulator)

If Maestro/simulator is unavailable, document the blocker in the task summary and list the commands the user should run locally. Do not claim visual **Pass** without Read PNGs.

## Local cleanup

```bash
rm -rf apps/mobile/.artifacts
```
