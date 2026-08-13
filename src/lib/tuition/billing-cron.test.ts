import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authorizeTuitionBillingCronRequest,
  runTuitionBillingCron,
} from "./billing-cron";
import type { AutopayLineItem } from "./autopay-cron-report";

describe("authorizeTuitionBillingCronRequest", () => {
  it("rejects requests without a bearer token", () => {
    const previous = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-secret";

    try {
      assert.equal(
        authorizeTuitionBillingCronRequest(
          new Request("http://localhost/api/cron/tuition-billing"),
        ),
        false,
      );
    } finally {
      process.env.CRON_SECRET = previous;
    }
  });

  it("accepts requests with the configured bearer token", () => {
    const previous = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-secret";

    try {
      assert.equal(
        authorizeTuitionBillingCronRequest(
          new Request("http://localhost/api/cron/tuition-billing", {
            headers: { authorization: "Bearer test-secret" },
          }),
        ),
        true,
      );
    } finally {
      process.env.CRON_SECRET = previous;
    }
  });
});

describe("runTuitionBillingCron", () => {
  it("aggregates per-organization billing cron work", async () => {
    const calls: string[] = [];
    let notifiedPayload: Record<string, unknown> | null = null;
    const autopayLine: AutopayLineItem = {
      organizationSlug: "rooted-meadows",
      familyId: "family-1",
      familyLabel: "Cecilia family",
      chargeId: "charge-1",
      chargeLabel: "August tuition",
      amountCents: 72000,
      outcome: "charged",
    };

    const summary = await runTuitionBillingCron({} as never, {
      listLiveOrganizationIds: async () => ["org-1", "org-2"],
      getTuitionOrgSettings: async () => ({}),
      markOverdueCharges: async (_admin, organizationId) => {
        calls.push(`overdue:${organizationId}`);
        return organizationId === "org-1" ? 2 : 0;
      },
      sendTuitionDueReminders: async (_admin, organizationId) => {
        calls.push(`reminders:${organizationId}`);
        return organizationId === "org-2" ? 3 : 0;
      },
      applyLateFeesForOrganization: async () => ({ applied: 0, notified: 0 }),
      evaluateRulesForOrganization: async (_admin, organizationId) => {
        calls.push(`rules:${organizationId}`);
        return 1;
      },
      processAutopayForOrganization: async () => ({
        processed: 1,
        failed: 0,
        skipped: 2,
        attempted: 1,
        dueCandidates: 1,
        lines: [autopayLine],
        truncated: false,
      }),
      notifySummary: async (payload) => {
        notifiedPayload = payload;
      },
    });

    assert.deepEqual(calls, [
      "overdue:org-1",
      "reminders:org-1",
      "rules:org-1",
      "overdue:org-2",
      "reminders:org-2",
      "rules:org-2",
    ]);
    assert.equal(summary.organizations, 2);
    assert.equal(summary.overdueCount, 2);
    assert.equal(summary.remindersSent, 3);
    assert.equal(summary.rulesEvaluated, 2);
    assert.equal(summary.lateFeesApplied, 0);
    assert.equal(summary.lateFeesNotified, 0);
    assert.equal(summary.autopayProcessed, 2);
    assert.equal(summary.autopayFailed, 0);
    assert.equal(summary.autopaySkipped, 4);
    assert.equal(summary.autopayDueCandidates, 2);
    assert.equal(summary.autopayLines.length, 2);
    assert.equal(summary.autopayLines[0]?.chargeId, "charge-1");
    const payload = notifiedPayload as Record<string, unknown> | null;
    assert.equal(payload?.autopaySkipped, 4);
    assert.equal(payload?.autopayDueCandidates, 2);
  });
});
