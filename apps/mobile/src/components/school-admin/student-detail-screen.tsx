import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StudentClassroomAssignButton } from '@/components/school-admin/students/student-classroom-assign-button';
import { StudentClassroomAssignPicker } from '@/components/school-admin/students/student-classroom-assign-picker';
import { StudentHealthTab } from '@/components/school-admin/students/student-health-tab';
import { StudentStoryDetailHeader } from '@/components/school-admin/students/student-story-detail-header';
import { SubmissionGuardiansSection } from '@/components/school-admin/submission-detail-sections';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import { listFamilyGuardians, type FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import {
  formatAssignedTeachersLabel,
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  loadEnrolledStudentDetail,
  studentStatusLabel,
  type EnrolledStudentDetail,
} from '@/lib/school-admin/enrolled-students';
import { fetchClassrooms, setStudentClassroomsApi } from '@/lib/school-admin-api';
import { studentHasStandingHealthItems, type StudentHealthProfile } from '@/lib/student-health/types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';

type StudentDetailScreenProps = {
  organizationId: string;
  studentId: string;
  slug: string;
};

function DetailField({ label, value }: { label: string; value: string }) {
  const theme = useParentTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.ink }]}>{value}</Text>
    </View>
  );
}

export function StudentDetailScreen({ organizationId, studentId, slug }: StudentDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['overview']));
  const [classroomPickerOpen, setClassroomPickerOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);
  const [assigningClassroom, setAssigningClassroom] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [hasStandingHealth, setHasStandingHealth] = useState(false);

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'family', label: 'Family' },
      { id: 'health', label: 'Health' },
    ],
    [],
  );

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextDetail = await loadEnrolledStudentDetail(supabase, organizationId, studentId);
      if (!nextDetail) {
        setError('Student not found.');
        setDetail(null);
        return;
      }
      setDetail(nextDetail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, studentId, supabase]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const loadGuardians = useCallback(async () => {
    if (!detail?.familyId) {
      setGuardians([]);
      return;
    }
    setGuardiansLoading(true);
    try {
      const rows = await listFamilyGuardians(supabase, organizationId, detail.familyId);
      setGuardians(rows);
    } catch {
      setGuardians([]);
    } finally {
      setGuardiansLoading(false);
    }
  }, [detail?.familyId, organizationId, supabase]);

  useEffect(() => {
    if (activeTab === 'family') {
      void loadGuardians();
    }
  }, [activeTab, loadGuardians]);

  const ensureClassroomsLoaded = useCallback(async () => {
    if (classroomsLoaded) return;
    const payload = await fetchClassrooms(slug);
    setClassrooms(payload.classrooms);
    setClassroomsLoaded(true);
  }, [classroomsLoaded, slug]);

  const handleAssignClassrooms = async (classroomIds: string[]) => {
    if (!detail) return;
    setAssigningClassroom(true);
    setAssignError(null);
    try {
      const result = await setStudentClassroomsApi(slug, detail.id, classroomIds);
      setDetail((current) =>
        current
          ? {
              ...current,
              classroomIds: result.classroomIds,
              classroomNames: result.classroomNames,
              assignedTeachers: result.assignedTeachers,
              assignedTeacherNames: result.assignedTeacherNames,
              enrollments: current.enrollments.map((enrollment) => ({
                ...enrollment,
                classroomName:
                  result.classroomNames.length > 0 ? result.classroomNames.join(', ') : null,
                classroomIds: result.classroomIds,
              })),
            }
          : current,
      );
    } catch (assignError) {
      setAssignError(
        assignError instanceof Error ? assignError.message : 'Failed to assign classrooms.',
      );
      throw assignError;
    } finally {
      setAssigningClassroom(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setVisitedTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
  };

  const handleHealthProfileChange = (profile: StudentHealthProfile) => {
    setHasStandingHealth(studentHasStandingHealthItems(profile));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={[styles.errorCopy, { color: theme.muted }]}>{error ?? 'Student not found.'}</Text>
        </View>
      </View>
    );
  }

  const studentName = formatEnrolledStudentName(detail);
  const gradeLabel = formatStudentGrade(detail.grade);
  const programLabel =
    detail.programNames.length > 0 ? detail.programNames.join(' · ') : 'No program';
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StudentStoryDetailHeader
          studentName={studentName}
          photoUrl={detail.profilePhotoUrl}
          statusLabel={studentStatusLabel(detail.status)}
          subtitle={`${gradeLabel ?? 'No grade'} · ${programLabel}`}
          showHealthIndicator={hasStandingHealth}
        />

        <SubmissionStoryTabBar tabs={tabs} activeTabId={activeTab} onChange={handleTabChange} />

        <View style={styles.tabContent}>
          {assignError ? <StoryErrorBanner message={assignError} /> : null}

          {activeTab === 'overview' ? (
            <>
              <StoryDetailSection
                title="Student details"
                description="Core profile information for this enrolled student.">
                <View style={styles.fieldGrid}>
                  <DetailField label="Full name" value={studentName} />
                  <DetailField label="Grade" value={gradeLabel ?? '—'} />
                  <DetailField
                    label="Date of birth"
                    value={detail.dateOfBirth ? formatEnrolledDate(detail.dateOfBirth) : '—'}
                  />
                  <DetailField label="Student status" value={studentStatusLabel(detail.status)} />
                  <DetailField label="Family" value={detail.familyName ?? '—'} />
                  <DetailField label="Family email" value={detail.familyPrimaryEmail ?? '—'} />
                </View>
              </StoryDetailSection>

              <StoryDetailSection
                title="Classrooms"
                description="Assign classrooms for this student. Lead teachers sync from classroom assignments.">
                <StudentClassroomAssignButton
                  label="Classrooms"
                  classroomNames={detail.classroomNames}
                  leadTeacherLabel={formatAssignedTeachersLabel(detail.assignedTeachers)}
                  onPress={() => {
                    void ensureClassroomsLoaded();
                    setClassroomPickerOpen(true);
                  }}
                />
                <StoryTextLink
                  label="Manage on Classrooms →"
                  onPress={() => router.push(`/school-admin/${slug}/more/classrooms`)}
                />
              </StoryDetailSection>

              <StoryDetailSection
                title="Enrollments"
                description="Programs this student is currently enrolled in.">
                {detail.enrollments.length === 0 ? (
                  <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                    No enrolled programs found.
                  </Text>
                ) : (
                  detail.enrollments.map((enrollment) => (
                    <View
                      key={enrollment.id}
                      style={[styles.enrollmentCard, { borderColor: theme.line }]}>
                      <Text style={[styles.enrollmentTitle, { color: theme.ink }]}>
                        {enrollment.programName}
                      </Text>
                      <Text style={[styles.enrollmentMeta, { color: theme.muted }]}>
                        {enrollment.classroomName
                          ? `Classroom: ${enrollment.classroomName}`
                          : 'No classroom assigned'}
                        {' · '}
                        Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                      </Text>
                    </View>
                  ))
                )}
              </StoryDetailSection>

              {detail.applicationId ? (
                <StoryDetailSection
                  title="Admissions"
                  description="View the original application for this student.">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(
                        `/school-admin/${slug}/admissions/submissions/${detail.applicationId}`,
                      )
                    }
                    style={({ pressed }) => [styles.applicationLink, pressed && { opacity: 0.7 }]}>
                    <Text style={[styles.applicationLinkLabel, { color: theme.primary }]}>
                      View application
                      {detail.applicationStatus
                        ? ` (${applicationStatusLabel(detail.applicationStatus)})`
                        : ''}
                    </Text>
                    <Ionicons name="open-outline" size={14} color={theme.primary} />
                  </Pressable>
                </StoryDetailSection>
              ) : null}
            </>
          ) : null}

          {activeTab === 'family' ? (
            <>
              <StoryDetailSection
                title="Family record"
                description="Household contact details linked to this student.">
                <View style={styles.fieldGrid}>
                  <DetailField label="Family name" value={detail.familyName ?? '—'} />
                  <DetailField label="Primary email" value={detail.familyPrimaryEmail ?? '—'} />
                  <DetailField label="Primary phone" value={detail.familyPrimaryPhone ?? '—'} />
                </View>
              </StoryDetailSection>
              <SubmissionGuardiansSection guardians={guardians} loading={guardiansLoading} />
            </>
          ) : null}

          {visitedTabs.has('health') ? (
            <View style={activeTab === 'health' ? undefined : styles.hiddenTab}>
              <StudentHealthTab
                slug={slug}
                studentId={detail.id}
                studentFirstName={detail.firstName}
                onProfileChange={handleHealthProfileChange}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <StudentClassroomAssignPicker
        visible={classroomPickerOpen}
        studentName={studentName}
        studentProgramNames={detail.programNames}
        classroomIds={detail.classroomIds}
        classrooms={classrooms}
        saving={assigningClassroom}
        onClose={() => setClassroomPickerOpen(false)}
        onAddClassroom={() => {
          setClassroomPickerOpen(false);
          router.push(`/school-admin/${slug}/more/classrooms`);
        }}
        onSave={handleAssignClassrooms}
      />
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
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  tabContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  hiddenTab: {
    display: 'none',
  },
  fieldGrid: {
    gap: Spacing.three,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldValue: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 20,
  },
  enrollmentCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: Spacing.two,
  },
  enrollmentTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  enrollmentMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  applicationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicationLinkLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
});
