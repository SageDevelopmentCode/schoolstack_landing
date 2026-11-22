import "server-only";
import type { createAdminClient } from "@/utils/supabase/admin";
import type { DemoMeetingLinkEmailPayload } from "@/lib/emails";

type AdminClient = ReturnType<typeof createAdminClient>;

export const MAX_MEETING_LINK_LENGTH = 2000;

/** A trimmed http(s) URL, or null when the value isn't one. */
export function parseMeetingLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_MEETING_LINK_LENGTH) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** The booking fields the meeting-link email needs, or null when the id is unknown. */
export async function loadDemoRequestForMeetingLink(
  admin: AdminClient,
  id: string,
): Promise<Omit<DemoMeetingLinkEmailPayload, "meetingLink"> | null> {
  const { data, error } = await admin
    .from("demo_requests")
    .select("id, name, email, school_name, scheduled_date, scheduled_time, timezone")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    schoolName: data.school_name,
    scheduledDate: data.scheduled_date,
    scheduledTime: data.scheduled_time,
    visitorTimezone: data.timezone,
  };
}
