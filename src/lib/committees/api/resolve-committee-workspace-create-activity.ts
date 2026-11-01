import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { supplyItemDisplayName, type CoopSupplyListItem } from "@/lib/admissions/program-coop-supply-list-mock";

/** Max age of a workspace entity eligible for post-create activity + email via record-activity. */
export const COMMITTEE_WORKSPACE_CREATE_MAX_AGE_MS = 10 * 60 * 1000;

export const RECORD_COMMITTEE_WORKSPACE_CREATE_ACTIONS: ReadonlySet<string> =
  new Set([
    ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
    ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
    ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
    ACTIVITY_ACTIONS.COMMITTEE_PROJECT_CREATED,
    ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED,
  ]);

export type ResolvedCommitteeWorkspaceCreateActivity = {
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
};

export type ResolveCommitteeWorkspaceCreateActivityResult =
  | { ok: true; activity: ResolvedCommitteeWorkspaceCreateActivity }
  | { ok: false; code: "action_not_allowed" }
  | { ok: false; code: "invalid_entity" }
  | { ok: false; code: "entity_too_old" };

function isCreatedWithinWindow(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) return false;
  return Date.now() - createdMs <= COMMITTEE_WORKSPACE_CREATE_MAX_AGE_MS;
}

export async function resolveCommitteeWorkspaceCreateActivity(
  supabase: SupabaseClient,
  input: {
    committeeId: string;
    action: string;
    entityId: string;
  },
): Promise<ResolveCommitteeWorkspaceCreateActivityResult> {
  const action = input.action.trim();
  const entityId = input.entityId.trim();
  const committeeId = input.committeeId.trim();

  if (!RECORD_COMMITTEE_WORKSPACE_CREATE_ACTIONS.has(action)) {
    return { ok: false, code: "action_not_allowed" };
  }

  if (action === ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED) {
    const { data, error } = await supabase
      .from("committee_tasks")
      .select("id, title, status, created_at")
      .eq("id", entityId)
      .eq("committee_id", committeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, code: "invalid_entity" };
    if (!isCreatedWithinWindow(data.created_at)) {
      return { ok: false, code: "entity_too_old" };
    }

    const title = String(data.title ?? "Untitled");
    return {
      ok: true,
      activity: {
        action,
        entityType: "committee_task",
        entityId,
        summary: `Task "${title}" was created`,
        metadata: {
          taskTitle: title,
          taskStatus: data.status ?? null,
        },
      },
    };
  }

  if (action === ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED) {
    const { data, error } = await supabase
      .from("committee_resources")
      .select("id, title, resource_type, created_at")
      .eq("id", entityId)
      .eq("committee_id", committeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, code: "invalid_entity" };
    if (!isCreatedWithinWindow(data.created_at)) {
      return { ok: false, code: "entity_too_old" };
    }

    const title = String(data.title ?? "Untitled");
    return {
      ok: true,
      activity: {
        action,
        entityType: "committee_resource",
        entityId,
        summary: `Resource "${title}" was added`,
        metadata: {
          resourceTitle: title,
          resourceType: data.resource_type ?? null,
        },
      },
    };
  }

  if (action === ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED) {
    const { data, error } = await supabase
      .from("committee_events")
      .select("id, title, event_date, created_at")
      .eq("id", entityId)
      .eq("committee_id", committeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, code: "invalid_entity" };
    if (!isCreatedWithinWindow(data.created_at)) {
      return { ok: false, code: "entity_too_old" };
    }

    const title = String(data.title ?? "Untitled");
    return {
      ok: true,
      activity: {
        action,
        entityType: "committee_event",
        entityId,
        summary: `Calendar event "${title}" was added`,
        metadata: {
          eventTitle: title,
          eventDate: data.event_date ?? null,
        },
      },
    };
  }

  if (action === ACTIVITY_ACTIONS.COMMITTEE_PROJECT_CREATED) {
    const { data, error } = await supabase
      .from("committee_projects")
      .select("id, name, status, created_at")
      .eq("id", entityId)
      .eq("committee_id", committeeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, code: "invalid_entity" };
    if (!isCreatedWithinWindow(data.created_at)) {
      return { ok: false, code: "entity_too_old" };
    }

    const name = String(data.name ?? "Untitled");
    return {
      ok: true,
      activity: {
        action,
        entityType: "committee_project",
        entityId,
        summary: `Project "${name}" was created`,
        metadata: {
          projectName: name,
          projectStatus: data.status ?? null,
          projectId: entityId,
        },
      },
    };
  }

  if (action === ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED) {
    const { data, error } = await supabase
      .from("committee_project_supply_items")
      .select("id, name, project_id, created_at")
      .eq("id", entityId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, code: "invalid_entity" };

    const projectId = String(data.project_id);
    const { data: project, error: projectError } = await supabase
      .from("committee_projects")
      .select("committee_id, name")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) throw projectError;
    if (!project || String(project.committee_id) !== committeeId) {
      return { ok: false, code: "invalid_entity" };
    }
    if (!isCreatedWithinWindow(data.created_at)) {
      return { ok: false, code: "entity_too_old" };
    }

    const itemName = supplyItemDisplayName({
      name: String(data.name ?? ""),
    } as CoopSupplyListItem);
    const projectName = String(project.name ?? "Untitled");
    return {
      ok: true,
      activity: {
        action,
        entityType: "committee_project_supply_item",
        entityId,
        summary: `Supply item "${itemName}" was added`,
        metadata: {
          projectId,
          projectName,
          supplyItemName: itemName,
        },
      },
    };
  }

  return { ok: false, code: "action_not_allowed" };
}
