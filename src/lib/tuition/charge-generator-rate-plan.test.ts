import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  regenerateFutureCharges,
  regenerateFutureChargesForRatePlan,
} from "./charge-generator";

type AssignmentRow = {
  id: string;
  organization_id: string;
  family_id: string;
  payment_plan_id: string;
  rate_plan_id: string;
  rate_tier_id: string | null;
  effective_start: string | null;
  metadata: Record<string, unknown>;
  status: string;
};

type ChargeRow = {
  id: string;
  assignment_id: string;
  organization_id: string;
  family_id: string;
  label: string;
  base_amount_cents: number;
  amount_cents: number;
  due_date: string;
  status: string;
  charge_type: string;
  installment_number: number | null;
};

function createRegenerationMockSupabase(options: {
  assignments: AssignmentRow[];
  paymentPlan?: {
    id: string;
    organization_id: string;
    rate_plan_id: string;
    installment_count: number;
    installment_amount_cents: number;
    billing_day_of_month: number;
    name: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  };
  tier?: { id: string; amount_cents: number } | null;
  existingCharges?: ChargeRow[];
  feeComponents?: unknown[];
  adjustments?: unknown[];
}) {
  const {
    assignments,
    paymentPlan = {
      id: "plan-1",
      organization_id: "org-1",
      rate_plan_id: "rate-1",
      installment_count: 10,
      installment_amount_cents: 72000,
      billing_day_of_month: 1,
      name: "10 payments",
      is_default: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    tier = { id: "tier-1", amount_cents: 720000 },
    existingCharges = [],
    feeComponents = [],
    adjustments = [],
  } = options;

  const charges = [...existingCharges];
  const voidedChargeIds: string[] = [];
  const insertedCharges: Array<Record<string, unknown>> = [];

  function createFilterBuilder(table: string, filters: Record<string, unknown> = {}) {
    const nextFilters = { ...filters };

    const filterBuilder = {
      select(_columns?: string) {
        return filterBuilder;
      },
      eq(column: string, value: unknown) {
        nextFilters[column] = value;
        return filterBuilder;
      },
      in(column: string, values: unknown[]) {
        nextFilters[`${column}__in`] = values;
        return filterBuilder;
      },
      not(column: string, _op: string, value: unknown) {
        nextFilters[`${column}__not`] = value;
        return filterBuilder;
      },
      lt(_column: string, _value: unknown) {
        return filterBuilder;
      },
      order(_column: string, _options?: { ascending: boolean }) {
        return filterBuilder;
      },
      maybeSingle: async () => {
        if (table === "tuition_enrollment_assignments" && nextFilters.id) {
          const assignment = assignments.find((row) => row.id === nextFilters.id);
          return { data: assignment ?? null, error: null };
        }

        if (table === "tuition_payment_plans" && nextFilters.id) {
          return { data: paymentPlan, error: null };
        }

        if (table === "tuition_rate_tiers" && nextFilters.id) {
          return { data: tier, error: null };
        }

        return { data: null, error: null };
      },
      single: async () => filterBuilder.maybeSingle(),
      update(values: Record<string, unknown>) {
        const pendingUpdate = {
          values,
          filters: { ...nextFilters },
        };

        const updateBuilder = {
          eq(column: string, value: unknown) {
            pendingUpdate.filters[column] = value;
            return updateBuilder;
          },
          in(column: string, values: unknown[]) {
            pendingUpdate.filters[`${column}__in`] = values;
            return updateBuilder;
          },
          neq(column: string, value: unknown) {
            pendingUpdate.filters[`${column}__neq`] = value;
            return updateBuilder;
          },
          select() {
            return updateBuilder;
          },
          then(
            resolve: (value: { data: ChargeRow[] | null; error: null }) => void,
          ) {
            if (table === "tuition_charges") {
              const targetStatus = pendingUpdate.filters.status__in as
                | string[]
                | undefined;
              const excludedChargeType = pendingUpdate.filters.charge_type__neq as
                | string
                | undefined;
              for (const charge of charges) {
                if (
                  charge.assignment_id === pendingUpdate.filters.assignment_id &&
                  (!targetStatus || targetStatus.includes(charge.status)) &&
                  (excludedChargeType == null ||
                    charge.charge_type !== excludedChargeType)
                ) {
                  charge.status = String(pendingUpdate.values.status);
                  voidedChargeIds.push(charge.id);
                }
              }
            }
            resolve({ data: null, error: null });
          },
        };

        return updateBuilder;
      },
      insert(rows: Array<Record<string, unknown>> | Record<string, unknown>) {
        const payload = Array.isArray(rows) ? rows : [rows];
        insertedCharges.push(...payload);
        for (const row of payload) {
          charges.push({
            id: `charge-${charges.length + 1}`,
            assignment_id: String(row.assignment_id),
            organization_id: String(row.organization_id),
            family_id: String(row.family_id),
            label: String(row.label),
            base_amount_cents: Number(row.base_amount_cents),
            amount_cents: Number(row.amount_cents),
            due_date: String(row.due_date),
            status: String(row.status),
            charge_type: String(row.charge_type),
            installment_number:
              typeof row.installment_number === "number"
                ? row.installment_number
                : null,
          });
        }
        return {
          select: () => ({
            async then(resolve: (value: { data: ChargeRow[]; error: null }) => void) {
              resolve({ data: charges.slice(-payload.length), error: null });
            },
          }),
        };
      },
      then(
        resolve: (value: { data: AssignmentRow[] | ChargeRow[] | unknown[]; error: null }) => void,
      ) {
        if (table === "tuition_enrollment_assignments") {
          let rows = assignments;
          if (nextFilters.rate_plan_id) {
            rows = rows.filter((row) => row.rate_plan_id === nextFilters.rate_plan_id);
          }
          if (nextFilters.status) {
            rows = rows.filter((row) => row.status === nextFilters.status);
          }
          resolve({ data: rows, error: null });
          return;
        }

        if (table === "tuition_fee_components") {
          resolve({ data: feeComponents, error: null });
          return;
        }

        if (table === "tuition_adjustments") {
          resolve({ data: adjustments, error: null });
          return;
        }

        if (table === "tuition_charges") {
          let rows = charges.filter(
            (charge) =>
              charge.assignment_id === nextFilters.assignment_id &&
              charge.status !== nextFilters.status__not,
          );
          if (nextFilters.assignment_id && !nextFilters.status__not) {
            rows = charges.filter(
              (charge) => charge.assignment_id === nextFilters.assignment_id,
            );
          }
          resolve({ data: rows, error: null });
          return;
        }

        resolve({ data: [], error: null });
      },
    };

    return filterBuilder;
  }

  const supabase = {
    from(table: string) {
      return createFilterBuilder(table);
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    voidedChargeIds,
    insertedCharges,
    getCharges: () => charges,
  };
}

describe("regenerateFutureChargesForRatePlan", () => {
  it("regenerates charges for active assignments and skips pending plan selection", async () => {
    const { supabase } = createRegenerationMockSupabase({
      assignments: [
        {
          id: "assign-ready",
          organization_id: "org-1",
          family_id: "family-1",
          payment_plan_id: "plan-1",
          rate_plan_id: "rate-1",
          rate_tier_id: "tier-1",
          effective_start: "2026-08-01",
          metadata: {},
          status: "active",
        },
        {
          id: "assign-pending",
          organization_id: "org-1",
          family_id: "family-2",
          payment_plan_id: "plan-1",
          rate_plan_id: "rate-1",
          rate_tier_id: "tier-1",
          effective_start: "2026-08-01",
          metadata: { pendingPaymentPlanSelection: true },
          status: "active",
        },
      ],
    });

    const result = await regenerateFutureChargesForRatePlan(supabase, "rate-1");

    assert.equal(result.processed, 1);
    assert.equal(result.skipped, 1);
  });
});

describe("regenerateFutureCharges", () => {
  it("voids scheduled charges and inserts repriced future installments", async () => {
    const { supabase, voidedChargeIds, insertedCharges } = createRegenerationMockSupabase({
      assignments: [
        {
          id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          payment_plan_id: "plan-1",
          rate_plan_id: "rate-1",
          rate_tier_id: "tier-1",
          effective_start: "2026-08-01",
          metadata: {},
          status: "active",
        },
      ],
      existingCharges: [
        {
          id: "charge-scheduled",
          assignment_id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          label: "Aug Tuition",
          base_amount_cents: 70000,
          amount_cents: 70000,
          due_date: "2026-08-01",
          status: "scheduled",
          charge_type: "tuition",
          installment_number: 1,
        },
      ],
    });

    await regenerateFutureCharges(supabase, "assign-1");

    assert.ok(voidedChargeIds.includes("charge-scheduled"));
    assert.ok(insertedCharges.length >= 10);
    assert.ok(
      insertedCharges.some(
        (charge) =>
          charge.charge_type === "tuition" && charge.base_amount_cents === 72000,
      ),
    );
  });

  it("preserves paid charges when regenerating", async () => {
    const { supabase, voidedChargeIds, getCharges } = createRegenerationMockSupabase({
      assignments: [
        {
          id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          payment_plan_id: "plan-1",
          rate_plan_id: "rate-1",
          rate_tier_id: "tier-1",
          effective_start: "2026-08-01",
          metadata: {},
          status: "active",
        },
      ],
      existingCharges: [
        {
          id: "charge-paid",
          assignment_id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          label: "Aug Tuition",
          base_amount_cents: 72000,
          amount_cents: 72000,
          due_date: "2026-08-01",
          status: "paid",
          charge_type: "tuition",
          installment_number: 1,
        },
        {
          id: "charge-scheduled",
          assignment_id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          label: "Sep Tuition",
          base_amount_cents: 72000,
          amount_cents: 72000,
          due_date: "2026-09-01",
          status: "scheduled",
          charge_type: "tuition",
          installment_number: 2,
        },
      ],
    });

    await regenerateFutureCharges(supabase, "assign-1");

    assert.equal(voidedChargeIds.includes("charge-paid"), false);
    assert.equal(getCharges().find((charge) => charge.id === "charge-paid")?.status, "paid");
    assert.ok(voidedChargeIds.includes("charge-scheduled"));
  });

  it("preserves scheduled late fee charges when regenerating", async () => {
    const { supabase, voidedChargeIds, getCharges } = createRegenerationMockSupabase({
      assignments: [
        {
          id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          payment_plan_id: "plan-1",
          rate_plan_id: "rate-1",
          rate_tier_id: "tier-1",
          effective_start: "2026-08-01",
          metadata: {},
          status: "active",
        },
      ],
      existingCharges: [
        {
          id: "charge-tuition",
          assignment_id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          label: "Aug Tuition",
          base_amount_cents: 72000,
          amount_cents: 72000,
          due_date: "2026-08-01",
          status: "scheduled",
          charge_type: "tuition",
          installment_number: 1,
        },
        {
          id: "charge-late-fee",
          assignment_id: "assign-1",
          organization_id: "org-1",
          family_id: "family-1",
          label: "Late Fee",
          base_amount_cents: 2500,
          amount_cents: 2500,
          due_date: "2026-08-15",
          status: "scheduled",
          charge_type: "late_fee",
          installment_number: null,
        },
      ],
    });

    await regenerateFutureCharges(supabase, "assign-1");

    assert.equal(voidedChargeIds.includes("charge-late-fee"), false);
    assert.equal(
      getCharges().find((charge) => charge.id === "charge-late-fee")?.status,
      "scheduled",
    );
    assert.ok(voidedChargeIds.includes("charge-tuition"));
  });
});
