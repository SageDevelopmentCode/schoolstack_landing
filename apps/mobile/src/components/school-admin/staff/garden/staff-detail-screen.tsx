import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GChoiceChips, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GLink, GOutlineButton, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { AdminCopyLinkRow, AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { AdminPickerSheet } from '@/components/school-admin/garden/admin-picker-sheet';
import { READ_ONLY_NOTICE, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminInfoRow, AdminRowSkeleton, AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import {
  employmentChipTone,
  formatLastSignIn,
  staffPortalChip,
} from '@/components/school-admin/staff/garden/staff-row';
import {
  useStaffDetailController,
  type StaffDetailController,
  type StaffDetailTab,
} from '@/components/school-admin/staff/garden/use-staff-detail-controller';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { haptic } from '@/lib/haptics';
import type { StaffEmploymentStatus, StaffPortalRole } from '@/lib/school-admin-api';
import { formatEnrolledStudentName, formatStudentGrade, type AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import {
  employmentStatusLabel,
  portalRoleLabel,
  staffDisplayName,
  staffPortalLoginStatus,
} from '@/lib/school-admin/staff-labels';

type StaffDetailScreenProps = { slug: string; staffMemberId: string; organizationId: string };

function useDetailBleed() {
  const insets = useSafeAreaInsets();
  return { marginTop: -insets.top, paddingTop: insets.top };
}

/**
 * School admin › More › Staff › one member (Garden). Data and saves live in
 * `useStaffDetailController`; tabs mount on first visit and stay mounted.
 */
export function StaffDetailScreen(props: StaffDetailScreenProps) {
  const controller = useStaffDetailController(props);
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <StaffDetailSkeleton />;
  if (controller.status === 'error') return <StaffDetailError controller={controller} />;
  return <StaffDetailContent controller={controller} />;
}

/** Toasts, confirms, copy-link, in-sheet assign status. The controller reports failures. */
function useStaffDetailFeedback(controller: StaffDetailController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [pickerNotice, setPickerNotice] = useState<AdminSheetNotice | null>(null);
  const { member, saveProfile, runPortalAction, unassignStudent, assignStudents, closePicker, openPicker } = controller;
  const firstName = member?.firstName || (member ? staffDisplayName(member) : 'This staff member');

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Staff record',
    id: `admin-staff-refresh-${controller.staffMemberId}`,
  });

  const guard = useCallback(
    (fn: () => void) => () => {
      if (readOnly) return notifyReadOnly();
      fn();
    },
    [notifyReadOnly, readOnly],
  );

  const save = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    void action.run(saveProfile, {
      key: 'staff-profile',
      retry: true,
      success: { title: 'Profile saved', description: `${firstName}'s record is up to date.` },
      error: (err) => ({
        title: "Couldn't save the profile",
        description: `${errorText(err, 'Failed to update staff member.')} Your edits are still here.`,
      }),
    });
  }, [action, firstName, notifyReadOnly, readOnly, saveProfile]);

  const reactivate = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    void action.run(() => runPortalAction('reactivate'), {
      key: 'staff-portal',
      retry: true,
      success: { title: 'Portal access restored', description: `${firstName} can sign in again with a one-time code.` },
      error: (err) => ({
        title: "Couldn't reactivate portal access",
        description: `${errorText(err, 'Failed to update portal access.')} ${firstName} still can't sign in.`,
      }),
    });
  }, [action, firstName, notifyReadOnly, readOnly, runPortalAction]);

  const deactivate = useCallback(async () => {
    if (readOnly) return notifyReadOnly();
    const confirmed = await confirmDestructive({
      title: 'Deactivate portal access',
      message: 'This will revoke sign-in access for this staff member. You can reactivate later.',
      confirmLabel: 'Deactivate',
    });
    if (!confirmed) return;
    void action.run(() => runPortalAction('deactivate'), {
      key: 'staff-portal',
      retry: true,
      success: { title: 'Portal access turned off', description: `${firstName} can't sign in now. Reactivate any time.` },
      error: (err) => ({
        title: "Couldn't deactivate portal access",
        description: `${errorText(err, 'Failed to update portal access.')} ${firstName} can still sign in.`,
      }),
    });
  }, [action, firstName, notifyReadOnly, readOnly, runPortalAction]);

  const copyLink = useCallback(() => {
    const url = controller.loginUrl;
    void action.run(() => Clipboard.setStringAsync(url), {
      key: 'staff-copy-login',
      operation: 'school_admin_staff_copy_login_url',
      success: { title: 'Sign-in link copied', description: `Send it to ${firstName} so they can sign in.` },
      error: { title: "Couldn't copy the link", description: `Copy it by hand: ${url}` },
      retry: true,
    });
  }, [action, controller.loginUrl, firstName]);

  const remove = useCallback(
    async (student: AdminEnrolledStudentSummary) => {
      if (readOnly) return notifyReadOnly();
      const name = formatEnrolledStudentName(student);
      const staffName = member ? staffDisplayName(member) : 'this staff member';
      const confirmed = await confirmDestructive({
        title: 'Remove student',
        message: `Unassign ${name} from ${staffName}?`,
        confirmLabel: 'Remove',
      });
      if (!confirmed) return;
      void action.run(() => unassignStudent(student.id), {
        key: `staff-unassign-${student.id}`,
        retry: true,
        success: { title: `${student.firstName || name} unassigned`, description: `They're no longer on ${firstName}'s list.` },
        error: (err) => ({
          title: `Couldn't remove ${student.firstName || name}`,
          description: `${errorText(err, 'Failed to unassign student.')} They're still assigned.`,
        }),
      });
    },
    [action, firstName, member, notifyReadOnly, readOnly, unassignStudent],
  );

  const openAssign = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    setPickerNotice(null);
    openPicker();
  }, [notifyReadOnly, openPicker, readOnly]);

  const closeAssign = useCallback(() => {
    setPickerNotice(null);
    closePicker();
  }, [closePicker]);

  const assign = useCallback(
    async (studentIds: string[]): Promise<boolean> => {
      if (readOnly) {
        setPickerNotice(READ_ONLY_NOTICE);
        return false;
      }
      setPickerNotice(null);
      let failure = '';
      const ok = await action.run(() => assignStudents(studentIds), {
        key: 'staff-assign',
        silent: true,
        error: (err) => {
          failure = errorText(err, 'Failed to assign students.');
          return { title: "Couldn't assign students" };
        },
      });
      if (!ok) {
        setPickerNotice({
          tone: 'error',
          title: 'Students weren’t assigned',
          description: `${failure} Nobody was added. Check your connection, then tap Assign again.`,
        });
        return false;
      }
      const count = studentIds.length;
      closeThen(closeAssign, () =>
        action.toast.success(`${count} student${count === 1 ? '' : 's'} assigned`, {
          id: 'staff-assign',
          description: `They're now on ${firstName}'s list.`,
        }),
      );
      return true;
    },
    [action, assignStudents, closeAssign, firstName, readOnly],
  );

  return {
    action,
    readOnly,
    guard,
    pullRefreshing,
    onPullRefresh,
    save,
    reactivate,
    deactivate,
    copyLink,
    remove,
    openAssign,
    closeAssign,
    assign,
    pickerNotice,
  };
}

