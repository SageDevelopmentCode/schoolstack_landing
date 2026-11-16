import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GChoiceChips } from '@/components/parent/garden/fields';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GLink, GOutlineButton, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import {
  AdminClassroomFormSheet,
  type ClassroomFormInput,
} from '@/components/school-admin/classrooms/garden/admin-classroom-form-sheet';
import { CLASSROOM_STATUS_LABELS, classroomStatusTone } from '@/components/school-admin/classrooms/garden/classroom-row';
import {
  useClassroomDetailController,
  type ClassroomDetailController,
} from '@/components/school-admin/classrooms/garden/use-classroom-detail-controller';
import { AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { AdminPickerSheet, type AdminPickerItem } from '@/components/school-admin/garden/admin-picker-sheet';
import { READ_ONLY_NOTICE, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminStatStrip, AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { haptic } from '@/lib/haptics';
import { groupStudentsForClassroomPicker } from '@/lib/school-admin/classroom-roster-ui';
import type { ClassroomStaffRole } from '@/lib/school-admin/classrooms';
import { formatEnrolledStudentName, formatStudentGrade } from '@/lib/school-admin/enrolled-students';

type ClassroomDetailScreenProps = { slug: string; organizationId: string; classroomId: string };

function useDetailBleed() {
  const insets = useSafeAreaInsets();
  return { marginTop: -insets.top, paddingTop: insets.top };
}

/** School admin › More › Classrooms › one classroom (Garden). */
export function ClassroomDetailScreen(props: ClassroomDetailScreenProps) {
  const controller = useClassroomDetailController(props);
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);
  if (controller.status === 'loading') return <ClassroomDetailSkeleton />;
  if (controller.status === 'error') return <ClassroomDetailError controller={controller} />;
  return <ClassroomDetailContent controller={controller} />;
}

/** Toasts, confirms and in-sheet status. The controller reports failures. */
function useClassroomDetailFeedback(controller: ClassroomDetailController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [editNotice, setEditNotice] = useState<AdminSheetNotice | null>(null);
  const [staffNotice, setStaffNotice] = useState<AdminSheetNotice | null>(null);
  const [studentNotice, setStudentNotice] = useState<AdminSheetNotice | null>(null);
  const [role, setRole] = useState<ClassroomStaffRole>('lead');
  const roomName = controller.summary?.name ?? 'this classroom';

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Classroom',
    id: `admin-classroom-refresh-${controller.classroomId}`,
  });

  const gate = useCallback(
    (open: () => void, reset: () => void) => () => {
      if (readOnly) return notifyReadOnly();
      reset();
      open();
    },
    [notifyReadOnly, readOnly],
  );

  const openEdit = gate(controller.openEdit, () => setEditNotice(null));
  const openStaff = gate(controller.openStaffPicker, () => {
    setStaffNotice(null);
    setRole('lead');
  });
  const openStudents = gate(controller.openStudentPicker, () => setStudentNotice(null));

  const saveEdit = useCallback(
    async (input: ClassroomFormInput) => {
      if (readOnly) return setEditNotice(READ_ONLY_NOTICE);
      setEditNotice(null);
      let failure = '';
      const ok = await action.run(() => controller.saveEdit(input), {
        key: 'classroom-edit',
        silent: true,
        error: (err) => {
          failure = errorText(err, 'Failed to save classroom.');
          return { title: "Couldn't save the classroom" };
        },
      });
      if (!ok) {
        setEditNotice({ tone: 'error', title: 'Changes weren’t saved', description: `${failure} Your edits are still here.` });
        return;
      }
      closeThen(controller.closeEdit, () =>
        action.toast.success('Classroom saved', { id: 'classroom-edit', description: `${input.name} is up to date.` }),
      );
    },
    [action, controller, readOnly],
  );

  const assignStaff = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (readOnly) {
        setStaffNotice(READ_ONLY_NOTICE);
        return false;
      }
      const staffId = ids[0];
      if (!staffId) return false;
      const member = controller.staffMembers.find((entry) => entry.id === staffId);
      const name = member ? `${member.firstName} ${member.lastName}`.trim() : 'Staff member';
      setStaffNotice(null);
      let failure = '';
      const ok = await action.run(() => controller.assignStaff(staffId, role), {
        key: 'classroom-staff-assign',
        silent: true,
        error: (err) => {
          failure = errorText(err, 'Failed to assign staff.');
          return { title: "Couldn't assign staff" };
        },
      });
      if (!ok) {
        setStaffNotice({ tone: 'error', title: `${name} wasn't assigned`, description: `${failure} Nothing changed. Try again.` });
        return false;
      }
      closeThen(controller.closeStaffPicker, () =>
        action.toast.success(`${name} assigned`, {
          id: 'classroom-staff-assign',
          description: `${role === 'lead' ? 'Lead teacher' : 'Assistant'} in ${roomName}.`,
        }),
      );
      return true;
    },
    [action, controller, readOnly, role, roomName],
  );

  const assignStudents = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (readOnly) {
        setStudentNotice(READ_ONLY_NOTICE);
        return false;
      }
      setStudentNotice(null);
      let failure = '';
      const ok = await action.run(() => controller.assignStudents(ids), {
        key: 'classroom-students-assign',
        silent: true,
        error: (err) => {
          failure = errorText(err, 'Failed to assign students.');
          return { title: "Couldn't add students" };
        },
      });
      if (!ok) {
        setStudentNotice({ tone: 'error', title: 'Students weren’t added', description: `${failure} Nobody was added. Try again.` });
        return false;
      }
      closeThen(controller.closeStudentPicker, () =>
        action.toast.success(`${ids.length} student${ids.length === 1 ? '' : 's'} added`, {
          id: 'classroom-students-assign',
          description: `They're on the ${roomName} roster now.`,
        }),
      );
      return true;
    },
    [action, controller, readOnly, roomName],
  );

  const removeStaff = useCallback(
    async (staffMemberId: string, name: string) => {
      if (readOnly) return notifyReadOnly();
      const ok = await confirmDestructive({ title: 'Remove staff', message: `Remove ${name} from this classroom?`, confirmLabel: 'Remove' });
      if (!ok) return;
      void action.run(() => controller.removeStaff(staffMemberId), {
        key: `classroom-remove-${staffMemberId}`,
        retry: true,
        success: { title: `${name} removed`, description: `They're no longer on ${roomName}.` },
        error: (err) => ({ title: `Couldn't remove ${name}`, description: `${errorText(err, 'Failed to remove staff.')} They're still assigned.` }),
      });
    },
    [action, controller, notifyReadOnly, readOnly, roomName],
  );

  const removeStudent = useCallback(
    async (studentId: string, name: string) => {
      if (readOnly) return notifyReadOnly();
      const ok = await confirmDestructive({ title: 'Remove student', message: `Remove ${name} from this classroom?`, confirmLabel: 'Remove' });
      if (!ok) return;
      void action.run(() => controller.removeStudent(studentId), {
        key: `classroom-remove-${studentId}`,
        retry: true,
        success: { title: `${name} removed`, description: `They're off the ${roomName} roster.` },
        error: (err) => ({ title: `Couldn't remove ${name}`, description: `${errorText(err, 'Failed to remove student.')} They're still on the roster.` }),
      });
    },
    [action, controller, notifyReadOnly, readOnly, roomName],
  );

  const deleteRoom = useCallback(async () => {
    if (readOnly) return notifyReadOnly();
    const ok = await confirmDestructive({
      title: 'Delete classroom',
      message: 'This will remove the classroom and unassign its roster.',
    });
    if (!ok) return;
    void action.run(controller.deleteClassroom, {
      key: 'classroom-delete',
      retry: true,
      success: { title: `${roomName} deleted`, description: 'Its students and staff were unassigned.' },
      error: (err) => ({ title: "Couldn't delete the classroom", description: `${errorText(err, 'Failed to delete classroom.')} Nothing was removed.` }),
    });
  }, [action, controller.deleteClassroom, notifyReadOnly, readOnly, roomName]);

  return {
    action,
    pullRefreshing,
    onPullRefresh,
    openEdit,
    openStaff,
    openStudents,
    saveEdit,
    assignStaff,
    assignStudents,
    removeStaff,
    removeStudent,
    deleteRoom,
    editNotice,
    staffNotice,
    studentNotice,
    role,
    setRole,
  };
}

