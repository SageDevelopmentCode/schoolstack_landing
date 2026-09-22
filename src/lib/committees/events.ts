import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { logCommitteeActivityEvent } from "@/lib/committees/committee-activity-log";
import { getCommittee } from "./committees";
import { mapEventRow, type CommitteeEventRow } from "./mappers";
import type { CommitteeEvent, CommitteeEventType } from "./types";

export type CreateEventInput = {
  title: string;
  date: string;
  time?: string;
  type?: CommitteeEventType;
  location?: string;
  createdByMemberId?: string;
};

export async function createEvent(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateEventInput,
): Promise<CommitteeEvent> {
  const { data, error } = await supabase
    .from("committee_events")
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      event_date: input.date,
      event_time: input.time ?? null,
      event_type: input.type ?? "meeting",
      location: input.location ?? null,
      created_by_member_id: input.createdByMemberId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  const event = mapEventRow(data as CommitteeEventRow);
  logCommitteeActivityEvent(supabase, {
    committeeId,
    action: ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
    entityType: "committee_event",
    entityId: event.id,
    summary: `Calendar event "${event.title}" was added`,
    metadata: { eventTitle: event.title, eventDate: event.date },
    actor: input.createdByMemberId
      ? { type: "parent", memberId: input.createdByMemberId }
      : undefined,
  });
  return event;
}

export type UpdateEventInput = {
  title?: string;
  date?: string;
  time?: string | null;
  type?: CommitteeEventType;
  location?: string | null;
};

export async function updateEvent(
  supabase: SupabaseClient,
  eventId: string,
  input: UpdateEventInput,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_events")
    .select("committee_id, title")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.date !== undefined) patch.event_date = input.date;
  if (input.time !== undefined) patch.event_time = input.time;
  if (input.type !== undefined) patch.event_type = input.type;
  if (input.location !== undefined) patch.location = input.location;

  const { error } = await supabase
    .from("committee_events")
    .update(patch)
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  if (existing?.committee_id) {
    logCommitteeActivityEvent(supabase, {
      committeeId: String(existing.committee_id),
      action: ACTIVITY_ACTIONS.COMMITTEE_EVENT_UPDATED,
      entityType: "committee_event",
      entityId: eventId,
      summary: `Calendar event "${String(existing.title ?? "Untitled")}" was updated`,
      metadata: { eventTitle: existing.title ?? null, changes: input },
    });
  }
}

export async function deleteEvent(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_events")
    .select("committee_id, title")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("committee_events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);

  if (existing?.committee_id) {
    logCommitteeActivityEvent(supabase, {
      committeeId: String(existing.committee_id),
      action: ACTIVITY_ACTIONS.COMMITTEE_EVENT_DELETED,
      entityType: "committee_event",
      entityId: eventId,
      summary: `Calendar event "${String(existing.title ?? "Untitled")}" was deleted`,
      metadata: { eventTitle: existing.title ?? null },
    });
  }
}

export async function refreshCommitteeAfterEventChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
