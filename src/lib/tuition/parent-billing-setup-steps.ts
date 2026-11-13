import {
  childFirstNameFromFullName,
  type ParentBillingFamilySummary,
} from "./parent-billing-summary";
import { formatPaymentMethodLabel, type SavedPaymentMethodSummary } from "./payment-methods";
import type { FamilyBillingReadinessState } from "./types";

/*
 * Parent billing "Tuition setup" tracker.
 *
 * Pure view-model derived from data the billing page already loads. It never
 * fetches and never decides behaviour; the page maps each step key onto an
 * existing handler (select tab, open card setup, scroll to the pay button).
 *
 * Copy rule: step text must not contain dollar amounts or reuse page copy that
 * E2E selects by substring ("Payment schedule", "Pay in full", "Action needed",
 * "Estimated annual tuition", "Choose your payment schedule").
 */

export type ParentBillingSetupStepKey = "plan" | "agreements" | "payment_method" | "pay";

export type ParentBillingSetupStepStatus = "done" | "todo" | "waiting";

export type ParentBillingSetupStep = {
  key: ParentBillingSetupStepKey;
  label: string;
  detail: string;
  status: ParentBillingSetupStepStatus;
};

export type ParentBillingSetupProgress = {
  steps: ParentBillingSetupStep[];
  doneCount: number;
  totalCount: number;
  allDone: boolean;
  /** First step the parent can act on now, if any. */
  currentKey: ParentBillingSetupStepKey | null;
  /** First child (by key) that still needs a plan, for the "plan" action. */
  firstPendingChildKey: string | null;
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function buildParentBillingSetupSteps(input: {
  familySummary: ParentBillingFamilySummary;
  readinessState: FamilyBillingReadinessState | null;
  hasAgreements: boolean;
  pendingAgreementCount: number;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  autopayEnabled: boolean;
}): ParentBillingSetupProgress {
  const {
    familySummary,
    readinessState,
    hasAgreements,
    pendingAgreementCount,
    savedPaymentMethod,
    autopayEnabled,
  } = input;

  const pendingChildren = familySummary.children.filter(
    (child) => child.status === "needs_schedule",
  );
  const waitingOnSchool =
    pendingChildren.length === 0 &&
    (readinessState === "needs_assignment" || readinessState === "no_charges");

  const steps: ParentBillingSetupStep[] = [];

  // 1. Plan
  if (waitingOnSchool) {
    steps.push({
      key: "plan",
      label: "Choose a plan",
      detail: "Your school is still setting up tuition",
      status: "waiting",
    });
  } else if (pendingChildren.length > 0) {
    const names = pendingChildren.map((child) => childFirstNameFromFullName(child.studentName));
    steps.push({
      key: "plan",
      label: "Choose a plan",
      detail:
        familySummary.children.length === 1
          ? "Pick how you'd like to split tuition"
          : `Still needed for ${joinNames(names)}`,
      status: "todo",
    });
  } else {
    steps.push({
      key: "plan",
      label: "Choose a plan",
      detail:
        familySummary.children.length > 1 ? "Confirmed for every student" : "Confirmed",
      status: "done",
    });
  }

  // 2. Agreements (only when the school uses them)
  if (hasAgreements) {
    steps.push({
      key: "agreements",
      label: "Sign agreements",
      detail:
        pendingAgreementCount > 0
          ? `${pendingAgreementCount} waiting for your signature`
          : "All signed",
      status: pendingAgreementCount > 0 ? "todo" : "done",
    });
  }

  // 3. Payment method
  const methodLabel = formatPaymentMethodLabel(savedPaymentMethod);
  steps.push({
    key: "payment_method",
    label: "Add a payment method",
    detail: methodLabel
      ? `${methodLabel} · Autopay ${autopayEnabled ? "on" : "off"}`
      : "Save a card for faster checkout and autopay",
    status: methodLabel ? "done" : "todo",
  });

  // 4. Pay
  const planBlocking = steps[0]!.status !== "done";
  if (familySummary.balanceDueCents > 0) {
    steps.push({
      key: "pay",
      label: "Pay what's due",
      detail: autopayEnabled
        ? "Autopay will cover it on the due date, or pay early"
        : "Your next payment is ready",
      status: "todo",
    });
  } else if (planBlocking) {
    steps.push({
      key: "pay",
      label: "Pay what's due",
      detail: "Opens once tuition charges are ready",
      status: "waiting",
    });
  } else {
    steps.push({
      key: "pay",
      label: "Pay what's due",
      detail: "Nothing due right now",
      status: "done",
    });
  }

  const doneCount = steps.filter((step) => step.status === "done").length;
  const current = steps.find((step) => step.status === "todo") ?? null;

  return {
    steps,
    doneCount,
    totalCount: steps.length,
    allDone: doneCount === steps.length,
    currentKey: current?.key ?? null,
    firstPendingChildKey: pendingChildren[0]?.childKey ?? null,
  };
}
