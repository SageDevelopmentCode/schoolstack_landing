import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { setStripeClientForTests } from "@/lib/stripe/client";
import { processAutopayForOrganization } from "./autopay";

describe("processAutopayForOrganization", () => {
  after(() => {
    setStripeClientForTests(null);
  });

  it("skips due charges with stale payment methods", async () => {
    setStripeClientForTests({
      paymentMethods: {
        retrieve: async () => {
          const error = new Error("No such payment_method") as Error & {
            code?: string;
          };
          error.code = "resource_missing";
          throw error;
        },
      },
    } as never);

    const removedPaymentMethods: string[] = [];
    const supabase = {
      from(table: string) {
        if (table === "organization_payment_accounts") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    organization_id: "org-1",
                    stripe_connect_account_id: "acct_test",
                    onboarding_status: "complete",
                    charges_enabled: true,
                    payouts_enabled: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "organizations") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { slug: "rooted-meadows-demo" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "tuition_billing_accounts") {
          return {
            select: (columns?: string) => ({
              eq: (column: string, value?: string) => {
                if (
                  columns === "default_payment_method_id" &&
                  column === "id"
                ) {
                  return {
                    maybeSingle: async () => ({
                      data: { default_payment_method_id: "pm_stale" },
                      error: null,
                    }),
                  };
                }

                if (column === "organization_id" && value === "org-1") {
                  return Promise.resolve({
                    data: [
                      {
                        id: "billing-1",
                        family_id: "family-1",
                        default_payment_method_id: "pm_stale",
                        autopay_enabled: true,
                        metadata: {},
                      },
                    ],
                    error: null,
                  });
                }

                return {
                  maybeSingle: async () => ({ data: null, error: null }),
                };
              },
            }),
            update: () => ({
              eq: async () => ({ error: null }),
            }),
          };
        }

        if (table === "guardians") {
          return {
            select: () => ({
              in: () => ({
                order: async () => ({
                  data: [{ family_id: "family-1", last_name: "Cecilia" }],
                  error: null,
                }),
              }),
              eq: () => ({
                not: () => ({
                  order: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({
                        data: { user_id: "user-1" },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    is: async () => ({
                      data: [
                        {
                          id: "charge-1",
                          amount_cents: 36000,
                          paid_cents: 0,
                          label: "Aug Tuition (Julius)",
                          currency: "USD",
                          guardian_id: null,
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "user_stripe_customers") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { stripe_customer_id: "cus_test" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "family_payment_methods") {
          return {
            delete: () => ({
              eq: () => ({
                eq: () => {
                  removedPaymentMethods.push("pm_stale");
                  return { error: null };
                },
              }),
            }),
          };
        }

        if (table === "activity_events") {
          return {
            insert: async () => ({ error: null }),
          };
        }

        if (table === "families" || table === "organizations" || table === "profiles") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { name: "Cecilia Family", email: "test@example.com", slug: "demo" },
                  error: null,
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const result = await processAutopayForOrganization(supabase as never, "org-1");

    assert.equal(result.processed, 0);
    assert.equal(result.failed, 0);
    assert.equal(result.skipped, 1);
    assert.equal(result.lines[0]?.skipReason, "stale_payment_method");
    assert.equal(removedPaymentMethods.length, 1);
  });

  it("skips fully paid due charges without attempting Stripe", async () => {
    const supabase = {
      from(table: string) {
        if (table === "organization_payment_accounts") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    organization_id: "org-1",
                    stripe_connect_account_id: "acct_test",
                    onboarding_status: "complete",
                    charges_enabled: true,
                    payouts_enabled: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "organizations") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { slug: "rooted-meadows" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "tuition_billing_accounts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "billing-1",
                    family_id: "family-1",
                    default_payment_method_id: "pm_test",
                    autopay_enabled: true,
                    metadata: {},
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        if (table === "guardians") {
          return {
            select: () => ({
              in: () => ({
                order: async () => ({
                  data: [{ family_id: "family-1", last_name: "Cecilia" }],
                  error: null,
                }),
              }),
              eq: () => ({
                not: () => ({
                  order: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({
                        data: { user_id: "user-1" },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "tuition_charges") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  in: () => ({
                    is: async () => ({
                      data: [
                        {
                          id: "charge-1",
                          amount_cents: 72000,
                          paid_cents: 72000,
                          label: "August tuition",
                          currency: "USD",
                          guardian_id: null,
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "user_stripe_customers") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { stripe_customer_id: "cus_test" },
                  error: null,
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const result = await processAutopayForOrganization(supabase as never, "org-1");

    assert.equal(result.processed, 0);
    assert.equal(result.failed, 0);
    assert.equal(result.skipped, 1);
    assert.equal(result.dueCandidates, 0);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0]?.outcome, "skipped");
    assert.equal(result.lines[0]?.skipReason, "zero_balance");
    assert.equal(result.lines[0]?.chargeLabel, "August tuition");
    assert.equal(result.lines[0]?.familyLabel, "Cecilia family");
  });
});
