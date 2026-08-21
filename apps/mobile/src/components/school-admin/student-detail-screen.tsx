import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DetailSection } from '@/components/school-admin/detail-section';
import { DetailTabBar, type DetailTab } from '@/components/school-admin/detail-tab-bar';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StudentTeacherAssignPicker } from '@/components/school-admin/student-teacher-assign-picker';
import { SubmissionGuardiansSection } from '@/components/school-admin/submission-detail-sections';
import { ThemedText } from '@/components/themed-text';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import { listFamilyGuardians, type FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import {
  assignStudentTeacher,
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  loadEnrolledStudentDetail,
  listOrgStaffMembers,
  studentStatusLabel,
  type EnrolledStudentDetail,
  type OrgStaffMemberRecord,
} from '@/lib/school-admin/enrolled-students';
import { getSupabaseClient } from '@/lib/supabase';

type StudentDetailScreenProps = {
  organizationId: string;
  studentId: string;
  slug: string;
};

function StudentDetailHeader() {
  const theme = useAdminTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.headerBar,
        { borderBottomColor: theme.border, backgroundColor: theme.surface },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to students"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.accent} />
        <ThemedText type="small" style={{ color: theme.accent }}>
          Students
        </ThemedText>
      </Pressable>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        Student
      </ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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

export function StudentDetailScreen({ organizationId, studentId, slug }: StudentDetailScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [staffMembers, setStaffMembers] = useState<OrgStaffMemberRecord[]>([]);
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const activeStaff = useMemo(
    () => staffMembers.filter((member) => member.employmentStatus === 'active'),
    [staffMembers],
  );

  const tabs = useMemo<DetailTab[]>(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'family', label: 'Family' },
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

    try {
      const nextStaff = await listOrgStaffMembers(supabase, organizationId);
      setStaffMembers(nextStaff);
    } catch {
      setStaffMembers([]);
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

  const handleAssignTeacher = async (staffMemberId: string | null) => {
    if (!detail) return;
    setAssigningTeacher(true);
    try {
      const result = await assignStudentTeacher(supabase, {
        organizationId,
        studentId: detail.id,
        staffMemberId,
      });
      setDetail((current) =>
        current
          ? {
              ...current,
              assignedTeacherId: result.assignedTeacherId,
              assignedTeacherName: result.assignedTeacherName,
            }
          : current,
      );
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Failed to assign teacher.');
    } finally {
      setAssigningTeacher(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StudentDetailHeader />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.container}>
        <StudentDetailHeader />
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {error ?? 'Student not found.'}
          </ThemedText>
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
      <StudentDetailHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summary}>
          <StudentPhoto name={studentName} photoUrl={detail.profilePhotoUrl} size="lg" />
          <View style={styles.summaryCopy}>
            <ThemedText type="title" style={{ color: theme.textPrimary }}>
              {studentName}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {gradeLabel ?? 'No grade'} · {programLabel}
            </ThemedText>
            <StatusBadge
              label={studentStatusLabel(detail.status)}
              colors={{ backgroundColor: theme.successBg, color: theme.success }}
            />
          </View>
        </View>

        <DetailTabBar tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' ? (
          <View style={styles.tabContent}>
            <DetailSection
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

              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerVisible(true)}
                style={({ pressed }) => [
                  styles.teacherRow,
                  { borderColor: theme.border, backgroundColor: theme.bg },
                  pressed && { opacity: 0.85 },
                ]}>
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  Teacher
                </ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {detail.assignedTeacherName ?? 'Unassigned'}
                </ThemedText>
              </Pressable>
            </DetailSection>

            <DetailSection
              title="Enrollments"
              description="Programs this student is currently enrolled in.">
              {detail.enrollments.length === 0 ? (
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  No enrolled programs found.
                </ThemedText>
              ) : (
                detail.enrollments.map((enrollment) => (
                  <View
                    key={enrollment.id}
                    style={[
                      styles.enrollmentCard,
                      { borderColor: theme.border, backgroundColor: theme.bg },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                      {enrollment.programName}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textTertiary }}>
                      {enrollment.classroomName
                        ? `Classroom: ${enrollment.classroomName}`
                        : 'No classroom assigned'}
                      {' · '}
                      Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                    </ThemedText>
                  </View>
                ))
              )}
            </DetailSection>

            {detail.applicationId ? (
              <DetailSection
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
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    View application
                    {detail.applicationStatus
                      ? ` (${applicationStatusLabel(detail.applicationStatus)})`
                      : ''}
                  </ThemedText>
                  <Ionicons name="open-outline" size={14} color={theme.accent} />
                </Pressable>
              </DetailSection>
            ) : null}
          </View>
        ) : (
          <View style={styles.tabContent}>
            <DetailSection
              title="Family record"
              description="Household contact details linked to this student.">
              <View style={styles.fieldGrid}>
                <DetailField label="Family name" value={detail.familyName ?? '—'} />
                <DetailField label="Primary email" value={detail.familyPrimaryEmail ?? '—'} />
                <DetailField label="Primary phone" value={detail.familyPrimaryPhone ?? '—'} />
              </View>
            </DetailSection>

            <SubmissionGuardiansSection guardians={guardians} loading={guardiansLoading} />
          </View>
        )}
      </ScrollView>

      <StudentTeacherAssignPicker
        visible={pickerVisible}
        studentName={studentName}
        assignedTeacherId={detail.assignedTeacherId}
        activeStaff={activeStaff}
        assigning={assigningTeacher}
        onClose={() => setPickerVisible(false)}
        onAssign={handleAssignTeacher}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  headerBar: {
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
    paddingBottom: Spacing.six,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  summaryCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  tabContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  fieldGrid: {
    gap: Spacing.three,
  },
  field: {
    gap: 2,
  },
  teacherRow: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  enrollmentCard: {
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  applicationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