function ClassroomDetailContent({ controller }: { controller: ClassroomDetailController }) {
  const feedback = useClassroomDetailFeedback(controller);
  const accent = useGardenAccent();
  const bleed = useDetailBleed();
  const updated = useUpdatedLabel(controller.lastUpdatedAt);
  const summary = controller.summary!;
  const detail = controller.detail!;
  const { roster } = controller;
  const leads = detail.staff.filter((member) => member.role === 'lead');

  const steps = useMemo<GStep[]>(
    () => [
      {
        id: 'lead',
        title: leads.length > 0 ? 'Lead teacher assigned' : 'Assign a lead teacher',
        meta: leads.length > 0 ? leads.map((lead) => lead.name).join(', ') : 'Lead teachers sync to every student in this room.',
        state: leads.length > 0 ? 'done' : 'current',
        onPress: leads.length > 0 ? undefined : feedback.openStaff,
      },
      {
        id: 'students',
        title: roster.length > 0 ? `${roster.length} student${roster.length === 1 ? '' : 's'} on the roster` : 'Add students',
        meta: roster.length > 0 ? null : 'Pick from enrolled learners.',
        state: roster.length > 0 ? 'done' : leads.length > 0 ? 'current' : 'todo',
        onPress: roster.length > 0 ? undefined : feedback.openStudents,
      },
    ],
    [feedback.openStaff, feedback.openStudents, leads, roster.length],
  );
  const setupDone = leads.length > 0 && roster.length > 0;

  const assignedStaffIds = useMemo(() => new Set(detail.staff.map((entry) => entry.staffMemberId)), [detail.staff]);
  const staffItems = useMemo<AdminPickerItem[]>(
    () =>
      controller.staffMembers
        .filter((member) => member.employmentStatus === 'active' && !assignedStaffIds.has(member.id))
        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
        .map((member) => {
          const name = `${member.firstName} ${member.lastName}`.trim();
          return {
            id: member.id,
            title: name,
            meta: member.roleTitle,
            searchText: member.email ?? '',
            leading: <AdminInitialsAvatar name={name} size="sm" />,
          };
        }),
    [assignedStaffIds, controller.staffMembers],
  );

  const studentItems = useMemo<AdminPickerItem[]>(() => {
    const assigned = new Set(roster.map((student) => student.id));
    const groups = groupStudentsForClassroomPicker(
      controller.enrolled.filter((student) => !assigned.has(student.id)),
      summary.programName,
    );
    return groups.flatMap((group) =>
      group.students.map((student) => ({
        id: student.id,
        title: formatEnrolledStudentName(student),
        meta: [formatStudentGrade(student.grade), student.programNames[0]].filter(Boolean).join(' · ') || null,
        group: group.label,
        searchText: [student.grade ?? '', student.programNames.join(' ')].join(' '),
      })),
    );
  }, [controller.enrolled, roster, summary.programName]);

  return (
    <View style={[styles.root, bleed]} testID="school-admin-classroom-ready">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }>
        <GBackHeader
          backLabel="Classrooms"
          backAccessibilityLabel="Back to classrooms"
          onBack={controller.goBack}
          title={summary.name}
          subtitle={`${summary.programName ?? 'All programs'} · ${summary.studentCount} students · ${summary.staffCount} staff`}>
          <View style={styles.heroChips}>
            <GChip label={CLASSROOM_STATUS_LABELS[summary.status]} tone={classroomStatusTone(summary.status)} />
            {leads.length === 0 ? <GChip label="No lead teacher" tone="warning" icon="alert-circle" /> : null}
            {updated ? <Text style={styles.updated}>{updated}</Text> : null}
          </View>
        </GBackHeader>

        <View style={styles.actions}>
          <GOutlineButton label="Edit classroom" icon="create-outline" onPress={feedback.openEdit} />
          <GPressable
            accessibilityLabel={controller.deleting ? 'Deleting classroom' : 'Delete classroom'}
            accessibilityState={{ busy: controller.deleting, disabled: controller.deleting }}
            disabled={controller.deleting}
            onPress={() => void feedback.deleteRoom()}
            style={styles.danger}>
            {controller.deleting ? <ActivityIndicator size="small" color="#9F3A1E" /> : null}
            <Text style={styles.dangerLabel}>{controller.deleting ? 'Deleting…' : 'Delete classroom'}</Text>
          </GPressable>
        </View>

        <AdminStatStrip
          stats={[
            { label: 'Students', value: String(roster.length) },
            { label: 'Lead teachers', value: String(leads.length) },
            { label: 'Assistants', value: String(detail.staff.length - leads.length) },
          ]}
        />

        {!setupDone ? (
          <GCard index={0} title="Finish setting up">
            <GStepList steps={steps} accessibilityLabel="Classroom setup steps" />
          </GCard>
        ) : null}

        <GCard
          index={1}
          title="Staff"
          action={<GLink label="Assign staff" icon="add" onPress={feedback.openStaff} />}>
          <Text style={styles.description}>Lead teachers and assistants for this classroom.</Text>
          {detail.staff.length === 0 ? (
            <AdminEmptyPanel icon="person-add-outline" title="No staff assigned yet." actionLabel="Assign staff" onAction={feedback.openStaff} />
          ) : (
            detail.staff.map((member, index) => {
              const removing = controller.removingId === member.staffMemberId;
              return (
                <AdminWorkRow
                  key={member.id}
                  divider={index > 0}
                  title={member.name}
                  meta={member.role === 'lead' ? 'Lead teacher' : 'Assistant'}
                  accessibilityHint="Opens the staff record"
                  onPress={() => controller.openStaff(member.staffMemberId)}
                  leading={<AdminInitialsAvatar name={member.name} />}
                  trailing={
                    <RemovePill
                      label={`Remove ${member.name}`}
                      busy={removing}
                      color={accent.clayDeep}
                      onPress={() => void feedback.removeStaff(member.staffMemberId, member.name)}
                    />
                  }
                />
              );
            })
          )}
        </GCard>

        <GCard
          index={2}
          title="Student roster"
          action={<GLink label="Add students" icon="add" onPress={feedback.openStudents} />}>
          <Text style={styles.description}>Enrolled learners assigned to this classroom.</Text>
          {roster.length === 0 ? (
            <AdminEmptyPanel icon="people-outline" title="No students assigned yet." actionLabel="Add students" onAction={feedback.openStudents} />
          ) : (
            roster.map((student, index) => {
              const name = formatEnrolledStudentName(student);
              return (
                <AdminWorkRow
                  key={student.id}
                  divider={index > 0}
                  title={name}
                  meta={[formatStudentGrade(student.grade), student.programNames[0]].filter(Boolean).join(' · ') || null}
                  accessibilityLabel={name}
                  accessibilityHint="Opens the student record"
                  onPress={() => controller.openStudent(student.id)}
                  leading={<StudentPhoto name={name} photoUrl={student.profilePhotoUrl} size="sm" />}
                  trailing={
                    <RemovePill
                      label={`Remove ${name}`}
                      busy={controller.removingId === student.id}
                      color={accent.clayDeep}
                      onPress={() => void feedback.removeStudent(student.id, name)}
                    />
                  }
                />
              );
            })
          )}
        </GCard>
      </ScrollView>

      <AdminClassroomFormSheet
        visible={controller.editOpen}
        classroom={summary}
        programs={controller.programs}
        saving={controller.savingEdit}
        notice={feedback.editNotice}
        onClose={controller.closeEdit}
        onSubmit={(input) => void feedback.saveEdit(input)}
      />

      <AdminPickerSheet
        visible={controller.staffPickerOpen}
        onClose={controller.closeStaffPicker}
        title="Assign staff"
        subtitle={summary.name}
        mode="single"
        items={staffItems}
        saving={controller.assigningStaff}
        notice={feedback.staffNotice}
        top={
          <GChoiceChips<ClassroomStaffRole>
            label="Role"
            options={[
              { id: 'lead', label: 'Lead teacher', icon: 'star-outline' },
              { id: 'assistant', label: 'Assistant', icon: 'people-outline' },
            ]}
            value={feedback.role}
            onChange={feedback.setRole}
          />
        }
        searchPlaceholder="Search staff"
        searchAccessibilityLabel="Search staff"
        emptyText="No staff available."
        noMatchText="No staff match your search."
        saveLabel={() => 'Assign'}
        savingLabel="Assigning…"
        onSave={feedback.assignStaff}
      />

      <AdminPickerSheet
        visible={controller.studentPickerOpen}
        onClose={controller.closeStudentPicker}
        title="Add students"
        subtitle={summary.name}
        items={studentItems}
        loading={controller.enrolledLoading}
        loadError={controller.enrolledError}
        onRetryLoad={() => void controller.retryEnrolled()}
        saving={controller.assigningStudents}
        notice={feedback.studentNotice}
        searchPlaceholder="Search students"
        searchAccessibilityLabel="Search students"
        emptyText="No students available to add."
        noMatchText="No students match your search."
        saveLabel={(count) => `Add ${count}`}
        savingLabel="Adding…"
        onSave={feedback.assignStudents}
      />
    </View>
  );
}

