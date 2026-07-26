import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlatformTemplateBySlug, getPlatformTemplateByType, resolveTemplateConfig } from "./templates";
import {
  assembleCommittee,
  mapDutyRoleRow,
  mapEventRow,
  mapMemberRow,
  mapMessageRow,
  mapResourceRow,
  mapTaskRow,
  mapTemplateRow,
  type CommitteeRow,
  type CommitteeTemplateRow,
} from "./mappers";
import type {
  Committee,
  CommitteeListItem,
  CommitteeStatus,
  CommitteeTemplate,
} from "./types";

function throwOnError<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function listCommittees(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CommitteeListItem[]> {
  const { data: rows, error } = await supabase
    .from("committees")
    .select("id, name, description, status, term_label, template_id, committee_templates(type)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const committeeIds = rows.map((r) => r.id);
  const { data: memberCounts, error: countError } = await supabase
    .from("committee_members")
    .select("committee_id")
    .in("committee_id", committeeIds)
    .eq("status", "active");

  if (countError) throw new Error(countError.message);

  const countByCommittee = new Map<string, number>();
  for (const m of memberCounts ?? []) {
    countByCommittee.set(
      m.committee_id,
      (countByCommittee.get(m.committee_id) ?? 0) + 1,
    );
  }

  return rows.map((row) => {
    const template = row.committee_templates as unknown as {
      type: CommitteeListItem["type"];
    } | null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status as CommitteeStatus,
      termLabel: row.term_label,
      type: template?.type ?? "annual_volunteer",
      memberCount: countByCommittee.get(row.id) ?? 0,
      templateId: row.template_id,
    };
  });
}

export async function listCommitteeTemplates(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CommitteeTemplate[]> {
  const { data, error } = await supabase
    .from("committee_templates")
    .select("*")
    .or(`organization_id.is.null,organization_id.eq.${organizationId}`)
    .order("name");

  if (error) throw new Error(error.message);
  return (data as CommitteeTemplateRow[]).map(mapTemplateRow);
}

export async function getCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<Committee | null> {
  const { data: row, error } = await supabase
    .from("committees")
    .select("*, committee_templates(type)")
    .eq("id", committeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const committeeRow = row as CommitteeRow & {
    committee_templates: { type: Committee["type"] } | null;
  };

  const [
    membersRes,
    dutyRolesRes,
    tasksRes,
    eventsRes,
    resourcesRes,
    messagesRes,
  ] = await Promise.all([
    supabase.from("committee_members").select("*").eq("committee_id", committeeId).order("display_name"),
    supabase.from("committee_duty_roles").select("*").eq("committee_id", committeeId).order("sort_order"),
    supabase.from("committee_tasks").select("*").eq("committee_id", committeeId).order("sort_order"),
    supabase.from("committee_events").select("*").eq("committee_id", committeeId).order("event_date"),
    supabase.from("committee_resources").select("*").eq("committee_id", committeeId).order("sort_order"),
    supabase.from("committee_messages").select("*").eq("committee_id", committeeId).order("created_at", { ascending: true }),
  ]);

  for (const res of [membersRes, dutyRolesRes, tasksRes, eventsRes, resourcesRes, messagesRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const members = (membersRes.data ?? []).map((r) => mapMemberRow(r));
  const dutyRoles = (dutyRolesRes.data ?? []).map((r) => mapDutyRoleRow(r));
  const tasks = (tasksRes.data ?? []).map((r) => mapTaskRow(r, members));
  const events = (eventsRes.data ?? []).map((r) => mapEventRow(r));
  const resources = (resourcesRes.data ?? []).map((r) => mapResourceRow(r));
  const messages = (messagesRes.data ?? []).map((r) => mapMessageRow(r, members));

  return assembleCommittee(
    committeeRow,
    committeeRow.committee_templates?.type ?? null,
    members,
    dutyRoles,
    tasks,
    events,
    resources,
    messages,
  );
}

export type CreateCommitteeInput = {
  templateId?: string | null;
  platformSlug?: string;
  name: string;
  description?: string;
  termLabel?: string;
  termStart?: string;
  termEnd?: string;
  aboutHtml?: string;
  status?: CommitteeStatus;
};

export async function createCommitteeFromTemplate(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateCommitteeInput,
): Promise<Committee> {
  let template: CommitteeTemplate | null = null;
  let platformSeed = input.platformSlug
    ? getPlatformTemplateBySlug(input.platformSlug)
    : null;

  if (input.templateId) {
    const { data, error } = await supabase
      .from("committee_templates")
      .select("*")
      .eq("id", input.templateId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) template = mapTemplateRow(data as CommitteeTemplateRow);
  }

  if (!template && !platformSeed) {
    platformSeed = getPlatformTemplateByType("annual_volunteer");
  }

  const config = resolveTemplateConfig(template?.config ?? platformSeed?.config);
  const committeeType = template?.type ?? platformSeed?.type ?? "annual_volunteer";

  const committeeInsert = {
    organization_id: organizationId,
    template_id: input.templateId ?? null,
    name: input.name,
    description: input.description ?? template?.description ?? platformSeed?.description ?? "",
    status: input.status ?? "active",
    term_label: input.termLabel ?? config.defaultTermLabel ?? "",
    term_start: input.termStart ?? null,
    term_end: input.termEnd ?? null,
    about_html: input.aboutHtml ?? "",
    config: { ...config, type: committeeType },
  };

  const committee = throwOnError(
    await supabase.from("committees").insert(committeeInsert).select().single(),
  ) as CommitteeRow;

  const defaultDutyRoles = config.defaultDutyRoles ?? [];

  if (defaultDutyRoles.length > 0) {
    const { error: rolesError } = await supabase.from("committee_duty_roles").insert(
      defaultDutyRoles.map((role, index: number) => ({
        committee_id: committee.id,
        title: role.title,
        description: role.description,
        sort_order: index,
      })),
    );
    if (rolesError) throw new Error(rolesError.message);
  }

  const defaultResources = config.defaultResources ?? [];

  if (defaultResources.length > 0) {
    const { error: resourcesError } = await supabase.from("committee_resources").insert(
      defaultResources.map((resource, index: number) => ({
        committee_id: committee.id,
        title: resource.title,
        resource_type: resource.type,
        url: resource.url ?? null,
        description: resource.description ?? null,
        sort_order: index,
      })),
    );
    if (resourcesError) throw new Error(resourcesError.message);
  }

  const result = await getCommittee(supabase, organizationId, committee.id);
  if (!result) throw new Error("Failed to load created committee");
  return { ...result, type: committeeType };
}

export type UpdateCommitteeInput = {
  name?: string;
  description?: string;
  status?: CommitteeStatus;
  termLabel?: string;
  termStart?: string | null;
  termEnd?: string | null;
  aboutHtml?: string;
};

export async function updateCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
  input: UpdateCommitteeInput,
): Promise<Committee> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.termLabel !== undefined) patch.term_label = input.termLabel;
  if (input.termStart !== undefined) patch.term_start = input.termStart;
  if (input.termEnd !== undefined) patch.term_end = input.termEnd;
  if (input.aboutHtml !== undefined) patch.about_html = input.aboutHtml;

  const { error } = await supabase
    .from("committees")
    .update(patch)
    .eq("id", committeeId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const result = await getCommittee(supabase, organizationId, committeeId);
  if (!result) throw new Error("Committee not found after update");
  return result;
}

export async function archiveCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<Committee> {
  return updateCommittee(supabase, organizationId, committeeId, {
    status: "archived",
  });
}
