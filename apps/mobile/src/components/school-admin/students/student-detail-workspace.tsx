import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import { SubmissionDetailScreenSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StudentClassroomAssignButton } from '@/components/school-admin/students/student-classroom-assign-button';
import { StudentClassroomAssignPicker } from '@/components/school-admin/students/student-classroom-assign-picker';
import { StudentLeadTeacherCaption } from '@/components/school-admin/students/student-lead-teacher-caption';
import { StudentHealthTab } from '@/components/school-admin/students/student-health-tab';
import { StudentStoryDetailHeader } from '@/components/school-admin/students/student-story-detail-header';
import { StudentStorySheetHeader } from '@/components/school-admin/students/student-story-sheet-header';
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
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type StudentDetailWorkspaceProps = {
  organizationId: string;
  studentId: string;
  slug: string;
  variant: 'screen' | 'sheet';
  onClose?: () => void;
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

export function StudentDetailWorkspace({
  organizationId,
  studentId,
  slug,
  variant,
  onClose,
}: StudentDetailWorkspaceProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);
  const [guardiansLoadedForFamilyId, setGuardiansLoadedForFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['overview']));
  const [classroomPickerOpen, setClassroomPickerOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);
  const [assigningClassroom, setAssigningClassroom] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [hasStandingHealth, setHasStandingHealth] = useState(false);

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'overview', label: 'Overview', icon: 'grid-outline', iconActive: 'grid' },
      { id: 'family', label: 'Family', icon: 'people-outline', iconActive: 'people' },
      { id: 'health', label: 'Health', icon: 'heart-outline', iconActive: 'heart' },
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
      reportError('school_admin_student_load', loadError, {
        entityType: 'student',
        entityId: studentId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, studentId, supabase]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    setVisitedTabs((current) => {
      if (current.has(activeTab)) return current;
      const next = new Set(current);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    if (!visitedTabs.has('family')) return;
    if (!detail?.familyId) {
      setGuardians([]);
      return;
    }
    if (guardiansLoadedForFamilyId === detail.familyId) return;

    void (async () => {
      setGuardiansLoading(true);
      try {
        const rows = await listFamilyGuardians(supabase, organizationId, detail.familyId);
        setGuardians(rows);
        setGuardiansLoadedForFamilyId(detail.familyId);
      } catch {
        setGuardians([]);
      } finally {
        setGuardiansLoading(false);
      }
    })();
  }, [
    visitedTabs,
    detail?.familyId,
    guardiansLoadedForFamilyId,
    organizationId,
    supabase,
  ]);

  const ensureClassroomsLoaded = useCallback(async () => {
    if (classroomsLoaded || classroomsLoading) return;
    setClassroomsLoading(true);
    try {
      const payload = await fetchClassrooms(slug);
      setClassrooms(payload.classrooms);
      setClassroomsLoaded(true);
    } catch (loadError) {
      reportError('school_admin_classrooms_load', loadError);
      setAssignError('Failed to load classrooms.');
    } finally {
      setClassroomsLoading(false);
    }
  }, [classroomsLoaded, classroomsLoading, reportError, slug]);

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
      reportError('school_admin_student_classrooms_assign', assignError, {
        entityType: 'student',
        entityId: detail.id,
        metadata: { classroomIds },
      });
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
  };

  const handleHealthProfileChange = useCallback((profile: StudentHealthProfile) => {
    setHasStandingHealth(studentHasStandingHealthItems(profile));
  }, []);

  if (loading) {
    return <SubmissionDetailScreenSkeleton />;
  }

  if (error || !detail) {
    if (variant === 'sheet') {
      return (
        <View style={styles.sheetError}>
          <StoryErrorBanner message={error ?? 'Student not found.'} />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={[styles.errorCopy, { color: theme.muted }]}>
            {error ?? 'Student not found.'}
          </Text>
        </View>
      </View>
    );
  }

  const studentName = formatEnrolledStudentName(detail);
  const gradeLabel = formatStudentGrade(detail.grade);
  const programLabel =
    detail.programNames.length > 0 ? detail.programNames.join(' · ') : 'No program';
  const subtitle = `${gradeLabel ?? 'No grade'} · ${programLabel}`;

  const header =
    variant === 'sheet' ? (
      <StudentStorySheetHeader
        studentName={studentName}
        photoUrl={detail.profilePhotoUrl}
        statusLabel={studentStatusLabel(detail.status)}
        subtitle={subtitle}
        showHealthIndicator={hasStandingHealth}
        onClose={onClose ?? (() => {})}
      />
    ) : (
      <StudentStoryDetailHeader
        studentName={studentName}
        photoUrl={detail.profilePhotoUrl}
        statusLabel={studentStatusLabel(detail.status)}
        subtitle={subtitle}
        showHealthIndicator={hasStandingHealth}
      />
    );

  const content = (
    <>
      {header}
      <SubmissionStoryTabBar tabs={tabs} activeTabId={activeTab} onChange={handleTabChange} />
      <View style={styles.tabContent}>
        {assignError ? <StoryErrorBanner message={assignError} /> : null}

        {visitedTabs.has('overview') ? (
          <View style={activeTab !== 'overview' ? styles.hiddenTab : styles.tabPanel}>
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
              <View style={styles.classroomFooter}>
                <StudentClassroomAssignButton
                  classroomNames={detail.classroomNames}
                  onPress={() => {
                    void ensureClassroomsLoaded();
                    setClassroomPickerOpen(true);
                  }}
                />
                <StudentLeadTeacherCaption
                  classroomNames={detail.classroomNames}
                  leadTeacherLabel={formatAssignedTeachersLabel(detail.assignedTeachers)}
                />
              </View>
              <StoryTextLink
                label="Manage on Classrooms →"
                onPress={() => {
                  if (variant === 'sheet') {
                    onClose?.();
                  }
                  router.push(`/school-admin/${slug}/more/classrooms`);
                }}
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
                  onPress={() => {
                    if (variant === 'sheet') {
                      onClose?.();
                    }
                    router.push(
                      `/school-admin/${slug}/admissions/submissions/${detail.applicationId}`,
                    );
                  }}
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
          </View>
        ) : null}

        {visitedTabs.has('family') ? (
          <View style={activeTab !== 'family' ? styles.hiddenTab : styles.tabPanel}>
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
          </View>
        ) : null}

        {visitedTabs.has('health') ? (
          <View style={activeTab === 'health' ? styles.tabPanel : styles.hiddenTab}>
            <StudentHealthTab
              slug={slug}
              studentId={detail.id}
              studentFirstName={detail.firstName}
              onProfileChange={handleHealthProfileChange}
            />
          </View>
        ) : null}
      </View>

      <StudentClassroomAssignPicker
        visible={classroomPickerOpen}
        studentName={studentName}
        studentProgramNames={detail.programNames}
        studentProgramIds={detail.programIds}
        classroomIds={detail.classroomIds}
        classrooms={classrooms}
        loading={classroomsLoading || (classroomPickerOpen && !classroomsLoaded)}
        saving={assigningClassroom}
        onClose={() => setClassroomPickerOpen(false)}
        onAddClassroom={() => {
          setClassroomPickerOpen(false);
          if (variant === 'sheet') {
            onClose?.();
          }
          router.push(`/school-admin/${slug}/more/classrooms`);
        }}
        onSave={handleAssignClassrooms}
      />
    </>
  );

  if (variant === 'sheet') {
    return <View style={styles.sheetContent}>{content}</View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  sheetContent: {
    backgroundColor: Story.paper,
  },
  sheetError: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
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
  tabPanel: {
    gap: Spacing.four,
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
  classroomFooter: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
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
