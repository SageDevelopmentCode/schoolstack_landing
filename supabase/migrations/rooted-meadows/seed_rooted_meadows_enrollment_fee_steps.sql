-- RETIRED (2026-07-27): Split Supply Fee + Activities Fee checklist steps duplicated
-- the bundled Payment step ($650). Use migrations_manual/remove_rooted_meadows_duplicate_fee_steps_2026_07_27.sql
-- to clean up production if split steps were already applied.
--
-- Target org: rooted-meadows

do $$
begin
  raise notice 'seed_rooted_meadows_enrollment_fee_steps.sql is retired — bundled Payment step covers supply + activities fees.';
end $$;
