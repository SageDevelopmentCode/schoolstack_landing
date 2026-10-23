# Portal QA — reference

## Invocation examples

| You say | Scope |
|---------|--------|
| `portal-qa` | Current checkout vs `origin/main` → scoped scenarios |
| `portal-qa vs develop` | `HEAD` vs `develop` |
| `portal-qa — include uncommitted` | Commits + working tree + staged |
| `portal-qa — full golden sweep` | `PORTAL_QA_SCENARIOS=all` |

Always name the skill or read [SKILL.md](SKILL.md) (`disable-model-invocation: true`).

---

## Full report template

```markdown
# Portal QA: `<branch>` vs `<base>`

**Scope:** N commits, M portal-related files. Scenarios: `id1`, `id2`, …  
**Triggers:** (brief list from scope JSON)  
**Environment:** local E2E (`rooted-meadows-school` seed), Playwright port 3100  
**Golden expanded:** yes/no (baseline/shell files touched)

## Programmatic results (Playwright)

| Scenario | mobile | tablet | desktop | Notes |
|----------|--------|--------|---------|-------|
| committee-messages | pass/fail | … | … | layout asserts, overflow |

(List each scenario run. Failures include assertion message.)

## Visual review

### `<scenario-id>`

| Viewport | Result | Notes |
|----------|--------|-------|
| mobile | Pass / Issue | … |
| tablet | Pass / Issue | … |
| desktop | Pass / Issue | … |

(Repeat per scenario.)

## Parent experience (mobile-first)

- Can a parent complete the primary task within ~3 seconds?
- Nav labels readable (no accidental truncation)?
- No clipped chrome or thin horizontal strips for chat/inbox layouts?
- Empty states justified by seed data?

## Family preview (if applicable)

(Routes and Pass/Issue when preview files changed.)

## Issues found

### BLOCKER / HIGH / MEDIUM / LOW

For each:
- **Scenario + viewport**
- What is wrong (visual or assert)
- Parent/admin impact
- Suggested fix area (file/component)

## Things that look good

(2–4 bullets.)

## Priority fixes

1. …

## Parent experience rating (1–10)

| Lens | Score |
|------|-------|
| Clarity on mobile | |
| Trust / polish | |
| Overall for parents | |

## Recommended next steps

(Run layout spec in CI path, re-capture, or ship blockers first.)
```

---

## Per-scenario visual checklists

| Scenario ID | Mobile / tablet (&lt;1024px) | Desktop (≥1024px) |
|-------------|------------------------------|-------------------|
| `committee-messages` | Compact committee bar; hamburger menu; messages panel uses most of screen below nav; seeded welcome text readable; no horizontal scroll | Sidebar section nav; tall messages panel; welcome text visible |
| `parent-messages-inbox` | Inbox + thread not a thin strip; composer visible | Reasonable two-column inbox at 1280px |
| `parent-home` | Portal home content visible under header; no overflow | Layout balanced |
| `parent-billing` | Billing summary or child panel visible; charges readable | Tabs/nav usable |
| `parent-committees-list` | Committees header/nav; list or empty state clear | Same |
| `committee-home` / `committee-tasks` / `committee-members` / `committee-resources` / `committee-calendar` | Section content visible; mobile menu works; no crushed main area | Sidebar nav + section layout |
| `parent-calendar` | Calendar shell loads | Month/agenda usable |
| `parent-attendance` | History list or empty state | Same |
| `parent-children` | Learner strip / overview | Same |
| `parent-children-health` / `parent-children-pickup` | Record workspace + correct tab | Same |
| `parent-classroom-signups` | List + filters | Signup cards readable |
| `parent-classroom-signup-detail` | Sidebar + signup detail | Same |
| `parent-forms-documents` | Seeded form card visible | Same |
| `parent-friday-branch` | Class card visible | Same |
| `parent-feed` | Coming-soon layout (no broken chrome) | Same |
| `parent-notifications` | Notification settings form | Same |
| `parent-coop-*` | Co-op program nav context; curriculum / supply / teaching schedule content | Same at 1280px |
| `teacher-dashboard` | Workspace nav / dashboard content visible | Same |
| `teacher-messages` | Messages UI fills space; not crushed under header | Same |
| `teacher-my-students` | Roster shows seeded assigned student; filters readable | Table/cards not cramped |
| `teacher-classroom-signups` / `teacher-classroom-signup-detail` | Signup list + volunteer signup sidebar | Same |
| `teacher-forms-documents` | Seeded form row visible | Same |
| `teacher-calendar` | Read-only or manager calendar shell loads | Month/agenda usable |
| `teacher-attendance` | Attendance roster shell visible | Same |
| `teacher-committees-list` | Committees header; mine list | Same |
| `teacher-committee-*` | Section content; mobile committee menu; seeded message on messages | Sidebar + section layout |
| `teacher-my-hours` / `teacher-feed` / `teacher-payroll` | Coming-soon layout (no broken chrome) | Same |
| `admin-dashboard` | Admin shell + dashboard content | Same |
| `admin-admissions-submissions` | Table visible (Status, seeded names) | Same |
| **generic** | Primary content visible; no clipping; touch targets not overlapping | Matches intent |

---

## Parent-centric lens (always apply on mobile PNGs)

1. **First impression** — Would a busy parent know where to tap?
2. **Regression patterns** — Thin flex child (chat/inbox height collapse), overlapping fixed headers, truncated tab labels.
3. **Data honesty** — Blank main area when seed expects content (e.g. committee message) is a **BLOCKER**.
4. **Calm UX** — Readable type, sufficient contrast, no horizontal pan to read one line.

## Teacher-centric lens (apply on teacher scenario PNGs)

1. **Classroom context** — “Your classroom” sections feel like the teacher’s workspace, not admin chrome leaking in.
2. **Roster & attendance** — Assigned students and attendance table readable on mobile without horizontal scroll.
3. **Volunteer signups & forms** — Seeded signup title and form row visible; detail sidebar not clipped.
4. **Committees** — Same workspace quality as parent committee scenarios when staff is a member.

---

## Commands cheat sheet

```bash
npm run portal-qa:scope
npm run portal-qa:scope -- --base origin/main --uncommitted
npm run test:e2e:build
PORTAL_QA_SCENARIOS=committee-messages npm run test:qa:portal
PORTAL_QA_SCENARIOS=parent-all npm run test:qa:portal
PORTAL_QA_SCENARIOS=teacher-all npm run test:qa:portal
PORTAL_QA_SCENARIOS=all npm run test:qa:portal
npm run verify:portal-qa-artifacts -- committee-messages
```

Artifact paths: `e2e/.artifacts/portal-qa/{scenario-id}-{mobile|tablet|desktop}.png`
