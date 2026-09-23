import type { SupabaseClient } from '@supabase/supabase-js';

import {
  COMMITTEE_MESSAGE_FILES_BUCKET,
  COMMITTEE_RESOURCE_FILES_BUCKET,
  COMMITTEE_RESOURCE_SIGNED_URL_TTL_SECONDS,
  MAX_MESSAGE_ATTACHMENTS,
} from '@/lib/parent/committees/constants';
import type {
  CommitteeEvent,
  CommitteeEventType,
  CommitteeResource,
  CommitteeResourceType,
  CommitteeTask,
  CommitteeTaskStatus,
} from '@/lib/parent/parent-committees-types';
import type { StagedMessageFile } from '@/lib/messages/types';

type CommitteeEventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_type: CommitteeEventType;
  location: string | null;
  created_by_member_id: string | null;
};

type CommitteeTaskRow = {
  id: string;
  title: string;
  description: string | null;
  group_key: string;
  status: CommitteeTaskStatus;
  assignee_member_id: string | null;
  due_date: string | null;
  attachment_label: string | null;
};

type CommitteeResourceRow = {
  id: string;
  title: string;
  resource_type: CommitteeResourceType;
  url: string | null;
  storage_path: string | null;
  file_name: string | null;
  description: string | null;
  allowed_duty_role_ids: string[] | null;
};

type CommitteeMessageRow = {
  id: string;
  sender_member_id: string | null;
  body: string;
  created_at: string;
};

function mapEventRow(row: CommitteeEventRow): CommitteeEvent {
  return {
    id: String(row.id),
    title: row.title,
    date: row.event_date,
    time: row.event_time ?? undefined,
    type: row.event_type,
    location: row.location ?? undefined,
    createdByMemberId: row.created_by_member_id ?? undefined,
  };
}

function mapTaskRow(row: CommitteeTaskRow, memberNames: Map<string, string>): CommitteeTask {
  const assigneeId = row.assignee_member_id ?? undefined;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? undefined,
    group: row.group_key,
    status: row.status,
    assigneeId,
    assigneeName: assigneeId ? memberNames.get(assigneeId) : undefined,
    dueDate: row.due_date ?? undefined,
    attachmentLabel: row.attachment_label ?? undefined,
  };
}

function mapResourceRow(row: CommitteeResourceRow): CommitteeResource {
  return {
    id: String(row.id),
    title: row.title,
    type: row.resource_type,
    url: row.url ?? undefined,
    storagePath: row.storage_path ?? undefined,
    fileName: row.file_name ?? undefined,
    description: row.description ?? undefined,
    allowedDutyRoleIds: row.allowed_duty_role_ids ?? undefined,
  };
}

export type CreateEventInput = {
  title: string;
  date: string;
  time?: string;
  type?: CommitteeEventType;
  location?: string;
  createdByMemberId?: string;
};

export async function createCommitteeEvent(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateEventInput,
): Promise<CommitteeEvent> {
  const { data, error } = await supabase
    .from('committee_events')
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      event_date: input.date,
      event_time: input.time ?? null,
      event_type: input.type ?? 'meeting',
      location: input.location ?? null,
      created_by_member_id: input.createdByMemberId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapEventRow(data as CommitteeEventRow);
}

export type UpdateEventInput = {
  title?: string;
  date?: string;
  time?: string | null;
  type?: CommitteeEventType;
  location?: string | null;
};

export async function updateCommitteeEvent(
  supabase: SupabaseClient,
  eventId: string,
  input: UpdateEventInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.date !== undefined) patch.event_date = input.date;
  if (input.time !== undefined) patch.event_time = input.time;
  if (input.type !== undefined) patch.event_type = input.type;
  if (input.location !== undefined) patch.location = input.location;

  const { error } = await supabase.from('committee_events').update(patch).eq('id', eventId);
  if (error) throw new Error(error.message);
}

export async function deleteCommitteeEvent(supabase: SupabaseClient, eventId: string): Promise<void> {
  const { error } = await supabase.from('committee_events').delete().eq('id', eventId);
  if (error) throw new Error(error.message);
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  group?: string;
  status?: CommitteeTaskStatus;
  assigneeMemberId?: string;
  dueDate?: string;
  createdByMemberId?: string;
};

export async function createCommitteeTask(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateTaskInput,
): Promise<CommitteeTask> {
  const { data, error } = await supabase
    .from('committee_tasks')
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      description: input.description ?? null,
      group_key: input.group ?? 'general',
      status: input.status ?? 'open',
      assignee_member_id: input.assigneeMemberId ?? null,
      due_date: input.dueDate ?? null,
      created_by_member_id: input.createdByMemberId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapTaskRow(data as CommitteeTaskRow, new Map());
}

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  group?: string;
  status?: CommitteeTaskStatus;
  assigneeMemberId?: string | null;
  dueDate?: string | null;
};

