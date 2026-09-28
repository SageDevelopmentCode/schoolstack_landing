import type { SupabaseClient } from "@supabase/supabase-js";
import { availabilitySlotKey } from "./admissions-availability";

export type TourBookingMode = "exclusive" | "group";

export async function updateAvailabilitySlotTourSettings(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    date: string;
    timeSlot: string;
    tourBookingMode: TourBookingMode;
    groupCapacity?: number | null;
    groupDayKey?: string | null;
  },
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("admissions_availability_slots")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("date", params.date)
    .eq("time_slot", params.timeSlot)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) {
    throw new Error("Open this time slot before changing tour settings.");
  }

  if (params.tourBookingMode === "exclusive") {
    const { error } = await supabase
      .from("admissions_availability_slots")
      .update({
        tour_booking_mode: "exclusive",
        group_capacity: null,
        group_day_key: null,
      })
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const capacity = params.groupCapacity ?? 0;
  if (capacity <= 0) {
    throw new Error("Group capacity must be at least 1.");
  }

  const { error } = await supabase
    .from("admissions_availability_slots")
    .update({
      tour_booking_mode: "group",
      group_capacity: capacity,
      group_day_key: params.groupDayKey ?? null,
    })
    .eq("id", existing.id);

  if (error) throw error;
}

export async function applyWholeDayGroupTour(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    date: string;
    groupCapacity: number;
  },
): Promise<number> {
  if (params.groupCapacity <= 0) {
    throw new Error("Group capacity must be at least 1.");
  }

  const { data, error } = await supabase
    .from("admissions_availability_slots")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("date", params.date);

  if (error) throw error;
  if (!data?.length) {
    throw new Error("Open at least one time slot on this date first.");
  }

  const { error: updateError } = await supabase
    .from("admissions_availability_slots")
    .update({
      tour_booking_mode: "group",
      group_capacity: params.groupCapacity,
      group_day_key: params.date,
    })
    .eq("organization_id", params.organizationId)
    .eq("date", params.date);

  if (updateError) throw updateError;
  return data.length;
}

export async function clearWholeDayGroupTour(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    date: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("admissions_availability_slots")
    .update({
      tour_booking_mode: "exclusive",
      group_capacity: null,
      group_day_key: null,
    })
    .eq("organization_id", params.organizationId)
    .eq("date", params.date);

  if (error) throw error;
}

export function slotSettingsKey(date: string, timeSlot: string): string {
  return availabilitySlotKey(date, timeSlot);
}
