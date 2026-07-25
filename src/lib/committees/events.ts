import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import { mapEventRow, type CommitteeEventRow } from "./mappers";
import type { CommitteeEvent, CommitteeEventType } from "./types";

export type CreateEventInput = {
  title: string;
  date: string;
  time?: string;
  type?: CommitteeEventType;
  location?: string;
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapEventRow(data as CommitteeEventRow);
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
}

export async function deleteEvent(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("committee_events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
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
