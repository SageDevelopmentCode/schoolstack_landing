import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StaffAssignedStudentsSection } from '@/components/school-admin/staff/staff-assigned-students-section';
import { CopyableUrlRow } from '@/components/school-admin/staff/copyable-url-row';
import { StaffPortalLoginBadge } from '@/components/school-admin/staff/staff-portal-login-badge';
import { StaffStoryDetailHeader } from '@/components/school-admin/staff/staff-story-detail-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  deactivateStaffPortalAccess,
  fetchStaffMembers,
  reactivateStaffPortalAccess,
  updateStaffMember,
  type StaffEmploymentStatus,
  type StaffMemberRecord,
  type StaffPortalRole,
} from '@/lib/school-admin-api';
import {
  employmentStatusLabel,
  formatStaffApiError,
  portalRoleLabel,
  schoolTeacherLoginUrl,
  staffDisplayName,
  staffPortalLoginStatus,
} from '@/lib/school-admin/staff-labels';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

const EMPLOYMENT_STATUSES: StaffEmploymentStatus[] = ['active', 'on_leave', 'inactive'];
const PORTAL_ROLES: StaffPortalRole[] = ['teacher', 'staff'];

type StaffDetailScreenProps = {
  slug: string;
  staffMemberId: string;
};

type StaffDetailTab = 'profile' | 'portal' | 'students' | 'contact';

