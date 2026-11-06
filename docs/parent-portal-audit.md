# Parent portal security & architecture audit

**Started:** 2026-11-06
**Scope:** Live parent portal (`/school/[slug]/parent/**`), `/api/parent-portal/**`, and the Supabase permissions behind them. Every school is affected; the audit was driven by `rooted-meadows` and `rooted-meadows-demo`.
**Status:** Plan approved (all phases). Phase 1a SQL written and verified locally (integration tests, billing/tuition E2E); **pending manual paste on remote**. Nothing else implemented yet.

> **For new chats:** Read this whole file first. Follow [Execution order](#execution-order). Tick checkboxes and add a row to the [Progress log](#progress-log) as work lands. Database changes follow `.cursor/rules/supabase-manual-sql-only.mdc`: SQL goes in `supabase/migrations/` **and** `supabase/migrations_manual/`, and the user pastes it into the SQL Editor. Agents never write to the database. Read-only MCP queries are fine.

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
| H1 | High | Parent pages only check access in layouts; page code loads data with the admin client after checking only that someone is logged in | 2 |
| H2 | High | Classroom signup submit trusts `studentId` and slot/role IDs from the client and doesn't check capacity | 2 |
| H3 | High | Middleware doesn't cover parent routes, so refreshed sessions get thrown away (random logouts) | 2 |
| H4 | Medium | Operational-errors endpoint lets the client choose `notify` (Discord spam). Support and feedback aren't rate limited. Bodies aren't validated | 2 |
| P1 | Perf | Each access check costs 4-6 sequential queries plus a `getUser()` HTTP call. Estimated 40-60 queries per home load (unmeasured) | 3 |
| P2 | Perf | Unread counts build full thread lists; the RPC failure fallback silently loads every message; badge counts are fetched after load | 3 |
| P3 | Perf | Realtime subscribes every parent to all of the school's messages; each event refetches counts with no debounce | 3 |
| P4 | Perf | Photos are signed one at a time, and each failure sends its own Discord alert | 3 |
| P5 | Perf | School settings are fetched with 2 sequential queries on every request, never cached | 3 |
| A1 | Arch | No single access layer: 67 route files repeat auth checks; data is read three ways (server admin client, API routes, browser Supabase) | 3 |
| A2 | Arch | Feature toggles are only enforced in the UI (about 5 of 67 routes check them) | 3 |
| A3 | Arch | 820-line `if (feature === ...)` switch, with preview loaders duplicated from live ones | 4 |
| A4 | Edge case | Multi-family parents: `familyIds[0]` has no fixed order; billing/forms use one family while the children list uses all | 4 |
| A5 | Maintainability | `fetchOrganizationWithSettings(supabase, ...)` and `getParentPortalUserProfile(_supabase, ...)` ignore their client argument | 4 |

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

- [ ] `requireParentPortalAccess({ organizationId, programId? })` (React `cache()`), called at the top of `renderSchoolParentFeaturePage` and the program/documentation pages
- [ ] Classroom signups: confirm `studentId` belongs to the family, slot/role IDs exist in the signup config, enforce capacity atomically (database function like supply list)
- [ ] Billing charges/payments: confirm `familyId` is one of the user's families before querying
- [ ] Middleware matcher: add `/school/:slug/parent/:path*` (check apply routes too)
- [ ] `/api/parent-portal/operational-errors`: server decides `notify`; cap `metadata` size
- [ ] Rate-limit support requests and feedback (reuse `src/lib/public-forms/rate-limit.ts`)
- [ ] Clamp `limit`/`offset` and reject `NaN` in paginated routes

## Phase 3: access layer and performance

- [ ] SQL: `parent_portal_access(p_organization_id)` security-definer using `auth.uid()` (honoring linked-account peers). Returns guardian IDs, family IDs, student IDs, enrolled program IDs (isolated/co-op flags), main-portal access. `authenticated` + service role only.
- [ ] `getParentPortalAccess()` server helper wrapping it in `cache()`; replace `getFamilyIdsByOrg`, `getStudentIdsByOrg` etc. in `parent-portal-server-cache.ts`
- [ ] `withParentPortalRoute({ feature?, programScope?, requireFamily?, parseBody? })` wrapper; migrate routes in groups (billing, messages, committees, students/*, co-op, rest). **Keep response shapes unchanged.**
- [ ] `getClaims()` instead of `getUser()` (needs asymmetric JWT signing keys; confirm first)
- [ ] `parent_unread_message_count()` function; make the RPC fallback report instead of silently loading everything
- [ ] Badge counts streamed from the layout via Suspense; drop post-load client fetches
- [ ] Realtime: private Broadcast channel per guardian/family fed by a DB trigger; debounce refetches (~750ms)
- [ ] Batch `createSignedUrls` for gallery and newsletters; one aggregated failure report per batch
- [ ] Cache school settings with `"use cache"` + tag; clear the tag on settings save

## Phase 4: architecture

- [ ] Feature registry `{ key, requires, load(ctx), Component, previewLoad? }` replacing the switch in `render-school-parent-feature-page.tsx`; live, program and preview all use it
- [ ] Merge live and preview home loaders (`load-parent-home-content-data.ts`); run preview steps in parallel
- [ ] Deterministic primary family (ordered or parent-chosen); same family set for billing, forms, Friday Branch and the children list
- [ ] Remove ignored client params (`fetchOrganizationWithSettings`, `getParentPortalUserProfile`, `getParentPortalPrimaryFamilyId`)
- [ ] Remove duplicate `getStudentIdsForFamilies` (exists in two modules)
- [ ] Split `ParentBillingPage.tsx` (~1,400 lines) and `SchoolParentHeader.tsx` (~700 lines) after the data layer settles

---

## Open questions
- Is there a staging or branch Supabase project, or is production the only database?
- Are asymmetric JWT signing keys enabled? (Required for `getClaims()`.)
- Should prospective (not yet enrolled) parents keep reading admissions availability with their own client, or should those reads go through API routes?

---

## Progress log

| Date | Phase / item | Change | Verified by | Notes |
|---|---|---|---|---|
| 2026-11-06 | Audit | n/a | Read-only MCP queries | Findings recorded; plan approved |
| 2026-11-06 | 1b step 1+2 | Migrations `20261147` (additive narrow policies) and `20261148` (staff-only financial reads) + manual mirrors with dry-run/rollback + integration test | Local `db reset` applies all three; `test:integration` 103/103 (incl. grants + family-financial RLS); parent/tuition/admin E2E 45/46; unit tests 1256/1256; lint:errors, typecheck, production build clean | Awaiting manual paste (step 1, then step 2 after smoke-check) |
| 2026-11-06 | 1a monitoring | `rpc-permission-errors` helper wired into 8 callers + unit test | `npm test` 1256/1256, lint:errors, typecheck | Deploy before pasting 1a SQL |
| 2026-11-06 | 1a | Migration `20261146` + manual mirror (with dry-run and rollback) + skill doc + grants integration test written | Local `db reset`, integration 97/97, billing/tuition E2E 18/18, lint:errors, typecheck, 24h log review | Awaiting manual paste on remote |