function RemovePill({ label, busy, color, onPress }: { label: string; busy: boolean; color: string; onPress: () => void }) {
  return (
    <GPressable
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      haptic="select"
      onPress={onPress}
      style={styles.removePill}>
      {busy ? <ActivityIndicator size="small" color={color} /> : <Text style={styles.removeLabel}>Remove</Text>}
    </GPressable>
  );
}

function ClassroomDetailError({ controller }: { controller: ClassroomDetailController }) {
  const bleed = useDetailBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.content}>
      <StatusBar style="dark" />
      <GBackHeader backLabel="Classrooms" backAccessibilityLabel="Back to classrooms" onBack={controller.goBack} title="Classroom" />
      <GErrorCard
        title="We couldn't load this classroom"
        message={controller.error ?? 'Classroom not found.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function ClassroomDetailSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading classroom" contentContainerStyle={styles.content}>
      <GSkeleton style={styles.skBack} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skSub} />
      <GSkeleton style={styles.skActions} />
      <GSkeleton style={styles.skStrip} />
      <GSkeleton style={styles.skCard} />
      <GSkeleton style={styles.skCard} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40, gap: 14 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, marginLeft: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 6 },
  danger: {
    minHeight: 44,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#C2714F',
    backgroundColor: '#F9E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dangerLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: '#9F3A1E' },
  removePill: {
    minHeight: 36,
    minWidth: 76,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
  skBack: { width: 120, height: 20, borderRadius: 10 },
  skTitle: { width: '65%', height: 30, borderRadius: 10 },
  skSub: { width: '85%', height: 14, borderRadius: 7 },
  skActions: { width: '80%', height: 44, borderRadius: 22 },
  skStrip: { height: 70, borderRadius: 16 },
  skCard: { height: 200, borderRadius: 22 },
});
