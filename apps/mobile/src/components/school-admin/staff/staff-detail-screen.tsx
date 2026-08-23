import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DetailTabBar, type DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StaffAssignedStudentsSection } from '@/components/school-admin/staff/staff-assigned-students-section';
import { CopyableUrlRow } from '@/components/school-admin/staff/copyable-url-row';
import { StaffPortalLoginBadge } from '@/components/school-admin/staff/staff-portal-login-badge';
import { ReadOnlyFieldRow } from '@/components/school-admin/submission-detail/read-only-field-row';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
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

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

const EMPLOYMENT_STATUSES: StaffEmploymentStatus[] = ['active', 'on_leave', 'inactive'];
const PORTAL_ROLES: StaffPortalRole[] = ['teacher', 'staff'];

type StaffDetailScreenProps = {
  slug: string;
  staffMemberId: string;
};

function StaffDetailHeader({
  isEditing,
  saveLoading,
  actionLoading,
  onBack,
  onEdit,
  onCancel,
  onSave,
}: {
  isEditing: boolean;
  saveLoading: boolean;
  actionLoading: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.headerBar,
        { borderBottomColor: theme.border, backgroundColor: theme.surface },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to staff"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.accent} />
        <ThemedText type="small" style={{ color: theme.accent }}>
          Staff
        </ThemedText>
      </Pressable>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        Details
      </ThemedText>
      {!isEditing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit staff member"
          disabled={actionLoading || saveLoading}
          onPress={onEdit}
          style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.7 }]}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Edit
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
            disabled={saveLoading}
            onPress={onCancel}
            style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.7 }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save changes"
            disabled={saveLoading}
            onPress={onSave}
            style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.7 }]}>
            {saveLoading ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Save
              </ThemedText>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  const theme = useAdminTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textPrimary }}>
        {value}
      </ThemedText>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const theme = useAdminTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            borderColor: theme.inputBorder,
            backgroundColor: theme.input,
            color: theme.textPrimary,
            fontFamily: Fonts.body,
          },
        ]}
      />
    </View>
  );
}

