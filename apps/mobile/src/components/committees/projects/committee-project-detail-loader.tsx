import { useEffect, useMemo, useState } from 'react';

import { CommitteeProjectDetailSkeleton } from '@/components/committees/projects/committee-project-detail-skeleton';
import { CommitteeProjectDetailScreen } from '@/components/committees/projects/committee-project-detail-screen';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import { mapMemberRow } from '@/lib/school-admin/committees/mappers';
import type { CommitteeMember } from '@/lib/parent/parent-committees-types';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeProjectDetailLoaderProps = {
  organizationId: string;
  committeeId: string;
  projectId: string;
  portalApiNamespace: CommitteePortalApiNamespace;
  currentMemberId?: string;
};

export function CommitteeProjectDetailLoader({
  organizationId,
  committeeId,
  projectId,
  portalApiNamespace,
  currentMemberId,
}: CommitteeProjectDetailLoaderProps) {
  const { isPreview } = usePortalPreview();
  const { reportError } = useMobileErrorReporter(organizationId);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [resolvedMemberId, setResolvedMemberId] = useState<string | undefined>(
    currentMemberId,
  );

  useEffect(() => {
    if (currentMemberId) {
      setResolvedMemberId(currentMemberId);
      return;
    }
    if (portalApiNamespace === 'school-admin') return;

    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const member = members.find(
        (entry) => entry.userId === user.id && entry.status === 'active',
      );
      setResolvedMemberId(member?.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentMemberId, members, portalApiNamespace, supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMembers(true);
      try {
        const mapped = await withCommitteeWorkspaceLoadTimeout(
          (async () => {
            const { data, error } = await supabase
              .from('committee_members')
              .select('*')
              .eq('committee_id', committeeId)
              .order('display_name');
            if (error) throw error;
            return (data ?? []).map((row) => mapMemberRow(row));
          })(),
        );
        if (!cancelled) {
          setMembers(mapped);
        }
      } catch (err) {
        const operation = isCommitteeWorkspaceLoadTimeoutError(err)
          ? 'committees.projects.members_load_timeout'
          : 'committees.projects.members_load';
        reportError(operation, err, {
          entityType: 'committee',
          entityId: committeeId,
        });
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committeeId, reportError, supabase]);

  const readOnly =
    portalApiNamespace === 'school-admin'
      ? isPreview
      : isPreview || !resolvedMemberId;

  if (loadingMembers) {
    return <CommitteeProjectDetailSkeleton />;
  }

  return (
    <CommitteeProjectDetailScreen
      organizationId={organizationId}
      committeeId={committeeId}
      projectId={projectId}
      supabase={supabase}
      members={members}
      readOnly={readOnly}
      portalApiNamespace={portalApiNamespace}
      currentMemberId={resolvedMemberId}
    />
  );
}
