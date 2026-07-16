import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { applicationStatusLabel } from "@/lib/admissions/application-status-ui";
import {
  type ApplicationDecisionAction,
  type ApplicationStatus,
  isApplicationStatus,
} from "@/lib/admissions/application-status-transitions";

const NON_RESTORABLE_STATUSES = new Set<ApplicationStatus>([
  "draft",
  "declined",
  "withdrawn",
]);

function isRestorableStatus(value: string): value is ApplicationStatus {
  return isApplicationStatus(value) && !NON_RESTORABLE_STATUSES.has(value);
}

export function buildWithdrawalRestoreAction(
  restoreStatus: ApplicationStatus,
): ApplicationDecisionAction {
  return {
    status: restoreStatus,
    label: `Restore to ${applicationStatusLabel(restoreStatus)}`,
    variant: "primary",
  };
}

export function activitySummaryForWithdrawalRestore(
  restoreStatus: ApplicationStatus,
): string {
  return `Application restored from withdrawal to ${applicationStatusLabel(restoreStatus)}`;
}

export async function resolveWithdrawalRestoreStatus(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<ApplicationStatus | null> {
  const { data: withdrawalEvent, error: eventError } = await supabase
    .from("activity_events")
    .select("metadata")
    .eq("entity_type", "application")
    .eq("entity_id", applicationId)
    .eq("action", ACTIVITY_ACTIONS.APPLICATION_WITHDRAWN)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) throw eventError;

  const fromStatus = withdrawalEvent?.metadata?.fromStatus;
  if (typeof fromStatus === "string" && isRestorableStatus(fromStatus)) {
    return fromStatus;
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("submitted_at")
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError) throw applicationError;
  if (!application) return null;

  return application.submitted_at ? "submitted" : "accepted";
}
