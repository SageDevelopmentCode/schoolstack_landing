import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GLink, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { AdminIconChip, AdminInfoRow } from '@/components/school-admin/garden/admin-ui';
import { GuardiansCard } from '@/components/school-admin/garden/guardians-card';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import {
  AdminClassroomAssignSheet,
  type ClassroomSheetNotice,
} from '@/components/school-admin/students/garden/admin-classroom-assign-sheet';
import { StudentHealthPanel } from '@/components/school-admin/students/garden/student-health-panel';
import {
  useStudentDetailController,
  type StudentDetailController,
  type StudentDetailTab,
} from '@/components/school-admin/students/garden/use-student-detail-controller';
import { classroomSummary } from '@/components/school-admin/students/garden/use-students-list-feedback';
import { PhotoMediaConsentBadge } from '@/components/students/photo-media-consent-badge';
import { applicationStatusLabel } from '@/lib/admissions/application-status-ui';
import { haptic } from '@/lib/haptics';
import {
  formatAssignedTeachersLabel,
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  studentStatusLabel,
} from '@/lib/school-admin/enrolled-students';
import { formatStudentClassroomLabel } from '@/lib/school-admin/format-student-classroom-label';
import { useStatusBarBleed } from '@/hooks/use-status-bar-bleed';

type StudentDetailScreenProps = { organizationId: string; studentId: string; slug: string };

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function useDetailBleed() {
  return useStatusBarBleed();
}

/**
 * School admin › Students › one student (Garden). Data and saves live in
 * `useStudentDetailController`; tabs mount on first visit and stay mounted.
 */
export function StudentDetailScreen(props: StudentDetailScreenProps) {
  const controller = useStudentDetailController(props);
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <StudentDetailSkeleton />;
  if (controller.status === 'error') return <StudentDetailError controller={controller} />;
  return <StudentDetailContent controller={controller} />;
}

/** Classroom save from the sheet + pull-to-refresh toasts. */
function useStudentDetailFeedback(controller: StudentDetailController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly } = useGardenReadOnlyGate();
  const [sheetNotice, setSheetNotice] = useState<ClassroomSheetNotice | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { assignClassrooms, closeClassroomPicker, openClassroomPicker, classrooms, detail } = controller;

  const openPicker = useCallback(() => {
    setSheetNotice(null);
    openClassroomPicker();
  }, [openClassroomPicker]);

  const closePicker = useCallback(() => {
    setSheetNotice(null);
    closeClassroomPicker();
  }, [closeClassroomPicker]);

  const saveClassrooms = useCallback(
    async (classroomIds: string[]): Promise<boolean> => {
      if (!detail) return false;
      if (readOnly) {
        setSheetNotice({ tone: 'info', title: 'Read-only preview', description: 'Actions are turned off while previewing.' });
        return false;
      }
      const name = formatEnrolledStudentName(detail);
      const key = `student-classrooms-${detail.id}`;
      setSheetNotice(null);
      const ok = await action.run(() => assignClassrooms(classroomIds), {
        key,
        silent: true,
        error: (err) => ({ title: "Couldn't save classrooms", description: errorText(err, 'Failed to assign classrooms.') }),
      });
      if (!ok) {
        setSheetNotice({
          tone: 'error',
          title: "Classrooms weren't saved",
          description: `${name}'s classrooms haven't changed. Check your connection, then tap Save again.`,
        });
        return false;
      }
      const names = classrooms.filter((room) => classroomIds.includes(room.id)).map((room) => room.name);
      closeThen(closePicker, () => {
        action.toast.success(`Classrooms updated for ${detail.firstName || name}`, {
          id: key,
          description:
            names.length > 0
              ? `${name} is now in ${classroomSummary(names)}. Lead teachers sync from classrooms.`
              : `${name} isn't in a classroom now.`,
        });
      });
      return true;
    },
    [action, assignClassrooms, classrooms, closePicker, detail, readOnly],
  );

  const refreshWithStatus = useCallback(async () => {
    try {
      await controller.refresh();
      setRefreshError(null);
    } catch (err) {
      setRefreshError(errorText(err, 'Failed to load student.'));
    }
  }, [controller]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: refreshWithStatus,
    error: refreshError,
    label: 'Student',
    id: `admin-student-refresh-${controller.studentId}`,
  });

  return {
    action,
    sheetNotice,
    openPicker,
    closePicker,
    saveClassrooms,
    pullRefreshing,
    onPullRefresh,
    classroomFlash: detail ? action.flashKey === `student-classrooms-${detail.id}` : false,
  };
}

