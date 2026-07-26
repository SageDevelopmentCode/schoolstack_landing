import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import { mapMessageRow, type CommitteeMessageRow } from "./mappers";
import type { CommitteeMessage } from "./types";

export async function listMessages(
  supabase: SupabaseClient,
  committeeId: string,
  members: { id: string; name: string }[],
): Promise<CommitteeMessage[]> {
  const { data, error } = await supabase
    .from("committee_messages")
    .select("*")
    .eq("committee_id", committeeId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as CommitteeMessageRow[]).map((row) =>
    mapMessageRow(row, members.map((m) => ({ ...m, committeeId: "", organizationId: "", userId: null, guardianId: null, staffMemberId: null, email: "", role: "member" as const, status: "active" as const }))),
  );
}

export async function postMessage(
  supabase: SupabaseClient,
  committeeId: string,
  body: string,
  senderMemberId?: string,
): Promise<CommitteeMessage> {
  const { data, error } = await supabase
    .from("committee_messages")
    .insert({
      committee_id: committeeId,
      sender_member_id: senderMemberId ?? null,
      body: body.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapMessageRow(data as CommitteeMessageRow, []);
}

export async function refreshCommitteeAfterMessageChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
