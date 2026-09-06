import type { SupabaseClient } from "@supabase/supabase-js";

export type ShadowDaySchedulingMode =
  | "whole_day"
  | "grade_targeted"
  | "grade_and_time";

export type AdmissionsOrgSettings = {
  shadowDaySchedulingMode?: ShadowDaySchedulingMode;
  program_parent_portal?: {
    enabled: boolean;
    isolated_program_ids: string[];
  };
};

export const DEFAULT_SHADOW_DAY_SCHEDULING_MODE: ShadowDaySchedulingMode =
  "whole_day";

export const SHADOW_DAY_SCHEDULING_MODE_OPTIONS: ReadonlyArray<{
  value: ShadowDaySchedulingMode;
  label: string;
  description: string;
}> = [
  {
    value: "whole_day",
    label: "Any open school day",
    description:
      "Families pick from open calendar days. No grade or time filtering.",
  },
  {
    value: "grade_targeted",
    label: "Only days open for their grade",
    description:
      "Schools open grade-specific slots. Families only see options matching the applicant's grade.",
  },
  {
    value: "grade_and_time",
    label: "Specific time windows per grade",
    description:
      "Schools open time windows for each grade. Families book a date, time, and grade slot.",
  },
];

export const SHADOW_DAY_SCHEDULING_QUESTION =
  "How should families book shadow days?";

export type ShadowDayAvailabilityImpact = {
  openSlotCount: number;
  bookedVisitCount: number;
  hasData: boolean;
};

export function describeShadowDayModeChangeImpact(
  impact: ShadowDayAvailabilityImpact,
): string {
  if (!impact.hasData) {
    return "No open shadow days or bookings yet. Families will see the new booking screen on their next visit.";
  }

  const parts: string[] = [];
  if (impact.openSlotCount > 0) {
    parts.push(
      `${impact.openSlotCount} open shadow ${impact.openSlotCount === 1 ? "slot" : "slots"}`,
    );
  }
  if (impact.bookedVisitCount > 0) {
    parts.push(
      `${impact.bookedVisitCount} booked shadow ${impact.bookedVisitCount === 1 ? "visit" : "visits"}`,
    );
  }

  const summary = parts.length > 0 ? parts.join(" and ") : "existing shadow data";
  return `${summary} will be kept. Families will see a different booking screen. Grade-specific slots may need to be reconfigured in the school schedule.`;
}

export async function getShadowDayAvailabilityImpact(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ShadowDayAvailabilityImpact> {
  const [{ count: openSlotCount, error: slotError }, { count: bookedVisitCount, error: visitError }] =
    await Promise.all([
      supabase
        .from("admissions_observation_slots")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabase
        .from("admissions_scheduled_visit_days")
        .select("id, admissions_scheduled_visits!inner(action_type, status)", {
          count: "exact",
          head: true,
        })
        .eq("organization_id", organizationId)
        .eq("admissions_scheduled_visits.action_type", "schedule_observation_day")
        .eq("admissions_scheduled_visits.status", "scheduled"),
    ]);

  if (slotError) throw slotError;
  if (visitError) throw visitError;

  const slots = openSlotCount ?? 0;
  const visits = bookedVisitCount ?? 0;

  return {
    openSlotCount: slots,
    bookedVisitCount: visits,
    hasData: slots > 0 || visits > 0,
  };
}

const SHADOW_DAY_SCHEDULING_MODES = new Set<ShadowDaySchedulingMode>([
  "whole_day",
  "grade_targeted",
  "grade_and_time",
]);

export function parseAdmissionsOrgSettings(
  raw: unknown,
): AdmissionsOrgSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const settings: AdmissionsOrgSettings = {};

  if (
    typeof record.shadowDaySchedulingMode === "string" &&
    SHADOW_DAY_SCHEDULING_MODES.has(
      record.shadowDaySchedulingMode as ShadowDaySchedulingMode,
    )
  ) {
    settings.shadowDaySchedulingMode =
      record.shadowDaySchedulingMode as ShadowDaySchedulingMode;
  }

  if (isPlainObject(record.program_parent_portal)) {
    const portalRaw = record.program_parent_portal as Record<string, unknown>;
    const isolatedIds = Array.isArray(portalRaw.isolated_program_ids)
      ? portalRaw.isolated_program_ids.filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        )
      : [];

    settings.program_parent_portal = {
      enabled: Boolean(portalRaw.enabled),
      isolated_program_ids: [...new Set(isolatedIds)],
    };
  }

  return settings;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolveShadowDaySchedulingMode(
  settings: AdmissionsOrgSettings,
): ShadowDaySchedulingMode {
  return settings.shadowDaySchedulingMode ?? DEFAULT_SHADOW_DAY_SCHEDULING_MODE;
}

export async function getAdmissionsOrgSettings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdmissionsOrgSettings> {
  const { data, error } = await supabase
    .from("organization_settings")
    .select("admissions")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return parseAdmissionsOrgSettings(data?.admissions);
}

export async function updateShadowDaySchedulingMode(
  supabase: SupabaseClient,
  organizationId: string,
  mode: ShadowDaySchedulingMode,
): Promise<void> {
  const current = await getAdmissionsOrgSettings(supabase, organizationId);
  const next: AdmissionsOrgSettings = {
    ...current,
    shadowDaySchedulingMode: mode,
  };

  const { error } = await supabase
    .from("organization_settings")
    .update({ admissions: next })
    .eq("organization_id", organizationId);

  if (error) throw error;
}
