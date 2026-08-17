import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewlyCompletedEnrollment } from "@/lib/admissions/enrollment-checklist-materialization";
import { sendEnrollmentCompletedNotifications } from "@/lib/admissions/enrollment-completed-notifications";

export function fireEnrollmentCompletedNotificationsIfNeeded(
  admin: SupabaseClient,
  result: NewlyCompletedEnrollment | null | undefined,
): void {
  if (!result) return;

  void sendEnrollmentCompletedNotifications(admin, result);
}
