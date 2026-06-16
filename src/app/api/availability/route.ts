import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { todayKey } from "@/lib/demo-scheduler";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
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
    console.error("Availability fetch failed:", slotsError.message);
    return NextResponse.json({ error: slotsError.message }, { status: 500 });
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
    console.error("Bookings fetch failed:", bookingsError.message);
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
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
