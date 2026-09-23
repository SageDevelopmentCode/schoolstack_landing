import type { SupabaseClient } from '@supabase/supabase-js';

import {
  assembleCommittee,
  mapDutyRoleRow,
  mapEventRow,
  mapMemberRow,
  mapMessageRow,
  mapResourceRow,
  mapTaskRow,
  mapTemplateRow,
  resolveTemplateConfig,
} from '@/lib/school-admin/committees/mappers';
import type {
  Committee,
  CommitteeListItem,
  CommitteeStatus,
  CommitteeTemplate,
} from '@/lib/parent/parent-committees-types';

export async function listCommittees(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CommitteeListItem[]> {
  const { data: rows, error } = await supabase
    .from('committees')
    .select('id, name, description, status, term_label, template_id, committee_templates(type)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const committeeIds = rows.map((row) => row.id);
  const { data: memberCounts, error: countError } = await supabase
    .from('committee_members')
    .select('committee_id')
    .in('committee_id', committeeIds)
    .eq('status', 'active');

  if (countError) throw new Error(countError.message);

  const countByCommittee = new Map<string, number>();
  for (const member of memberCounts ?? []) {
    countByCommittee.set(
      member.committee_id,
      (countByCommittee.get(member.committee_id) ?? 0) + 1,
    );
  }

  return rows.map((row) => {
    const template = row.committee_templates as unknown as { type: CommitteeListItem['type'] } | null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status as CommitteeStatus,
      termLabel: row.term_label,
      type: template?.type ?? 'annual_volunteer',
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
    .from('committee_templates')
    .select('*')
    .or(`organization_id.is.null,organization_id.eq.${organizationId}`)
    .order('name');

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapTemplateRow(row));
}

export async function getCommittee(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<Committee | null> {
  const { data: row, error } = await supabase
    .from('committees')
    .select('*, committee_templates(type)')
    .eq('id', committeeId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const committeeRow = row as {
    id: string;
    organization_id: string;
    template_id: string | null;
    name: string;
    description: string;
    status: Committee['status'];
    term_label: string;
    term_start: string | null;
    term_end: string | null;
    about_html: string;
    config: Committee['config'] | null;
    committee_templates: { type: Committee['type'] } | null;
  };

  const [membersRes, dutyRolesRes, tasksRes, eventsRes, resourcesRes, messagesRes] =
    await Promise.all([
      supabase
        .from('committee_members')
        .select('*')
        .eq('committee_id', committeeId)
        .order('display_name'),
      supabase
        .from('committee_duty_roles')
        .select('*')
        .eq('committee_id', committeeId)
        .order('sort_order'),
      supabase.from('committee_tasks').select('*').eq('committee_id', committeeId).order('sort_order'),
      supabase.from('committee_events').select('*').eq('committee_id', committeeId).order('event_date'),
      supabase
        .from('committee_resources')
        .select('*')
        .eq('committee_id', committeeId)
        .order('sort_order'),
      supabase
        .from('committee_messages')
        .select('*')
        .eq('committee_id', committeeId)
        .order('created_at', { ascending: true }),
    ]);

  for (const res of [membersRes, dutyRolesRes, tasksRes, eventsRes, resourcesRes, messagesRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const members = (membersRes.data ?? []).map((entry) => mapMemberRow(entry));
  const dutyRoles = (dutyRolesRes.data ?? []).map((entry) => mapDutyRoleRow(entry));
  const tasks = (tasksRes.data ?? []).map((entry) => mapTaskRow(entry, members));
  const events = (eventsRes.data ?? []).map((entry) => mapEventRow(entry, members));
  const resources = (resourcesRes.data ?? []).map((entry) => mapResourceRow(entry, members));
  const messages = (messagesRes.data ?? []).map((entry) => mapMessageRow(entry, members));

  return assembleCommittee(
    {
      id: committeeRow.id,
      organization_id: committeeRow.organization_id,
      template_id: committeeRow.template_id,
      name: committeeRow.name,
      description: committeeRow.description,
      status: committeeRow.status,
      term_label: committeeRow.term_label,
      term_start: committeeRow.term_start,
      term_end: committeeRow.term_end,
      about_html: committeeRow.about_html,
      config: committeeRow.config,
    },
    committeeRow.committee_templates?.type ?? null,
    members,
    dutyRoles,
    tasks,
    events,
    resources,
    messages,
  );
}

export function getDefaultTemplateConfig() {
  return resolveTemplateConfig(null);
}
