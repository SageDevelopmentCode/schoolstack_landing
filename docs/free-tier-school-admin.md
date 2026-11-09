# Free tier for school admin — design notes

Status: Phases 1–5 are implemented in the app (Nov 2026). Phase 6 is not. Signup is not necessarily live in production yet.

## Goal

Offer a free version of the MudKitchen school admin with a limited feature set, without risking the admin that paying schools (e.g. Rooted Meadows) use today. When a free school upgrades, it should keep everything it set up.

## Recommendation

Build the free tier **inside the existing school admin**, as a plan layer on top of the per-school feature flags we already have. Do **not** build a separate free admin that migrates data on upgrade.

One codebase, one database, a `plan` on each organization that caps which features can be enabled. Existing schools default to a plan that allows everything, so their behavior is unchanged.

## Free tier v1 scope: dashboard only

After onboarding, a free school can use **only the Dashboard**. The sidebar still shows the default admin tabs, locked, and clicking one opens an upgrade popup. A direct link to a locked tab returns to the Dashboard and opens that same popup. Teacher and parent portals are off (a dashboard-only school has no families or staff to use them).

| Portal | Free v1 |
|---|---|
| School admin | `dashboard` only |
| Teacher portal | Off |
| Parent portal / apply flow | Off |

More features get added to the free tier in later phases by widening the plan's allow-list, not by editing each school.

## What already exists

- **Per-school feature flags.** `organization_settings.features` (jsonb) holds `admin` / `teacher` / `parent` on/off flags plus `feature_nav` config.
  - Schema: `supabase/migrations/202601010010_add_product_organization_settings.sql`
  - Helpers: `src/lib/organization-settings/admin-routes.ts` (`isAdminFeatureEnabled`, `isAdminNavPathEnabled`), `src/lib/organization-settings/features.ts`
- **Defaults are merged under stored settings.** `mergeFeatures` (`src/lib/organization-settings/merge.ts`) deep-merges stored features over `DEFAULT_FEATURES` (`src/lib/organization-settings/catalog.ts`), where most admin features default to **on**. Storing `{ admin: { dashboard: true } }` alone would leave admissions, my school, messages, etc. enabled. This is why the free tier needs a plan allow-list (Phase 1), not just a stored preset.
- **Page-level gating.** School admin pages already 404 when a feature is off:
  - `src/app/school/[slug]/admin/(protected)/[feature]/page.tsx`
  - `src/app/school/[slug]/admin/(protected)/[feature]/[subtab]/page.tsx`
  - The admin index (`src/app/school/[slug]/admin/(protected)/page.tsx`) redirects to the first enabled nav item, so a dashboard-only school lands on the dashboard.
- **Organization lifecycle status.** `organizations.status` is `onboarding | live | paused | churned` (`supabase/migrations/202601010009_add_product_organizations.sql`). This is lifecycle, not billing; keep it separate from plan.
- **Admin access.** Requires a signed-in user with an active `owner` / `admin` row in `organization_memberships` (`userIsOrgAdminForAuthUser` in `src/lib/admissions/application-auth.ts`, used by `requireSchoolAdminUser` in `src/lib/school-admin/access.ts`).
- **Email code sign-in.** `src/components/school-admin/SchoolAdminLoginForm.tsx` already uses `signInWithOtp` / `verifyOtp`.

## Why not a separate free admin

- **It doesn't actually isolate risk.** A separate admin either forks the code (two versions that drift and double maintenance) or shares it (same code paths, same risk).
- **Upgrade-time data migration is the riskiest step.** Families, applications, auth users, storage files, Stripe links, and activity history would all need to move, with new IDs, at the moment a school decides to pay.
- **Family-facing portals are tied to the organization.** Parent, teacher, and apply portals all hang off the same org record. Free schools' families would eventually need those too, so they'd have to be duplicated as well.

---

# Implementation phases

Each phase is shippable on its own. Phases 1 and 2 must not change anything for existing schools; that's the bar for merging them.

## Phase 1 — Plan foundation (no user-visible change)

**Shipped.** `organizations.plan` is `free` or `custom` (default `custom`). `applyPlanToFeatures` caps free schools inside organization fetch and the public apply cache. A missing `plan` column is treated as `custom`.

**Goal:** organizations have a plan, and the app computes usable features from it. Paid schools behave exactly as today.

1. **Add `plan` to organizations.**

   ```sql
   alter table public.organizations
     add column if not exists plan text not null default 'custom'
       check (plan in ('free', 'custom'));
   ```

   - Every existing school (including Rooted Meadows) gets `custom`.
   - Per the Supabase rules: migration in `supabase/migrations/` **and** mirrored in `supabase/migrations_manual/` for remote paste. Run remote SQL manually.
   - Make sure `plan` is readable where `fetchOrganizationWithSettingsUncached` reads the org (`src/lib/organization-settings/fetch.ts`), including the cached anon path.

2. **Define plan allow-lists** in one module (e.g. `src/lib/organization-settings/plans.ts`):
   - `custom`: no cap (everything allowed).
   - `free`: `admin: ["dashboard"]`, `teacher: []`, `parent: []`.

