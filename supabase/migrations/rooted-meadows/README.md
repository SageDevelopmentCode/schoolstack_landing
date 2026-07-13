# Rooted Meadows — data seeds

Client-specific data scripts for Rooted Meadows Waldorf School. Run these manually in the Supabase SQL Editor.

## Prerequisites

Run these from the parent `migrations/` folder first:

1. `add_product_organizations.sql` — creates the org row
2. `add_product_application_form_versions.sql` — creates the application form table
3. `add_application_form_public_slug.sql` — adds `public_slug` column
4. Initial draft form row must exist (`id = a57d66cf-1c0b-4052-a1cd-3067c07361d3`)
5. For progress log: `add_product_organization_progress_log.sql`

## Application form seeds (run in order)

Each script is idempotent — it only runs when `jsonb_array_length(schema->'sections')` matches the expected count.

| Order | File | Step | Requires sections |
|-------|------|------|-------------------|
| 1 | `seed_rooted_meadows_academic_history_step.sql` | Academic History | 1 |
| 2 | `seed_rooted_meadows_educator_referral_step.sql` | Educator Referral | 2 |
| 3 | `seed_rooted_meadows_support_history_step.sql` | Support and History | 3 |
| 4 | `seed_rooted_meadows_getting_to_know_step.sql` | Getting to know your child | 4 |
| 5 | `seed_rooted_meadows_parent1_step.sql` | Parent 1 Information | 5 |
| 6 | `seed_rooted_meadows_parent2_step.sql` | Parent 2 Information | 6 |
| 7 | `seed_rooted_meadows_referral_source_step.sql` | Referral source | 7 |
| 8 | `seed_rooted_meadows_public_slug.sql` | Public URL slug (`apply`) | any |

## Progress log

Run after `add_product_organization_progress_log.sql`. Independent of the form seeds.

| File | Date |
|------|------|
| `add_organization_progress_log_2026_07_02.sql` | July 2 — admissions kickoff |
| `add_organization_progress_log_2026_07_03.sql` | July 3 — application form and public apply link |
| `add_organization_progress_log_2026_07_04.sql` | July 4 — family sign-in before applying |
| `add_organization_progress_log_2026_07_05.sql` | July 5 — staff login, family dashboard, and submission review |
| `add_organization_progress_log_2026_07_06.sql` | July 6 — families can book tours and interviews after applying |
| `add_organization_progress_log_2026_07_08.sql` | July 8 — enrollment checklist builder and staff scheduling tools |
| `add_organization_progress_log_2026_07_09.sql` | July 9 — families can complete enrollment after acceptance |
| `add_organization_progress_log_2026_07_10.sql` | July 10 — families can finish enrollment (sign, upload, pay online) |
| `add_organization_progress_log_2026_07_11.sql` | July 11 — guides for sharing apply link and walking families through enrollment |
| `add_organization_progress_log_2026_07_12.sql` | July 12 — Phase 1 complete; admissions polish, payments, and parent security |

## Enrollment checklist seeds

Run after `add_product_enrollment_checklist_templates.sql` and `add_product_document_templates.sql`. The demo org (`rooted-meadows-demo`) must have the `School Year 2026–27` program (see `seed_rooted_meadows_program_and_link_form.sql`).

| File | Step | Notes |
|------|------|-------|
| `seed_rooted_meadows_enrollment_agreement_variants.sql` | Enrollment Agreement (variant group) | Standard + Conditional Support agreements; idempotent |

To sync into the demo sandbox, run this seed against `rooted-meadows-school` first, then re-run `migrations_manual/clone_rooted_meadows_demo.sql`.

## Enrollment checklist variant groups

See [ENROLLMENT_VARIANT_GROUPS.md](./ENROLLMENT_VARIANT_GROUPS.md) for configuring standard vs. conditional-support enrollment agreements in the checklist builder.