export function StaffDetailScreen({ slug, staffMemberId }: StaffDetailScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();

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
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'profile', label: 'Profile' },
      { id: 'portal', label: 'Portal' },
      { id: 'students', label: 'Students' },
      { id: 'contact', label: 'Contact' },
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
      setError(formatStaffApiError(loadError, 'Failed to load staff member.'));
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, [resetEditForm, slug, staffMemberId]);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

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
      Alert.alert(
        'Error',
        formatStaffApiError(portalError, 'Failed to update portal access.'),
      );
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

  const showReactivate =
    member?.membershipStatus === 'disabled' || member?.employmentStatus === 'inactive';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StaffDetailHeader
          isEditing={false}
          saveLoading={false}
          actionLoading={false}
          onBack={() => router.back()}
          onEdit={() => {}}
          onCancel={() => {}}
          onSave={() => {}}
        />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StaffDetailHeader
          isEditing={false}
          saveLoading={false}
          actionLoading={false}
          onBack={() => router.back()}
          onEdit={() => {}}
          onCancel={() => {}}
          onSave={() => {}}
        />
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {error ?? 'Staff member not found.'}
          </ThemedText>
        </View>
      </View>
    );
  }

  const displayName = staffDisplayName(member);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StaffDetailHeader
        isEditing={isEditing}
        saveLoading={saveLoading}
        actionLoading={actionLoading}
        onBack={() => router.back()}
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summary}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            {displayName}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {member.roleTitle || 'No job title'} · {employmentStatusLabel(member.employmentStatus)}
          </ThemedText>
        </View>

        <DetailTabBar tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />

        {activeTab === 'profile' ? (
          <View style={styles.tabContent}>
            {isEditing ? (
              <View style={styles.sectionBody}>
                <FormField
                  label="First name"
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                />
                <FormField
                  label="Last name"
                  value={editLastName}
                  onChangeText={setEditLastName}
                />
                <FormField
                  label="Job title"
                  value={editRoleTitle}
                  onChangeText={setEditRoleTitle}
                  placeholder="Lead Teacher"
                />
                <View style={styles.field}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Employment status
                  </ThemedText>
                  <View style={styles.chipRow}>
                    {EMPLOYMENT_STATUSES.map((status) => {
                      const active = editEmploymentStatus === status;
                      return (
                        <Pressable
                          key={status}
                          accessibilityRole="button"
                          onPress={() => setEditEmploymentStatus(status)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? theme.accentLight : theme.surface,
                              borderColor: active ? theme.accent : theme.border,
                            },
                          ]}>
                          <ThemedText
                            type="small"
                            style={{ color: active ? theme.accent : theme.textSecondary }}>
                            {employmentStatusLabel(status)}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                  <ThemedText type="small" style={{ color: theme.textTertiary }}>
                    To revoke sign-in access, use Deactivate on the Portal tab.
                  </ThemedText>
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
          </View>
        ) : null}

        {activeTab === 'contact' ? (
          <View style={styles.tabContent}>
            <View style={styles.sectionBody}>
              <ReadOnlyFieldRow label="Email" value={member.email || '—'} />
              {isEditing ? (
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  Email cannot be changed here.
                </ThemedText>
              ) : null}
            </View>
          </View>
        ) : null}

        {activeTab === 'portal' ? (
          <View style={styles.tabContent}>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              Employment status and portal access are managed separately.
            </ThemedText>
            <View style={styles.sectionBody}>
                <View style={styles.field}>
                  <ThemedText type="small" style={{ color: theme.textTertiary }}>
                    Role
                  </ThemedText>
                  {isEditing ? (
                    <View style={styles.chipRow}>
                      {PORTAL_ROLES.map((role) => {
                        const active = editPortalRole === role;
                        return (
                          <Pressable
                            key={role}
                            accessibilityRole="button"
                            onPress={() => setEditPortalRole(role)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active ? theme.accentLight : theme.surface,
                                borderColor: active ? theme.accent : theme.border,
                              },
                            ]}>
                            <ThemedText
                              type="small"
                              style={{ color: active ? theme.accent : theme.textSecondary }}>
                              {portalRoleLabel(role)}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <ThemedText type="small" style={{ color: theme.textPrimary }}>
                      {portalRoleLabel(member.portalRole)}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.field}>
                  <ThemedText type="small" style={{ color: theme.textTertiary }}>
                    Sign-in status
                  </ThemedText>
                  <StaffPortalLoginBadge status={staffPortalLoginStatus(member)} />
                </View>

                <View style={styles.field}>
                  <ThemedText type="small" style={{ color: theme.textTertiary }}>
                    Sign-in URL
                  </ThemedText>
                  <CopyableUrlRow url={loginUrl} />
                </View>

                <View style={styles.portalActions}>
                  {showReactivate ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={actionLoading}
                      onPress={() => void handlePortalAction('reactivate')}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        { backgroundColor: theme.accent },
                        (pressed || actionLoading) && { opacity: 0.85 },
                      ]}>
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={theme.surface} />
                      ) : (
                        <ThemedText type="smallBold" style={{ color: theme.surface }}>
                          Reactivate portal access
                        </ThemedText>
                      )}
                    </Pressable>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      disabled={actionLoading}
                      onPress={confirmDeactivate}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        {
                          borderColor: theme.error,
                          backgroundColor: theme.errorBg,
                        },
                        (pressed || actionLoading) && { opacity: 0.85 },
                      ]}>
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={theme.error} />
                      ) : (
                        <ThemedText type="smallBold" style={{ color: theme.error }}>
                          Deactivate portal access
                        </ThemedText>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
          </View>
        ) : null}

        {activeTab === 'students' ? (
          <View style={styles.tabContent}>
            <StaffAssignedStudentsSection
              slug={slug}
              staffMemberId={member.id}
              organizationId={member.organizationId}
              staffMemberName={displayName}
              staffIsActive={member.employmentStatus === 'active'}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 72,
  },
  headerAction: {
    minWidth: 40,
    alignItems: 'flex-end',
    paddingVertical: Spacing.one,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  summary: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  tabContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  sectionBody: {
    gap: Spacing.three,
  },
  field: {
    gap: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  portalActions: {
    paddingTop: Spacing.two,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