export async function updateCommitteeTask(
  supabase: SupabaseClient,
  taskId: string,
  input: UpdateTaskInput,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.group !== undefined) patch.group_key = input.group;
  if (input.status !== undefined) patch.status = input.status;
  if (input.assigneeMemberId !== undefined) patch.assignee_member_id = input.assigneeMemberId;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;

  const { error } = await supabase.from('committee_tasks').update(patch).eq('id', taskId);
  if (error) throw new Error(error.message);
}

export async function deleteCommitteeTask(supabase: SupabaseClient, taskId: string): Promise<void> {
  const { error } = await supabase.from('committee_tasks').delete().eq('id', taskId);
  if (error) throw new Error(error.message);
}

export async function createCommitteeResourceSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(COMMITTEE_RESOURCE_FILES_BUCKET)
    .createSignedUrl(storagePath, COMMITTEE_RESOURCE_SIGNED_URL_TTL_SECONDS);

  if (error) throw new Error(error.message);
  if (!data?.signedUrl) throw new Error('Failed to create download link.');
  return data.signedUrl;
}

export type CommitteeResourceOpenTarget = Pick<
  CommitteeResource,
  'url' | 'storagePath' | 'fileName' | 'type'
>;

export async function resolveCommitteeResourceUrl(
  supabase: SupabaseClient,
  resource: CommitteeResourceOpenTarget,
): Promise<string | null> {
  if (resource.url) return resource.url;
  if (!resource.storagePath) return null;
  return createCommitteeResourceSignedUrl(supabase, resource.storagePath);
}

export type CreateResourceInput = {
  title: string;
  type?: CommitteeResourceType;
  url?: string;
  storagePath?: string;
  fileName?: string;
  description?: string;
  createdByMemberId?: string;
};

export async function createCommitteeResource(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateResourceInput,
): Promise<CommitteeResource> {
  const { data, error } = await supabase
    .from('committee_resources')
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      resource_type: input.type ?? 'link',
      url: input.url ?? null,
      storage_path: input.storagePath ?? null,
      file_name: input.fileName ?? null,
      description: input.description ?? null,
      created_by_member_id: input.createdByMemberId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapResourceRow(data as CommitteeResourceRow);
}

function buildMessageAttachmentStoragePath(
  organizationId: string,
  committeeId: string,
  messageId: string,
  fileName: string,
  fileId: string,
): string {
  const safeName = fileName.replace(/[/\\]/g, '_');
  return `${organizationId}/committee-messages/${committeeId}/${messageId}/${fileId}_${safeName}`;
}

export async function postCommitteeMessage(
  supabase: SupabaseClient,
  committeeId: string,
  body: string,
  senderMemberId?: string,
  options?: {
    organizationId: string;
    files?: StagedMessageFile[];
  },
): Promise<{ messageId: string }> {
  const trimmedBody = body.trim();
  const files = options?.files ?? [];

  if (!trimmedBody && files.length === 0) {
    throw new Error('Message cannot be empty.');
  }
  if (files.length > MAX_MESSAGE_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files per message.`);
  }
  if (!options?.organizationId) {
    throw new Error('Organization is required to send committee messages.');
  }

  const { data, error } = await supabase
    .from('committee_messages')
    .insert({
      committee_id: committeeId,
      sender_member_id: senderMemberId ?? null,
      body: trimmedBody || '',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const messageId = String((data as CommitteeMessageRow).id);

  for (const file of files) {
    const fileId = crypto.randomUUID();
    const storagePath = buildMessageAttachmentStoragePath(
      options.organizationId,
      committeeId,
      messageId,
      file.name,
      fileId,
    );

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from(COMMITTEE_MESSAGE_FILES_BUCKET)
      .upload(storagePath, blob, {
        contentType: file.mimeType || undefined,
        upsert: false,
      });

    if (uploadError) {
      await supabase.from('committee_messages').delete().eq('id', messageId);
      throw uploadError;
    }

    const { error: attachmentError } = await supabase.from('committee_message_attachments').insert({
      organization_id: options.organizationId,
      committee_id: committeeId,
      message_id: messageId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.mimeType ?? null,
      size_bytes: file.size ?? null,
    });

    if (attachmentError) {
      await supabase.from('committee_messages').delete().eq('id', messageId);
      throw attachmentError;
    }
  }

  return { messageId };
}
