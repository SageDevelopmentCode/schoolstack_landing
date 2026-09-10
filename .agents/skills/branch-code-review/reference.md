# Branch code review — reference

## Invocation examples

| You say | Scope |
|---------|--------|
| “Review this branch” / “branch-code-review” | Current checkout (`HEAD`) vs `origin/main` |
| “branch-code-review vs develop” | `HEAD` vs `develop` |
| “Review branch `feature/foo`” | That branch vs `origin/main` (fetch/checkout if needed) |
| “Review commit `abc1234` only” | Single commit |
| “Include uncommitted changes” | Also review working tree diff vs `HEAD` |

Always name the skill or path: read [SKILL.md](SKILL.md) or say `branch-code-review` (`disable-model-invocation: true`).

---

## Full report template

```markdown
# Branch review: `<branch>` vs `<base>`

**Scope:** N commits, M files (+ uncommitted if requested). Merge-base: `<sha>`.

## Cross-cutting patterns

(Bullet the recurring defects that span multiple features — fix once, win everywhere.)

## Findings

### CRITICAL / HIGH / MEDIUM / LOW

For each issue:
- **Severity**
- **File/function/line**
- What is wrong
- Why it matters
- Concrete recommendation (code snippet when helpful)

Group by theme when helpful: Security, Correctness, Performance, Architecture, Testing, Product logic.

## Things done well

(2–4 bullets — only what is genuinely good.)

## Worth investigating further

## Executive summary

## Priority fixes

1. …
2. …

## Overall rating (1–10)

| Dimension | Score |
|-----------|-------|
| Correctness | |
| Security | |
| Performance | |
| Maintainability | |
| Scalability | |
| Overall | |

## Recommended next steps

(Phased: ship blockers first, then hardening, then refactors.)
```

---

## Review dimensions checklist

Use as a lens; skip categories with no findings.

**Correctness:** logic errors, edge cases, race conditions, null/undefined, wrong assumptions, runtime failures.

**Security:** authn/authz, injection, data exposure across orgs/programs/families, insecure API usage, secrets in code, OWASP-style issues, unsafe input.

**Performance:** unnecessary DB/API calls, N+1, unbounded queries, hot paths (layouts, unread counts), memory (PDF buffering, iframe grids).

**Architecture:** separation of concerns, duplication, over-complexity, naming, patterns that won’t scale with the codebase.

**Testing:** coverage of real behavior, tests wired into `npm test`, time-bomb tests, tests that reimplement production logic instead of calling it.

**Product logic:** technically works but wrong for real users (copy vs behavior, preview parity, money paths).

**Scalability:** behavior at 10x / 100x users, data, or request rate.

Do not invent problems. Say when something is fine.

---

## Schoolstack file routing

| Change type | Where to look |
|-------------|----------------|
| Parent portal APIs | `src/app/api/parent-portal/**` |
| Platform admin APIs | `src/app/api/admin/**` |
| School admin APIs | `src/app/api/school-admin/**`, `src/app/api/school/[slug]/**` |
| Tuition / money | `src/lib/tuition/**`, `src/app/api/tuition/**` |
| Parent notifications | `src/lib/parent-portal/parent-activity-notifications*.ts`, `parent-coop-notifications.ts` |
| Activity log | `src/lib/activity-log.ts`, `src/lib/activity-event-display.ts` |
| Co-op supply / schedule / curriculum | `src/lib/admissions/program-coop-*` |
| Classrooms / enrollments | `src/lib/school-admin/classrooms.ts`, `enrolled-students.ts` |
| Feature announcements | `src/lib/admin/*-feature-announcements*`, `src/lib/school-admin/admin-feature-announcements.ts`, `src/lib/parent-portal/parent-feature-announcements.ts` |
| Preview routes | `src/app/admin/(preview)/preview/[slug]/family/[familyId]/parent/**` vs live `src/app/school/[slug]/parent/**` |
| Schema (CI/local) | `supabase/migrations/` |
| One-off / remote paste | `supabase/migrations_manual/` |
| Demo seeds | `supabase/migrations/rooted-meadows/` |
| Unit tests | `src/**/*.test.ts` — check inclusion in `package.json` `"test"` list |
| E2E | `e2e/**` |

---

## Subagent prompt template

Copy and adapt when a feature bucket is large (~500+ lines or 10+ files):

```
You are a senior code reviewer. Repo: <path>. READ-ONLY — do not edit files.

Review the <feature name> portion of branch <branch> vs <base> (commits: <range or list>).

Files in scope:
<file list>

Read current files and `git show` / `git diff <base>...HEAD -- <paths>` for context.

Look for: bugs, auth/authz (especially createAdminClient + programId from client),
race conditions on array/full-row upserts, data leakage across orgs/programs/families,
N+1 and unbounded queries, preview parity (same component as live, previewMode disables
actions not hides UI), migration RLS and idempotency, test quality, product logic.

Project rules when relevant:
- family-preview-parity (.cursor/rules/family-preview-parity.mdc)
- supabase manual SQL only (.cursor/rules/supabase-manual-sql-only.mdc)
- operational errors (.cursor/rules/operational-error-reporting.mdc)

Return:
- Findings: CRITICAL/HIGH/MEDIUM/LOW, file+line, what's wrong, why, recommendation
- 2–4 things done well
- Do not invent issues
```

Parent agent must **spot-verify every CRITICAL/HIGH** against source before including in the final report.

---

## Patterns to hunt (schoolstack)

| Pattern | What to check |
|---------|----------------|
| Org auth + admin client | `userHasEnrolledAccess(org)` then `createAdminClient()` with request `programId` |
| Program auth | Prefer `userHasEnrolledAccessInProgram` — exists in `program-parent-portal-access.ts` |
| Array RMW | select → JS cap → full-row upsert on `assigned_families` / teaching parent arrays |
| Display-name identity | Claims/sign-ups keyed by `displayName` / email / `"Account"` |
| Tests not in CI | New `*.test.ts` missing from `package.json` `"test"` explicit file list |
| RLS too broad | `user_is_active_org_member` where staff/guardian-only was intended |
| Preview parity | Live vs `/admin/preview/.../family/{familyId}/parent/...` |
| Migration mirrors | `supabase/migrations/` vs `migrations_manual/` — DDL in sync |
| Money paths | waive / refund / checkout races; `waived` still payable; non-atomic updates |
| Raw DB errors to client | `error.message` on 500 in API routes |
| `apiError` / validation | Domain validation thrown as generic `Error` → 500 + Discord notify |
