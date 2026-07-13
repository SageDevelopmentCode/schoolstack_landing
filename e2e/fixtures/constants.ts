import { TEST_ORG_SLUG } from "../helpers/constants";

export const E2E_ADMIN_EMAIL =
  process.env.E2E_ADMIN_EMAIL ?? "e2e-admin@schoolstack.test";
export const E2E_PARENT_EMAIL =
  process.env.E2E_PARENT_EMAIL ?? "e2e-parent@schoolstack.test";
export const E2E_OTHER_PARENT_EMAIL =
  process.env.E2E_OTHER_PARENT_EMAIL ?? "e2e-other-parent@schoolstack.test";
export const E2E_NONADMIN_EMAIL =
  process.env.E2E_NONADMIN_EMAIL ?? "e2e-nonadmin@schoolstack.test";
export const E2E_TEST_PASSWORD =
  process.env.E2E_TEST_PASSWORD ?? "E2eTestPassword123!";

export const AUTH_STATE_PATHS = {
  schoolAdmin: "e2e/.auth/school-admin.json",
  parent: "e2e/.auth/parent.json",
  nonAdmin: "e2e/.auth/non-admin.json",
} as const;

export { TEST_ORG_SLUG };
