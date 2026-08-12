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
| `backfill_calvert_arrow_enrollment_checklist_2026_07_26.sql` | Backfills Arrow's completed enrollment checklist + ledger; re-run safe — syncs missing template items when checklist already completed |
| `sync_arrow_calvert_split_fee_steps_2026_07_27.sql` | Adds Supply Fee + Activities Fee checklist instances for Arrow when template was split after backfill; no new ledger rows |
| `remove_rooted_meadows_duplicate_fee_steps_2026_07_27.sql` | Removes duplicate Supply Fee + Activities Fee checklist steps; keeps bundled $650 Payment step; cleans admin-bypass ledger dupes |
| `accept_and_start_enrollment_rooted_meadows_submitted_2026_07_27.sql` | Accepts all 11 submitted rooted-meadows applications and starts enrollment (enrolling + in_progress checklist); families see Start enrollment in portal |
| `import_rooted_meadows_submission_edwards_eben.sql` | Imports Eben Edwards legacy Google Form application into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs edwards-eben`; link `pegandsam@gmail.com` after import |
| `import_rooted_meadows_submission_caballero_helene_clara.sql` | Imports Helene + Clara Caballero (two applications, one family) into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs caballero-helene-clara`; link `jaz.h.cab@gmail.com` after import |
| `update_helene_caballero_last_name_to_miller_2026_08_10.sql` | Updates Helene's student + application last name to Miller on `rooted-meadows` production; Clara Caballero unchanged |
| `import_rooted_meadows_submission_patterson_eli.sql` | Imports Eli Patterson legacy Google Form application into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs patterson-eli`; link `anniepatterson980@gmail.com` after import |
| `import_rooted_meadows_submission_sekyere_claire_olivia_georgie.sql` | Imports Claire, Olivia + Georgie Sekyere (three applications, one family) into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs sekyere-claire-olivia-georgie`; link `lifeschoolingfam@gmail.com` after import |
| `import_rooted_meadows_submission_sparhawk_olivia_daniella.sql` | Imports Olivia + Daniella Sparhawk (two applications, one family) into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs sparhawk-olivia-daniella`; link `rakel.sparhawk@gmail.com` after import |
| `link_sparhawk_family_to_admin_rooted_meadows_2026_08_04.sql` | Links Rachael Sparhawk guardian + Olivia/Daniella applications to `admin@rootedmeadowswaldorf.org` for unified admin + family portal access |
| `import_rooted_meadows_submission_thompson_nina_maggie.sql` | Imports Nina + Maggie Thompson (two applications, one family) into `rooted-meadows` production; optional PDF via `node scripts/import-rooted-meadows-submission.mjs thompson-nina-maggie`; link `ameliasisco@gmail.com` after import |
| `reset_rooted_meadows_demo_tuition.sql` | Clears tuition rate catalog + billing for `rooted-meadows-demo` so the Tuition setup wizard shows; or run `node scripts/reset-rooted-meadows-demo-tuition.mjs` |
| `remove_ritchie_olson_from_rooted_meadows_demo_2026_07_23.sql` | Removes Ritchie + Olson demo duplicates and links parents to `rooted-meadows` production |
| `remove_zach_fredrickson_arrow_calvert_2026_07_27.sql` | Removes Zach Fredrickson Parent 2 fields from Arrow Calvert application; updates Hayley marital status to divorced; keeps Zach portal membership disabled |

Client-specific seeds live in [`migrations/rooted-meadows/`](../migrations/rooted-meadows/).
