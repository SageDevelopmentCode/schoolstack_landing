import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SchoolAdminCommitteeJoinRequestsSkeleton } from '@/components/school-admin/committees/school-admin-committee-join-requests-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  approveAdminCommitteeJoinRequest,
  declineAdminCommitteeJoinRequest,
  fetchAdminCommitteeJoinRequests,
} from '@/lib/school-admin-api';
import { getCommitteeJoinRequestDisplayName } from '@/lib/school-admin/committees/join-request-display';
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from '@/lib/school-admin/committees/role-labels';
import type {
  CommitteeDutyRoleSummary,
  CommitteeJoinRequest,
  CommitteeRole,
} from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

function formatSubmittedAt(value: string): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function buildDefaultDutyRoleIds(requests: CommitteeJoinRequest[]): Record<string, string> {
  return Object.fromEntries(
    requests.map((request) => [request.id, request.preferredDutyRoleId ?? '']),
  );
}

type SchoolAdminCommitteeJoinRequestsSectionProps = {
  organizationId: string;
  schoolSlug: string;
  committeeId?: string;
  committeeDutyRoles?: CommitteeDutyRoleSummary[];
  compact?: boolean;
  embedded?: boolean;
  refreshKey?: number;
  onChanged?: () => void;
};

export function SchoolAdminCommitteeJoinRequestsSection({
  organizationId,
  schoolSlug,
  committeeId,
  committeeDutyRoles,
  compact = false,
  embedded = false,
  refreshKey = 0,
  onChanged,
}: SchoolAdminCommitteeJoinRequestsSectionProps) {
  const theme = useParentTheme();
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [requests, setRequests] = useState<CommitteeJoinRequest[]>([]);
  const [dutyRolesByCommitteeId, setDutyRolesByCommitteeId] = useState<
    Record<string, CommitteeDutyRoleSummary[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, CommitteeRole>>({});
  const [assignDutyRoleIds, setAssignDutyRoleIds] = useState<Record<string, string>>({});

  const applyRequestsResponse = useCallback(
    (
      nextRequests: CommitteeJoinRequest[],
      nextDutyRolesByCommitteeId?: Record<string, CommitteeDutyRoleSummary[]>,
    ) => {
      setRequests(nextRequests);
      setAssignDutyRoleIds(buildDefaultDutyRoleIds(nextRequests));
      if (nextDutyRolesByCommitteeId) {
        setDutyRolesByCommitteeId(nextDutyRolesByCommitteeId);
      }
    },
    [],
  );

  const reloadRequests = useCallback(async () => {
    try {
      const response = await fetchAdminCommitteeJoinRequests(organizationId, {
        status: 'pending',
        committeeId,
      });
      applyRequestsResponse(
        response.requests,
        committeeDutyRoles ? undefined : response.dutyRolesByCommitteeId,
      );
    } catch (error) {
      reportError('committees.join_requests.load', error);
      setRequests([]);
      setAssignDutyRoleIds({});
    }
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId, reportError]);

  useEffect(() => {
    setHasLoaded(false);
    setLoading(true);
  }, [committeeId, organizationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetchAdminCommitteeJoinRequests(organizationId, {
          status: 'pending',
          committeeId,
        });
        if (!cancelled) {
          applyRequestsResponse(
            response.requests,
            committeeDutyRoles ? undefined : response.dutyRolesByCommitteeId,
          );
        }
      } catch (error) {
        reportError('committees.join_requests.load', error);
        if (!cancelled) {
          setRequests([]);
          setAssignDutyRoleIds({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyRequestsResponse, committeeDutyRoles, committeeId, organizationId, reportError]);

  useEffect(() => {
    if (refreshKey === 0 || !hasLoaded) return;
    void reloadRequests();
  }, [hasLoaded, refreshKey, reloadRequests]);

  const sectionTitle = compact ? 'Pending requests' : 'Join requests';

  const resolveDutyRoles = useCallback(
    (request: CommitteeJoinRequest): CommitteeDutyRoleSummary[] => {
      if (committeeDutyRoles) return committeeDutyRoles;
      return dutyRolesByCommitteeId[request.committeeId] ?? [];
    },
    [committeeDutyRoles, dutyRolesByCommitteeId],
  );

  const handleApprove = async (request: CommitteeJoinRequest) => {
    setActingId(request.id);
    try {
      const selectedDutyRoleId = assignDutyRoleIds[request.id] ?? '';
      await approveAdminCommitteeJoinRequest(request.id, {
        organizationId,
        schoolSlug,
        memberRole: memberRoles[request.id] ?? 'member',
        assignDutyRoleId: selectedDutyRoleId || null,
      });
      await reloadRequests();
      onChanged?.();
    } catch (error) {
      reportError('committees.join_requests.approve', error, {
        entityType: 'committee_join_request',
        entityId: request.id,
      });
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (request: CommitteeJoinRequest) => {
    setActingId(request.id);
    try {
      await declineAdminCommitteeJoinRequest(request.id, {
        organizationId,
        schoolSlug,
      });
      await reloadRequests();
      onChanged?.();
    } catch (error) {
      reportError('committees.join_requests.decline', error, {
        entityType: 'committee_join_request',
        entityId: request.id,
      });
    } finally {
      setActingId(null);
    }
  };

  if (loading && !hasLoaded) {
    return (
      <SchoolAdminCommitteeJoinRequestsSkeleton
        compact={compact}
        hideTitle={embedded}
      />
    );
  }

  if (requests.length === 0) {
    if (compact) return null;
    if (embedded) {
      return (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No pending requests right now.
        </Text>
      );
    }
    return (
      <StoryDetailSection title={sectionTitle}>
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No pending requests right now.</Text>
      </StoryDetailSection>
    );
  }

  const requestCards = (
    <View style={styles.list}>
      {requests.map((request) => {
          const busy = actingId === request.id;
          const requesterName = getCommitteeJoinRequestDisplayName(request);
          const requesterBadge =
            request.requesterType === 'staff'
              ? 'Staff'
              : request.requesterType === 'parent'
                ? 'Parent'
                : null;
          const dutyRoles = resolveDutyRoles(request);
          const selectedAccessLevel = memberRoles[request.id] ?? 'member';
          const selectedDutyRoleId = assignDutyRoleIds[request.id] ?? '';

          return (
            <StoryCard key={request.id} compact style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={[styles.requesterName, { color: theme.ink }]}>{requesterName}</Text>
                {requesterBadge ? <StoryChip tone="info" label={requesterBadge} /> : null}
              </View>
              <Text style={[styles.requestMeta, { color: theme.muted }]}>
                {request.committeeName ?? 'Committee'}
                {request.grade ? ` · ${request.grade}` : ''}
              </Text>
              {request.preferredDutyRoleTitle ? (
                <Text style={[styles.requestMeta, { color: theme.muted }]}>
                  Preferred role: {request.preferredDutyRoleTitle}
                </Text>
              ) : null}
              {request.note ? (
                <Text style={[styles.requestNote, { color: theme.muted }]}>&ldquo;{request.note}&rdquo;</Text>
              ) : null}
              <Text style={[styles.submittedAt, { color: theme.muted }]}>
                Submitted {formatSubmittedAt(request.createdAt)}
              </Text>

              <View style={styles.pickerBlock}>
                <Text style={[styles.pickerLabel, { color: theme.muted }]}>Access level</Text>
                <View style={styles.pickerRow}>
                  {COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((option) => (
                    <AdmissionsFilterPill
                      key={option.value}
                      active={selectedAccessLevel === option.value}
                      label={option.label}
                      onPress={() =>
                        setMemberRoles((prev) => ({ ...prev, [request.id]: option.value }))
                      }
                    />
                  ))}
                </View>
              </View>

              {dutyRoles.length > 0 ? (
                <View style={styles.pickerBlock}>
                  <Text style={[styles.pickerLabel, { color: theme.muted }]}>Duty role</Text>
                  <View style={styles.pickerRow}>
                    <AdmissionsFilterPill
                      active={!selectedDutyRoleId}
                      label="None"
                      onPress={() =>
                        setAssignDutyRoleIds((prev) => ({ ...prev, [request.id]: '' }))
                      }
                    />
                    {dutyRoles.map((dutyRole) => (
                      <AdmissionsFilterPill
                        key={dutyRole.id}
                        active={selectedDutyRoleId === dutyRole.id}
                        label={dutyRole.title}
                        onPress={() =>
                          setAssignDutyRoleIds((prev) => ({
                            ...prev,
                            [request.id]: dutyRole.id,
                          }))
                        }
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <StoryButton
                  label={busy ? 'Approving…' : 'Approve'}
                  onPress={() => void handleApprove(request)}
                  disabled={busy}
                  style={styles.actionButton}
                />
                <StoryButton
                  label="Decline"
                  variant="outline"
                  onPress={() => void handleDecline(request)}
                  disabled={busy}
                  style={styles.actionButton}
                />
              </View>
            </StoryCard>
          );
        })}
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedBody}>
        <Text style={[styles.pendingCount, { color: theme.muted }]}>
          {requests.length} pending request{requests.length === 1 ? '' : 's'}
        </Text>
        {requestCards}
      </View>
    );
  }

  return (
    <StoryDetailSection title={sectionTitle}>
      {!compact ? (
        <Text style={[styles.pendingCount, { color: theme.muted }]}>
          {requests.length} pending request{requests.length === 1 ? '' : 's'}
        </Text>
      ) : null}
      {requestCards}
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  embeddedBody: {
    gap: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  pendingCount: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  list: {
    gap: Spacing.two,
  },
  requestCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  requesterName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  requestMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  requestNote: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    fontStyle: 'italic',
  },
  submittedAt: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
  },
  pickerBlock: {
    gap: Spacing.one,
  },
  pickerLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
