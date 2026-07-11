# Migrations

## Local development / E2E

Migrations in this folder use timestamp prefixes (`20260101NNNN_name.sql`) so the Supabase CLI applies them in dependency order.

```bash
supabase start
supabase db reset   # applies all migrations below; does not run migrations_manual/ or rooted-meadows/
```

**54 migrations** apply in a fixed order. `add_product_timeline_bootstrap.sql` is excluded (see [`migrations_manual/`](../migrations_manual/)).

`202601010054_grant_postgrest_api_access.sql` grants table access to `anon` / `authenticated` / `service_role` — required for local PostgREST (Supabase cloud does this automatically).

## Remote (production) database

Migrations were originally run manually in the Supabase SQL Editor. The timestamp-prefixed files here are the same SQL, reordered for local `db reset`.

## Client seeds

[`rooted-meadows/`](rooted-meadows/) scripts are not auto-applied by the CLI (subfolder). Run manually when you need full Rooted Meadows form data locally.
