import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { expirePendingCheckoutSessionsForCharge } from "./expire-charge-checkout-sessions";

function pendingPaymentRow(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: "payment-1",
    organization_id: "org-1",
    application_id: null,
    family_id: "family-1",
    tuition_charge_id: "charge-1",
    payment_type: "tuition",
    enrollment_checklist_item_id: null,
    label: "Aug Tuition",
    payer_user_id: "user-1",
    stripe_checkout_session_id: "cs_test_open",
    stripe_payment_intent_id: null,
    amount_cents: 30000,
    amount_applied_cents: null,
    charged_amount_cents: null,
    processing_fee_cents: null,
    payment_method_type: "card",
    currency: "USD",
    status: "pending",
    stripe_provider_status: null,
    paid_at: null,
    created_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function createPaymentsSupabaseMock() {
  const failedPaymentIds: string[] = [];

  const supabase = {
    from(table: string) {
      const filters: Record<string, unknown> = {};
      let pendingUpdate = false;

      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return builder;
        },
        order() {
          return builder;
        },
        update(patch: Record<string, unknown>) {
          pendingUpdate = true;
          const updateFilters: Record<string, unknown> = {};
          const updateBuilder = {
            eq(column: string, value: unknown) {
              updateFilters[column] = value;
              return updateBuilder;
            },
            select() {
              return updateBuilder;
            },
            async maybeSingle() {
              if (table !== "application_payments" || updateFilters.id !== "payment-1") {
                return { data: null, error: null };
              }
              failedPaymentIds.push(String(updateFilters.id));
              return {
                data: { ...pendingPaymentRow(), status: patch.status },
                error: null,
              };
            },
          };
          return updateBuilder;
        },
        async maybeSingle() {
          if (table !== "application_payments" || pendingUpdate) {
            return { data: null, error: null };
          }
          if (filters.id === "payment-1") {
            return { data: pendingPaymentRow(), error: null };
          }
          return { data: null, error: null };
        },
        async then(
          resolve: (value: { data: unknown[]; error: null }) => unknown,
        ) {
          if (
            table === "application_payments" &&
            filters.tuition_charge_id === "charge-1" &&
            filters.status === "pending"
          ) {
            return resolve({
              data: [pendingPaymentRow()],
              error: null,
            });
          }
          return resolve({ data: [], error: null });
        },
      };

      return builder;
    },
    failedPaymentIds,
  };

  return supabase;
}

describe("expirePendingCheckoutSessionsForCharge", () => {
  it("expires open checkout sessions and marks payments failed", async () => {
    const expiredSessionIds: string[] = [];
    const supabase = createPaymentsSupabaseMock();

    const stripe = {
      checkout: {
        sessions: {
          async retrieve() {
            return { status: "open" };
          },
          async expire(sessionId: string) {
            expiredSessionIds.push(sessionId);
          },
        },
      },
    } as unknown as Stripe;

    await expirePendingCheckoutSessionsForCharge(
      supabase as never,
      stripe,
      "charge-1",
    );

    assert.deepEqual(expiredSessionIds, ["cs_test_open"]);
    assert.deepEqual(supabase.failedPaymentIds, ["payment-1"]);
  });

  it("marks expired sessions failed without calling expire", async () => {
    const expiredSessionIds: string[] = [];
    const supabase = createPaymentsSupabaseMock();

    const stripe = {
      checkout: {
        sessions: {
          async retrieve() {
            return { status: "expired" };
          },
          async expire(sessionId: string) {
            expiredSessionIds.push(sessionId);
          },
        },
      },
    } as unknown as Stripe;

    await expirePendingCheckoutSessionsForCharge(
      supabase as never,
      stripe,
      "charge-1",
    );

    assert.deepEqual(expiredSessionIds, []);
    assert.deepEqual(supabase.failedPaymentIds, ["payment-1"]);
  });
});
