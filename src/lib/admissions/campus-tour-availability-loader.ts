import type { SupabaseClient } from "@supabase/supabase-js";
import { listAdmissionsAvailabilitySlotRecords } from "./admissions-availability";
import {
  computePublicTourAvailability,
  listCampusTourVisitsForAvailability,
  type PublicTourAvailabilityResult,
} from "./public-tour-availability";

export async function loadCampusTourBookableAvailability(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
  durationMinutes?: number,
): Promise<PublicTourAvailabilityResult> {
  const [slotRecords, visits] = await Promise.all([
    listAdmissionsAvailabilitySlotRecords(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
    listCampusTourVisitsForAvailability(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
  ]);

  return computePublicTourAvailability({
    slotRecords,
    visits,
    startDate,
    endDate,
    durationMinutes,
  });
}
