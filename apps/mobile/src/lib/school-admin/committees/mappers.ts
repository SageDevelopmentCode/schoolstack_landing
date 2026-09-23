import type {
  Committee,
  CommitteeDutyRole,
  CommitteeEvent,
  CommitteeMember,
  CommitteeMessage,
  CommitteeResource,
  CommitteeTask,
  CommitteeTemplate,
  CommitteeTemplateConfig,
  CommitteeType,
} from '@/lib/parent/parent-committees-types';
import { DEFAULT_COMMITTEE_SECTIONS } from '@/lib/parent/parent-committees-types';

const SCHOOL_ADMIN_ATTRIBUTION = 'School Admin';

type CommitteeRow = {
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
  config: CommitteeTemplateConfig | null;
};

type CommitteeTemplateRow = {
  id: string;
  organization_id: string | null;
  slug: string;
  name: string;
  type: CommitteeType;
  description: string;
  config: CommitteeTemplateConfig | null;
};

export function resolveTemplateConfig(
  config: CommitteeTemplateConfig | null | undefined,
): CommitteeTemplateConfig {
  if (!config?.sections?.length) {
    return { sections: DEFAULT_COMMITTEE_SECTIONS };
  }
  return config;
}

export function mapTemplateRow(row: CommitteeTemplateRow): CommitteeTemplate {
  return {
    id: row.id,
    organizationId: row.organization_id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description,
    config: resolveTemplateConfig(row.config),
  };
}

export function mapMemberRow(row: {
  id: string;
  committee_id: string;
  organization_id: string;
  user_id: string | null;
  guardian_id: string | null;
  staff_member_id: string | null;
  display_name: string;
  email: string | null;
  phone: string | null;
  role: CommitteeMember['role'];
  grade: string | null;
  bio: string | null;
  term_start: string | null;
  term_end: string | null;
  status: CommitteeMember['status'];
}): CommitteeMember {
  return {
    id: row.id,
    committeeId: row.committee_id,
    organizationId: row.organization_id,
    userId: row.user_id,
    guardianId: row.guardian_id,
    staffMemberId: row.staff_member_id,
    name: row.display_name,
    email: row.email ?? '',
    phone: row.phone ?? undefined,
    role: row.role,
    grade: row.grade ?? undefined,
    bio: row.bio ?? undefined,
    termStart: row.term_start ?? undefined,
    termEnd: row.term_end ?? undefined,
    status: row.status,
  };
}

export function mapDutyRoleRow(row: {
  id: string;
  title: string;
  description: string;
  assignee_member_id: string | null;
}): CommitteeDutyRole {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_member_id ?? undefined,
  };
}

function resolveMember(
  memberId: string | null | undefined,
  members: CommitteeMember[],
): CommitteeMember | undefined {
  if (!memberId) return undefined;
  return members.find((member) => member.id === memberId);
}

export function mapTaskRow(
  row: {
    id: string;
    title: string;
    description: string | null;
    group_key: string;
    status: CommitteeTask['status'];
    assignee_member_id: string | null;
    due_date: string | null;
    attachment_label: string | null;
    created_by_member_id: string | null;
  },
  members: CommitteeMember[],
): CommitteeTask {
  const assignee = resolveMember(row.assignee_member_id, members);
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    group: row.group_key,
    status: row.status,
    assigneeId: row.assignee_member_id ?? undefined,
    assigneeName: assignee?.name,
    dueDate: row.due_date ?? undefined,
    attachmentLabel: row.attachment_label ?? undefined,
    createdByMemberId: row.created_by_member_id ?? undefined,
  };
}

export function mapEventRow(
  row: {
    id: string;
    title: string;
    event_date: string;
    event_time: string | null;
    event_type: CommitteeEvent['type'];
    location: string | null;
    created_by_member_id: string | null;
  },
  members: CommitteeMember[],
): CommitteeEvent {
  const creator = resolveMember(row.created_by_member_id, members);
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    time: row.event_time ?? undefined,
    type: row.event_type,
    location: row.location ?? undefined,
    createdByMemberId: row.created_by_member_id ?? undefined,
  };
}

export function mapResourceRow(
  row: {
    id: string;
    title: string;
    resource_type: CommitteeResource['type'];
    url: string | null;
    storage_path: string | null;
    file_name: string | null;
    description: string | null;
    allowed_duty_role_ids: string[] | null;
    created_by_member_id: string | null;
  },
  members: CommitteeMember[],
): CommitteeResource {
  const creator = resolveMember(row.created_by_member_id, members);
  return {
    id: row.id,
    title: row.title,
    type: row.resource_type,
    url: row.url ?? undefined,
    storagePath: row.storage_path ?? undefined,
    fileName: row.file_name ?? undefined,
    description: row.description ?? undefined,
    allowedDutyRoleIds: row.allowed_duty_role_ids ?? [],
    addedBy: creator?.name,
  };
}

export function mapMessageRow(
  row: {
    id: string;
    sender_member_id: string | null;
    body: string;
    created_at: string;
  },
  members: CommitteeMember[],
): CommitteeMessage {
  const sender = resolveMember(row.sender_member_id, members);
  const created = new Date(row.created_at);
  const time = created.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  return {
    id: row.id,
    senderId: row.sender_member_id ?? '',
    senderName: sender?.name ?? SCHOOL_ADMIN_ATTRIBUTION,
    senderRole: sender?.role,
    text: row.body,
    time,
  };
}

export function assembleCommittee(
  row: CommitteeRow,
  templateType: CommitteeType | null,
  members: CommitteeMember[],
  dutyRoles: CommitteeDutyRole[],
  tasks: CommitteeTask[],
  events: CommitteeEvent[],
  resources: CommitteeResource[],
  messages: CommitteeMessage[],
): Committee {
  const config = resolveTemplateConfig(row.config);
  const configType = (row.config as { type?: CommitteeType } | null)?.type;
  return {
    id: row.id,
    organizationId: row.organization_id,
    templateId: row.template_id,
    name: row.name,
    type: templateType ?? configType ?? 'annual_volunteer',
    description: row.description,
    status: row.status,
    termLabel: row.term_label,
    termStart: row.term_start ?? '',
    termEnd: row.term_end ?? '',
    aboutHtml: row.about_html,
    config,
    dutyRoles,
    members,
    resources,
    events,
    tasks,
    messages,
  };
}
