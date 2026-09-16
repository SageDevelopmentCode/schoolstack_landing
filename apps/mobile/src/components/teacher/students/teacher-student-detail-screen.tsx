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
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubmissionStoryTabBar } from '@/components/school-admin/admissions/submission-story-tab-bar';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { SubmissionDetailScreenSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import type { DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { TeacherStudentHealthTab } from '@/components/teacher/students/teacher-student-health-tab';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  loadTeacherAssignedStudentDetail,
  studentStatusLabel,
  type EnrolledStudentDetail,
} from '@/lib/school-admin/enrolled-students';
import { studentSubtitleLine } from '@/lib/teacher/teacher-home-utils';
import { studentHasStandingHealthItems, type StudentHealthProfile } from '@/lib/student-health/types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type TeacherStudentDetailScreenProps = {
  slug: string;
  studentId: string;
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

export function TeacherStudentDetailScreen({
  slug: _slug,
  studentId,
}: TeacherStudentDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data: homeData, updateStudentHealthFlag, ensureLoaded } = useTeacherHome();
  const organizationId = homeData?.organizationId ?? '';
  const staffMemberId = homeData?.summary.staffMemberId ?? '';
  const summaryStudent = homeData?.summary.assignedStudents.find((s) => s.id === studentId);
  const { reportError } = useMobileErrorReporter(organizationId);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['overview']));
  const [hasStandingHealth, setHasStandingHealth] = useState(
    summaryStudent?.hasStandingHealthItems ?? false,
  );

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'overview', label: 'Overview', icon: 'grid-outline', iconActive: 'grid' },
      { id: 'family', label: 'Family', icon: 'people-outline', iconActive: 'people' },
      { id: 'health', label: 'Health', icon: 'heart-outline', iconActive: 'heart' },
    ],
    [],
  );

  const loadDetail = useCallback(async () => {
    if (!organizationId || !staffMemberId) {
      setError('Staff profile not loaded.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextDetail = await loadTeacherAssignedStudentDetail(
        supabase,
        organizationId,
        staffMemberId,
        studentId,
      );
      if (!nextDetail) {
        setError('Student not found or not assigned to you.');
        setDetail(null);
        return;
      }
      setDetail(nextDetail);
    } catch (loadError) {
      reportError('teacher_student_load_detail', loadError, {
        entityType: 'student',
        entityId: studentId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, staffMemberId, studentId, supabase]);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const navigateToTab = (tabId: string) => {
    setVisitedTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
    setActiveTab(tabId);
  };

  const handleHealthProfileChange = (profile: StudentHealthProfile) => {
    const nextFlag = studentHasStandingHealthItems(profile);
    setHasStandingHealth(nextFlag);
    updateStudentHealthFlag(studentId, nextFlag);
  };

  const studentName = detail
    ? formatEnrolledStudentName(detail)
    : summaryStudent
      ? formatEnrolledStudentName(summaryStudent)
      : 'Student';

  const headerSubtitle = summaryStudent
    ? studentSubtitleLine(summaryStudent)
    : detail
      ? [formatStudentGrade(detail.grade), detail.programNames.join(', ')].filter(Boolean).join(' · ')
      : '';

  const renderOverview = (panelDetail: EnrolledStudentDetail) => (
    <View style={styles.tabContent}>
      <StoryDetailSection
        title="Student details"
        description="Core profile information for this student.">
        <View style={styles.fieldGrid}>
          <DetailField label="Full name" value={formatEnrolledStudentName(panelDetail)} />
          <DetailField label="Grade" value={formatStudentGrade(panelDetail.grade) ?? '—'} />
          <DetailField
            label="Date of birth"
            value={panelDetail.dateOfBirth ? formatEnrolledDate(panelDetail.dateOfBirth) : '—'}
          />
          <DetailField label="Student status" value={studentStatusLabel(panelDetail.status)} />
          <DetailField label="Family" value={panelDetail.familyName ?? '—'} />
          <DetailField label="Family email" value={panelDetail.familyPrimaryEmail ?? '—'} />
        </View>
      </StoryDetailSection>

      <StoryDetailSection
        title="Enrollments"
        description="Programs this student is currently enrolled in.">
        {panelDetail.enrollments.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No enrolled programs found.</Text>
        ) : (
          panelDetail.enrollments.map((enrollment) => (
            <View
              key={enrollment.id}
              style={[styles.enrollmentCard, { borderColor: theme.line, backgroundColor: Story.cream }]}>
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
    </View>
  );

  const renderFamily = (panelDetail: EnrolledStudentDetail) => (
    <View style={styles.tabContent}>
      <StoryDetailSection
        title="Family record"
        description="Household contact details linked to this student.">
        <View style={styles.fieldGrid}>
          <DetailField label="Family name" value={panelDetail.familyName ?? '—'} />
          <DetailField label="Primary email" value={panelDetail.familyPrimaryEmail ?? '—'} />
          <DetailField label="Primary phone" value={panelDetail.familyPrimaryPhone ?? '—'} />
        </View>
      </StoryDetailSection>
    </View>
  );

  const renderHealth = (panelDetail: EnrolledStudentDetail) => (
    <View style={styles.tabContent}>
      <TeacherStudentHealthTab
        organizationId={organizationId}
        studentId={studentId}
        studentFirstName={panelDetail.firstName.trim() || studentName}
        onProfileChange={handleHealthProfileChange}
      />
    </View>
  );

  const renderTabPanel = (tabId: string) => {
    if (!detail) return null;
    if (tabId === 'overview') return renderOverview(detail);
    if (tabId === 'family') return renderFamily(detail);
    if (tabId === 'health') return renderHealth(detail);
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Story.paper }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <StudentPhoto
            name={studentName}
            photoUrl={detail?.profilePhotoUrl ?? summaryStudent?.profilePhotoUrl}
            size="lg"
            showHealthIndicator={hasStandingHealth}
          />
          <View style={styles.heroCopy}>
            <StorySectionKicker style={styles.kicker}>Student profile</StorySectionKicker>
            <View style={styles.titleRow}>
              <StoryDisplayHeading size="section" style={styles.title}>
                {studentName}
              </StoryDisplayHeading>
              <StoryChip tone="success" label="Enrolled" />
            </View>
            {headerSubtitle ? (
              <Text style={[styles.subtitle, { color: theme.muted }]}>{headerSubtitle}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {detail && !loading && !error ? (
        <SubmissionStoryTabBar tabs={tabs} activeTabId={activeTab} onChange={navigateToTab} />
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <SubmissionDetailScreenSkeleton />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={[styles.errorCopy, { color: theme.muted }]}>{error}</Text>
            <StoryButton label="Try again" variant="soft" onPress={() => void loadDetail()} />
          </View>
        ) : detail ? (
          <>
            {tabs.map((tab) =>
              visitedTabs.has(tab.id) ? (
                <View key={tab.id} style={activeTab === tab.id ? undefined : styles.hiddenTab}>
                  {renderTabPanel(tab.id)}
                </View>
              ) : null,
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  tabContent: {
    gap: Spacing.four,
  },
  hiddenTab: {
    display: 'none',
  },
  fieldGrid: {
    gap: Spacing.three,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  enrollmentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: 4,
  },
  enrollmentTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  enrollmentMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
