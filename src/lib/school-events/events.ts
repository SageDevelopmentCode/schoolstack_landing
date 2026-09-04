import type { SupabaseClient } from "@supabase/supabase-js";
import { mapOrganizationEventRow, type OrganizationEventRow } from "./mappers";
import type { OrganizationEvent, SchoolEventColorKey, SchoolEventType } from "./types";

export type OrganizationEventAudienceScope =
  | { mode: "all" }
  | { mode: "main_portal" }
  | { mode: "program_portal"; programId: string };

export type CreateOrganizationEventInput = {
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  isAllDay?: boolean;
  type?: SchoolEventType;
  colorKey?: SchoolEventColorKey;
  location?: string;
  description?: string;
  programId?: string | null;
};

export type UpdateOrganizationEventInput = {
  title?: string;
  date?: string;
  time?: string | null;
  endTime?: string | null;
  isAllDay?: boolean;
  type?: SchoolEventType;
  colorKey?: SchoolEventColorKey | null;
  location?: string | null;
  description?: string | null;
  programId?: string | null;
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

function applyOrganizationEventAudienceScope<
  T extends {
    is(column: string, value: null): T;
    or(filter: string): T;
  },
>(query: T, scope?: OrganizationEventAudienceScope): T {
  if (!scope || scope.mode === "all") {
    return query;
  }
  if (scope.mode === "main_portal") {
    return query.is("program_id", null);
  }
  return query.or(`program_id.is.null,program_id.eq.${scope.programId}`);
}

export async function listEventsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    audienceScope?: OrganizationEventAudienceScope;
  },
): Promise<OrganizationEvent[]> {
  let query = supabase
    .from("organization_events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });

  query = applyOrganizationEventAudienceScope(query, options?.audienceScope);

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
  audienceScope?: OrganizationEventAudienceScope,
): Promise<OrganizationEvent[]> {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return listEventsForOrg(supabase, organizationId, {
    startDate: todayKey,
    limit,
    audienceScope,
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
      end_time: isAllDay ? null : (input.endTime ?? null),
      is_all_day: isAllDay,
      event_type: input.type ?? "other",
      color_key: input.colorKey ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
      program_id: input.programId ?? null,
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
  if (input.endTime !== undefined) patch.end_time = input.endTime;
  if (input.isAllDay !== undefined) patch.is_all_day = input.isAllDay;
  if (input.type !== undefined) patch.event_type = input.type;
  if (input.colorKey !== undefined) patch.color_key = input.colorKey;
  if (input.location !== undefined) patch.location = input.location;
  if (input.description !== undefined) patch.description = input.description;
  if (input.programId !== undefined) patch.program_id = input.programId;

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
