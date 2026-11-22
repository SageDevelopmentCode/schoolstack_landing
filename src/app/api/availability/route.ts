import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiError } from "@/lib/api/route-errors";
import { SCHEDULER_TIMEZONE, sortDemoTimeSlots, todayKey } from "@/lib/demo-scheduler";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/availability";

/** PostgREST caps each response (1000 rows by default), so read open slots page by page. */
const SLOT_PAGE_SIZE = 1000;
const MAX_SLOT_PAGES = 20;

type SlotRow = { date: string; time_slot: string };

async function fetchOpenSlots(
  supabase: ReturnType<typeof createClient>,
  fromDate: string,
): Promise<{ data: SlotRow[]; error: unknown }> {
  const rows: SlotRow[] = [];
  for (let page = 0; page < MAX_SLOT_PAGES; page++) {
    const from = page * SLOT_PAGE_SIZE;
    const { data, error } = await supabase
      .from("demo_availability_slots")
      .select("date, time_slot")
      .gte("date", fromDate)
      .order("date")
      .order("time_slot")
      .order("id")
      .range(from, from + SLOT_PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...((data ?? []) as SlotRow[]));
    if (!data || data.length < SLOT_PAGE_SIZE) break;
  }
  return { data: rows, error: null };
}

export async function GET(request: Request) {
  const today = todayKey();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: openSlots, error: slotsError } = await fetchOpenSlots(supabase, today);

  if (slotsError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: slotsError,
    });
  }

  if (!openSlots?.length) {
    return NextResponse.json({ slots: {}, schedulerTimezone: SCHEDULER_TIMEZONE });
  }

  const dates = [...new Set(openSlots.map((s) => s.date as string))];

  const { data: bookings, error: bookingsError } = await supabase
    .from("demo_requests")
    .select("scheduled_date, scheduled_time")
    .eq("status", "scheduled")
    .in("scheduled_date", dates);

  if (bookingsError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: bookingsError,
    });
  }

  const booked = new Set(
    (bookings ?? []).map((b) => `${b.scheduled_date}|${b.scheduled_time}`)
  );

  const slots: Record<string, string[]> = {};

  for (const row of openSlots) {
    const date = row.date as string;
    const time = row.time_slot as string;
    if (booked.has(`${date}|${time}`)) continue;
    if (!slots[date]) slots[date] = [];
    slots[date].push(time);
  }

  for (const date of Object.keys(slots)) {
    slots[date] = sortDemoTimeSlots(slots[date]);
  }

  return NextResponse.json({ slots, schedulerTimezone: SCHEDULER_TIMEZONE });
}
