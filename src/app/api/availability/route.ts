import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiError } from "@/lib/api/route-errors";
import { todayKey } from "@/lib/demo-scheduler";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/availability";

export async function GET(request: Request) {
  const today = todayKey();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: openSlots, error: slotsError } = await supabase
    .from("demo_availability_slots")
    .select("date, time_slot")
    .gte("date", today)
    .order("date")
    .order("time_slot");

  if (slotsError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: slotsError.message,
      cause: slotsError,
    });
  }

  if (!openSlots?.length) {
    return NextResponse.json({ slots: {} });
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
      error: bookingsError.message,
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

  return NextResponse.json({ slots });
}
