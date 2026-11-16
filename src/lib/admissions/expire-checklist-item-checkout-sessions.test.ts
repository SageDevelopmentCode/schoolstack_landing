import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { expirePendingCheckoutSessionsForChecklistItems } from "./expire-checklist-item-checkout-sessions";

type Row = Record<string, unknown>;

function paymentRow(overrides: Row): Row {
  return {
    id: "payment-1",
    organization_id: "org-1",
    application_id: "app-1",
    family_id: null,
    tuition_charge_id: null,
    payment_type: "enrollment_checklist",
    enrollment_checklist_item_id: "item-1",
    label: "Supply and Activities Fee",
    payer_user_id: "user-1",
    stripe_checkout_session_id: "cs_old",
    stripe_payment_intent_id: null,
    amount_cents: 65000,
    amount_applied_cents: null,
    charged_amount_cents: 65250,
    processing_fee_cents: 250,
    payment_method_type: "us_bank_account",
    currency: "USD",
    status: "pending",
    stripe_provider_status: null,
    paid_at: null,
    created_at: "2026-11-04T21:49:00.000Z",
    ...overrides,
  };
}

/** In-memory application_payments table covering the queries the helper makes. */
function createSupabaseMock(rows: Row[]) {
  const canceledIds: string[] = [];

  const matches = (row: Row, filters: Row) =>
    Object.entries(filters).every(([column, value]) => row[column] === value);

  const supabase = {
    from(table: string) {
      assert.equal(table, "application_payments");
      const filters: Row = {};

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
        async maybeSingle() {
          return { data: rows.find((row) => matches(row, filters)) ?? null, error: null };
        },
        then(resolve: (value: { data: Row[]; error: null }) => unknown) {
          return Promise.resolve(
            resolve({ data: rows.filter((row) => matches(row, filters)), error: null }),
          );
        },
        update(patch: Row) {
          const updateFilters: Row = {};
          const updateBuilder = {
            eq(column: string, value: unknown) {
              updateFilters[column] = value;
              return updateBuilder;
            },
            select() {
              return updateBuilder;
            },
            async maybeSingle() {
              const row = rows.find((candidate) => matches(candidate, updateFilters));
              if (!row) return { data: null, error: null };
              Object.assign(row, patch);
              if (patch.status === "canceled") canceledIds.push(String(row.id));
              return { data: row, error: null };
            },
          };
          return updateBuilder;
        },
      };

      return builder;
    },
  };

  return { supabase, canceledIds };
}

function createStripeMock(statusBySession: Record<string, string>) {
  const expired: string[] = [];
  const stripe = {
    checkout: {
      sessions: {
        async retrieve(sessionId: string) {
          return { id: sessionId, status: statusBySession[sessionId] };
        },
        async expire(sessionId: string) {
          expired.push(sessionId);
        },
      },
    },
  } as unknown as Stripe;
  return { stripe, expired };
}

describe("expirePendingCheckoutSessionsForChecklistItems", () => {
  it("expires an abandoned combined session and cancels every row on it", async () => {
    // Nov 4: one combined Checkout for two siblings, never finished.
    const rows = [
      paymentRow({ id: "levi-old", enrollment_checklist_item_id: "item-levi" }),
      paymentRow({ id: "maggie-old", enrollment_checklist_item_id: "item-maggie" }),
    ];
    const { supabase, canceledIds } = createSupabaseMock(rows);
    const { stripe, expired } = createStripeMock({ cs_old: "open" });

    await expirePendingCheckoutSessionsForChecklistItems(
      supabase as never,
      stripe,
      ["item-levi", "item-maggie"],
    );

    assert.deepEqual(expired, ["cs_old"]);
    assert.deepEqual(canceledIds.sort(), ["levi-old", "maggie-old"]);
  });

  it("cancels rows on an already expired session without calling expire", async () => {
    const { supabase, canceledIds } = createSupabaseMock([paymentRow({})]);
    const { stripe, expired } = createStripeMock({ cs_old: "expired" });

    await expirePendingCheckoutSessionsForChecklistItems(supabase as never, stripe, [
      "item-1",
    ]);

    assert.deepEqual(expired, []);
    assert.deepEqual(canceledIds, ["payment-1"]);
  });

  it("leaves rows that have a PaymentIntent or a completed session", async () => {
    const rows = [
      paymentRow({ id: "in-flight", stripe_payment_intent_id: "pi_1" }),
      paymentRow({ id: "completed", stripe_checkout_session_id: "cs_done" }),
    ];
    const { supabase, canceledIds } = createSupabaseMock(rows);
    const { stripe, expired } = createStripeMock({ cs_old: "open", cs_done: "complete" });

    await expirePendingCheckoutSessionsForChecklistItems(supabase as never, stripe, [
      "item-1",
    ]);

    assert.deepEqual(expired, []);
    assert.deepEqual(canceledIds, []);
  });
});