function DetailField({ label, value }: { label: string; value: string }) {
  const theme = useParentTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

export function StaffDetailScreen({ slug, staffMemberId }: StaffDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter();

  const [member, setMember] = useState<StaffMemberRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editPortalRole, setEditPortalRole] = useState<StaffPortalRole>('teacher');
  const [editEmploymentStatus, setEditEmploymentStatus] = useState<StaffEmploymentStatus>('active');
  const [activeTab, setActiveTab] = useState<StaffDetailTab>('profile');
  const [visitedTabs, setVisitedTabs] = useState<Set<StaffDetailTab>>(() => new Set(['profile']));

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'profile', label: 'Profile', icon: 'grid-outline', iconActive: 'grid' },
      { id: 'portal', label: 'Portal access', icon: 'log-in-outline', iconActive: 'log-in' },
      { id: 'students', label: 'Learners & groups', icon: 'people-outline', iconActive: 'people' },
      { id: 'contact', label: 'Contact', icon: 'mail-outline', iconActive: 'mail' },
    ],
    [],
  );

  const loginUrl = useMemo(() => schoolTeacherLoginUrl(slug, siteUrl), [slug]);

  const resetEditForm = useCallback((nextMember: StaffMemberRecord) => {
    setEditFirstName(nextMember.firstName);
    setEditLastName(nextMember.lastName);
    setEditRoleTitle(nextMember.roleTitle ?? '');
    setEditPortalRole(nextMember.portalRole ?? 'teacher');
    setEditEmploymentStatus(nextMember.employmentStatus);
  }, []);

  const loadMember = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await fetchStaffMembers(slug);
      const nextMember = members.find((item) => item.id === staffMemberId) ?? null;
      if (!nextMember) {
        setError('Staff member not found.');
        setMember(null);
        return;
      }
      setMember(nextMember);
      resetEditForm(nextMember);
      setIsEditing(false);
    } catch (loadError) {
      reportError('school_admin_staff_load', loadError, {
        entityType: 'staff_member',
        entityId: staffMemberId,
      });
      setError(formatStaffApiError(loadError, 'Failed to load staff member.'));
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [reportError, resetEditForm, slug, staffMemberId]);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

  useEffect(() => {
    setVisitedTabs((current) => {
      if (current.has(activeTab)) return current;
      const next = new Set(current);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const handleSave = async () => {
    if (!member) return;
    setSaveLoading(true);
    try {
      await updateStaffMember(slug, member.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        roleTitle: editRoleTitle.trim(),
        portalRole: editPortalRole,
        employmentStatus: editEmploymentStatus,
      });
      setIsEditing(false);
      await loadMember();
    } catch (saveError) {
      reportError('school_admin_staff_save', saveError, {
        entityType: 'staff_member',
        entityId: member.id,
      });
      Alert.alert('Error', formatStaffApiError(saveError, 'Failed to update staff member.'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePortalAction = async (action: 'deactivate' | 'reactivate') => {
    if (!member) return;
    setActionLoading(true);
    try {
      if (action === 'deactivate') {
        await deactivateStaffPortalAccess(slug, member.id);
      } else {
        await reactivateStaffPortalAccess(slug, member.id);
      }
      await loadMember();
    } catch (portalError) {
      reportError('school_admin_staff_portal_access', portalError, {
        entityType: 'staff_member',
        entityId: member.id,
        metadata: { action },
      });
      Alert.alert('Error', formatStaffApiError(portalError, 'Failed to update portal access.'));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeactivate = () => {
    Alert.alert(
      'Deactivate portal access',
      'This will revoke sign-in access for this staff member. You can reactivate later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => void handlePortalAction('deactivate'),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StaffStoryDetailHeader
          staffName="Staff member"
          employmentStatus="active"
          subtitle="Loading…"
          isEditing={false}
          saveLoading={false}
          actionLoading={false}
          onEdit={() => {}}
          onCancel={() => {}}
          onSave={() => {}}
        />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.container}>
        <StaffStoryDetailHeader
          staffName="Staff member"
          employmentStatus="active"
          subtitle="—"
          isEditing={false}
          saveLoading={false}
          actionLoading={false}
          onEdit={() => {}}
          onCancel={() => router.back()}
          onSave={() => {}}
        />
        <View style={styles.centered}>
          <StoryErrorBanner message={error ?? 'Staff member not found.'} />
        </View>
      </View>
    );
  }

  const displayName = staffDisplayName(member);
  const subtitle = `${member.roleTitle || 'No job title'} · ${portalRoleLabel(member.portalRole)}`;
  const showReactivate =
    member.membershipStatus === 'disabled' || member.employmentStatus === 'inactive';

  return (
    <View style={styles.container}>
      <StaffStoryDetailHeader
        staffName={displayName}
        employmentStatus={member.employmentStatus}
        subtitle={subtitle}
        isEditing={isEditing}
        saveLoading={saveLoading}
        actionLoading={actionLoading}
        onEdit={() => {
          resetEditForm(member);
          setIsEditing(true);
        }}
        onCancel={() => {
          resetEditForm(member);
          setIsEditing(false);
        }}
        onSave={() => void handleSave()}
      />

      <SubmissionStoryTabBar
        tabs={tabs}
        activeTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as StaffDetailTab)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {visitedTabs.has('profile') ? (
          <View style={[styles.tabPanel, activeTab !== 'profile' && styles.tabPanelHidden]}>
            <StoryDetailSection title="Profile">
              {isEditing ? (
                <View style={styles.sectionBody}>
                  <StoryTextField
                    label="First name"
                    value={editFirstName}
                    onChangeText={setEditFirstName}
                  />
                  <StoryTextField
                    label="Last name"
                    value={editLastName}
                    onChangeText={setEditLastName}
                  />
                  <StoryTextField
                    label="Job title"
                    value={editRoleTitle}
                    onChangeText={setEditRoleTitle}
                    placeholder="Lead Teacher"
                  />
                  <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: theme.muted }]}>Employment status</Text>
                    <View style={styles.chipRow}>
                      {EMPLOYMENT_STATUSES.map((status) => {
                        const active = editEmploymentStatus === status;
                        return (
                          <Pressable
                            key={status}
                            accessibilityRole="button"
                            onPress={() => setEditEmploymentStatus(status)}>
                            <StoryChip
                              tone={active ? 'success' : 'info'}
                              label={employmentStatusLabel(status)}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={[styles.helperCopy, { color: theme.muted }]}>
                      To revoke sign-in access, use Deactivate on the Portal access tab.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.sectionBody}>
                  <DetailField label="Name" value={displayName} />
                  <DetailField label="Job title" value={member.roleTitle || '—'} />
                  <DetailField
                    label="Employment status"
                    value={employmentStatusLabel(member.employmentStatus)}
                  />
                </View>
              )}
            </StoryDetailSection>
          </View>
        ) : null}

        {visitedTabs.has('portal') ? (
          <View style={[styles.tabPanel, activeTab !== 'portal' && styles.tabPanelHidden]}>
            <StoryDetailSection
              title="Portal access"
              description="Employment status and portal access are managed separately.">
              <View style={styles.sectionBody}>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: theme.muted }]}>Role</Text>
                  {isEditing ? (
                    <View style={styles.chipRow}>
                      {PORTAL_ROLES.map((role) => {
                        const active = editPortalRole === role;
                        return (
                          <Pressable
                            key={role}
                            accessibilityRole="button"
                            onPress={() => setEditPortalRole(role)}>
                            <StoryChip
                              tone={active ? 'success' : 'info'}
                              label={portalRoleLabel(role)}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={[styles.fieldValue, { color: theme.ink }]}>
                      {portalRoleLabel(member.portalRole)}
                    </Text>
                  )}
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: theme.muted }]}>Sign-in status</Text>
                  <StaffPortalLoginBadge status={staffPortalLoginStatus(member)} />
                </View>

                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: theme.muted }]}>Sign-in URL</Text>
                  <CopyableUrlRow url={loginUrl} />
                </View>

                <View style={styles.portalActions}>
                  {showReactivate ? (
                    <StoryButton
                      label="Reactivate portal access"
                      disabled={actionLoading}
                      onPress={() => void handlePortalAction('reactivate')}
                    />
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      disabled={actionLoading}
                      onPress={confirmDeactivate}
                      style={({ pressed }) => [
                        styles.dangerButton,
                        { borderColor: theme.alert, backgroundColor: theme.alertBg },
                        (pressed || actionLoading) && { opacity: 0.85 },
                      ]}>
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={theme.alert} />
                      ) : (
                        <Text style={[styles.dangerButtonLabel, { color: theme.alert }]}>
                          Deactivate portal access
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            </StoryDetailSection>
          </View>
        ) : null}

        {visitedTabs.has('students') ? (
          <View style={[styles.tabPanel, activeTab !== 'students' && styles.tabPanelHidden]}>
            <StoryDetailSection title="Learners & groups">
              <StaffAssignedStudentsSection
                slug={slug}
                staffMemberId={member.id}
                organizationId={member.organizationId}
                staffMemberName={displayName}
                staffIsActive={member.employmentStatus === 'active'}
              />
            </StoryDetailSection>
          </View>
        ) : null}

        {visitedTabs.has('contact') ? (
          <View style={[styles.tabPanel, activeTab !== 'contact' && styles.tabPanelHidden]}>
            <StoryDetailSection title="Contact">
              <View style={styles.sectionBody}>
                <DetailField label="Email" value={member.email || '—'} />
                {isEditing ? (
                  <Text style={[styles.helperCopy, { color: theme.muted }]}>
                    Email cannot be changed here.
                  </Text>
                ) : null}
              </View>
            </StoryDetailSection>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  tabPanel: {
    gap: Spacing.four,
  },
  tabPanelHidden: {
    display: 'none',
  },
  sectionBody: {
    gap: Spacing.three,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldValue: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  portalActions: {
    paddingTop: Spacing.two,
  },
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  dangerButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
});