3. **Compute usable features in one function**, e.g. `applyPlanToFeatures(features, plan)`, and call it inside `fetchOrganizationWithSettings` so admin, teacher, parent, and apply all see the same result.
   - For `custom` it must return the input unchanged.
   - For `free` it forces every key not on the allow-list to `false`, including keys that come from `DEFAULT_FEATURES` or are added to the catalog later.

4. **Tests.**
   - Unit: for `custom`, output deep-equals input (the "paid schools unchanged" guarantee).
   - Unit: for `free`, only `admin.dashboard` is true, regardless of stored features or defaults.
   - Existing `admin-routes.test.ts` / parent-nav tests still pass.

**Done when:** migration is applied, all existing schools are `custom`, and nothing visible changed.

## Phase 2 — Dashboard-only experience for free schools

**Shipped.** `free-tier-school` is seeded as `plan = 'free'`. The free dashboard hides the setup bar, uses a neutral empty sentence, and drops how-to guides that are not tied to an enabled feature. Parent, apply, teacher login, and public forms 404 only when `plan` is `free`.

**Goal:** a free school (created by hand for now) sees a clean, working dashboard with nothing broken.

1. **Create a test free school** in local seeds / E2E with `plan = 'free'`.
2. **Audit the dashboard for links into disabled features** and hide them (or show an upgrade prompt) when the target feature is off. Known links:
   - Attendance section → `my_school/attendance` (`AdminDashboardAttendanceSection.tsx`)
   - Staff hours → `my_school/staff_hours` (`AdminDashboardStaffHoursSection.tsx`, `StaffHoursDashboardTodayContent.tsx`)
   - Journey panel links (`dashboard/AdminDashboardJourneyPanel.tsx`, driven by `src/lib/school-admin/dashboard-family-journey.ts`)
   - Today panel signals (`dashboard/AdminDashboardTodayPanel.tsx`)
   - How-to guides → `/admin/documentation` (`ui/story/AdminDashboardHowToGuidesCard.tsx`); confirm documentation filters to enabled features (`admin-documentation.ts`)
3. **Empty states.** With no data, every dashboard panel should read sensibly (no zero-filled charts that look broken).
4. **Confirm other portals are closed.** For the free test school, teacher portal, parent portal, and `/school/{slug}/apply` should be unavailable (not half-rendered).
5. **Visual verification** at mobile / tablet / desktop per the portal-responsive-verify skill.

**Done when:** the free test school's admin is the dashboard only, every visible link works, and paid schools' dashboards are unchanged.

## Phase 3 — Self-serve signup ("Try for free")

**Shipped.** `/try` asks for a school name and email, confirms with a 6-digit code on the same page, then creates an `onboarding` school with `plan = 'free'`, empty features, and an owner membership. A signed-in visitor is redirected the same way as login. Broadcast, visit-confirmation, and Friday roster email routes return 403 for free schools.

**Goal:** anyone can create a free school in about 30 seconds.

### Fields

| Field | Source |
|---|---|
| Email | Ask |
| School name | Ask |
| URL slug | Generated from school name; editable later |
| Timezone | Detected from the browser (`Intl`) |
| Plan, features, owner membership | Set server-side on creation |
| Their name, role, student count, school type | Ask later inside the admin, not up front |

The thing that slows people down is extra fields and leaving the tab to click an email link, not the existence of a form.

### Flow

1. Signup page (e.g. `/try`): email + school name.
2. User enters a **6-digit code** emailed to them, on the same tab. Reuse the OTP pattern from `SchoolAdminLoginForm.tsx`.
3. Server route creates, in one operation:
   - `organizations` row with `plan = 'free'`
   - `organization_settings` row (features can stay `{}`; the plan allow-list does the gating)
   - `organization_memberships` row with role `owner`
4. Redirect to `/school/{slug}/admin`, which lands on the dashboard.

Verify the email **before** granting access. Unverified accounts are how spam ends up going out through the Zoho sender.

### Slugs, names, abuse

- Slugs are unique (`organizations_slug_key`); auto-suffix on collision.
- Block names and slugs that impersonate existing customers (e.g. a fake "Rooted Meadows").
- Block an email that already has an active `owner` or `admin` membership. Parents and teachers can still start a free school. At the next login, two schools show the "Choose your school" step: the parent school opens the parent portal (or apply), and the free school opens that school's admin.
- Rate-limit signups per IP / email domain.

### Server-side guards (minimum for launch)

`src/app/api/school-admin/*` routes check admin access but not features, so a free admin could call a paid feature's API directly. Data stays scoped to their own school, but some routes create families/staff or send email. Before launch, add a guard (e.g. `requireAdminFeature(org, key)`) to at least the routes that **send email or invite people**. Full coverage comes in Phase 5.

### Ops

- New signups and failures go through `reportOperationalError` like everything else.
- Tag events with the plan so free-school noise can be filtered or routed separately in Discord.

**Done when:** a new visitor can sign up, verify, and land on their dashboard; no access to any other feature via UI or the guarded APIs.

