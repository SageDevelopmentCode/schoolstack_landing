import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import type {
  CommitteeJoinRequestStatus,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "./types";

export type ResolvedParentGuardian = {
  id: string | null;
  displayName: string;
  email: string;
};

export async function resolveParentGuardianForOrg(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  fallbackEmail = "",
): Promise<ResolvedParentGuardian> {
  const { data: guardian, error } = await supabase
    .from("guardians")
    .select("id, first_name, last_name, email")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const displayName = guardian
    ? [guardian.first_name, guardian.last_name].filter(Boolean).join(" ").trim() ||
      String(guardian.email ?? fallbackEmail)
  : fallbackEmail || "Parent";

  return {
    id: guardian?.id ?? null,
    displayName,
    email: String(guardian?.email ?? fallbackEmail).trim(),
  };
}

export async function listBrowsableCommitteesForParent(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<ParentCommitteeBrowseItem[]> {
  const { data: committees, error } = await supabase
    .from("committees")
    .select("id, name, description, term_label, config, committee_templates(type)")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("name");

  if (error) throw new Error(error.message);
  if (!committees?.length) return [];

  const committeeIds = committees.map((c) => c.id);

  const [dutyRolesRes, requestsRes, membersRes] = await Promise.all([
    supabase
      .from("committee_duty_roles")
      .select("id, committee_id, title, description, sort_order")
      .in("committee_id", committeeIds)
      .order("sort_order"),
    supabase
      .from("committee_join_requests")
      .select("id, committee_id, status")
      .eq("user_id", userId)
      .in("committee_id", committeeIds)
      .neq("status", "withdrawn")
      .order("created_at", { ascending: false }),
    supabase
      .from("committee_members")
      .select("committee_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("committee_id", committeeIds),
  ]);

  if (dutyRolesRes.error) throw new Error(dutyRolesRes.error.message);
  if (requestsRes.error) throw new Error(requestsRes.error.message);
  if (membersRes.error) throw new Error(membersRes.error.message);

  const rolesByCommittee = new Map<string, { id: string; title: string; description: string }[]>();
  for (const role of dutyRolesRes.data ?? []) {
    const list = rolesByCommittee.get(role.committee_id) ?? [];
    list.push({
      id: role.id,
      title: role.title,
      description: role.description,
    });
    rolesByCommittee.set(role.committee_id, list);
  }

  const requestByCommittee = new Map<string, { id: string; status: CommitteeJoinRequestStatus }>();
  for (const req of requestsRes.data ?? []) {
    if (!requestByCommittee.has(req.committee_id)) {
      requestByCommittee.set(req.committee_id, {
        id: req.id,
        status: req.status as CommitteeJoinRequestStatus,
      });
    }
  }

  const memberCommitteeIds = new Set(
    (membersRes.data ?? []).map((m) => m.committee_id),
  );

  return committees.map((row) => {
    const template = row.committee_templates as unknown as { type: ParentCommitteeBrowseItem["type"] } | null;
    const config = (row.config ?? {}) as { type?: ParentCommitteeBrowseItem["type"] };
    const request = requestByCommittee.get(row.id);

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      termLabel: row.term_label,
      type: template?.type ?? config.type ?? "annual_volunteer",
      dutyRoles: rolesByCommittee.get(row.id) ?? [],
      requestStatus: request?.status ?? null,
      requestId: request?.id ?? null,
      isMember: memberCommitteeIds.has(row.id),
    };
  });
}

export async function listParentCommitteeMemberships(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<ParentCommitteeListItem[]> {
  const { data: members, error } = await supabase
    .from("committee_members")
    .select("committee_id, committees(id, name, description, term_label, config, committee_templates(type))")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  if (!members?.length) return [];

  const committeeIds = members.map((m) => m.committee_id);

  const [tasksRes, eventsRes] = await Promise.all([
    supabase
      .from("committee_tasks")
      .select("committee_id, status")
      .in("committee_id", committeeIds)
      .neq("status", "done"),
    supabase
      .from("committee_events")
      .select("committee_id, title, event_date")
      .in("committee_id", committeeIds)
      .order("event_date"),
  ]);

  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (eventsRes.error) throw new Error(eventsRes.error.message);

  const openTasksByCommittee = new Map<string, number>();
  for (const task of tasksRes.data ?? []) {
    openTasksByCommittee.set(
      task.committee_id,
      (openTasksByCommittee.get(task.committee_id) ?? 0) + 1,
    );
  }

  const nextEventByCommittee = new Map<string, string>();
  for (const event of eventsRes.data ?? []) {
    if (!nextEventByCommittee.has(event.committee_id)) {
      nextEventByCommittee.set(event.committee_id, event.title);
    }
  }

  return members.map((member) => {
    const committee = member.committees as unknown as {
      id: string;
      name: string;
      description: string;
      term_label: string;
      config: { type?: ParentCommitteeListItem["type"] } | null;
      committee_templates: { type: ParentCommitteeListItem["type"] } | null;
    };

    return {
      id: committee.id,
      name: committee.name,
      description: committee.description,
      termLabel: committee.term_label,
      type:
        committee.committee_templates?.type ??
        committee.config?.type ??
        "annual_volunteer",
      openTaskCount: openTasksByCommittee.get(member.committee_id) ?? 0,
      nextEventTitle: nextEventByCommittee.get(member.committee_id) ?? null,
    };
  });
}

export async function getParentCommitteeWorkspace(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  committeeId: string,
) {
  const { data: member, error } = await supabase
    .from("committee_members")
    .select("id")
    .eq("committee_id", committeeId)
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!member) {
    throw new Error("You do not have access to this committee workspace.");
  }

  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found.");
  return committee;
}
