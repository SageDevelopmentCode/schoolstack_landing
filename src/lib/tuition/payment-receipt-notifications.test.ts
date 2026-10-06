import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import {
  sendAutopayConfirmationNotifications,
  type AutopayConfirmationDeps,
} from "./payment-receipt-notifications";

const ORG_ID = "org-1";
const admin = {} as SupabaseClient;

function payment(overrides: Partial<PaymentRecord>): PaymentRecord {
  return {
    id: "pay",
    organizationId: ORG_ID,
    applicationId: null,
    familyId: "family-a",
    tuitionChargeId: "charge",
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: "Oct Tuition",
    payerUserId: null,
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: "pi_1",
    amountCents: 72000,
    amountAppliedCents: 72000,
    chargedAmountCents: 72500,
    processingFeeCents: 500,
    paymentMethodType: "us_bank_account",
    currency: "usd",
    status: "succeeded",
    stripeProviderStatus: "processing",
    paidAt: "2026-10-01T13:31:00Z",
    createdAt: "2026-10-01T13:31:00Z",
    ...overrides,
  };
}

function buildDeps(payments: PaymentRecord[]) {
  const sends: Array<{ to: string; periodLabel: string; html: string }> = [];
  const deps: AutopayConfirmationDeps = {
    loadPayment: async (_admin, id) => payments.find((p) => p.id === id) ?? null,
    loadOrganization: async () => ({ name: "Rooted Meadows", slug: "rooted-meadows" }),
    loadOrganizationTimezone: async () => "America/Chicago",
    resolveContact: async (_admin, { familyId }) =>
      familyId === "family-a"
        ? { emails: ["a1@example.com", "a2@example.com"], name: "Amelia Thompson" }
        : { emails: ["b@example.com"], name: "Bob Olson" },
    loadStudentNames: async (_admin, chargeIds) =>
      new Map(chargeIds.map((id) => [id, `Student ${id}`])),
    loadChargeDueDates: async () => ["2026-10-01"],
    sendEmail: async (payload) => {
      sends.push({ to: payload.to, periodLabel: payload.periodLabel, html: payload.html });
      return { ok: payload.to !== "a2@example.com" };
    },
  };
  return { deps, sends };
}

test("groups payments by family and sends one email per notification address", async () => {
  const payments = [
    payment({ id: "p1", familyId: "family-a", tuitionChargeId: "c1" }),
    payment({ id: "p2", familyId: "family-a", tuitionChargeId: "c2" }),
    payment({ id: "p3", familyId: "family-b", tuitionChargeId: "c3" }),
  ];
  const { deps, sends } = buildDeps(payments);

  const result = await sendAutopayConfirmationNotifications(
    admin,
    { organizationId: ORG_ID, paymentIds: ["p1", "p2", "p3", "p1"] },
    deps,
  );

  assert.deepEqual(result.skippedPaymentIds, []);
  assert.equal(result.families.length, 2);

  const familyA = result.families.find((f) => f.familyId === "family-a");
  assert.deepEqual(familyA?.paymentIds, ["p1", "p2"]);
  assert.deepEqual(familyA?.sent, ["a1@example.com"]);
  assert.deepEqual(familyA?.failed, ["a2@example.com"]);

  assert.equal(sends.length, 3);
  assert.ok(sends.every((s) => s.periodLabel === "October"));
  const familyAHtml = sends.find((s) => s.to === "a1@example.com")?.html ?? "";
  assert.match(familyAHtml, /Student c1/);
  assert.match(familyAHtml, /Student c2/);
  assert.match(familyAHtml, /\$1,450\.00/);
  assert.doesNotMatch(familyAHtml, /fail/i);
});

test("skips payments that are not succeeded tuition payments in the organization", async () => {
  const payments = [
    payment({ id: "ok", familyId: "family-b" }),
    payment({ id: "pending", status: "pending" }),
    payment({ id: "other-org", organizationId: "org-2" }),
    payment({ id: "fee", paymentType: "application_fee" }),
    payment({ id: "no-family", familyId: null }),
  ];
  const { deps, sends } = buildDeps(payments);

  const result = await sendAutopayConfirmationNotifications(
    admin,
    {
      organizationId: ORG_ID,
      paymentIds: ["ok", "pending", "other-org", "fee", "no-family", "missing"],
    },
    deps,
  );

  assert.deepEqual(
    result.skippedPaymentIds.map((s) => [s.paymentId, s.reason]),
    [
      ["pending", "status_pending"],
      ["other-org", "other_organization"],
      ["fee", "not_tuition"],
      ["no-family", "no_family"],
      ["missing", "not_found"],
    ],
  );
  assert.equal(result.families.length, 1);
  assert.deepEqual(
    sends.map((s) => s.to),
    ["b@example.com"],
  );
});
