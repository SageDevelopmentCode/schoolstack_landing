import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildConnectStatusResult,
  buildPendingMessage,
  extractRequirementsDue,
  formatStripeRequirement,
  STRIPE_DASHBOARD_LINK_SENTINEL,
} from "@/lib/stripe/connect-status";
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

describe("formatStripeRequirement", () => {
  it("maps known Stripe requirement keys to readable labels", () => {
    assert.equal(
      formatStripeRequirement("individual.verification.document"),
      "Government-issued ID",
    );
    assert.equal(formatStripeRequirement("external_account"), "Bank account for payouts");
  });

  it("falls back for unknown requirement keys", () => {
    assert.equal(
      formatStripeRequirement("some.unknown.requirement"),
      "Additional verification in Stripe",
    );
  });
});

describe("extractRequirementsDue", () => {
  it("deduplicates and humanizes currently_due and past_due fields", () => {
    const requirements = extractRequirementsDue({
      requirements: {
        currently_due: ["individual.verification.document"],
        past_due: ["individual.verification.document", "external_account"],
      },
    });

    assert.deepEqual(requirements, [
      "Government-issued ID",
      "Bank account for payouts",
    ]);
  });
});

describe("buildPendingMessage", () => {
  it("returns null when account is not created", () => {
    assert.equal(
      buildPendingMessage({
        accountCreated: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }),
      null,
    );
  });

  it("mentions requirements when details are missing", () => {
    const message = buildPendingMessage(
      {
        accountCreated: true,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      },
      ["Government-issued ID"],
    );

    assert.match(message ?? "", /few more details/i);
  });

  it("returns verification message while charges are disabled", () => {
    const message = buildPendingMessage({
      accountCreated: true,
      detailsSubmitted: true,
      chargesEnabled: false,
      payoutsEnabled: false,
    });

    assert.match(message ?? "", /still verifying/i);
  });
});

describe("buildConnectStatusResult", () => {
  it("includes dashboard sentinel and requirements for in-progress accounts", () => {
    const result = buildConnectStatusResult({
      account: pendingAccount,
      orgSlug: "rooted-meadows",
      stripeAccount: {
        details_submitted: true,
        requirements: {
          currently_due: ["external_account"],
        },
      },
      isTestMode: true,
      syncedAt: "2026-07-19T12:00:00.000Z",
    });

    assert.equal(result.isReady, false);
    assert.equal(result.isTestMode, true);
    assert.equal(result.syncedAt, "2026-07-19T12:00:00.000Z");
    assert.deepEqual(result.requirementsDue, ["Bank account for payouts"]);
    assert.equal(result.nextSteps.length, 0);
  });

  it("includes dashboard tile and publish steps when ready", () => {
    const result = buildConnectStatusResult({
      account: readyAccount,
      orgSlug: "rooted-meadows",
      publishedFormSlug: "apply",
      syncedAt: "2026-07-19T12:00:00.000Z",
    });

    assert.equal(result.isReady, true);
    assert.equal(result.nextSteps[0]?.href, STRIPE_DASHBOARD_LINK_SENTINEL);
    assert.equal(result.nextSteps[0]?.label, "Open your Stripe dashboard");
    assert.match(result.nextSteps[1]?.href ?? "", /flows/);
    assert.match(result.nextSteps[2]?.href ?? "", /apply/);
  });
});
