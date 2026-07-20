import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { createMockStripeClient } from "@/test/mocks/stripe";

async function createDashboardLoginUrl(
  stripeConnectAccountId: string,
  stripe: Stripe,
): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(stripeConnectAccountId);
  return loginLink.url;
}

describe("createDashboardLoginUrl", () => {
  it("returns a Stripe Express dashboard login URL", async () => {
    const mockStripe = createMockStripeClient({
      accountsCreateLoginLink: async (accountId) =>
        ({
          object: "login_link",
          created: Math.floor(Date.now() / 1000),
          url: `https://connect.stripe.test/express/${accountId}`,
        }) as Stripe.LoginLink,
    });

    const url = await createDashboardLoginUrl("acct_test_connect", mockStripe);
    assert.equal(url, "https://connect.stripe.test/express/acct_test_connect");
  });
});
