import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveCiPagesFromChangedFiles } from "./resolve-ci-pages-from-diff";

test("parent component change resolves parent CI cluster with auth expansion", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/school-parent/ParentBillingPage.tsx",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/parent",
    "/school/rooted-meadows-school/parent/portal",
    "/school/rooted-meadows-school/parent/billing",
    "/school/rooted-meadows-school/parent/children",
  ]);
});

test("admin component change resolves admin CI cluster with login", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/school-admin/admissions/ApplicationSubmissionsPage.tsx",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/dashboard",
    "/school/rooted-meadows-school/admin/admissions/submissions",
  ]);
});

test("global layout change runs full CI page set", () => {
  const paths = resolveCiPagesFromChangedFiles(["src/app/layout.tsx"]);

  assert.equal(paths.length, 12);
  assert.equal(paths[0], "/");
});

test("unmatched src change falls back to full CI page set", () => {
  const paths = resolveCiPagesFromChangedFiles(["src/lib/tuition/charges.ts"]);

  assert.equal(paths.length, 12);
});

test("sql-only changes do not match perf paths and fall back to full set when forced through resolver", () => {
  const paths = resolveCiPagesFromChangedFiles(["supabase/migrations/foo.sql"]);

  assert.equal(paths.length, 12);
});
