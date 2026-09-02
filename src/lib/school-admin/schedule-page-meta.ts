import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countAdmissionsAvailabilitySlotsInMonth,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { countObservationDaysInMonth } from "@/lib/admissions/admissions-observation-availability";
import {
  listOrgScheduledVisitsForAdminList,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";

export type SchedulePageMeta = {
  timezone: string;
  monthSlotCount: number;
  monthObservationDayCount: number;
  upcomingVisitCount: number;
};

type AdminSchedulePageMetaRow = {
  month_slot_count?: number | string | null;
  month_observation_day_count?: number | string | null;
  upcoming_visit_count?: number | string | null;
};

export function parseAdminSchedulePageMetaRow(
  row: AdminSchedulePageMetaRow | null,
): Omit<SchedulePageMeta, "timezone"> | null {
  if (!row) return null;

  return {
    monthSlotCount: Number(row.month_slot_count ?? 0),
    monthObservationDayCount: Number(row.month_observation_day_count ?? 0),
    upcomingVisitCount: Number(row.upcoming_visit_count ?? 0),
  };
}

export async function fetchSchedulePageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
  year: number,
  month: number,
): Promise<Omit<SchedulePageMeta, "timezone"> | null> {
  const { data, error } = await supabase.rpc("admin_schedule_page_meta", {
    p_organization_id: organizationId,
    p_year: year,
    p_month: month,
  });

  if (error) return null;

  return parseAdminSchedulePageMetaRow(
    (data ?? null) as AdminSchedulePageMetaRow | null,
  );
}

async function fetchSchedulePageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
  timezone: string,
): Promise<Omit<SchedulePageMeta, "timezone">> {
  const { year, month } = todayMonthYearInTimezone(timezone);
  const [monthSlotCount, monthObservationDayCount, visits] = await Promise.all([
    countAdmissionsAvailabilitySlotsInMonth(supabase, organizationId, year, month),
    countObservationDaysInMonth(supabase, organizationId, year, month),
    listOrgScheduledVisitsForAdminList(supabase, organizationId),
  ]);

  return {
    monthSlotCount,
    monthObservationDayCount,
    upcomingVisitCount: visits.filter((visit) => visit.timing === "upcoming").length,
  };
}

export async function fetchSchedulePageMeta(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<SchedulePageMeta> {
  const timezone = await getOrganizationTimezone(supabase, organizationId);
  const { year, month } = todayMonthYearInTimezone(timezone);

  const fromRpc = await fetchSchedulePageMetaFromRpc(
    supabase,
    organizationId,
    year,
    month,
  );

  if (fromRpc) {
    return {
      timezone,
      ...fromRpc,
    };
  }

  const fallback = await fetchSchedulePageMetaFallback(
    supabase,
    organizationId,
    timezone,
  );

  return {
    timezone,
    ...fallback,
  };
}

export function upcomingVisitCountFromVisits(visits: AdminScheduledVisit[]): number {
  return visits.filter((visit) => visit.timing === "upcoming").length;
}
