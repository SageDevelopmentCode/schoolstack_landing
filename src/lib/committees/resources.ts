import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import {
  deleteCommitteeResourceFile,
} from "./resource-file-storage";
import { mapResourceRow, type CommitteeResourceRow } from "./mappers";
import type { CommitteeResource, CommitteeResourceType } from "./types";

export type CreateResourceInput = {
  title: string;
  type?: CommitteeResourceType;
  url?: string;
  storagePath?: string;
  fileName?: string;
  description?: string;
  allowedDutyRoleIds?: string[];
};

export async function createResource(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateResourceInput,
): Promise<CommitteeResource> {
  const { data, error } = await supabase
    .from("committee_resources")
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      resource_type: input.type ?? "link",
      url: input.url ?? null,
      storage_path: input.storagePath ?? null,
      file_name: input.fileName ?? null,
      description: input.description ?? null,
      allowed_duty_role_ids: input.allowedDutyRoleIds ?? [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapResourceRow(data as CommitteeResourceRow);
}

export type UpdateResourceInput = {
  title?: string;
  type?: CommitteeResourceType;
  url?: string | null;
  storagePath?: string | null;
  fileName?: string | null;
  description?: string | null;
  allowedDutyRoleIds?: string[];
};

export async function updateResource(
  supabase: SupabaseClient,
  resourceId: string,
  input: UpdateResourceInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.type !== undefined) patch.resource_type = input.type;
  if (input.url !== undefined) patch.url = input.url;
  if (input.storagePath !== undefined) patch.storage_path = input.storagePath;
  if (input.fileName !== undefined) patch.file_name = input.fileName;
  if (input.description !== undefined) patch.description = input.description;
  if (input.allowedDutyRoleIds !== undefined) {
    patch.allowed_duty_role_ids = input.allowedDutyRoleIds;
  }

  const { error } = await supabase
    .from("committee_resources")
    .update(patch)
    .eq("id", resourceId);

  if (error) throw new Error(error.message);
}

export async function deleteResource(
  supabase: SupabaseClient,
  resourceId: string,
): Promise<void> {
  const { data: row, error: fetchError } = await supabase
    .from("committee_resources")
    .select("storage_path")
    .eq("id", resourceId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("committee_resources")
    .delete()
    .eq("id", resourceId);

  if (error) throw new Error(error.message);

  const storagePath = (row as { storage_path?: string | null } | null)?.storage_path;
  if (storagePath) {
    try {
      await deleteCommitteeResourceFile(supabase, storagePath);
    } catch {
      // Row is already deleted; orphaned storage is acceptable.
    }
  }
}

export async function refreshCommitteeAfterResourceChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
