# Manual SQL scripts

Files here are **not** applied by `supabase db reset`. Run them manually in the Supabase SQL Editor when needed.

| File | Notes |
|------|-------|
| `add_product_timeline_bootstrap.sql` | Overlaps `add_product_organizations.sql` + progress log; skipped in local CLI order to avoid duplicate policy errors |
| `clone_rooted_meadows_demo.sql` | Clones `rooted-meadows-school` into `rooted-meadows-demo` for sandbox demos; run teardown at bottom before re-running |
| `clone_rooted_meadows_production.sql` | Clones `rooted-meadows-demo` into `rooted-meadows` (production); keeps only Ritchie + Olson submissions; skips Stripe, slots, memberships; run teardown at bottom before re-running |
| `import_rooted_meadows_submission_ritchie_olivia.sql` | Imports Olivia Ritchie legacy Google Form application into `rooted-meadows-demo`; upload PDF first via `node scripts/import-rooted-meadows-submission.mjs ritchie-olivia` |
| `import_rooted_meadows_submission_olson_joseph.sql` | Imports Joseph Olson legacy Google Form application into `rooted-meadows-demo`; link `bolsonmft@gmail.com` after import |
| `import_rooted_meadows_submission_calvert_arrow.sql` | Imports Arrow Calvert legacy Google Form application into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs calvert-arrow`; link `canidcafe@gmail.com` after import |
| `reset_rooted_meadows_demo_tuition.sql` | Clears tuition rate catalog + billing for `rooted-meadows-demo` so the Tuition setup wizard shows; or run `node scripts/reset-rooted-meadows-demo-tuition.mjs` |
| `remove_ritchie_olson_from_rooted_meadows_demo_2026_07_23.sql` | Removes Ritchie + Olson demo duplicates and links parents to `rooted-meadows` production |

Client-specific seeds live in [`migrations/rooted-meadows/`](../migrations/rooted-meadows/).
