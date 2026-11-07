# Parent portal security & architecture audit

**Started:** 2026-11-06
**Scope:** Live parent portal (`/school/[slug]/parent/**`), `/api/parent-portal/**`, and the Supabase permissions behind them. Every school is affected; the audit was driven by `rooted-meadows` and `rooted-meadows-demo`.
**Status:** Plan approved (all phases). Phase 1a, the 1a Discord monitoring code, and Phase 1b steps 1-2 are written and verified locally. **Nothing has been pasted on production yet** and the monitoring code is not deployed yet. Phase 2 (app security hardening) is written and verified locally (not deployed); it adds one new SQL file that must be pasted **before** the code deploys. Phase 3 (access layer and performance, "core pass") is written and verified locally (not deployed); it adds one SQL file (`20261150`) that must be pasted **before** the code deploys. Realtime Broadcast and `getClaims()` are deferred. Phase 4 safe pass (deterministic primary family, ignored-param cleanup, duplicate helper removal) is written and verified locally (not deployed, no new SQL); the registry, loader merge and component splits are deferred.

> **For new chats:** Read this whole file first. Follow [Execution order](#execution-order). Tick checkboxes and add a row to the [Progress log](#progress-log) as work lands. Database changes follow `.cursor/rules/supabase-manual-sql-only.mdc`: SQL goes in `supabase/migrations/` **and** `supabase/migrations_manual/`, and the user pastes it into the SQL Editor. Agents never write to the database. Read-only MCP queries are fine.


## Environments and how to verify

- **Production Supabase** (ref `rxrmlfyoqzdpjxztluyd`) is the only hosted database; there is no staging. Agents only read it, via the Supabase MCP (`plugin-supabase-supabase`), never write. The user pastes SQL in the SQL Editor.
- **Local Supabase** is a Docker stack (`supabase start`). `supabase db reset` applies `supabase/migrations/` only, never `migrations_manual/`. Docker must be running (`open -a Docker`). Test helpers refuse any non-local URL.
- **Run order on production:** deploy monitoring code, paste 1a, smoke-check; paste 1b step 1, smoke-check; paste 1b step 2, smoke-check. Each file has a dry-run block and a rollback block.
- **Local verification commands:**
  - `supabase db reset`, then `npm run test:integration` (121 tests), `npm test` (1287 tests), `npm run lint:errors`, `npm run typecheck`
  - If typecheck reports stale `.next/types` errors: `npx next typegen`
  - E2E: `npm run test:e2e:build` first (a plain `npm run build` bakes the production Supabase URL into the bundle and logins fail with "Invalid login credentials"). Reset the DB before each run, or the seed hits a duplicate-key error. Then: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright CI=true npm run test:e2e -- e2e/parent e2e/tuition e2e/admin`
- **Known unrelated E2E failure:** `e2e/parent/apply-mobile.spec.ts` "application detail uses shared navbar on mobile" fails with or without these migrations.
- **Unrelated uncommitted work** is in the tree (`apps/mobile/*`, `package-lock.json`, `PainSection.tsx`, `WorkflowSection.tsx`). Do not touch it or bundle it into audit commits.
- **Gotchas:**
  - `user_is_staff_org_member()` includes teachers.
  - RLS tightening fails silently as empty data, so Discord alerts cannot catch it; rely on dry-runs and smoke-checks.
  - New functions are locked by default since `20261146`; every new function needs an explicit `grant execute`.
- **New code from this work:** `src/lib/rpc-permission-errors.ts` and `-server.ts` (Discord alert on permission errors); integration tests `src/lib/supabase/function-grants.integration.test.ts` and `family-financial-rls.integration.test.ts`.

---

## Ground rules

- The software works. Don't rewrite working features. Every change must keep current behavior unless the change itself is the fix.
- **Mobile app compatibility:** older app builds call the same `/api/parent-portal/*` routes. Response shapes must not change.
- **"Add first, remove later" for permissions:** add new narrow access, deploy code that uses it, and only then remove broad access.
- Every SQL file includes a **dry-run block** (`begin; set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<user-id>","role":"authenticated"}', true); <queries>; rollback;`) and a **rollback block**.
- After code changes: `npm run lint:errors`, `npm run typecheck`, and responsive screenshot checks per `.cursor/rules/post-change-verification.mdc`.
- Errors go through `apiError` / `reportOperationalError` per `.cursor/rules/operational-error-reporting.mdc`.
- **Guard rules for new SQL checks:**
  - Parent-facing guards must include linked-account peers (`portal_account_link_peer_user_ids(org)`). The live `user_is_guardian_for_family()` only checks `g.user_id = auth.uid()`, but the app resolves families across linked logins.
  - Admin-side guards must also allow `is_platform_admin()` (platform admins open school admin pages without being members) and the service role.

---

## Findings summary

| # | Severity | Finding | Fixed in |
|---|---|---|---|
| C1 | Critical | "Allow all access" policy lets the public key insert, update and **delete** rows in `organizations` (97 cascading foreign keys), `organization_progress_log` and `organization_timeline_phase_demos` | 1a |
| C2 | Critical | Security-definer functions, including ones that write data, are callable with the public key because `anon` was never revoked | 1a |
| C3 | Critical | `user_is_active_org_member()` ignores role, so parents can read every family's tuition, payment-method, billing-email and signature data in their school | 1b |
| H1 | High | Parent pages only check access in layouts; page code loads data with the admin client after checking only that someone is logged in | 2 (done locally) |
| H2 | High | Classroom signup submit trusts `studentId` and slot/role IDs from the client and doesn't check capacity | 2 (done locally) |
| H3 | High | Middleware doesn't cover parent routes, so refreshed sessions get thrown away (random logouts) | 2 (done locally) |
| H4 | Medium | Operational-errors endpoint lets the client choose `notify` (Discord spam). Support and feedback aren't rate limited. Bodies aren't validated | 2 (done locally) |
| P1 | Perf | Each access check costs 4-6 sequential queries plus a `getUser()` HTTP call. Measured: 104 PostgREST requests per parent home load before, 53 after (see [Phase 3 measurements](#phase-3-measurements)) | 3 (done locally) |
| P2 | Perf | Unread counts build full thread lists; the RPC failure fallback silently loads every message; badge counts are fetched after load | 3 (done locally) |
| P3 | Perf | Realtime subscribes every parent to all of the school's messages; each event refetches counts with no debounce | 3 (deferred) |
| P4 | Perf | Photos are signed one at a time, and each failure sends its own Discord alert | 3 (done locally) |
| P5 | Perf | School settings are fetched with 2 sequential queries on every request, never cached | 3 (done locally) |
| A1 | Arch | No single access layer: 67 route files repeat auth checks; data is read three ways (server admin client, API routes, browser Supabase) | 3 (done locally for the 67 routes; server pages and browser reads unchanged) |
| A2 | Arch | Feature toggles are only enforced in the UI (about 5 of 67 routes check them) | 3 (done locally where a feature key is clear; see route table) |
| A3 | Arch | 820-line `if (feature === ...)` switch, with preview loaders duplicated from live ones | 4 |
| A4 | Edge case | Multi-family parents: `familyIds[0]` has no fixed order; billing/forms use one family while the children list uses all | 4 (order fixed; the primary-family-only gap is an open question) |
| A5 | Maintainability | `fetchOrganizationWithSettings(supabase, ...)` and `getParentPortalUserProfile(_supabase, ...)` ignore their client argument | 4 (fixed) |

---

## Evidence (read-only queries against the live DB, 2026-11-06)

### C1: open write policies
- `organizations."Allow all access"` is `FOR ALL TO public USING (true) WITH CHECK (true)`. Same policy on `organization_progress_log` and `organization_timeline_phase_demos`. Origin: `supabase/migrations/202601010009_add_product_organizations.sql` and `supabase/migrations_manual/add_product_timeline_bootstrap.sql`.
- `has_table_privilege('anon', 'public.organizations', ...)` is true for SELECT, INSERT, UPDATE and DELETE.
- All 97 foreign keys referencing `organizations` are `ON DELETE CASCADE`.
- Code that depended on the open policy:
  - `src/app/admin/(protected)/organizations/page.tsx` updates `organizations` from the browser; covered by "Platform admins manage organizations".
  - `src/lib/organization-progress.ts` reads `organization_progress_log` with the visitor's client (public timeline, MudKitchen build log); needs a published-rows read policy.
  - `organization_timeline_phase_demos`: no callers in `src/`.

### C2: functions callable with the public key
Root cause: migrations use `revoke ... from public, authenticated` but forget `anon`, which Supabase grants by default (e.g. `20260921_waive_tuition_charge_atomic.sql`). Live ACL: `{postgres=X, anon=X, service_role=X}`.

**Service-only (every caller uses `createAdminClient()`), revoke from `public, anon, authenticated`:**
- [x] `waive_tuition_charge_atomic`
- [x] `revert_tuition_ach_settlement_atomic`
- [x] `sign_teacher_parent_form_response_atomic`
- [x] `enroll_friday_branch_student_atomic`, `withdraw_friday_branch_student_atomic`
- [x] `save_friday_branch_schedule`
- [x] `append/remove_program_coop_supply_assigned_family`, `append/remove_program_coop_teaching_schedule_parent`
- [x] `latest_messages_for_threads`, `thread_unread_counts`, `count_admin_unread_messages`

**Called with the user's own client: guarded wrappers (original renamed to `*_unchecked`, locked):**
- [x] `admin_dashboard_metrics`, `admin_schedule_page_meta`, `admin_students_page_meta`, `admin_submissions_page_meta`, `admin_tuition_page_meta` (called from the browser by `TuitionDashboard.tsx`), `get_organization_payment_transactions_meta`: service role, platform admin or staff of the org
- [x] `parent_billing_page_meta`, `parent_portal_home_meta`: service role, platform admin, staff, or guardian of the family (including linked logins)
  - `parent_portal_home_meta` errors loudly instead of falling back, so dry-run it first.

**Do not touch:** RLS helper functions (`user_is_*`, `is_platform_admin`, `is_admin`, `portal_account_link_peer_user_ids`, `thread_has_platform_support`, `message_thread_organization_id`, `committee_*`, `user_can_*`, `user_has_enrolled_parent_access`, `user_staff_member_id_for_org`, `user_committee_member_id`); public-form rate-limit functions; trigger functions.

Guardrails:
- [x] `alter default privileges ... revoke execute on functions from public, anon, authenticated` (new RLS helpers now need explicit grants; documented in `.agents/skills/supabase-migrations/SKILL.md`)
- [x] Integration test `src/lib/supabase/function-grants.integration.test.ts`
- [ ] Check API logs for non-server `DELETE`/`PATCH` on `organizations` and direct `/rest/v1/rpc/...` calls to the functions above

### C3: parents can read other families' data
- `user_is_active_org_member()` matches any role (live definition confirmed).
- Parents get `organization_memberships(role='parent', status='active')` from `src/lib/admissions/family-guardians.ts` and `src/lib/admissions/applicant-bootstrap.ts`.
- Live counts: `rooted-meadows` 31 active parent memberships; `rooted-meadows-demo` 7.
- 38 SELECT policies use the helper. Most sensitive: `tuition_charges`, `family_payment_methods` (brand, last4, expiry, Stripe PM id), `tuition_billing_accounts` (billing email), `document_signatures` (`signature_data`, `ip_address`), `staff_members` (emails), `organization_memberships`, `organization_settings`.
- App path that exposes it: `src/app/api/parent-portal/billing/charges/route.ts` and `.../payments/route.ts` accept any `familyId` and rely on RLS.
- Precedent: `20260929_fix_teacher_parent_form_rls.sql` fixed the same bug for one table.

**Tables parents read with their own client (do NOT make staff-only before adding a parent policy):**

| Table | Parent dependency |
|---|---|
| `programs` | `listEnrolledProgramsForStudentIds`: portal switcher, co-op navigation |
| `application_form_versions` | `listFamilyApplications` joins `!inner`; children list depends on it |
| `enrollment_checklist_templates` / `_items` | Enrollment checklist |
| `admissions_*` slot/availability tables | Tour and visit booking in the apply flow |
| `organization_memberships` | `userHasParentAccess` reads the parent's own row |
| `tuition_rate_plans`, `tuition_payment_plans`, `tuition_fee_components`, `tuition_rate_tiers` | Billing / plan selector (verify browser reads) |
| `classrooms`, `enrollment_classrooms`, `classroom_signups` | Verify parent signups loaders |

**Linked-account gotcha (found 2026-11-06):** the guardian-only policies use `user_is_guardian_for_family()`, which checks only `g.user_id = auth.uid()` and ignores linked-account peers. `tuition_charges` additionally requires `g.user_id = auth.uid()` when `guardian_id` is set. Today the only linked group is in `rooted-meadows-demo` (1 of 2 members has no guardian row of their own), and that user currently sees billing only because of the broad org-member policy. Step 1 must add peer-aware policies before step 2 removes the broad ones.

**Already have guardian-only policies (safe to make staff-only early):** `tuition_charges`, `tuition_billing_accounts`, `tuition_billing_splits`, `tuition_adjustments`, `tuition_enrollment_assignments`, `family_payment_methods`. `document_signatures`: no parent dependency found yet; verify.

### H1: page access checked only in layouts
- `src/app/school/[slug]/parent/(protected)/layout.tsx` checks enrolled access; `p/[programSlug]/layout.tsx` checks program access.
- `src/lib/parent-portal/render-school-parent-feature-page.tsx` only checks for a logged-in user, then loads newsletters, curriculum discussions, forms and Friday Branch data with `createAdminClient()`.
- Next.js partial rendering can skip layouts on navigation or crafted requests.

### H2: classroom signup submit
- `src/app/api/parent-portal/classroom-signups/[signupId]/route.ts` (POST) passes `studentId`, `selectedSlotIds`, `selectedRoleIds` from the body straight to `upsertClassroomSignupResponse` (`src/lib/classroom-signups/mutations.ts`) with the admin client.

### H3: middleware matcher
- `src/middleware.ts` covers only `/admin/:path*`, `/auth/callback`, `/school/:slug/admin/:path*`.

### Performance evidence
- Access chain: `userHasEnrolledAccess` -> `getFamilyIdsForUser` -> `getPortalAccountLinkContext` (1-3 queries) -> guardians -> students -> enrollments. Routes then call `getFamilyIdsForUser` again.
- `getParentMessagesUnreadCount` -> `getTotalUnreadCount` -> full `listThreadsForOrganization` (`src/lib/messages/threads.ts`). Silent fallback in `getUnreadCountsFallback`.
- `src/lib/messages/use-message-realtime.ts`: org-wide `postgres_changes` on `portal_messages` and `message_threads`.
- `SchoolParentBaseline.tsx` + `SchoolParentHeader.tsx` fetch activity, messages and committee unread counts after load; the live layout doesn't pass `initialActivityUnreadCount` / `initialCommitteeUnreadSummary`.
- `src/lib/school-gallery/storage.ts` `attachSignedUrlsToGalleryPhotos` signs each photo separately and reports each failure with `notify: true`.
- `src/lib/organization-settings/fetch.ts`: 2 sequential queries, cached per request only.

### What to keep
Request-level `cache()` in `parent-portal-server-cache.ts`; Suspense streaming on home, billing, messages and calendar; atomic capacity functions (supply list, Friday Branch); consistent `apiError`; the family-preview parity approach.

---

## Execution order

1. **Phase 1a:** SQL safe now (no code dependency)
2. **Phase 1b, steps 1-2:** add narrow parent policies, then tighten tables parents never need
3. **Phase 2:** app security hardening (code)
4. **Phase 3:** access layer and performance (SQL for the new function first, then code)
5. **Phase 1b, step 3:** remove remaining broad policies once code no longer depends on them
6. **Phase 4:** architecture

---

## Phase 1a: database emergency (safe now)

Files: `supabase/migrations/20261146_lock_down_open_policies_and_function_grants.sql`, mirror `supabase/migrations_manual/lock_down_open_policies_and_function_grants_2026_11_06.sql` (includes dry-run and rollback blocks).

- [x] Drop "Allow all access" on `organizations`, `organization_progress_log`, `organization_timeline_phase_demos`; add published-read and platform-admin policies
- [x] Revoke execute on service-only functions
- [x] Guarded wrappers for page-summary functions (7: dashboard metrics, schedule, students, submissions, tuition, parent billing, parent home). `get_organization_payment_transactions_meta` needs no wrapper: `20260927` already guards it (platform admin / org admin); 1a only revokes `anon`.
- [x] Default-privileges change + skill doc (`.agents/skills/supabase-migrations/SKILL.md`, "Function grants")
- [x] Integration test for grants (`src/lib/supabase/function-grants.integration.test.ts`, in `test:integration`)
- [x] Local verification: `supabase db reset` applies cleanly; `npm run test:integration` 97/97; billing + tuition E2E 18/18; `lint:errors` and `typecheck` clean
- [x] Log review (last 24h, read-only): no DELETE/PATCH on `/rest/v1/organizations`; RPC POSTs came only from the server (`node`) and the MudKitchen mobile app (`admin_submissions_page_meta`, called with the admin's own session, so it still works through the wrapper)
- [ ] User: run dry-run block as a parent, a school admin and a teacher
- [ ] User: deploy the monitoring code, then paste migration in Supabase SQL Editor
- [ ] Smoke-check: parent home and billing (rooted-meadows-demo); admin dashboard, tuition, students, submissions (web and mobile), schedule, transactions; Friday Branch enroll; public timeline page

**Monitoring (Discord alerts for 1a):**
- [x] `reportRpcPermissionDenied` (`src/lib/rpc-permission-errors.ts`, server half in `rpc-permission-errors-server.ts`): when a guarded function returns Postgres `42501` (permission denied or the guard's `forbidden`), it writes `activity_events`, sends Discord (`notify: true`) and Sentry via `reportOperationalError`. Operation name: `rpc_permission_denied:<function>`.
- [x] Throttled to one report per function + organization per 10 minutes per server instance, so a bad deploy does not spam Discord.
- [x] Wired into all 7 guarded callers plus `get_organization_payment_transactions_meta`: dashboard metrics, schedule, students, submissions, tuition, transactions, parent billing, parent home. Fallback behavior is unchanged (still returns `null` or throws as before).
- [x] Browser callers (`fetchTuitionPageMeta` from `TuitionDashboard.tsx`) report through the existing client endpoints.
- [ ] **Deploy order: ship this code first, then paste the 1a SQL.** The alert only fires on permission errors, so it is harmless beforehand.
- Not covered: the MudKitchen mobile app calls `admin_submissions_page_meta` directly and only has Sentry (no Discord path); a denial there would show in Sentry/API logs only.
- Not covered: RLS tightening (1b) fails as **empty data, not errors**, so these alerts cannot catch it. Mitigation: dry-run blocks, smoke-check lists and the billing/tuition E2E specs after each paste. A scheduled canary cron that alerts Discord if the demo parent/admin paths return empty or denied is an optional later item.
- Where to look after pasting: Discord (school-admin/API error channel) for `rpc_permission_denied:*`; `activity_events` where `metadata->>'operation' like 'rpc_permission_denied:%'`.

Behavior notes:
- Teachers count as staff (`user_is_staff_org_member`), so they can still call the admin summaries, same as today's RLS. Tightening to admin-only is a later decision.
- The guarded wrappers accept: service role, platform admin, staff of the org, and (parent functions) a guardian of the family including linked-account peers.
- Direct calls from the SQL Editor as `postgres` to a guarded function now fail with `forbidden` (no `auth.uid()`); use the `_unchecked` variants for ad hoc admin queries.
- After this migration, every new function needs an explicit `grant execute` (default privileges changed). RLS helpers called inside policies need `grant execute ... to authenticated`.

## Phase 1b: replace broad member-read policies

Files (step 1): `supabase/migrations/20261147_parent_portal_narrow_read_policies.sql`, mirror `supabase/migrations_manual/parent_portal_narrow_read_policies_2026_11_06.sql`.
Files (step 2): `supabase/migrations/20261148_restrict_family_financial_reads_to_staff.sql`, mirror `supabase/migrations_manual/restrict_family_financial_reads_to_staff_2026_11_06.sql`.
Both mirrors include a dry-run block (rolls back) and a rollback block. Neither needs a code deploy.

**Step 1: add narrow access (only adds, safe anytime)**
- [x] Helper `user_is_family_portal_member(family)`: guardian of the family including linked-account logins
- [x] Peer-aware read policies for linked logins on `tuition_charges` (keeps the split-billing `guardian_id` rule), `tuition_billing_accounts`, `tuition_billing_splits`, `tuition_enrollment_assignments`, `tuition_adjustments`, `family_payment_methods`
- [x] Users (and linked logins) read their own `organization_memberships` row
- [x] Guardians read `programs` they have a child enrolled in or an application for (`user_has_program_portal_link`)
- [x] Guardians read form versions linked to their own applications (covers archived versions)
- [x] Guardians read checklist templates and template items for their own checklists
- [ ] Admissions slots: parents read availability/slots with their own client in the apply flow. **Left on the broad policy on purpose** (open question below); decide before step 3
- [ ] User: dry-run, paste step 1, smoke-check parent home/billing/children/enrollment on rooted-meadows-demo

**Step 2: tighten tables parents never need (paste only after step 1 is smoke-checked)**
- [x] Staff-only reads (`user_is_staff_org_member()`, keeps teachers unchanged) replace "Org members read" on `tuition_charges`, `tuition_billing_accounts`, `tuition_billing_splits`, `tuition_adjustments`, `tuition_enrollment_assignments`, `family_payment_methods`, `document_signatures`. `document_signatures` has no parent-facing user-client reads in the app.
- [x] Local verification: integration test `src/lib/supabase/family-financial-rls.integration.test.ts` (own family only, unrelated parent blocked, linked login sees linked family, staff sees all); parent, tuition and admin E2E specs 45 of 46 pass. The one failure, `apply-mobile.spec.ts` "application detail uses shared navbar on mobile", fails identically with the 1b migrations absent (it opens a draft form where the profile button is not rendered, so it looks data/order dependent, not related to these changes); worth a separate look
- [ ] User: dry-run, paste step 2, verify billing loads for a parent with a split, one without, a linked login and an admin (rooted-meadows-demo first, then rooted-meadows)
- Silent failure mode: RLS tightening shows empty data, not errors, so Discord alerts do not fire. Rely on the dry-run output and the smoke-check; roll back immediately if billing is empty.

**Step 3: after phase 3**
- [ ] Remaining tables: `staff_members`, `organization_settings`, `organization_memberships` (broad read), tuition config tables, classroom tables, `student_teacher_assignments`, `committee_templates`, admissions slots, and the rest of the 38
- [ ] Then drop the broad "Org members read" policies on `programs`, `application_form_versions`, checklist templates/items (the narrow replacements from step 1 are already in place)

---

## Phase 2: app security hardening

Files: `supabase/migrations/20261149_submit_classroom_signup_response_atomic.sql`, mirror `supabase/migrations_manual/submit_classroom_signup_response_atomic_2026_11_06.sql` (dry-run and rollback blocks included).

**Deploy order: paste the 20261149 SQL first, then deploy the code.** The classroom signup route now calls the new function; if it does not exist yet, parent signup submits return 500. Everything else in Phase 2 is code only and independent of the SQL pastes from Phase 1.

- [x] `requireParentPortalAccess({ organizationId, programId?, schoolSlug? })` in `parent-portal-server-cache.ts` (reuses the per-request cached enrolled/program checks, so no extra queries after a layout ran). Called at the top of `renderSchoolParentFeaturePage` (before every admin-client loader, including the photos branch) and in the children, notifications, school documentation and newsletter read pages. The program documentation page already checked program access.
- [x] Classroom signups: new `submit_classroom_signup_response_atomic` (service role only). Locks the signup row and checks: signup is open and in the org, student belongs to the family, slot/role ids exist in the signup config, single-select signups take at most one slot, slot `capacity`, role `quantityNeeded` and open-signup `maxFamilies` are not exceeded (the family's own previous response does not count against it). The route resolves the family **from the student** (among the user's families, including linked logins) instead of `familyIds[0]`, and maps rejections to 403/404/400/409 with the same `{ error }` shape. Integration test `src/lib/supabase/classroom-signup-submit.integration.test.ts` covers valid, re-submit, over capacity, bad ids, wrong student, closed signup, role/maxFamilies limits, a concurrent race, and non-callable by a signed-in user.
- [x] Billing charges/payments: `userCanAccessFamily()` (`src/lib/parent-portal/family-access.ts`) returns 403 when `familyId` is not one of the user's families (linked logins included).
- [x] Middleware matcher now includes `/school/:slug/parent/**` and `/school/:slug/apply/**` so refreshed auth cookies are written back (no redirect logic added).
- [x] Client operational-errors endpoints (`parent-portal`, `teacher-portal`, `school-admin`, `admissions`, `mobile`): client `notify` is ignored; the server throttles Discord to 5 per user + organization per 10 minutes per instance (events are still recorded); string fields and metadata size are capped (`src/lib/client-operational-error-input.ts`). No client in the repo sends `notify: false`.
- [x] Support requests and feedback: per-email rate limit (3 per hour, 1 per minute) via the existing public-form functions, keyed by email only (not IP, because parents share school networks); fails open if the rate-limit RPC is down (already reported). Feedback body is type-checked and length-capped; support `sourcePagePath` capped. New form ids `parent_portal_support` and `parent_portal_feedback` (free text in SQL, no migration needed).
- [x] `parsePagination` (`src/lib/api/pagination.ts`): rejects NaN/non-integers, clamps `limit` and `offset`. Used by billing charges, billing payments and attendance history. Gallery, activity-notifications and committee activity already clamp.
- [ ] User: paste 20261149 (dry-run first), then deploy code, then smoke-check: parent home and a deep link (forms, newsletter read), billing history for a parent with a split, classroom signup submit / change / withdraw, no random logouts over a long session.
- Note for later: the public-form rate-limit functions were granted with `revoke ... from public` only (see `20261112`); check whether `anon` can still execute `record_public_form_submission_event` (it could be used to fill the rate-limit table and block a form).

## Phase 3: access layer and performance

Scope: **core pass** (chosen with the user). Realtime Broadcast and `getClaims()` are deferred; JWT signing keys are unknown, so routes still call `getUser()`.

Files: `supabase/migrations/20261150_parent_portal_access.sql`, mirror `supabase/migrations_manual/parent_portal_access_2026_11_06.sql` (deploy-order header, dry-run and rollback blocks included).

**Deploy order: paste the 20261150 SQL first, then deploy the code.** Pasting `20261150` early is harmless (it only adds functions and grants); the code is what depends on it. Every parent API route and the parent layouts now call `parent_portal_access`; without the function they fail. The parent unread-count API falls back to the old thread-list path (and reports it) if only `parent_unread_message_count` is missing, but the access function has no fallback.

- [x] SQL: `parent_portal_access(p_organization_id)` (security definer, keyed on `auth.uid()`, linked-account peers included for families; messaging and guardian ids use only the caller's OWN guardian rows). Returns `link`, `guardian_ids`, `family_ids` (ordered by oldest guardian, then id), `student_ids`, `enrolled_programs`, `has_enrolled_access`. `authenticated` + service role only. Integration test `src/lib/supabase/parent-portal-access.integration.test.ts` (7 tests).
- [x] `getParentPortalAccess()` (`parent-portal-server-cache.ts`): one RPC per school per request through `cache()`; family ids, link context, enrolled-access and program-access helpers all derive from it. Pure parsing and access rules in `parent-portal-access-rpc.ts`.
- [x] `withParentPortalRoute` (`src/lib/parent-portal/with-parent-portal-route.ts`): bearer-aware client + `getUser()` (401), organization id from query/body/multipart (400), program/family params (400), one access RPC, access/program/family checks (403), optional feature toggle (403 `feature_disabled`), then the handler; thrown errors become 500 via `apiError`. All **67** `/api/parent-portal/**` route files use it (checked by looping over `route.ts` files). Response shapes are unchanged. Unit tests: `with-parent-portal-route.test.ts` (11).
- [x] `parent_unread_message_count(p_organization_id, p_program_id)`: parent unread API makes one call on the request client. The `thread_unread_counts` fallback in `threads.ts` now reports through `reportOperationalError` (notify throttled to once per 10 minutes per instance) and the fallback scan is bounded (own messages excluded in SQL, `created_at` lower bound when every thread has a read marker, 5,000-row cap). Unit tests in `unread-count-api.test.ts`.
- [x] Badge counts: the live main and program layouts call `startParentBadgeCountLoads` (no `await`) and pass the promises to `SchoolParentBaseline`. The activity count, message count and committee summary resolve into the header as they finish; a failed server load resolves `null` and the client falls back to its old fetch. The three post-load client fetches are gone on a healthy load. The family preview layouts now pass `initialMessagesUnreadCount` as well (parity).
- [x] `attachSignedUrlsToGalleryPhotos`: one `createSignedUrls` call per batch (was one request per photo) and one aggregated report per organization per batch. Newsletters use it through `load-parent-newsletters.ts`. Unit tests in `src/lib/school-gallery/storage.test.ts`.
- [x] School settings cache: `fetchOrganizationWithSettings` reads `organizations` + `organization_settings_public` through the cookie-free anon client inside `unstable_cache` (tag `org-settings:<slug>`, 60s TTL, misses never cached), with the per-request `cache()` still in front; any failure falls back to the signed-in read. Saves expire the tag: `saveSchoolProfileBundle`, `notifications/settings` and `friday-branch/settings` call `revalidateOrganizationSettingsById`; browser editors (`OrganizationSettingsEditor`, the platform-admin status update) call the new `POST /api/school-admin/revalidate-settings` (school admin or platform admin only). Integration test `organization-settings/fetch.integration.test.ts` checks the anon read equals the privileged read.
- [ ] Deferred: `getClaims()` instead of `getUser()` (needs asymmetric JWT signing keys; see open questions). It now matters more, see [Phase 3 measurements](#phase-3-measurements).
- [ ] Deferred: Realtime private Broadcast channel per guardian/family fed by a DB trigger; debounce refetches (~750ms).
- [ ] User: paste 20261150 (dry-run first), then deploy code, then smoke-check: parent home, messages (badge matches the inbox), committees, calendar, gallery, newsletters, billing, classroom signup, Friday Branch, notification settings; edit a school's branding or features and see it on the parent portal within a few seconds.

Behavior notes:
- Org settings cache: a **churned** school is not readable by `anon`, so those requests use the signed-in read exactly as before. Cached branding/features can lag a save made by a script or SQL (not through the app) by up to 60s.
- Route order changes that are intentional: access checks now run before body validation on `notification-settings` PATCH, `operational-errors`, `feedback` and `support-requests`, so a parent without access gets 403 instead of a validation 400. `operational-errors` returns 401 (was: validated the body first). `gallery` and `photo-media-consents` return 403 before 404 for a bad `slug`.
- Messaging parity decisions: a null program id counts all of the parent's threads, and platform-support threads are counted for parents (matches the existing app, not the original plan text).
- Co-op loaders and mutations (`coop/*`, `supply-list/*`, `teaching-schedule/*`) and `loadParentPortalHomeApiPayload` still run their own internal access queries; the wrapper removed the route-level ones only.
- `withParentPortalRoute` does not call `recordApiDuration` on early 400/401/403 exits for `committees/[committeeId]`.
- Badge promises are consumed with `.then` in the hooks (not `use()` under Suspense), so the header never suspends while counts load.

### Route to feature table

Feature keys are enforced by the wrapper (403 `feature_disabled`). "none" means the route either has no feature (shared across features) or checks its own toggle inside the handler (newsletters, friday-branch, gallery).

| Routes | Feature key | Access rule |
|---|---|---|
| `billing`, `billing/charges`, `billing/payments` | `billing` | enrolled access |
| `calendar`, `calendar/events` | `calendar` | enrolled access, optional program scope |
| `classroom-signups`, `signups/attention` | `classroom_signups` (list only) | enrolled access |
| `classroom-signups/[signupId]` (GET, POST) | none | enrolled access; DELETE needs a family only |
| `committees/*` (browse, mine, join-requests, tasks, messages, activity, record-activity, `[committeeId]`) | `committees` | enrolled access |
| `committees/unread-summary`, `committees/[id]/mark-read` | none | enrolled access |
| `forms-documents`, `[formId]`, `[formId]/download` | `forms_documents` | enrolled access |
| `messages/threads`, `contacts` | `messages` (optional program scope) | enrolled access |
| `messages/threads/[id]` and its message routes | `messages` | enrolled access plus thread participation |
| `messages/threads/[id]/read`, `messages/unread-count` | none | read marker / badge answers 0 without access |
| `gallery`, `photo-media-consents` | none (gallery checks its own toggle) | optional program scope |
| `newsletters`, `[editionId]`, `[editionId]/document` | none (handler checks the newsletters toggle) | enrolled access |
| `friday-branch/*` | none (handler checks the paused flag) | `requireParentFridayBranchAccess` with the access snapshot |
| `coop/*`, `curriculum/pdf`, `curriculum-discussion`, `supply-list/*`, `teaching-schedule/*` | none | required program scope |
| `students/[studentId]/*` | `attendance` for attendance history only | guardian of the student (snapshot `studentIds`), no enrollment needed |
| `activity-notifications/*` | none | notification context (main or program) |
| `children/[applicationId]/profile`, `attendance/eligible-children` | none | enrolled access |
| `home`, `portal-contexts`, `notification-settings` | none | home checks main/program access itself; others enrolled access |
| `feedback`, `support-requests`, `operational-errors`, `profile-photo` | none | enrolled access (`profile-photo`: own guardian row) |

### Phase 3 measurements

Measured locally on `rooted-meadows-school` parent home with production builds, counting Postgres statements via `pg_stat_statements` after a warm load plus 3 seconds idle (includes prefetches the page triggers). "Before" is a worktree at the pre-audit commit; "after" is the current tree, so the difference includes the Phase 2 middleware change.

| | Before | After |
|---|---|---|
| PostgREST requests (`set_config` statements) per home load | 104 | 53 |
| GoTrue `getUser` calls (session/user/identity lookups) per home load | 6 | 23 |
| Total database transactions per home load (includes auth) | about 210 | about 414 |

- The PostgREST requests the app makes roughly halved. The database total went **up** because GoTrue `getUser` lookups quadrupled: Phase 2 put `/school/:slug/parent/**` and `/apply/**` behind the middleware, which calls `getUser()` on every page, RSC prefetch and API request. This is the cost of fixing random logouts, and it is why `getClaims()` (local JWT verification in the middleware) is the next worthwhile change once the JWT keys are known.

## Phase 4: architecture

Scope: **safe pass** (chosen with the user). The primary family is chosen by a fixed order (oldest guardian row, then id), with no switcher UI. No new SQL; deploy needs only the earlier pastes.

- [x] Deterministic primary family: `getFamilyIdsForUser` now makes one guardians query across all linked logins and `getFamilyIdsForAuthUser` is ordered too; both use `orderFamilyIdsByFirstGuardian` (oldest guardian row, then family id, duplicates collapsed). This is the same order `parent_portal_access` returns, so `familyIds[0]` is stable on every request and in every code path. Tests: `application-auth.test.ts` (4) and an integration case in `parent-portal-access.integration.test.ts` that asserts the RPC `family_ids` equals `getFamilyIdsForUser`.
- [x] Ignored client params removed: `fetchOrganizationWithSettings(slug)` (about 90 call sites), `getParentPortalUserProfile(orgId)`, `getParentPortalFamilyIds(orgId)`, `getParentPortalPrimaryFamilyId(orgId)`. Pages and layouts no longer build a Supabase client only to pass it in. `fetchOrganizationWithSettingsUncached(supabase, slug)` keeps its client.
- [x] `getStudentIdsForFamilies` lives in `src/lib/admissions/family-students.ts`; the three former copies import it (`program-parent-portal-access.ts` still re-exports the name).
- [ ] Deferred: feature registry `{ key, requires, load(ctx), Component, previewLoad? }` replacing the switch in `render-school-parent-feature-page.tsx`.
- [ ] Deferred: merge live and preview home loaders (`load-parent-home-content-data.ts`); run preview steps in parallel.
- [ ] Deferred: split `ParentBillingPage.tsx` (~1,400 lines) and `SchoolParentHeader.tsx` (~700 lines).

Behavior note: a parent with several families, or a linked login, now always lands on the family with the oldest guardian row. Before, the primary family could differ between requests.

---

## Open questions
- Billing, forms and Friday Branch use the primary family only, while the children list shows every family. Should multi-family parents get a family switcher, or should those features cover all families? (Rare today; the primary is now at least stable.)
- ~~Staging DB?~~ Answered: production only, plus local Docker.
- Are asymmetric JWT signing keys enabled? (Required for `getClaims()`, which would remove most of the GoTrue lookups measured in Phase 3.)
- Should prospective (not yet enrolled) parents keep reading admissions availability with their own client, or should those reads go through API routes?

---

## Progress log

| Date | Phase / item | Change | Verified by | Notes |
|---|---|---|---|---|
| 2026-11-06 | Audit | n/a | Read-only MCP queries | Findings recorded; plan approved |
| 2026-11-06 | 1b step 1+2 | Migrations `20261147` (additive narrow policies) and `20261148` (staff-only financial reads) + manual mirrors with dry-run/rollback + integration test | Local `db reset` applies all three; `test:integration` 103/103 (incl. grants + family-financial RLS); parent/tuition/admin E2E 45/46; unit tests 1256/1256; lint:errors, typecheck, production build clean | Awaiting manual paste (step 1, then step 2 after smoke-check) |
| 2026-11-06 | 1a monitoring | `rpc-permission-errors` helper wired into 8 callers + unit test | `npm test` 1256/1256, lint:errors, typecheck | Deploy before pasting 1a SQL |
| 2026-11-06 | 1a | Migration `20261146` + manual mirror (with dry-run and rollback) + skill doc + grants integration test written | Local `db reset`, integration 97/97, billing/tuition E2E 18/18, lint:errors, typecheck, 24h log review | Awaiting manual paste on remote |
| 2026-11-06 | 2 | Access guard on parent pages, billing family check, atomic classroom signup RPC (`20261149`) + route changes, middleware matcher, server-controlled operational-error reporting (5 endpoints), support/feedback rate limits, `parsePagination` | `supabase db reset` applies cleanly; `test:integration` 112/112 (9 new); `npm test` 1269/1269 (13 new); `lint:errors`, `typecheck`; E2E parent/tuition/admin 48 passed, 1 skipped | Paste `20261149` SQL first, then deploy code |
| 2026-11-06 | 3 | Migration `20261150` (`parent_portal_access`, `parent_unread_message_count`) + manual mirror; `getParentPortalAccess` snapshot; `withParentPortalRoute` on all 67 parent routes; parent unread via RPC with a reported, bounded fallback; badge counts streamed from the live layouts; batched gallery/newsletter signed URLs with one report; cached org settings with tag revalidation (server saves + `POST /api/school-admin/revalidate-settings`); family preview gets the message badge | `supabase db reset` applies cleanly; `test:integration` 121/121 (9 new); `npm test` 1287/1287 (18 new); `lint:errors`, `typecheck`; E2E parent/tuition/admin 47 passed, 1 flaky (apply-mobile, passed on retry), 1 skipped; parent/committee messages layout specs 7/7 with screenshots reviewed; PostgREST requests per home load 104 to 53 | Paste `20261150` SQL first, then deploy code. `getClaims()` and Realtime Broadcast deferred |
| 2026-11-07 | 4 safe pass | Deterministic family order (`orderFamilyIdsByFirstGuardian`, matches the RPC), `fetchOrganizationWithSettings(slug)` and parent-portal cache helpers without ignored client args, 56 unused client/cookie locals removed, shared `getStudentIdsForFamilies` | `supabase db reset` applies cleanly; `test:integration` 122/122 (1 new); `npm test` 1291/1291 (4 new); `lint:errors`, `typecheck`; E2E parent/tuition/admin 48 passed, 1 skipped; parent messages layout spec 3/3, desktop screenshot reviewed | No new SQL. Registry, loader merge and component splits deferred |