function StudentDetailContent({ controller }: { controller: StudentDetailController }) {
  const feedback = useStudentDetailFeedback(controller);
  const accent = useGardenAccent();
  const bleed = useDetailBleed();
  const updated = useUpdatedLabel(controller.lastUpdatedAt);
  const detail = controller.detail!;
  const { activeTab, visitedTabs } = controller;

  const studentName = formatEnrolledStudentName(detail);
  const gradeLabel = formatStudentGrade(detail.grade);
  const programLabel = detail.programNames.length > 0 ? detail.programNames.join(' · ') : 'No program';
  const subtitle = `${gradeLabel ?? 'No grade'} · ${programLabel}`;
  const teacherLabel = formatAssignedTeachersLabel(detail.assignedTeachers);
  const hasTeacher = teacherLabel.trim().toLowerCase() !== 'unassigned' && teacherLabel.trim().length > 0;
  const noClassroom = detail.classroomNames.length === 0;

  const scroll = (tab: StudentDetailTab, children: ReactNode) =>
    visitedTabs.has(tab) ? (
      <ScrollView
        key={tab}
        style={[styles.panel, activeTab !== tab && styles.hidden]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={feedback.pullRefreshing}
            onRefresh={() => void feedback.onPullRefresh()}
            tintColor={Garden.soft}
          />
        }>
        {children}
      </ScrollView>
    ) : null;

  return (
    <View style={[styles.root, bleed]} testID="school-admin-student-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <GBackHeader
          backLabel="Students"
          backAccessibilityLabel="Back to students"
          onBack={controller.goBack}
          title={studentName}
          subtitle={subtitle}
          aside={
            <StudentPhoto
              name={studentName}
              photoUrl={detail.profilePhotoUrl}
              size="lg"
              showHealthIndicator={controller.hasStandingHealth}
            />
          }>
          <View style={styles.heroChips}>
            <GChip label={studentStatusLabel(detail.status)} tone="success" />
            {noClassroom ? <GChip label="Needs a classroom" tone="warning" icon="alert-circle" /> : null}
            {controller.hasStandingHealth ? <GChip label="Health info on file" tone="alert" icon="medkit" /> : null}
            {updated ? <Text style={styles.updated}>{updated}</Text> : null}
          </View>
        </GBackHeader>
        <GSegmented<StudentDetailTab>
          accessibilityLabel="Student sections"
          compact
          items={[
            { id: 'overview', label: 'Overview', icon: 'grid-outline', testID: 'student-tab-overview' },
            { id: 'family', label: 'Family', icon: 'people-outline', testID: 'student-tab-family' },
            { id: 'health', label: 'Health', icon: 'heart-outline', testID: 'student-tab-health' },
          ]}
          activeId={activeTab}
          onChange={controller.setActiveTab}
        />
      </View>

      <View style={styles.panel}>
        {scroll(
          'overview',
          <>
            <GCard
              index={0}
              title="Classrooms"
              testID="student-classrooms"
              style={feedback.classroomFlash && styles.flash}>
              <Text style={styles.description}>
                Assign classrooms for this student. Lead teachers sync from classroom assignments.
              </Text>
              <GPressable
                accessibilityLabel={`Assign classrooms. ${formatStudentClassroomLabel(detail.classroomNames)}`}
                accessibilityState={{ busy: controller.assigningClassroom }}
                onPress={feedback.openPicker}
                style={[
                  styles.classroomRow,
                  noClassroom
                    ? { borderColor: '#E2B33C', backgroundColor: '#FFF6DA' }
                    : { borderColor: Garden.ink12, backgroundColor: Garden.paper },
                ]}>
                <AdminIconChip name={noClassroom ? 'add-circle-outline' : 'easel-outline'} tint={noClassroom ? Garden.butter : Garden.sky} />
                <View style={styles.classroomCopy}>
                  <Text style={styles.classroomTitle} numberOfLines={2}>
                    {noClassroom ? 'No classroom yet' : formatStudentClassroomLabel(detail.classroomNames)}
                  </Text>
                  <Text style={styles.classroomMeta} numberOfLines={1}>
                    {noClassroom ? 'Tap to assign one' : hasTeacher ? `Lead teacher · ${teacherLabel}` : 'No lead teacher yet'}
                  </Text>
                </View>
                {controller.assigningClassroom ? (
                  <ActivityIndicator size="small" color={accent.clayDeep} />
                ) : (
                  <Text style={[styles.classroomCta, { color: accent.clayDeep }]}>{noClassroom ? 'Assign' : 'Change'}</Text>
                )}
              </GPressable>
              <GLink label="Manage on Classrooms" onPress={controller.goToClassrooms} style={styles.link} />
            </GCard>

            <GCard index={1} title="Student details">
              <Text style={styles.description}>Core profile information for this enrolled student.</Text>
              <AdminInfoRow label="Full name" value={studentName} />
              <AdminInfoRow label="Grade" value={gradeLabel} divider />
              <AdminInfoRow
                label="Date of birth"
                value={detail.dateOfBirth ? formatEnrolledDate(detail.dateOfBirth) : null}
                divider
              />
              <AdminInfoRow label="Student status" value={studentStatusLabel(detail.status)} divider />
              <AdminInfoRow label="Family" value={detail.familyName} divider />
              <AdminInfoRow label="Family email" value={detail.familyPrimaryEmail} divider />
              <View style={styles.photoRow}>
                <Text style={styles.photoLabel}>Photo permissions</Text>
                <PhotoMediaConsentBadge consent={detail.photoMediaConsent} label={detail.photoMediaConsentLabel} />
              </View>
            </GCard>

            <GCard index={2} title="Enrollments">
              <Text style={styles.description}>Programs this student is currently enrolled in.</Text>
              {detail.enrollments.length === 0 ? (
                <Text style={styles.body}>No enrolled programs found.</Text>
              ) : (
                detail.enrollments.map((enrollment, i) => (
                  <View key={enrollment.id} style={[styles.enrollment, i > 0 && styles.divider]}>
                    <AdminIconChip name="school-outline" tint={Garden.lav} />
                    <View style={styles.classroomCopy}>
                      <Text style={styles.classroomTitle}>{enrollment.programName}</Text>
                      <Text style={styles.classroomMeta}>
                        {enrollment.classroomName ? `Classroom: ${enrollment.classroomName}` : 'No classroom assigned'}
                        {' · '}Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </GCard>

            {detail.applicationId ? (
              <GCard index={3} title="Admissions">
                <Text style={styles.description}>View the original application for this student.</Text>
                <GPressable
                  accessibilityLabel={`View application${
                    detail.applicationStatus ? ` (${applicationStatusLabel(detail.applicationStatus)})` : ''
                  }`}
                  onPress={controller.openApplication}
                  style={styles.applicationRow}>
                  <AdminIconChip name="document-text-outline" tint={Garden.peach} />
                  <Text style={styles.classroomTitle}>View application</Text>
                  {detail.applicationStatus ? (
                    <GChip label={applicationStatusLabel(detail.applicationStatus)} tone="neutral" />
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color={Garden.ink60} style={styles.push} />
                </GPressable>
              </GCard>
            ) : null}
          </>,
        )}

        {scroll(
          'family',
          <>
            <GCard index={0} title="Family record">
              <Text style={styles.description}>Household contact details linked to this student.</Text>
              <AdminInfoRow label="Family name" value={detail.familyName} />
              <AdminInfoRow label="Primary email" value={detail.familyPrimaryEmail} divider />
              <AdminInfoRow label="Primary phone" value={detail.familyPrimaryPhone} divider />
            </GCard>
            <GuardiansCard index={1} guardians={controller.guardians} loading={controller.guardiansLoading} />
          </>,
        )}

        {scroll(
          'health',
          <StudentHealthPanel
            organizationId={controller.organizationId}
            slug={controller.slug}
            studentId={detail.id}
            studentFirstName={detail.firstName}
            onProfileChange={controller.onHealthProfileChange}
          />,
        )}
      </View>

      <AdminClassroomAssignSheet
        visible={controller.classroomPickerOpen}
        studentName={studentName}
        studentProgramNames={detail.programNames}
        studentProgramIds={detail.programIds}
        classroomIds={detail.classroomIds}
        classrooms={controller.classrooms}
        loading={controller.classroomsLoading || (controller.classroomPickerOpen && !controller.classroomsLoaded && !controller.classroomsError)}
        loadError={controller.classroomsError}
        onRetryLoad={() => void controller.retryClassrooms()}
        saving={controller.assigningClassroom}
        notice={feedback.sheetNotice}
        onClose={feedback.closePicker}
        onAddClassroom={() => {
          feedback.closePicker();
          controller.goToClassrooms();
        }}
        onSave={feedback.saveClassrooms}
      />
    </View>
  );
}

function StudentDetailError({ controller }: { controller: StudentDetailController }) {
  const bleed = useDetailBleed();
  const notFound = controller.error === 'Student not found.';
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <GBackHeader backLabel="Students" backAccessibilityLabel="Back to students" onBack={controller.goBack} title="Student" />
      <GErrorCard
        title={notFound ? "We couldn't find this student" : "We couldn't load this student"}
        message={controller.error ?? 'Student not found.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function StudentDetailSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading student"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skBack} />
      <View style={styles.skHero}>
        <View style={styles.skHeroCopy}>
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skSub} />
          <GSkeleton style={styles.skChip} />
        </View>
        <GSkeleton style={styles.skPhoto} />
      </View>
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skCard} />
      <GSkeleton style={styles.skCardTall} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 12 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, marginLeft: 2 },
  panel: { flex: 1 },
  hidden: { display: 'none' },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },
  flash: { backgroundColor: Garden.mint },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 8 },
  body: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft },
  classroomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  classroomCopy: { flex: 1, minWidth: 0, gap: 2 },
  classroomTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  classroomMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  classroomCta: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  link: { marginTop: 12, alignSelf: 'flex-start' },
  photoRow: { paddingVertical: 10, gap: 6, borderTopWidth: 1, borderTopColor: Garden.ink06 },
  photoLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  enrollment: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  applicationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 },
  push: { marginLeft: 'auto' },
  errorWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 100, height: 20, borderRadius: 10 },
  skHero: { flexDirection: 'row', gap: 12 },
  skHeroCopy: { flex: 1, gap: 8 },
  skTitle: { width: '70%', height: 30, borderRadius: 10 },
  skSub: { width: '85%', height: 14, borderRadius: 7 },
  skChip: { width: 80, height: 24, borderRadius: 12 },
  skPhoto: { width: 56, height: 56, borderRadius: 28 },
  skTabs: { height: 40, borderRadius: 20, marginTop: 4 },
  skCard: { height: 170, borderRadius: 22 },
  skCardTall: { height: 280, borderRadius: 22 },
});