const TABS = [
  { id: 'profile' as const, label: 'Profile', icon: 'grid-outline' as const, testID: 'staff-tab-profile' },
  { id: 'portal' as const, label: 'Portal access', icon: 'log-in-outline' as const, testID: 'staff-tab-portal' },
  { id: 'students' as const, label: 'Learners & groups', icon: 'people-outline' as const, testID: 'staff-tab-students' },
  { id: 'contact' as const, label: 'Contact', icon: 'mail-outline' as const, testID: 'staff-tab-contact' },
];

const EMPLOYMENT_OPTIONS: { id: StaffEmploymentStatus; label: string }[] = [
  { id: 'active', label: employmentStatusLabel('active') },
  { id: 'on_leave', label: employmentStatusLabel('on_leave') },
  { id: 'inactive', label: employmentStatusLabel('inactive') },
];

const ROLE_OPTIONS: { id: StaffPortalRole; label: string }[] = [
  { id: 'teacher', label: portalRoleLabel('teacher') },
  { id: 'staff', label: portalRoleLabel('staff') },
];

function StaffDetailContent({ controller }: { controller: StaffDetailController }) {
  const feedback = useStaffDetailFeedback(controller);
  const accent = useGardenAccent();
  const bleed = useDetailBleed();
  const updated = useUpdatedLabel(controller.lastUpdatedAt);
  const member = controller.member!;
  const { activeTab, visitedTabs, isEditing, form } = controller;

  const displayName = staffDisplayName(member);
  const subtitle = `${member.roleTitle || 'No job title'} · ${portalRoleLabel(member.portalRole)}`;
  const loginStatus = staffPortalLoginStatus(member);
  const portalChip = staffPortalChip(loginStatus);
  const showReactivate = member.membershipStatus === 'disabled' || member.employmentStatus === 'inactive';
  const staffIsActive = member.employmentStatus === 'active';
  const portalBusy = controller.portalAction !== null;
  const copied = feedback.action.flashKey === 'staff-copy-login';
  const profileFlash = feedback.action.flashKey === 'staff-profile';

  const portalSteps = useMemo<GStep[]>(() => {
    const accessOn = !showReactivate;
    return [
      {
        id: 'access',
        title: accessOn ? 'Portal access is on' : 'Portal access is off',
        meta: accessOn ? `${portalRoleLabel(member.portalRole)} portal` : 'Reactivate below to restore sign-in.',
        state: accessOn ? 'done' : 'current',
      },
      {
        id: 'linked',
        title: loginStatus.accountLinked ? 'Account linked' : 'No account yet',
        meta: loginStatus.accountLinked
          ? member.email ?? null
          : `They sign in with a one-time code sent to ${member.email || 'their email'}.`,
        state: loginStatus.accountLinked ? 'done' : accessOn ? 'current' : 'todo',
      },
      {
        id: 'signed-in',
        title: loginStatus.hasEverSignedIn ? 'Signed in' : 'Never signed in',
        meta:
          loginStatus.hasEverSignedIn && loginStatus.lastSignInAt
            ? `Last sign-in ${formatLastSignIn(loginStatus.lastSignInAt)}`
            : 'Share the sign-in link below.',
        state: loginStatus.hasEverSignedIn ? 'done' : loginStatus.accountLinked ? 'current' : 'todo',
      },
    ];
  }, [loginStatus, member.email, member.portalRole, showReactivate]);

  const panel = (tab: StaffDetailTab, children: ReactNode) =>
    visitedTabs.has(tab) ? (
      <ScrollView
        key={tab}
        style={[styles.panel, activeTab !== tab && styles.hidden]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={feedback.pullRefreshing} onRefresh={() => void feedback.onPullRefresh()} tintColor={Garden.soft} />
        }>
        {children}
      </ScrollView>
    ) : null;

  const pickerItems = useMemo(() => {
    const assigned = new Set(controller.students.map((student) => student.id));
    return controller.enrolled
      .filter((student) => !assigned.has(student.id))
      .sort((a, b) => formatEnrolledStudentName(a).localeCompare(formatEnrolledStudentName(b)))
      .map((student) => {
        const others = student.assignedTeachers.filter((teacher) => teacher.id !== member.id).map((teacher) => teacher.name);
        return {
          id: student.id,
          title: formatEnrolledStudentName(student),
          meta: others.length > 0 ? `Teachers: ${others.join(', ')}` : formatStudentGrade(student.grade),
          searchText: [formatStudentGrade(student.grade) ?? '', student.programNames.join(' ')].join(' '),
        };
      });
  }, [controller.enrolled, controller.students, member.id]);

  return (
    <View style={[styles.root, bleed]} testID="school-admin-staff-member-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <GBackHeader
          backLabel="Staff"
          backAccessibilityLabel="Back to staff"
          onBack={controller.goBack}
          title={displayName}
          subtitle={subtitle}
          aside={<AdminInitialsAvatar name={displayName} size="lg" />}>
          <View style={styles.heroChips}>
            <GChip label={employmentStatusLabel(member.employmentStatus)} tone={employmentChipTone(member.employmentStatus)} />
            <GChip label={portalChip.label} tone={portalChip.tone} />
            {updated ? <Text style={styles.updated}>{updated}</Text> : null}
          </View>
        </GBackHeader>

        {isEditing ? (
          <View style={styles.editBar} accessibilityLiveRegion="polite">
            <View style={styles.editCopy}>
              <Text style={styles.editTitle}>Editing profile</Text>
              <Text style={styles.editMeta}>{controller.formDirty ? 'Changes not saved yet' : 'No changes yet'}</Text>
            </View>
            <GOutlineButton label="Cancel" accessibilityLabel="Cancel editing" onPress={controller.cancelEditing} />
            <GToyButton
              label={controller.saving ? 'Saving…' : 'Save'}
              icon="checkmark"
              accessibilityLabel="Save changes"
              loading={controller.saving}
              disabled={!controller.formDirty || controller.saving || !form?.firstName.trim() || !form?.lastName.trim()}
              onPress={feedback.save}
            />
          </View>
        ) : (
          <GOutlineButton
            label="Edit profile"
            icon="create-outline"
            accessibilityLabel="Edit staff member"
            onPress={feedback.guard(controller.startEditing)}
            style={styles.editButton}
          />
        )}

        <GSegmented<StaffDetailTab>
          accessibilityLabel="Staff sections"
          compact
          scrollable
          items={TABS}
          activeId={activeTab}
          onChange={controller.setActiveTab}
        />
      </View>

      <View style={styles.panel}>
        {panel(
          'profile',
          <GCard index={0} title="Profile" style={profileFlash && styles.flash}>
            {isEditing && form ? (
              <View style={styles.form}>
                <GTextField label="First name" value={form.firstName} onChangeText={(firstName) => controller.updateForm({ firstName })} />
                <GTextField label="Last name" value={form.lastName} onChangeText={(lastName) => controller.updateForm({ lastName })} />
                <GTextField
                  label="Job title"
                  value={form.roleTitle}
                  onChangeText={(roleTitle) => controller.updateForm({ roleTitle })}
                  placeholder="Lead Teacher"
                />
                <GChoiceChips<StaffEmploymentStatus>
                  label="Employment status"
                  options={EMPLOYMENT_OPTIONS}
                  value={form.employmentStatus}
                  onChange={(employmentStatus) => controller.updateForm({ employmentStatus })}
                  helper="To revoke sign-in access, use Deactivate on the Portal access tab."
                />
              </View>
            ) : (
              <>
                <AdminInfoRow label="Name" value={displayName} />
                <AdminInfoRow label="Job title" value={member.roleTitle} divider />
                <AdminInfoRow label="Employment status" value={employmentStatusLabel(member.employmentStatus)} divider />
              </>
            )}
          </GCard>,
        )}

        {panel(
          'portal',
          <>
            <GCard index={0} title="Portal access">
              <Text style={styles.description}>Employment status and portal access are managed separately.</Text>
              <GStepList steps={portalSteps} accessibilityLabel="Portal access steps" style={styles.steps} />
            </GCard>

            <GCard index={1} title="Role">
              {isEditing && form ? (
                <GChoiceChips<StaffPortalRole>
                  options={ROLE_OPTIONS}
                  value={form.portalRole}
                  onChange={(portalRole) => controller.updateForm({ portalRole })}
                />
              ) : (
                <AdminInfoRow label="Portal role" value={portalRoleLabel(member.portalRole)} />
              )}
            </GCard>

            <GCard index={2} title="Sign-in link">
              <Text style={styles.description}>Teachers and staff sign in here with a one-time code.</Text>
              <AdminCopyLinkRow url={controller.loginUrl} copied={copied} onCopy={feedback.copyLink} />
            </GCard>

            <GCard index={3} title={showReactivate ? 'Restore access' : 'Revoke access'}>
              {showReactivate ? (
                <>
                  <Text style={styles.description}>
                    {displayName} can&apos;t sign in right now. Reactivating sends them back to the portal with the same role.
                  </Text>
                  <GToyButton
                    label={controller.portalAction === 'reactivate' ? 'Reactivating…' : 'Reactivate portal access'}
                    icon="refresh"
                    loading={controller.portalAction === 'reactivate'}
                    disabled={portalBusy}
                    onPress={feedback.reactivate}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.description}>This will revoke sign-in access for this staff member. You can reactivate later.</Text>
                  <GPressable
                    accessibilityLabel="Deactivate portal access"
                    accessibilityState={{ busy: controller.portalAction === 'deactivate', disabled: portalBusy }}
                    disabled={portalBusy}
                    onPress={() => void feedback.deactivate()}
                    style={styles.danger}>
                    {controller.portalAction === 'deactivate' ? (
                      <ActivityIndicator size="small" color="#9F3A1E" />
                    ) : (
                      <Text style={styles.dangerLabel}>Deactivate portal access</Text>
                    )}
                  </GPressable>
                </>
              )}
            </GCard>
          </>,
        )}

        {panel(
          'students',
          <GCard
            index={0}
            title="Learners & groups"
            action={staffIsActive ? <GLink label="Assign student" icon="add" onPress={feedback.openAssign} /> : null}>
            <Text style={styles.countLine} accessibilityLiveRegion="polite">
              {!controller.studentsLoaded ? 'Loading…' : `${controller.students.length} assigned`}
            </Text>
            {!controller.studentsLoaded ? (
              <AdminRowSkeleton count={3} />
            ) : controller.studentsError ? (
              <GInlineBanner
                tone="error"
                title="Couldn't load assigned students"
                description={controller.studentsError}
                action={<GLink label="Try again" icon="refresh" onPress={() => void controller.retryStudents()} />}
              />
            ) : controller.students.length === 0 ? (
              <AdminEmptyPanel
                icon="people-outline"
                title="No students assigned yet."
                actionLabel={staffIsActive ? 'Assign student' : undefined}
                onAction={staffIsActive ? feedback.openAssign : undefined}
              />
            ) : (
              controller.students.map((student, index) => {
                const name = formatEnrolledStudentName(student);
                const program = student.programNames.length > 0 ? student.programNames.join(', ') : '—';
                const removing = controller.removingStudentId === student.id;
                return (
                  <AdminWorkRow
                    key={student.id}
                    divider={index > 0}
                    title={name}
                    meta={`${formatStudentGrade(student.grade) ?? '—'} · ${program}`}
                    accessibilityLabel={name}
                    accessibilityHint="Opens the student record"
                    onPress={() => controller.openStudent(student.id)}
                    leading={
                      <StudentPhoto
                        name={name}
                        photoUrl={student.profilePhotoUrl}
                        size="row"
                        showHealthIndicator={student.hasStandingHealthItems}
                      />
                    }
                    trailing={
                      staffIsActive ? (
                        <GPressable
                          accessibilityLabel={`Remove ${name}`}
                          accessibilityState={{ busy: removing, disabled: removing }}
                          disabled={removing}
                          haptic="select"
                          onPress={() => void feedback.remove(student)}
                          style={styles.removePill}>
                          {removing ? (
                            <ActivityIndicator size="small" color={accent.clayDeep} />
                          ) : (
                            <Text style={styles.removeLabel}>Remove</Text>
                          )}
                        </GPressable>
                      ) : undefined
                    }
                  />
                );
              })
            )}
            {!staffIsActive && controller.students.length > 0 ? (
              <Text style={styles.description}>Assign and remove are disabled while this staff member is inactive.</Text>
            ) : null}
          </GCard>,
        )}

        {panel(
          'contact',
          <GCard index={0} title="Contact">
            <AdminInfoRow label="Email" value={member.email} />
            {isEditing ? <Text style={styles.description}>Email cannot be changed here.</Text> : null}
          </GCard>,
        )}
      </View>

      <AdminPickerSheet
        visible={controller.pickerOpen}
        onClose={feedback.closeAssign}
        title="Assign students"
        subtitle={displayName}
        items={pickerItems}
        loading={controller.enrolledLoading}
        loadError={controller.enrolledError}
        onRetryLoad={() => void controller.retryEnrolled()}
        saving={controller.assigning}
        notice={feedback.pickerNotice}
        searchPlaceholder="Search students"
        searchAccessibilityLabel="Search students"
        emptyText="No students available to assign."
        noMatchText="No students match your search."
        saveLabel={(count) => `Assign (${count})`}
        savingLabel="Assigning…"
        onSave={feedback.assign}
      />
    </View>
  );
}

