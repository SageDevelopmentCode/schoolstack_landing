import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTuitionSetupCheckoutSession } from "@/lib/stripe/checkout-session";

describe("createTuitionSetupCheckoutSession", () => {
  it("creates a setup-mode checkout session with tuition metadata", async () => {
    let capturedParams: Record<string, unknown> | null = null;
    const session = {
      id: "cs_test",
      url: "https://checkout.stripe.test/setup",
    };

    const stripe = {
      checkout: {
        sessions: {
          create: async (params: Record<string, unknown>) => {
            capturedParams = params;
            return session;
          },
        },
      },
    };

    const result = await createTuitionSetupCheckoutSession(
      {
        stripeCustomerId: "cus_123",
        payerUserId: "user_123",
        organizationId: "org_123",
        familyId: "family_123",
        guardianId: "guardian_123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      },
      { stripe: stripe as never },
    );

    assert.equal(result.url, session.url);
    const params = capturedParams as Record<string, unknown> | null;
    assert.equal(params?.mode, "setup");
    assert.deepEqual(params?.metadata, {
      payment_type: "tuition_setup",
      organization_id: "org_123",
      family_id: "family_123",
      guardian_id: "guardian_123",
      supabase_user_id: "user_123",
    });
  });
});
