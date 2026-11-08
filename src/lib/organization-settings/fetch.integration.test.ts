import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPublicReadClient } from "@/lib/admissions/public-apply-cache";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";
import { fetchOrganizationWithSettingsUncached } from "./fetch";

/**
 * Phase 3: the cross-request cache reads with the cookie-free (anon) client. For an active school
 * that must be exactly what a privileged read returns, or the cache would serve different data.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

describeIntegration("organization settings cookie-free read", () => {
  it("matches the privileged read for an active school", async () => {
    const viaAnon = await fetchOrganizationWithSettingsUncached(
      createPublicReadClient(),
      TEST_ORG_SLUG,
    );
    const viaAdmin = await fetchOrganizationWithSettingsUncached(
      createTestAdminClient(),
      TEST_ORG_SLUG,
    );

    assert.ok(viaAnon, "anon must be able to read an active school");
    assert.deepEqual(viaAnon, viaAdmin);
  });

  it("returns null for an unknown slug instead of throwing", async () => {
    const result = await fetchOrganizationWithSettingsUncached(
      createPublicReadClient(),
      `missing-${Date.now()}`,
    );
    assert.equal(result, null);
  });
});
