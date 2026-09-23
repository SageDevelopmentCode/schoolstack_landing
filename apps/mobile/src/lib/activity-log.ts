import type { SupabaseClient, User } from '@supabase/supabase-js';

export const ACTIVITY_ACTIONS = {
  COMMITTEE_TASK_CREATED: 'committee.task.created',
  COMMITTEE_TASK_UPDATED: 'committee.task.updated',
  COMMITTEE_TASK_DELETED: 'committee.task.deleted',
  COMMITTEE_TASK_ASSIGNED: 'committee.task.assigned',
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export type ActorType = 'parent' | 'teacher' | 'school_admin' | 'platform_admin' | 'system';

export type ActivitySurface =
  | 'parent_portal'
  | 'teacher_portal'
  | 'school_admin'
  | 'public_apply'
  | 'login'
  | 'api'
  | 'system';

export type ActivityEventInput = {
  organizationId?: string | null;
  actorType: ActorType;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  surface: ActivitySurface;
  action: ActivityAction | string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
};

function getActorIdentityFromUser(user: User): {
  name: string | null;
  email: string | null;
} {
  const metadata = user.user_metadata ?? {};
  const metadataFullName =
    typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
  const metadataFirstName =
    typeof metadata.first_name === 'string' ? metadata.first_name.trim() : '';
  const metadataLastName =
    typeof metadata.last_name === 'string' ? metadata.last_name.trim() : '';

  const email = user.email?.trim() ?? null;
  const name =
    metadataFullName ||
    [metadataFirstName, metadataLastName].filter(Boolean).join(' ') ||
    null;

  return { name, email };
}

async function resolveActorFieldsFromSession(
  supabase: SupabaseClient,
  actorUserId: string | null,
  actorEmail: string | null,
  actorName: string | null,
): Promise<{ actorUserId: string | null; actorEmail: string | null; actorName: string | null }> {
  const { data: authData } = await supabase.auth.getUser();
  const sessionUser = authData.user;
  if (!sessionUser) {
    return { actorUserId, actorEmail, actorName };
  }

  const identity = getActorIdentityFromUser(sessionUser);

  if (!actorUserId) {
    return {
      actorUserId: sessionUser.id,
      actorEmail: actorEmail ?? identity.email,
      actorName: actorName ?? identity.name,
    };
  }

  if (sessionUser.id !== actorUserId) {
    return { actorUserId, actorEmail, actorName };
  }

  return {
    actorUserId,
    actorEmail: actorEmail ?? identity.email,
    actorName: actorName ?? identity.name,
  };
}

export async function logActivityEvent(
  supabase: SupabaseClient,
  event: ActivityEventInput,
): Promise<string | null> {
  try {
    let actorUserId = event.actorUserId ?? null;
    let actorEmail = event.actorEmail ?? null;
    let actorName = event.actorName?.trim() || null;

    if (event.actorType !== 'system') {
      const resolved = await resolveActorFieldsFromSession(
        supabase,
        actorUserId,
        actorEmail,
        actorName,
      );
      actorUserId = resolved.actorUserId;
      actorEmail = resolved.actorEmail;
      actorName = resolved.actorName;
    }

    const { data, error } = await supabase
      .from('activity_events')
      .insert({
        organization_id: event.organizationId ?? null,
        actor_type: event.actorType,
        actor_user_id: actorUserId,
        actor_email: actorEmail,
        actor_name: actorName,
        surface: event.surface,
        action: event.action,
        entity_type: event.entityType ?? null,
        entity_id: event.entityId ?? null,
        summary: event.summary,
        metadata: event.metadata ?? {},
        severity: event.severity ?? 'info',
      })
      .select('id')
      .single();

    if (error) return null;
    return data?.id ? String(data.id) : null;
  } catch {
    return null;
  }
}
