import { resolveTemplateConfig } from "./templates";
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
} from "./types";

export type CommitteeRow = {
  id: string;
  organization_id: string;
  template_id: string | null;
  name: string;
  description: string;
  status: Committee["status"];
  term_label: string;
  term_start: string | null;
  term_end: string | null;
  about_html: string;
  config: CommitteeTemplateConfig | null;
};

export type CommitteeTemplateRow = {
  id: string;
  organization_id: string | null;
  slug: string;
  name: string;
  type: CommitteeType;
  description: string;
  config: CommitteeTemplateConfig | null;
};

export type CommitteeMemberRow = {
  id: string;
  committee_id: string;
  organization_id: string;
  user_id: string | null;
  guardian_id: string | null;
  staff_member_id: string | null;
  display_name: string;
  email: string | null;
  phone: string | null;
  role: CommitteeMember["role"];
  grade: string | null;
  bio: string | null;
  term_start: string | null;
  term_end: string | null;
  status: CommitteeMember["status"];
};

export type CommitteeDutyRoleRow = {
  id: string;
  committee_id: string;
  title: string;
  description: string;
  assignee_member_id: string | null;
  sort_order: number;
};

export type CommitteeTaskRow = {
  id: string;
  committee_id: string;
  title: string;
  description: string | null;
  group_key: string;
  status: CommitteeTask["status"];
  assignee_member_id: string | null;
  due_date: string | null;
  attachment_label: string | null;
  sort_order: number;
};

export type CommitteeEventRow = {
  id: string;
  committee_id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_type: CommitteeEvent["type"];
  location: string | null;
  sort_order: number;
};

export type CommitteeResourceRow = {
  id: string;
  committee_id: string;
  title: string;
  resource_type: CommitteeResource["type"];
  url: string | null;
  description: string | null;
  allowed_duty_role_ids: string[];
  sort_order: number;
};

export type CommitteeMessageRow = {
  id: string;
  committee_id: string;
  sender_member_id: string | null;
  body: string;
  created_at: string;
};

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

export function mapMemberRow(row: CommitteeMemberRow): CommitteeMember {
  return {
    id: row.id,
    committeeId: row.committee_id,
    organizationId: row.organization_id,
    userId: row.user_id,
    guardianId: row.guardian_id,
    staffMemberId: row.staff_member_id,
    name: row.display_name,
    email: row.email ?? "",
    phone: row.phone ?? undefined,
    role: row.role,
    grade: row.grade ?? undefined,
    bio: row.bio ?? undefined,
    termStart: row.term_start ?? undefined,
    termEnd: row.term_end ?? undefined,
    status: row.status,
  };
}

export function mapDutyRoleRow(row: CommitteeDutyRoleRow): CommitteeDutyRole {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_member_id ?? undefined,
  };
}

export function mapTaskRow(
  row: CommitteeTaskRow,
  members: CommitteeMember[],
): CommitteeTask {
  const assignee = row.assignee_member_id
    ? members.find((m) => m.id === row.assignee_member_id)
    : undefined;
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
  };
}

export function mapEventRow(row: CommitteeEventRow): CommitteeEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    time: row.event_time ?? undefined,
    type: row.event_type,
    location: row.location ?? undefined,
  };
}

export function mapResourceRow(row: CommitteeResourceRow): CommitteeResource {
  return {
    id: row.id,
    title: row.title,
    type: row.resource_type,
    url: row.url ?? undefined,
    description: row.description ?? undefined,
    allowedDutyRoleIds: row.allowed_duty_role_ids ?? [],
  };
}

export function mapMessageRow(
  row: CommitteeMessageRow,
  members: CommitteeMember[],
): CommitteeMessage {
  const sender = row.sender_member_id
    ? members.find((m) => m.id === row.sender_member_id)
    : undefined;
  const created = new Date(row.created_at);
  const time = created.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return {
    id: row.id,
    senderId: row.sender_member_id ?? "",
    senderName: sender?.name ?? "School Admin",
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
    type: templateType ?? configType ?? "annual_volunteer",
    description: row.description,
    status: row.status,
    termLabel: row.term_label,
    termStart: row.term_start ?? "",
    termEnd: row.term_end ?? "",
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
