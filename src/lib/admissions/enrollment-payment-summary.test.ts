import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeEnrollmentPaymentStatus } from "./enrollment-checklist-materialization";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "./enrollment-checklist-schema";

function paymentItem(id: string, required = true): EnrollmentChecklistItem {
  return {
    id,
    itemKey: id,
    label: id,
    type: "payment",
    required,
    metadata: {},
  };
}

function formItem(id: string): EnrollmentChecklistItem {
  return {
    id,
    itemKey: id,
    label: id,
    type: "form",
    required: true,
    metadata: {},
  };
}

function instance(
  templateItemId: string,
  options: {
    status?: EnrollmentChecklistItemInstance["status"];
    paymentStatus?: EnrollmentChecklistItemInstance["paymentStatus"];
  } = {},
): EnrollmentChecklistItemInstance {
  return {
    id: `${templateItemId}-instance`,
    checklistId: "checklist-1",
    templateItemId,
    itemKey: templateItemId,
    status: options.status ?? "not_started",
    paymentStatus: options.paymentStatus ?? "pending",
    responses: {},
  };
}

describe("summarizeEnrollmentPaymentStatus", () => {
  it("returns hasPaymentItems false when no payment steps exist", () => {
    assert.deepEqual(
      summarizeEnrollmentPaymentStatus([formItem("health")], []),
      { hasPaymentItems: false, allPaid: false, allWaived: false },
    );
  });

  it("returns pending when payment items are unpaid", () => {
    const summary = summarizeEnrollmentPaymentStatus(
      [paymentItem("payment")],
      [instance("payment", { status: "not_started", paymentStatus: "pending" })],
    );

    assert.equal(summary.hasPaymentItems, true);
    assert.equal(summary.allPaid, false);
    assert.equal(summary.allWaived, false);
  });

  it("returns allPaid when every required payment item is paid", () => {
    const summary = summarizeEnrollmentPaymentStatus(
      [paymentItem("payment")],
      [instance("payment", { status: "completed", paymentStatus: "paid" })],
    );

    assert.deepEqual(summary, {
      hasPaymentItems: true,
      allPaid: true,
      allWaived: false,
    });
  });

  it("returns allWaived when every payment item is waived", () => {
    const summary = summarizeEnrollmentPaymentStatus(
      [paymentItem("payment")],
      [instance("payment", { status: "waived", paymentStatus: "waived" })],
    );

    assert.deepEqual(summary, {
      hasPaymentItems: true,
      allPaid: false,
      allWaived: true,
    });
  });

  it("ignores optional payment items", () => {
    const summary = summarizeEnrollmentPaymentStatus(
      [paymentItem("optional-payment", false), paymentItem("required-payment")],
      [
        instance("required-payment", {
          status: "completed",
          paymentStatus: "paid",
        }),
      ],
    );

    assert.equal(summary.allPaid, true);
  });
});
