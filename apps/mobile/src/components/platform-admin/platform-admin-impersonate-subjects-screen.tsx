import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ImpersonateSubjectRow } from '@/components/platform-admin/impersonate/impersonate-subject-row';
import {
  PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT,
} from '@/components/platform-admin/platform-admin-floating-tab-bar';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useAuth } from '@/contexts/auth-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { AdminOrganization } from '@/lib/organizations';
import { listAllOrganizations } from '@/lib/organizations';
import {
  impersonatePreviewHomeRoute,
  type ImpersonatePortalTab,
} from '@/lib/platform-admin/impersonate-nav';
import {
  fetchOrganizationMemberships,
  fetchOrganizationParentLoginStatus,
  fetchOrganizationStaffLoginStatus,
  type OrganizationMembershipRecord,
  type ParentPortalLoginStatus,
  type StaffMemberLoginRecord,
} from '@/lib/platform-admin/platform-admin-api';
import type { StartPortalPreviewInput } from '@/lib/platform-admin/preview-session-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const PORTAL_TABS: { key: ImpersonatePortalTab; label: string }[] = [
  { key: 'school_admin', label: 'School admin' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'parent', label: 'Parent' },
];

function formatPersonName(firstName: string, lastName: string, fallback: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

function dedupeFamilies(statuses: ParentPortalLoginStatus[]) {
  const byFamily = new Map<string, ParentPortalLoginStatus>();
  for (const status of statuses) {
    if (!byFamily.has(status.familyId)) {
      byFamily.set(status.familyId, status);
    }
  }
  return [...byFamily.values()];
}

type PlatformAdminImpersonateSubjectsScreenProps = {
  organizationId: string;
};

export function PlatformAdminImpersonateSubjectsScreen({
  organizationId,
}: PlatformAdminImpersonateSubjectsScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { startPortalPreview } = useAuth();

  const [organization, setOrganization] = useState<AdminOrganization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [portalTab, setPortalTab] = useState<ImpersonatePortalTab>('school_admin');
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMembershipRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberLoginRecord[]>([]);
  const [parentStatuses, setParentStatuses] = useState<ParentPortalLoginStatus[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      setOrgLoading(true);
      setOrgError(null);
      try {
        const organizations = await listAllOrganizations();
        const match = organizations.find((row) => row.id === organizationId) ?? null;
        if (cancelled) return;
        if (!match) {
          setOrgError('School not found.');
          setOrganization(null);
          return;
        }
        setOrganization(match);
      } catch (loadError) {
        if (cancelled) return;
        setOrgError(loadError instanceof Error ? loadError.message : 'Failed to load school.');
        setOrganization(null);
      } finally {
        if (!cancelled) {
          setOrgLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const loadSubjects = useCallback(async (selectedOrganization: AdminOrganization) => {
    setSubjectsLoading(true);
    setSubjectsError(null);
    try {
      const [membershipPayload, staffPayload, parentPayload] = await Promise.all([
        fetchOrganizationMemberships(selectedOrganization.id),
        fetchOrganizationStaffLoginStatus(selectedOrganization.id),
        fetchOrganizationParentLoginStatus(selectedOrganization.id),
      ]);
      setMemberships(
        membershipPayload.memberships.filter(
          (membership) =>
            membership.status === 'active' &&
            (membership.role === 'owner' || membership.role === 'admin'),
        ),
      );
      setStaffMembers(
        staffPayload.staffMembers.filter(
          (member) => member.portalRole === 'teacher' && member.membershipStatus === 'active',
        ),
      );
      setParentStatuses(dedupeFamilies(parentPayload.statuses));
    } catch (loadError) {
      setSubjectsError(
        loadError instanceof Error ? loadError.message : 'Failed to load preview subjects.',
      );
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organization) return;
    void loadSubjects(organization);
  }, [loadSubjects, organization]);

  const handlePreview = useCallback(
    async (input: Omit<StartPortalPreviewInput, 'school'>) => {
      if (!organization) return;
      await startPortalPreview({
        ...input,
        school: organization,
      });
      router.replace(impersonatePreviewHomeRoute(input.portal, organization.slug) as never);
    },
    [organization, router, startPortalPreview],
  );

  const subjectList = useMemo(() => {
    if (!organization) {
      return null;
    }

    if (subjectsLoading) {
      return (
        <View style={styles.loadingSubjects}>
          <ActivityIndicator color={theme.primary} />
        </View>
      );
    }

    if (portalTab === 'school_admin') {
      if (memberships.length === 0) {
        return (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No school admins found.</Text>
        );
      }
      return memberships.map((membership) => (
        <ImpersonateSubjectRow
          key={membership.id}
          title={membership.email ?? 'School admin'}
          subtitle={membership.role}
          meta={membership.email}
          onPreview={() =>
            void handlePreview({
              portal: 'school_admin',
              organizationId: organization.id,
              slug: organization.slug,
              subjectLabel: membership.email ?? 'School admin',
              membershipId: membership.id,
            })
          }
        />
      ));
    }

    if (portalTab === 'teacher') {
      if (staffMembers.length === 0) {
        return <Text style={[styles.emptyCopy, { color: theme.muted }]}>No teachers found.</Text>;
      }
      return staffMembers.map((member) => {
        const name = formatPersonName(
          member.firstName ?? '',
          member.lastName ?? '',
          member.email ?? 'Teacher',
        );
        return (
          <ImpersonateSubjectRow
            key={member.id}
            title={name}
            subtitle={member.email}
            meta={member.portalRole ?? undefined}
            onPreview={() =>
              void handlePreview({
                portal: 'teacher',
                organizationId: organization.id,
                slug: organization.slug,
                subjectLabel: name,
                staffMemberId: member.id,
              })
            }
          />
        );
      });
    }

    if (parentStatuses.length === 0) {
      return (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No parent families found.</Text>
      );
    }

    return parentStatuses.map((status) => {
      const name = formatPersonName(status.firstName, status.lastName, status.email ?? 'Parent');
      return (
        <ImpersonateSubjectRow
          key={status.familyId}
          title={name}
          subtitle={status.email}
          meta={`Family ${status.familyId.slice(0, 8)}…`}
          onPreview={() =>
            void handlePreview({
              portal: 'parent',
              organizationId: organization.id,
              slug: organization.slug,
              subjectLabel: name,
              familyId: status.familyId,
            })
          }
        />
      );
    });
  }, [
    memberships,
    organization,
    parentStatuses,
    portalTab,
    staffMembers,
    subjectsLoading,
    theme.muted,
    theme.primary,
    handlePreview,
  ]);

  if (orgLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (orgError || !organization) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <StoryErrorBanner message={orgError ?? 'School not found.'} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT + Spacing.five },
      ]}
      style={styles.container}
      keyboardShouldPersistTaps="handled">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to schools"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={18} color={theme.muted} />
        <Text style={[styles.backLabel, { color: theme.muted }]}>Back to schools</Text>
      </Pressable>

      <View style={styles.headerBlock}>
        <StoryDisplayHeading size="section">{organization.name}</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Choose who to preview read-only.
        </Text>
      </View>

      <StoryPillNav
        items={PORTAL_TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
        activeKey={portalTab}
        onChange={(key) => setPortalTab(key as ImpersonatePortalTab)}
        fullWidth
      />

      {subjectsError ? <StoryErrorBanner message={subjectsError} /> : null}
      <View style={styles.subjectList}>{subjectList}</View>
    </ScrollView>
  );
}

export function PlatformAdminImpersonateSubjectsRouteScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();

  if (!organizationId) {
    return null;
  }

  return <PlatformAdminImpersonateSubjectsScreen organizationId={organizationId} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  headerBlock: {
    gap: Spacing.one,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  subjectList: {
    gap: Spacing.two,
  },
  loadingSubjects: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
});
