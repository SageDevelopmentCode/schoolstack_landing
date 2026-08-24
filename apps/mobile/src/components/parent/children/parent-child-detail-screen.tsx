import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ParentApplicationStepBottomSheet } from '@/components/parent/children/parent-application-step-bottom-sheet';
import { ParentChecklistItemBottomSheet } from '@/components/parent/children/parent-checklist-item-bottom-sheet';
import { EditableStudentPhoto } from '@/components/parent/children/editable-student-photo';
import {
  SubmissionApplicationStepsSection,
  SubmissionEnrollmentStepsSection,
} from '@/components/school-admin/submission-detail-sections';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
} from '@/lib/admissions/application-form-steps';
import { extractStudentFromResponses } from '@/lib/admissions/apply-system-fields';
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from '@/lib/admissions/application-status-ui';
import { loadApplicationDetail } from '@/lib/admissions/application-detail';
import {
  loadEnrollmentChecklistForApplication,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';
import {
  StudentProfilePhotoUploadError,
  uploadStudentProfilePhotoFromParent,
} from '@/lib/parent/upload-student-profile-photo';
import { getSupabaseClient } from '@/lib/supabase';

type ProfileTab = 'application' | 'checklist';

type ParentChildDetailScreenProps = {
  slug: string;
  applicationId: string;
  organizationId: string;
};

function formatBirthDate(value: string): string | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateAge(value: string): number | null {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : null;
}

function ProfileTabToggle({
  activeTab,
  hasChecklist,
  onChange,
}: {
  activeTab: ProfileTab;
  hasChecklist: boolean;
  onChange: (tab: ProfileTab) => void;
}) {
  const theme = useAdminTheme();

  return (
    <View style={[styles.tabContainer, { backgroundColor: theme.accentLight }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'application' }}
        onPress={() => onChange('application')}
        style={[
          styles.tabSegment,
          activeTab === 'application' && { backgroundColor: theme.surface },
        ]}>
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={{
            color: activeTab === 'application' ? theme.textPrimary : theme.textTertiary,
          }}>
          Application
        </ThemedText>
      </Pressable>
      {hasChecklist ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'checklist' }}
          accessibilityLabel="Enrollment checklist"
          onPress={() => onChange('checklist')}
          style={[
            styles.tabSegment,
            activeTab === 'checklist' && { backgroundColor: theme.surface },
          ]}>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={{
              color: activeTab === 'checklist' ? theme.textPrimary : theme.textTertiary,
            }}>
            Enrollment
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ParentChildDetailScreen({
  slug,
  applicationId,
  organizationId,
}: ParentChildDetailScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { data: homeData, refresh } = useParentHome();

  const childOverview = useMemo(
    () => homeData?.familyChildren.find((c) => c.applicationId === applicationId) ?? null,
    [homeData?.familyChildren, applicationId],
  );

  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [checklist, setChecklist] = useState<LoadedEnrollmentChecklist | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('application');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [selectedApplicationStepId, setSelectedApplicationStepId] = useState<string | null>(null);
  const [selectedEnrollmentItemId, setSelectedEnrollmentItemId] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const [application, loadedChecklist] = await Promise.all([
        loadApplicationDetail(supabase, applicationId, organizationId),
        loadEnrollmentChecklistForApplication(supabase, applicationId, organizationId),
      ]);

      if (!application) {
        setProfileError('Could not load this student profile.');
        setDetail(null);
        setChecklist(null);
        return;
      }

      setDetail(application);
      setChecklist(loadedChecklist);
      setProfilePhotoUrl(
        application.profilePhotoUrl ?? childOverview?.profilePhotoUrl ?? null,
      );
      setActiveTab('application');
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Failed to load student profile.',
      );
    } finally {
      setProfileLoading(false);
    }
  }, [applicationId, organizationId, supabase, childOverview?.profilePhotoUrl]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const student = detail ? extractStudentFromResponses(detail.responses) : null;
  const fullName =
    childOverview?.studentName ??
    (student ? `${student.firstName} ${student.lastName}` : 'Student');
  const birthDate = student ? formatBirthDate(student.dateOfBirth) : null;
  const age = student ? calculateAge(student.dateOfBirth) : null;
  const gradeLabel = childOverview?.grade
    ? `Grade ${childOverview.grade}`
    : student?.grade
      ? `Grade ${student.grade}`
      : null;
  const hasChecklist = Boolean(checklist && checklist.items.length > 0);
  const canUploadPhoto = Boolean(detail?.studentId);
  const statusStyle = detail
    ? applicationStatusBadgeStyle(detail.status, theme)
    : childOverview
      ? applicationStatusBadgeStyle(childOverview.status, theme)
      : null;

  const selectedApplicationStep = useMemo(() => {
    if (!detail || !selectedApplicationStepId) return null;
    const steps = buildApplicationFormSteps(detail.schema, detail.feeConfig);
    const stepsWithStatus = computeApplicationFormStepStatuses(steps, {
      applicationStatus: detail.status,
      stepIndex: detail.stepIndex,
      feeStatus: detail.feeStatus,
    });
    return stepsWithStatus.find((step) => step.id === selectedApplicationStepId) ?? null;
  }, [detail, selectedApplicationStepId]);

  const selectedEnrollmentItem = useMemo(() => {
    if (!checklist || !selectedEnrollmentItemId) return null;
    return checklist.items.find((item) => item.id === selectedEnrollmentItemId) ?? null;
  }, [checklist, selectedEnrollmentItemId]);

  const selectedEnrollmentInstance = useMemo(() => {
    if (!checklist || !selectedEnrollmentItemId) return null;
    return (
      checklist.instances.find(
        (instance) => instance.templateItemId === selectedEnrollmentItemId,
      ) ?? null
    );
  }, [checklist, selectedEnrollmentItemId]);

  const handlePhotoSelected = useCallback(
    async (uri: string, mimeType?: string) => {
      if (!detail?.studentId) return;

      setPhotoUploading(true);
      try {
        const nextUrl = await uploadStudentProfilePhotoFromParent({
          organizationId,
          studentId: detail.studentId,
          uri,
          mimeType,
        });
        setProfilePhotoUrl(nextUrl);
        void refresh();
      } catch (error) {
        const message =
          error instanceof StudentProfilePhotoUploadError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to upload photo.';
        Alert.alert('Photo upload failed', message);
      } finally {
        setPhotoUploading(false);
      }
    },
    [detail?.studentId, organizationId, refresh],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border, backgroundColor: theme.surface },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to My children"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.accent} />
          <ThemedText type="small" style={{ color: theme.accent }}>
            My children
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Child profile
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <EditableStudentPhoto
            name={fullName}
            photoUrl={profilePhotoUrl}
            shape="square"
            editable={canUploadPhoto}
            uploading={photoUploading}
            showEditHint={canUploadPhoto}
            onPhotoSelected={(uri, mimeType) => void handlePhotoSelected(uri, mimeType)}
          />
          <View style={styles.heroCopy}>
            <ThemedText type="title" style={{ color: theme.textPrimary }}>
              {fullName}
            </ThemedText>
            <View style={styles.pillRow}>
              {statusStyle ? (
                <View
                  style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
                  <ThemedText type="badge" style={{ color: statusStyle.color, fontSize: 11 }}>
                    {detail
                      ? applicationStatusLabel(detail.status)
                      : childOverview?.statusLabel ?? '—'}
                  </ThemedText>
                </View>
              ) : null}
              {gradeLabel ? (
                <View style={[styles.metaPill, { backgroundColor: theme.elevated }]}>
                  <ThemedText type="badge" style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {gradeLabel}
                  </ThemedText>
                </View>
              ) : null}
              {birthDate ? (
                <View style={[styles.metaPill, { backgroundColor: theme.elevated }]}>
                  <ThemedText type="badge" style={{ color: theme.textSecondary, fontSize: 11 }}>
                    Born {birthDate}
                    {age !== null ? ` · Age ${age}` : ''}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {profileLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={theme.accent} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Loading profile…
            </ThemedText>
          </View>
        ) : profileError ? (
          <ThemedText type="small" style={{ color: theme.error, textAlign: 'center' }}>
            {profileError}
          </ThemedText>
        ) : detail ? (
          <>
            <ProfileTabToggle
              activeTab={activeTab}
              hasChecklist={hasChecklist}
              onChange={setActiveTab}
            />

            <View style={styles.tabContent}>
              {activeTab === 'application' ? (
                <SubmissionApplicationStepsSection
                  detail={detail}
                  feeStatus={detail.feeStatus}
                  applicationStatus={detail.status}
                  submittedAt={detail.submittedAt}
                  feeEnabled={detail.feeConfig.enabled}
                  onItemPress={setSelectedApplicationStepId}
                  activeItemId={selectedApplicationStepId ?? undefined}
                  timelineRowSpacing={Spacing.five}
                />
              ) : null}

              {activeTab === 'checklist' && checklist ? (
                <SubmissionEnrollmentStepsSection
                  checklist={checklist}
                  loading={false}
                  error={null}
                  onItemPress={setSelectedEnrollmentItemId}
                  activeItemId={selectedEnrollmentItemId ?? undefined}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <ParentApplicationStepBottomSheet
        visible={Boolean(selectedApplicationStep)}
        step={selectedApplicationStep}
        detail={detail}
        feeStatus={detail?.feeStatus ?? 'not_required'}
        onClose={() => setSelectedApplicationStepId(null)}
      />

      <ParentChecklistItemBottomSheet
        visible={Boolean(selectedEnrollmentItem)}
        item={selectedEnrollmentItem}
        instance={selectedEnrollmentInstance}
        onClose={() => setSelectedEnrollmentItemId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 110,
  },
  headerSpacer: {
    minWidth: 110,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 2,
  },
  tabSegment: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  tabContent: {
    gap: Spacing.three,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
