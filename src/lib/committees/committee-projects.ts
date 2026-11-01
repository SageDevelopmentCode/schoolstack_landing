import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { logCommitteeActivityForPortal } from "@/lib/committees/committee-activity-client";
import { logCommitteeActivityEvent } from "@/lib/committees/committee-activity-log";
import {
  COMMITTEE_PROJECT_SELECT,
  mapCommitteeProjectRow,
  type CommitteeProject,
  type CommitteeProjectRow,
  type CommitteeProjectStatus,
} from "@/lib/committees/committee-project-mappers";
import { committeeProjectDisplayName } from "@/lib/committees/committee-projects-mock";

export type { CommitteeProject, CommitteeProjectStatus } from "@/lib/committees/committee-project-mappers";

export type CreateCommitteeProjectInput = {
  name?: string;
  description?: string;
  status?: CommitteeProjectStatus;
  createdByMemberId?: string | null;
  organizationId: string;
  committeesApiBase?: string;
};

export type UpdateCommitteeProjectInput = {
  name?: string;
  description?: string;
  status?: CommitteeProjectStatus;
};

export type DeleteCommitteeProjectInput = {
  organizationId: string;
  committeesApiBase?: string;
  createdByMemberId?: string | null;
};

async function nextProjectSortOrder(
  supabase: SupabaseClient,
  committeeId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("committee_projects")
    .select("sort_order")
    .eq("committee_id", committeeId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data?.length) return 0;
  return (data[0] as { sort_order: number }).sort_order + 1;
}

export async function listCommitteeProjects(
  supabase: SupabaseClient,
  committeeId: string,
): Promise<CommitteeProject[]> {
  const { data, error } = await supabase
    .from("committee_projects")
    .select(COMMITTEE_PROJECT_SELECT)
    .eq("committee_id", committeeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const projects = ((data ?? []) as CommitteeProjectRow[]).map(mapCommitteeProjectRow);
  if (projects.length === 0) return projects;

  const projectIds = projects.map((project) => project.id);
  const { data: itemRows, error: itemError } = await supabase
    .from("committee_project_supply_items")
    .select("project_id")
    .in("project_id", projectIds);

  if (itemError) throw new Error(itemError.message);

  const counts = new Map<string, number>();
  for (const row of itemRows ?? []) {
    const pid = String((row as { project_id: string }).project_id);
    counts.set(pid, (counts.get(pid) ?? 0) + 1);
  }

  return projects.map((project) => ({
    ...project,
    supplyItemCount: counts.get(project.id) ?? 0,
  }));
}

export async function createCommitteeProject(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateCommitteeProjectInput,
): Promise<CommitteeProject> {
  const sortOrder = await nextProjectSortOrder(supabase, committeeId);
  const name = (input.name ?? "Untitled project").trim() || "Untitled project";

  const { data, error } = await supabase
    .from("committee_projects")
    .insert({
      committee_id: committeeId,
      organization_id: input.organizationId,
      name,
      description: input.description ?? "",
      status: input.status ?? "draft",
      sort_order: sortOrder,
      created_by_member_id: input.createdByMemberId ?? null,
    })
    .select(COMMITTEE_PROJECT_SELECT)
    .single();

  if (error) throw new Error(error.message);

  const project = mapCommitteeProjectRow(data as CommitteeProjectRow);
  project.supplyItemCount = 0;

  if (input.committeesApiBase) {
    logCommitteeActivityForPortal(input.committeesApiBase, {
      organizationId: input.organizationId,
      committeeId,
      action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_CREATED,
      entityType: "committee_project",
      entityId: project.id,
      summary: `Project "${committeeProjectDisplayName(project)}" was created`,
      metadata: { projectName: project.name, projectStatus: project.status },
      actor: input.createdByMemberId
        ? { type: "parent", memberId: input.createdByMemberId }
        : undefined,
    });
  } else {
    logCommitteeActivityEvent(supabase, {
      committeeId,
      action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_CREATED,
      entityType: "committee_project",
      entityId: project.id,
      summary: `Project "${committeeProjectDisplayName(project)}" was created`,
      metadata: { projectName: project.name, projectStatus: project.status },
    });
  }

  return project;
}

export async function updateCommitteeProject(
  supabase: SupabaseClient,
  projectId: string,
  input: UpdateCommitteeProjectInput,
): Promise<CommitteeProject> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_projects")
    .select(COMMITTEE_PROJECT_SELECT)
    .eq("id", projectId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) throw new Error("Project not found.");

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("committee_projects")
    .update(patch)
    .eq("id", projectId)
    .select(COMMITTEE_PROJECT_SELECT)
    .single();

  if (error) throw new Error(error.message);

  const project = mapCommitteeProjectRow(data as CommitteeProjectRow);

  logCommitteeActivityEvent(supabase, {
    committeeId: project.committeeId,
    action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_UPDATED,
    entityType: "committee_project",
    entityId: project.id,
    summary: `Project "${committeeProjectDisplayName(project)}" was updated`,
    metadata: {
      projectName: project.name,
      changes: input,
    },
  });

  return project;
}

export async function deleteCommitteeProject(
  supabase: SupabaseClient,
  projectId: string,
  input?: DeleteCommitteeProjectInput,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_projects")
    .select("committee_id, name")
    .eq("id", projectId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const committeeId = existing?.committee_id ? String(existing.committee_id) : null;
  const projectName = existing?.name ?? null;

  const { error } = await supabase.from("committee_projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);

  if (!committeeId) return;

  const summary = `Project "${String(projectName ?? "Untitled")}" was deleted`;
  const metadata = { projectName };

  if (input?.committeesApiBase) {
    logCommitteeActivityForPortal(input.committeesApiBase, {
      organizationId: input.organizationId,
      committeeId,
      action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_DELETED,
      entityType: "committee_project",
      entityId: projectId,
      summary,
      metadata,
      actor: input.createdByMemberId
        ? { type: "parent", memberId: input.createdByMemberId }
        : undefined,
    });
  } else {
    logCommitteeActivityEvent(supabase, {
      committeeId,
      action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_DELETED,
      entityType: "committee_project",
      entityId: projectId,
      summary,
      metadata,
    });
  }
}
