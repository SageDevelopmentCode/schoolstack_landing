import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { errorText } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminFilterChips, AdminRowSkeleton } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { haptic } from '@/lib/haptics';
import type { CommitteeDutyRoleSummary, CommitteeJoinRequest, CommitteeRole } from '@/lib/parent/parent-committees-types';
import { approveAdminCommitteeJoinRequest, declineAdminCommitteeJoinRequest, fetchAdminCommitteeJoinRequests } from '@/lib/school-admin-api';
import { getCommitteeJoinRequestDisplayName } from '@/lib/school-admin/committees/join-request-display';
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from '@/lib/school-admin/committees/role-labels';

function formatSubmittedAt(value: string): string {
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return value;
  }
}

function defaultDutyRoleIds(requests: CommitteeJoinRequest[]): Record<string, string> {
  return Object.fromEntries(requests.map((request) => [request.id, request.preferredDutyRoleId ?? '']));
}

/**
 * Garden join requests (org-wide on the Committees list, or one committee in
 * its workspace). Same fetch / approve / decline calls and
 * `committees.join_requests.*` operations as the Story section; approve and
 * decline now toast (with Retry on failure) and decline confirms first.
 */
export function AdminJoinRequests({
  organizationId,
  schoolSlug,
  committeeId,
  committeeDutyRoles,
  refreshKey = 0,
  onChanged,
  onCountChange,
  hideWhenEmpty = false,
}: {
  organizationId: string;
  schoolSlug: string;
  committeeId?: string;
  committeeDutyRoles?: CommitteeDutyRoleSummary[];
  refreshKey?: number;
  onChanged?: () => void;
  onCountChange?: (count: number) => void;
  hideWhenEmpty?: boolean;
}) {
  const accent = useGardenAccent();
  const action = useAdminAction(organizationId);
  const { reportError } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [requests, setRequests] = useState<CommitteeJoinRequest[]>([]);
  const [dutyRolesByCommitteeId, setDutyRolesByCommitteeId] = useState<Record<string, CommitteeDutyRoleSummary[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, CommitteeRole>>({});
  const [dutyRoleIds, setDutyRoleIds] = useState<Record<string, string>>({});
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const load = useCallback(async () => {
    try {
      const response = await fetchAdminCommitteeJoinRequests(organizationId, { status: 'pending', committeeId });
      setRequests(response.requests);
      setDutyRoleIds(defaultDutyRoleIds(response.requests));
      if (!committeeDutyRoles) setDutyRolesByCommitteeId(response.dutyRolesByCommitteeId);
      onCountChangeRef.current?.(response.requests.length);
    } catch (error) {
      reportError('committees.join_requests.load', error);
      setRequests([]);
      setDutyRoleIds({});
    } finally {
      setLoaded(true);
    }
  }, [committeeDutyRoles, committeeId, organizationId, reportError]);

  useEffect(() => {
    void load();
    // refreshKey re-runs the load after a pull-to-refresh.
  }, [load, refreshKey]);

  const dutyRolesFor = (request: CommitteeJoinRequest) => committeeDutyRoles ?? dutyRolesByCommitteeId[request.committeeId] ?? [];

  const approve = async (request: CommitteeJoinRequest) => {
    if (readOnly) return notifyReadOnly();
    const name = getCommitteeJoinRequestDisplayName(request);
    setActingId(request.id);
    await action.run(
      async () => {
        await approveAdminCommitteeJoinRequest(request.id, {
          organizationId,
          schoolSlug,
          memberRole: memberRoles[request.id] ?? 'member',
          assignDutyRoleId: dutyRoleIds[request.id] || null,
        });
        await load();
        onChanged?.();
      },
      {
        key: `join-approve-${request.id}`,
        operation: 'committees.join_requests.approve',
        metadata: { requestId: request.id },
        retry: true,
        success: { title: `${name} approved`, description: `They're a member of ${request.committeeName ?? 'the committee'} now.` },
        error: (err) => ({ title: `Couldn't approve ${name}`, description: `${errorText(err, 'Request failed.')} The request is still pending.` }),
      },
    );
    setActingId(null);
  };

  const decline = async (request: CommitteeJoinRequest) => {
    if (readOnly) return notifyReadOnly();
    const name = getCommitteeJoinRequestDisplayName(request);
    const ok = await confirmDestructive({
      title: `Decline ${name}?`,
      message: `They won't join ${request.committeeName ?? 'this committee'}. They can ask again later.`,
      confirmLabel: 'Decline',
    });
    if (!ok) return;
    setActingId(request.id);
    await action.run(
      async () => {
        await declineAdminCommitteeJoinRequest(request.id, { organizationId, schoolSlug });
        await load();
        onChanged?.();
      },
      {
        key: `join-decline-${request.id}`,
        operation: 'committees.join_requests.decline',
        metadata: { requestId: request.id },
        retry: true,
        success: { title: `Declined ${name}'s request` },
        error: (err) => ({ title: `Couldn't decline ${name}`, description: `${errorText(err, 'Request failed.')} The request is still pending.` }),
      },
    );
    setActingId(null);
  };

  if (!loaded) return <AdminRowSkeleton count={2} />;

  if (requests.length === 0) {
    if (hideWhenEmpty) return null;
    return <AdminEmptyPanel tone="mint" icon="checkmark-circle" title="No pending requests right now." />;
  }

  return (
    <View style={styles.list}>
      <Text style={styles.count} accessibilityLiveRegion="polite">
        {requests.length} pending request{requests.length === 1 ? '' : 's'}
      </Text>
      {requests.map((request) => {
        const busy = actingId === request.id;
        const name = getCommitteeJoinRequestDisplayName(request);
        const badge = request.requesterType === 'staff' ? 'Staff' : request.requesterType === 'parent' ? 'Parent' : null;
        const dutyRoles = dutyRolesFor(request);
        const access = memberRoles[request.id] ?? 'member';
        const dutyRoleId = dutyRoleIds[request.id] ?? '';
        return (
          <View key={request.id} style={styles.card}>
            <View style={styles.head}>
              <AdminInitialsAvatar name={name} size="sm" />
              <View style={styles.headCopy}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.meta}>
                  {request.committeeName ?? 'Committee'}
                  {request.grade ? ` · ${request.grade}` : ''} · Submitted {formatSubmittedAt(request.createdAt)}
                </Text>
              </View>
              {badge ? <GChip label={badge} tone="info" /> : null}
            </View>
            {request.preferredDutyRoleTitle ? <Text style={styles.meta}>Preferred role: {request.preferredDutyRoleTitle}</Text> : null}
            {request.note ? <Text style={styles.note}>“{request.note}”</Text> : null}
            <Text style={styles.label}>Access level</Text>
            <AdminFilterChips<CommitteeRole>
              accessibilityLabel="Access level"
              items={COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
              activeId={access}
              onChange={(value) => setMemberRoles((prev) => ({ ...prev, [request.id]: value }))}
            />
            {dutyRoles.length > 0 ? (
              <>
                <Text style={styles.label}>Duty role</Text>
                <AdminFilterChips<string>
                  accessibilityLabel="Duty role"
                  items={[{ id: '', label: 'None' }, ...dutyRoles.map((role) => ({ id: role.id, label: role.title }))]}
                  activeId={dutyRoleId}
                  onChange={(value) => setDutyRoleIds((prev) => ({ ...prev, [request.id]: value }))}
                />
              </>
            ) : null}
            <View style={styles.actions}>
              <GPressable
                accessibilityLabel={busy ? 'Approving…' : `Approve ${name}`}
                accessibilityState={{ busy, disabled: busy }}
                disabled={busy}
                haptic="press"
                onPress={() => void approve(request)}
                style={[styles.approve, { backgroundColor: accent.clay }]}>
                {busy ? <ActivityIndicator size="small" color={Garden.white} /> : null}
                <Text style={styles.approveLabel}>{busy ? 'Approving…' : 'Approve'}</Text>
              </GPressable>
              <GPressable
                accessibilityLabel={`Decline ${name}`}
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => {
                  haptic.select();
                  void decline(request);
                }}
                style={styles.decline}>
                <Text style={styles.declineLabel}>Decline</Text>
              </GPressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  count: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  card: { gap: 8, padding: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Garden.ink12, backgroundColor: Garden.white },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headCopy: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  note: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.ink65, fontStyle: 'italic' },
  label: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  approve: { flex: 1, minHeight: 44, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  approveLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.white },
  decline: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.ink },
});
