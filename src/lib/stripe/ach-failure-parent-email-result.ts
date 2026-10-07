import type { OutboundEmailSendResult } from "@/lib/admissions/notification-logging";

export function tuitionAchParentEmailDeliveredFromResults(
  results: PromiseSettledResult<OutboundEmailSendResult>[],
): boolean {
  return results.some(
    (result) =>
      result.status === "fulfilled" &&
      result.value.ok === true &&
      result.value.skipped !== "unsubscribed",
  );
}
