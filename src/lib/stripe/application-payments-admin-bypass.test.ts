import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPaymentByChecklistItem,
  recordAdminBypassEnrollmentPayment,
} from "./application-payments";

function createMockSupabase() {
  const rows: Array<Record<string, unknown>> = [];

  const supabase = {
    from(table: string) {
      if (table !== "application_payments") {
        throw new Error(`Unexpected table: ${table}`);
      }

      const filters: Record<string, unknown> = {};
      let orderColumn: string | null = null;

      return {
        select() {
          return this;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return this;
        },
        order(column: string) {
          orderColumn = column;
          return this;
        },
        limit() {
          return this;
        },
        maybeSingle: async () => {
          if (orderColumn) {
            const match = rows.find((row) =>
              Object.entries(filters).every(([key, value]) => row[key] === value),
            );
            return { data: match ?? null, error: null };
          }
          return { data: null, error: null };
        },
        insert(values: Record<string, unknown>) {
          const row = {
            id: `payment-${rows.length + 1}`,
            created_at: values.created_at ?? new Date().toISOString(),
            ...values,
          };
          rows.push(row);
          return {
            select: () => ({
              single: async () => ({ data: row, error: null }),
            }),
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  return { supabase, rows };
}

describe("recordAdminBypassEnrollmentPayment", () => {
  it("creates a succeeded enrollment checklist payment", async () => {
    const { supabase, rows } = createMockSupabase();

    const payment = await recordAdminBypassEnrollmentPayment(supabase, {
      organizationId: "org-1",
      applicationId: "app-1",
      enrollmentChecklistItemId: "item-1",
      amountCents: 50000,
      label: "Supply Fee",
      actorUserId: "admin-1",
    });

    assert.ok(payment);
    assert.equal(payment?.status, "succeeded");
    assert.equal(payment?.paymentType, "enrollment_checklist");
    assert.equal(rows[0]?.amount_cents, 50000);

    const existing = await getPaymentByChecklistItem(supabase, "item-1", {
      status: "succeeded",
    });
    assert.equal(existing?.id, payment?.id);
  });

  it("skips duplicate succeeded payments for the same checklist item", async () => {
    const { supabase } = createMockSupabase();

    const first = await recordAdminBypassEnrollmentPayment(supabase, {
      organizationId: "org-1",
      applicationId: "app-1",
      enrollmentChecklistItemId: "item-1",
      amountCents: 15000,
      label: "Activities Fee",
    });

    const second = await recordAdminBypassEnrollmentPayment(supabase, {
      organizationId: "org-1",
      applicationId: "app-1",
      enrollmentChecklistItemId: "item-1",
      amountCents: 15000,
      label: "Activities Fee",
    });

    assert.equal(first?.id, second?.id);
  });
});
