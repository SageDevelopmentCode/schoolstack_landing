import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdmissionsSetupStatus,
  computeApplyFormStepStatus,
  computeChecklistStepStatus,
  computeGoLiveStepStatus,
  computeProgramsStepStatus,
  computeStripeStepStatus,
  type AdmissionsSetupRawData,
} from "@/lib/school-admin/admissions-setup-status";
import type { OrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";

const readyAccount: OrganizationPaymentAccount = {
  organizationId: "org_test",
  stripeConnectAccountId: "acct_test",
  onboardingStatus: "complete",
  chargesEnabled: true,
  payoutsEnabled: true,
};

const pendingAccount: OrganizationPaymentAccount = {
  organizationId: "org_test",
  stripeConnectAccountId: "acct_test",
  onboardingStatus: "pending",
  chargesEnabled: false,
  payoutsEnabled: false,
};

const emptyData: AdmissionsSetupRawData = {
  hasPrograms: false,
  paymentAccount: null,
  applyFormStatus: "none",
  applyFormPublicSlug: null,
  checklistStatus: "none",
  checklistItemCount: 0,
  hasSubmissions: false,
};

describe("computeProgramsStepStatus", () => {
  it("returns not_started when no programs exist", () => {
    assert.equal(computeProgramsStepStatus(false), "not_started");
  });

  it("returns completed when at least one program exists", () => {
    assert.equal(computeProgramsStepStatus(true), "completed");
  });
});

describe("computeStripeStepStatus", () => {
  it("returns not_started when no account exists", () => {
    assert.equal(computeStripeStepStatus(null), "not_started");
  });

  it("returns in_progress when account exists but charges are disabled", () => {
    assert.equal(computeStripeStepStatus(pendingAccount), "in_progress");
  });

  it("returns completed when payment is ready", () => {
    assert.equal(computeStripeStepStatus(readyAccount), "completed");
  });
});

describe("computeApplyFormStepStatus", () => {
  it("maps apply form states to setup statuses", () => {
    assert.equal(computeApplyFormStepStatus("none"), "not_started");
    assert.equal(computeApplyFormStepStatus("draft"), "in_progress");
    assert.equal(computeApplyFormStepStatus("published"), "completed");
  });
});

describe("computeChecklistStepStatus", () => {
  it("requires a published checklist with items to complete", () => {
    assert.equal(computeChecklistStepStatus("none", 0), "not_started");
    assert.equal(computeChecklistStepStatus("draft", 2), "in_progress");
    assert.equal(computeChecklistStepStatus("published", 0), "in_progress");
    assert.equal(computeChecklistStepStatus("published", 3), "completed");
  });
});

describe("computeGoLiveStepStatus", () => {
  it("stays not_started until both flows are published", () => {
    assert.equal(computeGoLiveStepStatus(false, false, false), "not_started");
    assert.equal(computeGoLiveStepStatus(true, false, false), "not_started");
    assert.equal(computeGoLiveStepStatus(false, true, false), "not_started");
  });

  it("returns in_progress when published but no submissions yet", () => {
    assert.equal(computeGoLiveStepStatus(true, true, false), "in_progress");
  });

  it("returns completed after the first submission", () => {
    assert.equal(computeGoLiveStepStatus(true, true, true), "completed");
  });
});

describe("buildAdmissionsSetupStatus", () => {
  it("builds ordered steps with links and progress metadata", () => {
    const status = buildAdmissionsSetupStatus("rooted-meadows", {
      ...emptyData,
      hasPrograms: true,
      paymentAccount: readyAccount,
      applyFormStatus: "published",
      applyFormPublicSlug: "apply",
      checklistStatus: "published",
      checklistItemCount: 2,
      hasSubmissions: false,
    });

    assert.equal(status.completedCount, 4);
    assert.equal(status.totalCount, 5);
    assert.equal(status.firstIncompleteStepId, "go_live");
    assert.equal(status.applyFormPublicPath, "/school/rooted-meadows/forms/apply");
    assert.equal(status.steps[0]?.href, "/school/rooted-meadows/admin/admissions/programs");
    assert.equal(
      status.steps[2]?.href,
      "/school/rooted-meadows/admin/admissions/flows?flow=apply",
    );
    assert.equal(status.steps[4]?.status, "in_progress");
  });

  it("returns null firstIncompleteStepId when all steps are complete", () => {
    const status = buildAdmissionsSetupStatus("rooted-meadows", {
      ...emptyData,
      hasPrograms: true,
      paymentAccount: readyAccount,
      applyFormStatus: "published",
      applyFormPublicSlug: "apply",
      checklistStatus: "published",
      checklistItemCount: 1,
      hasSubmissions: true,
    });

    assert.equal(status.completedCount, 5);
    assert.equal(status.firstIncompleteStepId, null);
  });
});
