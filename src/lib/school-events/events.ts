import type { SupabaseClient } from "@supabase/supabase-js";
import { mapOrganizationEventRow, type OrganizationEventRow } from "./mappers";
import type { OrganizationEvent, SchoolEventType } from "./types";

export type CreateOrganizationEventInput = {
  title: string;
  date: string;
  time?: string;
  isAllDay?: boolean;
  type?: SchoolEventType;
  location?: string;
  description?: string;
};

export type UpdateOrganizationEventInput = {
  title?: string;
  date?: string;
  time?: string | null;
  isAllDay?: boolean;
  type?: SchoolEventType;
  location?: string | null;
  description?: string | null;
};

function sortEvents(events: OrganizationEvent[]): OrganizationEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.sortOrder - b.sortOrder;
  });
}

export function groupOrganizationEventsByDate(
  events: OrganizationEvent[],
): Map<string, OrganizationEvent[]> {
  const map = new Map<string, OrganizationEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
  }
  return map;
}

export async function listEventsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  },
): Promise<OrganizationEvent[]> {
  let query = supabase
    .from("organization_events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (options?.startDate) {
    query = query.gte("event_date", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("event_date", options.endDate);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return sortEvents((data as OrganizationEventRow[]).map(mapOrganizationEventRow));
}

export async function listUpcomingEventsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  limit = 5,
): Promise<OrganizationEvent[]> {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return listEventsForOrg(supabase, organizationId, {
    startDate: todayKey,
    limit,
  });
}

export async function createOrganizationEvent(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateOrganizationEventInput,
): Promise<OrganizationEvent> {
  const isAllDay = input.isAllDay ?? !input.time;

  const { data, error } = await supabase
    .from("organization_events")
    .insert({
      organization_id: organizationId,
      title: input.title.trim(),
      event_date: input.date,
      event_time: isAllDay ? null : (input.time ?? null),
      is_all_day: isAllDay,
      event_type: input.type ?? "other",
      location: input.location ?? null,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapOrganizationEventRow(data as OrganizationEventRow);
}

export async function updateOrganizationEvent(
  supabase: SupabaseClient,
  eventId: string,
  input: UpdateOrganizationEventInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.date !== undefined) patch.event_date = input.date;
  if (input.time !== undefined) patch.event_time = input.time;
  if (input.isAllDay !== undefined) patch.is_all_day = input.isAllDay;
  if (input.type !== undefined) patch.event_type = input.type;
  if (input.location !== undefined) patch.location = input.location;
  if (input.description !== undefined) patch.description = input.description;

  const { error } = await supabase
    .from("organization_events")
    .update(patch)
    .eq("id", eventId);

  if (error) throw new Error(error.message);
}

export async function deleteOrganizationEvent(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("organization_events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}
