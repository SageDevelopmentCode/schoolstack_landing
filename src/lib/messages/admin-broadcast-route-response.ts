import type { AdminBroadcastFailure, AdminBroadcastSendResult } from "./admin-broadcast-send";

export const BROADCAST_FAILURE_SAMPLE_LIMIT = 10;

export function summarizeBroadcastFailures(
  failures: AdminBroadcastFailure[],
  limit = BROADCAST_FAILURE_SAMPLE_LIMIT,
): Array<{ name: string; error: string }> {
  return failures.slice(0, limit).map((failure) => ({
    name: failure.name,
    error: failure.error,
  }));
}

export function buildBroadcastPartialFailureMessage(result: AdminBroadcastSendResult): string {
  const total = result.sentCount + result.failedCount;
  return `Bulk message partially failed: ${result.failedCount} of ${total} parents could not be reached.`;
}

export function buildBroadcastTotalFailureBody(result: AdminBroadcastSendResult) {
  return {
    error: "Unable to send messages to the selected parents.",
    code: "broadcast_failed",
    sentCount: result.sentCount,
    failedCount: result.failedCount,
    failures: result.failures,
  };
}
