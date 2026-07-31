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