function StaffDetailError({ controller }: { controller: StaffDetailController }) {
  const bleed = useDetailBleed();
  const notFound = controller.error === 'Staff member not found.';
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <GBackHeader backLabel="Staff" backAccessibilityLabel="Back to staff" onBack={controller.goBack} title="Staff member" />
      <GErrorCard
        title={notFound ? "We couldn't find this staff member" : "We couldn't load this staff member"}
        message={controller.error ?? 'Staff member not found.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function StaffDetailSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading staff member" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skBack} />
      <View style={styles.skHero}>
        <View style={styles.skHeroCopy}>
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skSub} />
          <GSkeleton style={styles.skChip} />
        </View>
        <GSkeleton style={styles.skPhoto} />
      </View>
      <GSkeleton style={styles.skButton} />
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skCard} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 12 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, marginLeft: 2 },
  editButton: { alignSelf: 'flex-start' },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Garden.butter,
  },
  editCopy: { flex: 1, minWidth: 0 },
  editTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  editMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: '#6B4F00' },
  panel: { flex: 1 },
  hidden: { display: 'none' },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },
  flash: { backgroundColor: Garden.mint },
  form: { gap: 14 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 10 },
  steps: { marginTop: 4 },
  countLine: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, marginBottom: 6, fontVariant: ['tabular-nums'] },
  danger: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#C2714F',
    backgroundColor: '#F9E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  dangerLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: '#9F3A1E' },
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
  errorWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 100, height: 20, borderRadius: 10 },
  skHero: { flexDirection: 'row', gap: 12 },
  skHeroCopy: { flex: 1, gap: 8 },
  skTitle: { width: '70%', height: 30, borderRadius: 10 },
  skSub: { width: '85%', height: 14, borderRadius: 7 },
  skChip: { width: 80, height: 24, borderRadius: 12 },
  skPhoto: { width: 56, height: 56, borderRadius: 28 },
  skButton: { width: 130, height: 44, borderRadius: 22 },
  skTabs: { height: 40, borderRadius: 20, marginTop: 4 },
  skCard: { height: 220, borderRadius: 22 },
});
