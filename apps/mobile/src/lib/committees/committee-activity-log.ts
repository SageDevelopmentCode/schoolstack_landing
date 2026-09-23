import type { SupabaseClient } from '@supabase/supabase-js';

import {
  logActivityEvent,
  type ActivityAction,
  type ActorType,
} from '@/lib/activity-log';

export type CommitteeActivityActor = {
  type: Extract<ActorType, 'school_admin' | 'parent'>;
  userId?: string | null;
  name?: string | null;
  memberId?: string | null;
};

export type LogCommitteeActivityInput = {
  committeeId: string;
  organizationId?: string;
  committeeName?: string;
  action: ActivityAction | string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
  actor?: CommitteeActivityActor;
};

type CommitteeContext = {
  organizationId: string;
  committeeName: string;
};

const committeeContextCache = new Map<string, Promise<CommitteeContext | null>>();

async function resolveCommitteeContext(
  supabase: SupabaseClient,
  committeeId: string,
): Promise<CommitteeContext | null> {
  const cached = committeeContextCache.get(committeeId);
  if (cached) return cached;

  const promise = (async () => {
    const { data, error } = await supabase
      .from('committees')
      .select('organization_id, name')
      .eq('id', committeeId)
      .maybeSingle();

    if (error || !data?.organization_id) return null;
    return {
      organizationId: String(data.organization_id),
      committeeName: String(data.name ?? 'Committee'),
    };
  })();

  committeeContextCache.set(committeeId, promise);
  return promise;
}

export function logCommitteeActivityEvent(
  supabase: SupabaseClient,
  input: LogCommitteeActivityInput,
): void {
  void (async () => {
    try {
      let organizationId = input.organizationId;
      let committeeName = input.committeeName;

      if (!organizationId || !committeeName) {
        const context = await resolveCommitteeContext(supabase, input.committeeId);
        if (!context) return;
        organizationId = organizationId ?? context.organizationId;
        committeeName = committeeName ?? context.committeeName;
      }

      const actorType = input.actor?.type ?? 'school_admin';

      await logActivityEvent(supabase, {
        organizationId,
        actorType,
        actorUserId: input.actor?.userId ?? null,
        actorName: input.actor?.name ?? null,
        surface: actorType === 'parent' ? 'parent_portal' : 'school_admin',
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: {
          ...(input.metadata ?? {}),
          committeeId: input.committeeId,
          committeeName,
          actorMemberId: input.actor?.memberId ?? null,
        },
      });
    } catch {
      // Activity logging is best-effort and must not block committee actions.
    }
  })();
}
