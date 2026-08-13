import assert from "node:assert/strict";
import { test } from "node:test";
import { CI_LHCI_PAGE_PATHS } from "./page-manifest";
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

test("tuition component change resolves tuition CI path with login", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/school-admin/tuition/TuitionFamiliesPanel.tsx",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/my_school/tuition",
  ]);
});

test("tuition lib change resolves tuition CI path with login", () => {
  const paths = resolveCiPagesFromChangedFiles(["src/lib/tuition/charges.ts"]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/my_school/tuition",
  ]);
});

test("tuition component plus school-admin lib unions to tuition path", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/school-admin/tuition/TuitionFamiliesPanel.tsx",
    "src/lib/school-admin/activity-notifications.ts",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/dashboard",
    "/school/rooted-meadows-school/admin/admissions/submissions",
    "/school/rooted-meadows-school/admin/my_school/tuition",
  ]);
});

test("platform admin component resolves admin CI cluster", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/admin/OrganizationSettingsEditor.tsx",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/dashboard",
    "/school/rooted-meadows-school/admin/admissions/submissions",
  ]);
});

test("mixed admin and parent changes union both clusters", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/components/school-admin/admissions/ApplicationSubmissionsPage.tsx",
    "src/components/school-parent/ParentBillingPage.tsx",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/dashboard",
    "/school/rooted-meadows-school/admin/admissions/submissions",
    "/school/rooted-meadows-school/parent",
    "/school/rooted-meadows-school/parent/portal",
    "/school/rooted-meadows-school/parent/billing",
    "/school/rooted-meadows-school/parent/children",
  ]);
});

test("organization settings change resolves all school-facing clusters", () => {
  const paths = resolveCiPagesFromChangedFiles([
    "src/lib/organization-settings/catalog.ts",
  ]);

  assert.deepEqual(paths, [
    "/school/rooted-meadows-school/apply",
    "/school/rooted-meadows-school/forms/apply",
    "/school/rooted-meadows-school/admin/login",
    "/school/rooted-meadows-school/admin/dashboard",
    "/school/rooted-meadows-school/admin/admissions/submissions",
    "/school/rooted-meadows-school/parent",
    "/school/rooted-meadows-school/parent/portal",
    "/school/rooted-meadows-school/parent/billing",
    "/school/rooted-meadows-school/parent/children",
  ]);
});

test("global layout change runs full CI page set", () => {
  const paths = resolveCiPagesFromChangedFiles(["src/app/layout.tsx"]);

  assert.equal(paths.length, CI_LHCI_PAGE_PATHS.length);
  assert.deepEqual(paths, [...CI_LHCI_PAGE_PATHS]);
});

test("unmatched src change falls back to full CI page set", () => {
  const paths = resolveCiPagesFromChangedFiles(["src/lib/unknown/shared.ts"]);

  assert.equal(paths.length, CI_LHCI_PAGE_PATHS.length);
  assert.deepEqual(paths, [...CI_LHCI_PAGE_PATHS]);
});

test("sql-only changes resolve to empty page set", () => {
  const paths = resolveCiPagesFromChangedFiles(["supabase/migrations/foo.sql"]);

  assert.deepEqual(paths, []);
});