## Phase 4 — Navbar and marketing entry point

**Shipped.** Try for free is the filled navbar button and links to `/try` on the home nav and the older nav. Book a Demo is the outline button. Free tools stays in the footer and still links to `/tools`.

**Goal:** send traffic to signup.

- Rename the navbar's secondary CTA from "Free tools" to **Try for free** (`FREE_TOOLS_NAV_LABEL` in `src/lib/marketing/free-tools.ts`, used in `src/components/sections/Navbar.tsx`) and point it at the signup page.
- It currently links to `/tools` (`FREE_TOOLS_HUB_PATH`), the free tools hub, which is a separate thing and may drive search traffic. Move that link to the footer or a Resources menu rather than dropping it.
- Decide which CTA is primary. Today "Book a Demo" is the filled button.

The navbar change is in the app. It was originally held until signup was live in production; that wait is no longer in effect.

## Phase 5 — Upgrade path

**Shipped.** A free school sees the default admin tabs. Only Dashboard opens. Clicking a locked tab, or opening its URL, shows an upgrade popup with the school-demo booking calendar. After the call, a platform admin sets the plan to Custom on the organizations page. That unlocks the default features in place. There is no Stripe checkout. Paid schools do not see the locks or the popup. School-admin API routes for paid features return 403 only when `plan` is `free`.

**Goal:** a free school can become a paying school without moving any data.

- In the dashboard, show what's locked with an "Upgrade to unlock" prompt instead of a 404, gated on `plan = 'free'` so paid schools never see it.
- Upgrading sets `plan = 'custom'` (ideally from a Stripe subscription webhook, or manually after a sales call). Then enable the school's features as today.
- Complete server-side feature guards across all paid-only `api/school-admin/*` routes.

## Phase 6 — Grow the free tier

**Not started.**

Only once Phases 1–5 are stable:

- Add features to the `free` allow-list (e.g. school profile, a basic application form).
- Usage limits (max students / families) as count checks in create routes, applied only to `free`.
- **Sample data:** a "Load sample data" action, or pre-filled clearly labeled sample families/applications, so the admin isn't empty. More valuable once free schools have more than the dashboard.
- Setup checklist on the dashboard (add logo, set up application form, invite a co-admin) as those features become available.
- Optional read-only demo school behind an "Explore a demo school" link (existing `/admin/preview/[slug]/admin` routes are platform-admin only, so this is new work).
- Email rate limits for free schools before they can message parents.

---

## Risks to keep in mind across phases

### Keeping existing schools unaffected

Existing schools (`rooted-meadows`, `rooted-meadows-demo`, and every other org) get `plan = 'custom'` from the column default, and `custom` passes features through unchanged. `rooted-meadows-demo` is a full clone of production (`clone_rooted_meadows_production.sql`), not a free school, so it stays `custom` too. The migration uses `add column if not exists`, so re-running it is a no-op.

That only holds if these three rules are followed:

1. **Run the SQL before deploying code that reads `plan` (Phase 1).** `fetchOrganizationWithSettingsUncached` returns `null` when its `organizations` query errors. If code selecting `plan` deploys before the column exists in production, the query fails for every school and every admin, parent, and teacher page 404s. Since remote migrations are pasted manually, the order is: paste SQL, confirm the column exists, then deploy. As a backstop, treat a missing `plan` as `custom` in code.
2. **Gate dashboard link hiding on `plan === 'free'` (Phase 2).** Hiding links "when the target feature is off" would also hide links for paid schools that already have that feature disabled. That's arguably a fix, but it's still a change; gating on plan keeps paid dashboards identical.
3. **Apply new API feature guards to free schools only at first (Phases 3 and 5).** A paid school might call a route without the matching flag enabled (e.g. it's used from a different page or the mobile app). Start with guards that only enforce when `plan === 'free'`, and extend to all plans only after confirming which feature each route belongs to.

Signup can't take existing URLs: slugs are unique (`organizations_slug_key`), and the Phase 3 impersonation check blocks lookalike names.

### Other risks

- **Defaults leaking into free.** Any new admin/teacher/parent feature added to `DEFAULT_FEATURES` with `true` must not appear for free schools. The Phase 1 allow-list and its unit test cover this; keep the test.
- **Shared settings cache.** Org settings are cached for 60s across users (`fetch.ts`). New schools aren't cached on miss, but plan changes (upgrade) need `revalidateOrganizationSettings(slug)`.
- **Ops noise and email reputation** as free signups grow.

## Open questions

- New free schools use `status = 'onboarding'` (decided in Phase 3). `live` stays the status for schools that are open to families.
- Which features join the free tier after the dashboard, and in what order?
- Does the free tier eventually have usage limits, or only a smaller feature set?
- Upgrade path: a booked call, then a manual plan flip to Custom (decided in Phase 5). No Stripe checkout.
- Try for free is the primary navbar CTA (decided in Phase 4). Book a Demo is the outline button.
- Sample data: loaded automatically, or behind a button?
- Is a no-signup demo school worth building?
