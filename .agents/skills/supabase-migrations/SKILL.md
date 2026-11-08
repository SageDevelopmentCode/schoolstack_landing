---
name: supabase-migrations
description: >
  Place Supabase SQL in the correct folders for schoolstack_landing — schema
  migrations in supabase/migrations/ (CI/E2E) plus migrations_manual/ for remote
  paste, seeds, and one-off data. Use when adding tables, columns, RLS, indexes,
  DDL, schema changes, supabase db reset, or fixing PGRST205 / missing table in
  E2E or local dev.
---

# Supabase migrations (schoolstack_landing)

## Where to put SQL

| Change type | Primary location | Also create / update |
|-------------|------------------|----------------------|
| **Schema** (tables, columns, indexes, RLS, triggers) that app code or tests depend on | `supabase/migrations/` | `supabase/migrations_manual/` (same SQL, remote paste header) |
| **One-off data** (demo reset, backfill, import, progress log) | `supabase/migrations_manual/` only | — |
| **Client seed** (Rooted Meadows forms, etc.) | `supabase/migrations/rooted-meadows/` | — |
| **Excluded bootstrap** | `supabase/migrations_manual/add_product_timeline_bootstrap.sql` | Never promote to `migrations/` |

**Critical:** `supabase db reset`, CI E2E, and `npm run test:e2e:setup` apply **only** `supabase/migrations/*.sql` at the repo root of that folder. Files in `migrations_manual/` or subfolders are **not** applied automatically.

## Schema change workflow

1. **Pick timestamp** — next file after the latest in `supabase/migrations/`, format `YYYYMMDD` + sequence + `_snake_name.sql` (e.g. `20260732_add_tuition_billing_splits.sql`). Run after dependent migrations (check `Run after:` comments in nearby files).

2. **Create migration** — `supabase/migrations/<timestamp>_<name>.sql`
   - Use idempotent DDL where possible (`create table if not exists`, `add column if not exists`, `drop policy if exists`).
   - Comment header: purpose + `Run after: <previous_migration>.sql` when order matters.
   - Match RLS patterns in existing migrations (e.g. `20260727_add_tuition_rls.sql`).

3. **Mirror for production** — `supabase/migrations_manual/<descriptive_name>_<YYYY_MM_DD>.sql` with header:
   ```sql
   -- Promoted to supabase/migrations/<timestamp>_<name>.sql for local/CI.
   -- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
   ```

4. **Do not** apply DDL to remote via MCP or service-role scripts (see `.cursor/rules/supabase-manual-sql-only.mdc`). Tell the user to paste manual SQL after review.

5. **Verify locally:**
   ```bash
   supabase db reset
   supabase db query --local "select to_regclass('public.<table_name>');"
   ```
   If the change affects tuition, billing, or parent portal, run relevant E2E specs with `CI=true npm run test:e2e -- <spec paths>`.

## Grants

New tables usually need no extra grant file — `202601010054_grant_postgrest_api_access.sql` sets default privileges for later tables. Add explicit grants only if a new migration fails with permission errors locally.

## Function grants

Since `20261146_lock_down_open_policies_and_function_grants.sql`, **new functions are created without execute for `public`, `anon`, and `authenticated`** (default privileges). Every new function therefore needs an explicit grant — decide who may call it:

| Kind of function | Grant |
|---|---|
| Atomic / money / write RPC called only by server code (`createAdminClient()`) | `revoke all on function ... from public, anon, authenticated; grant execute on function ... to service_role;` |
| Summary/read RPC called with the signed-in user's client | Put a caller check inside (service role OR platform admin OR staff/guardian of the org), then `revoke all ... from public, anon; grant execute ... to authenticated, service_role;` |
| RLS helper used inside a policy (`user_is_*`, `is_platform_admin`, ...) | `grant execute ... to authenticated` (and `anon` only if a public-read policy calls it) |
| Trigger function | No grant needed |

Rules:

- Always write the full signature in `revoke`/`grant` (`function public.name(uuid, text)`), never rely on the name alone.
- `revoke ... from public, authenticated` is **not enough**: Supabase grants `anon` explicitly, so include `anon` (the 20261146 migration fixed ~20 functions that missed it).
- Any function that trusts its parameters (`p_organization_id`, `p_family_id`, `p_user_id`) must either be service-role only or verify the caller via `auth.uid()` / `auth.role()`. A `SECURITY DEFINER` function without one of those is a data leak when exposed through PostgREST.
- Never write a `for all using (true)` policy, even for a prototype table. Public read of curated rows: `for select ... using (published = true)`; writes: platform-admin policy or service role.
- Guarded-wrapper pattern for retrofitting a check without copying a large body: rename the original to `<name>_unchecked`, lock it, create a wrapper with the original name/signature (see section 3 of 20261146).
- `integration` test `src/lib/supabase/function-grants.integration.test.ts` fails if an `anon`/`authenticated` client can call a locked function — extend its lists when you add one.

## Naming conventions

- **Migrations folder:** `20260732_add_tuition_billing_splits.sql` (timestamp prefix required by Supabase CLI).
- **Manual folder:** `add_tuition_splits_and_overpay_2026_07_31.sql` or `sync_rooted_meadows_checklist_to_demo_2026_07_28.sql`.
- **Manual data scripts:** `import_rooted_meadows_submission_*.sql`, `reset_rooted_meadows_demo_tuition.sql`.

## Common failure: PGRST205 in E2E / local

```
Could not find the table 'public.<name>' in the schema cache
```

Usually means app code references a table/column that exists only in `migrations_manual/`. **Fix:** promote the DDL into `supabase/migrations/` (do not only patch tests).

## References

- [`supabase/migrations/README.md`](../../supabase/migrations/README.md)
- [`.cursor/rules/supabase-manual-sql-only.mdc`](../../.cursor/rules/supabase-manual-sql-only.mdc)
- E2E env: [`.agents/skills/e2e-local/SKILL.md`](../e2e-local/SKILL.md)
