import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import { mapTaskRow, type CommitteeTaskRow } from "./mappers";
import type { CommitteeTask, CommitteeTaskStatus } from "./types";

export type CreateTaskInput = {
  title: string;
  description?: string;
  group?: string;
  status?: CommitteeTaskStatus;
  assigneeMemberId?: string;
  dueDate?: string;
  attachmentLabel?: string;
};

export async function createTask(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateTaskInput,
): Promise<CommitteeTask> {
  const { data, error } = await supabase
    .from("committee_tasks")
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      description: input.description ?? null,
      group_key: input.group ?? "general",
      status: input.status ?? "open",
      assignee_member_id: input.assigneeMemberId ?? null,
      due_date: input.dueDate ?? null,
      attachment_label: input.attachmentLabel ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTaskRow(data as CommitteeTaskRow, []);
}

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  group?: string;
  status?: CommitteeTaskStatus;
  assigneeMemberId?: string | null;
  dueDate?: string | null;
  attachmentLabel?: string | null;
};

export async function updateTask(
  supabase: SupabaseClient,
  taskId: string,
  input: UpdateTaskInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.group !== undefined) patch.group_key = input.group;
  if (input.status !== undefined) patch.status = input.status;
  if (input.assigneeMemberId !== undefined) {
    patch.assignee_member_id = input.assigneeMemberId;
  }
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;
  if (input.attachmentLabel !== undefined) {
    patch.attachment_label = input.attachmentLabel;
  }

  const { error } = await supabase
    .from("committee_tasks")
    .update(patch)
    .eq("id", taskId);

  if (error) throw new Error(error.message);
}

export async function deleteTask(
  supabase: SupabaseClient,
  taskId: string,
): Promise<void> {
  const { error } = await supabase.from("committee_tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
}

export async function refreshCommitteeAfterTaskChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
