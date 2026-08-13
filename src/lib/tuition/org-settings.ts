import type { SupabaseClient } from "@supabase/supabase-js";
import type { TuitionOrgSettings } from "./types";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeOrgSettingsChanges,
  type TuitionActivityOptions,
} from "./tuition-activity";

export const DEFAULT_GRACE_DAYS = 5;
export const DEFAULT_REMINDER_DAYS_BEFORE = 3;
export const DEFAULT_LATE_FEE_DAY_OF_MONTH = 10;

export function parseTuitionOrgSettings(
  raw: unknown,
): TuitionOrgSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const settings: TuitionOrgSettings = {};

  if (typeof record.graceDays === "number" && Number.isFinite(record.graceDays)) {
    settings.graceDays = Math.max(0, Math.floor(record.graceDays));
  }

  if (
    typeof record.lateFeeAmountCents === "number" &&
    Number.isFinite(record.lateFeeAmountCents)
  ) {
    settings.lateFeeAmountCents = Math.max(0, Math.floor(record.lateFeeAmountCents));
  }

  if (
    typeof record.lateFeeDayOfMonth === "number" &&
    Number.isFinite(record.lateFeeDayOfMonth)
  ) {
    settings.lateFeeDayOfMonth = Math.min(
      28,
      Math.max(1, Math.floor(record.lateFeeDayOfMonth)),
    );
  }

  if (typeof record.lateFeeRecurring === "boolean") {
    settings.lateFeeRecurring = record.lateFeeRecurring;
  }

  if (typeof record.lateFeeEnabled === "boolean") {
    settings.lateFeeEnabled = record.lateFeeEnabled;
  }

  if (Array.isArray(record.reminderDaysBefore)) {
    const days = record.reminderDaysBefore
      .filter((value): value is number => typeof value === "number" && value > 0)
      .map((value) => Math.floor(value));
    if (days.length > 0) {
      settings.reminderDaysBefore = days;
    }
  } else if (
    typeof record.reminderDaysBefore === "number" &&
    record.reminderDaysBefore > 0
  ) {
    settings.reminderDaysBefore = [Math.floor(record.reminderDaysBefore)];
  }

  if (Array.isArray(record.adjustmentReasons)) {
    const reasons = record.adjustmentReasons
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    if (reasons.length > 0) {
      settings.adjustmentReasons = reasons;
    }
  }

  return settings;
}

export function resolveTuitionOrgSettings(
  settings: TuitionOrgSettings,
): Required<
  Pick<
    TuitionOrgSettings,
    | "graceDays"
    | "lateFeeAmountCents"
    | "lateFeeDayOfMonth"
    | "lateFeeRecurring"
    | "lateFeeEnabled"
    | "reminderDaysBefore"
  >
> {
  return {
    graceDays: settings.graceDays ?? DEFAULT_GRACE_DAYS,
    lateFeeAmountCents: settings.lateFeeAmountCents ?? 0,
    lateFeeDayOfMonth: settings.lateFeeDayOfMonth ?? DEFAULT_LATE_FEE_DAY_OF_MONTH,
    lateFeeRecurring: settings.lateFeeRecurring ?? true,
    lateFeeEnabled: settings.lateFeeEnabled ?? false,
    reminderDaysBefore:
      settings.reminderDaysBefore && settings.reminderDaysBefore.length > 0
        ? settings.reminderDaysBefore
        : [DEFAULT_REMINDER_DAYS_BEFORE],
  };
}

export function isLateFeeConfigured(settings: TuitionOrgSettings): boolean {
  const resolved = resolveTuitionOrgSettings(settings);
  return resolved.lateFeeEnabled && resolved.lateFeeAmountCents > 0;
}

export async function getTuitionOrgSettings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionOrgSettings> {
  const { data, error } = await supabase
    .from("organization_settings")
    .select("tuition")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return parseTuitionOrgSettings(data?.tuition);
}

export async function updateTuitionOrgSettings(
  supabase: SupabaseClient,
  organizationId: string,
  patch: TuitionOrgSettings,
  options?: TuitionActivityOptions,
): Promise<TuitionOrgSettings> {
  const current = await getTuitionOrgSettings(supabase, organizationId);
  const merged = { ...current, ...patch };

  const { data: updated, error: updateError } = await supabase
    .from("organization_settings")
    .update({ tuition: merged })
    .eq("organization_id", organizationId)
    .select("tuition")
    .maybeSingle();

  if (updateError) throw updateError;
  if (updated) {
    const result = parseTuitionOrgSettings(updated.tuition);
    if (!options?.skip) {
      const changeSummary = summarizeOrgSettingsChanges(current, result);
      void logTuitionActivity(supabase, {
        organizationId,
        action: ACTIVITY_ACTIONS.TUITION_ORG_SETTINGS_UPDATED,
        entityType: "organization_settings",
        entityId: organizationId,
        summary: "Updated tuition settings",
        changeSummary,
        context: options?.context,
      });
    }
    return result;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("organization_settings")
    .insert({
      organization_id: organizationId,
      tuition: merged,
    })
    .select("tuition")
    .single();

  if (insertError) throw insertError;
  const result = parseTuitionOrgSettings(inserted?.tuition);

  if (!options?.skip) {
    const changeSummary = summarizeOrgSettingsChanges(current, result);
    void logTuitionActivity(supabase, {
      organizationId,
      action: ACTIVITY_ACTIONS.TUITION_ORG_SETTINGS_UPDATED,
      entityType: "organization_settings",
      entityId: organizationId,
      summary: "Updated tuition settings",
      changeSummary,
      context: options?.context,
    });
  }

  return result;
}
