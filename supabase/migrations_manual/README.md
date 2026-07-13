# Manual SQL scripts

Files here are **not** applied by `supabase db reset`. Run them manually in the Supabase SQL Editor when needed.

| File | Notes |
|------|-------|
| `add_product_timeline_bootstrap.sql` | Overlaps `add_product_organizations.sql` + progress log; skipped in local CLI order to avoid duplicate policy errors |
| `clone_rooted_meadows_demo.sql` | Clones `rooted-meadows-school` into `rooted-meadows-demo` for sandbox demos; run teardown at bottom before re-running |

Client-specific seeds live in [`migrations/rooted-meadows/`](../migrations/rooted-meadows/).
