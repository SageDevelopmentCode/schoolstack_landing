import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GLink, GOutlineButton, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { AdminIconChip, AdminInfoRow } from '@/components/school-admin/garden/admin-ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StudentHealthPanel } from '@/components/school-admin/students/garden/student-health-panel';
import type { StudentHealthSource } from '@/components/school-admin/students/garden/use-student-health';
import {
  useTeacherStudentDetailController,
  type TeacherStudentDetailController,
  type TeacherStudentTab,
} from '@/components/teacher/students/garden/use-teacher-student-detail-controller';
import { haptic } from '@/lib/haptics';
import type { MessageContact } from '@/lib/messages/types';
import {
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStudentGrade,
  studentStatusLabel,
} from '@/lib/school-admin/enrolled-students';
import type { TeacherStudentDetailScope } from '@/lib/teacher/teacher-nav';
import {
  createTeacherStudentHealthItem,
  deleteTeacherStudentHealthItem,
  fetchTeacherStudentHealthProfile,
  updateTeacherStudentHealthItem,
} from '@/lib/teacher/teacher-portal-api';
import { useStatusBarBleed } from '@/hooks/use-status-bar-bleed';

/**
 * Full-screen route inside the teacher layout's SafeAreaView (tab bar hidden):
 * let the cream run under the status bar and the home indicator.
 */
function useDetailBleed() {
  return useStatusBarBleed({ bottom: true });
}

type Props = { slug: string; studentId: string; detailAccess?: TeacherStudentDetailScope };

/**
 * Teacher › one student, full screen (Garden). Overview / Family / Health tabs
 * mount on first visit and stay mounted; health edits reuse the admin Garden
 * panel on the teacher API; "Message family" opens or starts the conversation.
 */
export function TeacherStudentDetailScreen({ slug, studentId, detailAccess = 'assigned' }: Props) {
  const controller = useTeacherStudentDetailController({ slug, studentId, detailAccess });
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <TeacherStudentDetailSkeleton />;
  if (controller.status === 'error') return <DetailError controller={controller} />;
  return <DetailContent controller={controller} />;
}

/** "Message family": one guardian → straight there; several → a picker; none → say why. */
function useMessageFamily(controller: TeacherStudentDetailController) {
  const toast = useGardenToast();
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { familyContacts, messageContact, inboxLoading, inboxError, refreshInbox } = controller;

  const start = useCallback(() => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    if (familyContacts.length === 1) {
      haptic.press();
      messageContact(familyContacts[0]);
      return;
    }
    if (familyContacts.length > 1) {
      setPickerOpen(true);
      return;
    }
    if (inboxLoading) {
      toast.info('Loading family contacts…', { id: 'teacher-message-family', description: 'Try again in a moment.' });
      return;
    }
    if (inboxError) {
      toast.error("Couldn't load family contacts", {
        id: 'teacher-message-family',
        description: 'Messages aren’t reachable right now. Nothing was sent.',
        action: { label: 'Try again', onPress: () => void refreshInbox() },
      });
      return;
    }
    toast.info('No one to message yet', {
      id: 'teacher-message-family',
      description: "This family doesn't have a guardian you can message in the app yet. Ask your school office.",
    });
  }, [familyContacts, inboxError, inboxLoading, messageContact, notifyReadOnly, readOnly, refreshInbox, toast]);

  const closePicker = useCallback(() => setPickerOpen(false), []);
  const pick = useCallback(
    (contact: MessageContact) => closeThen(closePicker, () => messageContact(contact)),
    [closePicker, messageContact],
  );
  const openContact = useCallback(
    (contact: MessageContact) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      messageContact(contact);
    },
    [messageContact, notifyReadOnly, readOnly],
  );

  return { start, pickerOpen, closePicker, pick, openContact };
}

function DetailContent({ controller }: { controller: TeacherStudentDetailController }) {
  const accent = useGardenAccent();
  const bleed = useDetailBleed();
  const { bottom } = useSafeAreaInsets();
  const updated = useUpdatedLabel(controller.loadedAt);
  const messageFamily = useMessageFamily(controller);
  const detail = controller.detail!;
  const { activeTab, visitedTabs, detailAccess, organizationId, studentId } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.reload,
    error: controller.error,
    label: 'Student',
    id: `teacher-student-refresh-${studentId}`,
  });

  const healthSource = useMemo<StudentHealthSource>(
    () => ({
      fetchProfile: () => fetchTeacherStudentHealthProfile(organizationId, studentId),
      createItem: (itemType, payload) => createTeacherStudentHealthItem(organizationId, studentId, itemType, payload),
      updateItem: (itemId, itemType, payload) =>
        updateTeacherStudentHealthItem(organizationId, studentId, itemId, itemType, payload),
      deleteItem: (itemId) => deleteTeacherStudentHealthItem(organizationId, studentId, itemId),
      saveOperation: 'teacher_student_health_save',
      deleteOperation: 'teacher_student_health_delete',
    }),
    [organizationId, studentId],
  );

  const studentName = formatEnrolledStudentName(detail);
  const firstName = detail.firstName.trim() || studentName;
  const gradeLabel = formatStudentGrade(detail.grade);
  const subtitle = `${gradeLabel ?? 'No grade'} · ${
    detail.programNames.length > 0 ? detail.programNames.join(' · ') : 'No program'
  }`;
  const showMessage = controller.messagesEnabled;

  const scroll = (tab: TeacherStudentTab, children: ReactNode) =>
    visitedTabs.has(tab) ? (
      <ScrollView
        key={tab}
        style={[styles.panel, activeTab !== tab && styles.hidden]}
        contentContainerStyle={[styles.content, { paddingBottom: 40 + bottom }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />
        }>
        {children}
      </ScrollView>
    ) : null;

  return (
    <View style={[styles.root, bleed]} testID="teacher-student-detail-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <GBackHeader
          backLabel="Back"
          backAccessibilityLabel="Back"
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
            <GChip label="Enrolled" tone="success" />
            {controller.hasStandingHealth ? (
              <GChip label="Health info on file" tone="alert" icon="medkit" />
            ) : null}
            {updated ? <Text style={styles.updated}>{updated}</Text> : null}
          </View>
          {showMessage ? (
            <GOutlineButton
              label="Message family"
              icon="chatbubble-ellipses-outline"
              testID="teacher-student-message-family"
              accessibilityHint={`Opens your conversation with ${firstName}'s family`}
              onPress={messageFamily.start}
              style={styles.messageButton}
            />
          ) : null}
        </GBackHeader>
        <GSegmented<TeacherStudentTab>
          accessibilityLabel="Student sections"
          compact
          items={[
            { id: 'overview', label: 'Overview', icon: 'grid-outline', testID: 'teacher-student-tab-overview' },
            { id: 'family', label: 'Family', icon: 'people-outline', testID: 'teacher-student-tab-family' },
            { id: 'health', label: 'Health', icon: 'heart-outline', testID: 'teacher-student-tab-health' },
          ]}
          activeId={activeTab}
          onChange={controller.setActiveTab}
        />
      </View>

      <View style={styles.panel}>
        {scroll(
          'overview',
          <>
            <GCard index={0} title="Student details">
              <Text style={styles.description}>Core profile information for this student.</Text>
              <AdminInfoRow label="Full name" value={studentName} />
              <AdminInfoRow label="Grade" value={gradeLabel ?? '—'} divider />
              {detailAccess === 'school' ? (
                <AdminInfoRow label="Teachers" value={detail.assignedTeacherNames.trim() || 'Unassigned'} divider />
              ) : null}
              <AdminInfoRow
                label="Date of birth"
                value={detail.dateOfBirth ? formatEnrolledDate(detail.dateOfBirth) : '—'}
                divider
              />
              <AdminInfoRow label="Student status" value={studentStatusLabel(detail.status)} divider />
              <AdminInfoRow label="Family" value={detail.familyName ?? '—'} divider />
              <AdminInfoRow label="Family email" value={detail.familyPrimaryEmail ?? '—'} divider />
            </GCard>

            <GCard index={1} title="Enrollments">
              <Text style={styles.description}>Programs this student is currently enrolled in.</Text>
              {detail.enrollments.length === 0 ? (
                <Text style={styles.body}>No enrolled programs found.</Text>
              ) : (
                detail.enrollments.map((enrollment, i) => (
                  <View key={enrollment.id} style={[styles.enrollment, i > 0 && styles.divider]}>
                    <AdminIconChip name="school-outline" tint={Garden.lav} />
                    <View style={styles.copy}>
                      <Text style={styles.rowTitle}>{enrollment.programName}</Text>
                      <Text style={styles.rowMeta}>
                        {enrollment.classroomName ? `Classroom: ${enrollment.classroomName}` : 'No classroom assigned'}
                        {' · '}Enrolled {formatEnrolledDate(enrollment.enrolledAt)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </GCard>

            {controller.hasStandingHealth ? (
              <GPressable
                accessibilityLabel={`${firstName} has health information on file. Open Health`}
                onPress={() => controller.setActiveTab('health')}
                style={styles.healthNudge}>
                <AdminIconChip name="medkit-outline" tint={Garden.peach} />
                <View style={styles.copy}>
                  <Text style={styles.rowTitle}>Health information on file</Text>
                  <Text style={styles.rowMeta}>Check allergies and medications before snack and outings.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
              </GPressable>
            ) : null}
          </>,
        )}

        {scroll(
          'family',
          <>
            <GCard index={0} title="Family record">
              <Text style={styles.description}>Household contact details linked to this student.</Text>
              <AdminInfoRow label="Family name" value={detail.familyName ?? '—'} />
              <AdminInfoRow label="Primary email" value={detail.familyPrimaryEmail ?? '—'} divider />
              <AdminInfoRow label="Primary phone" value={detail.familyPrimaryPhone ?? '—'} divider />
            </GCard>
            {showMessage ? (
              <FamilyContactsCard
                controller={controller}
                firstName={firstName}
                accentDeep={accent.clayDeep}
                onMessage={messageFamily.openContact}
              />
            ) : null}
          </>,
        )}

        {scroll(
          'health',
          <StudentHealthPanel
            organizationId={organizationId}
            slug={controller.slug}
            studentId={studentId}
            studentFirstName={firstName}
            onProfileChange={controller.onHealthProfileChange}
            source={healthSource}
          />,
        )}
      </View>

      <GSheet
        visible={messageFamily.pickerOpen}
        onClose={messageFamily.closePicker}
        title="Message family"
        subtitle={`Who would you like to message about ${firstName}?`}
        headerAside={<GChip label={`${controller.familyContacts.length} guardians`} tone="info" />}
        accessibilityLabel="Close message family">
        {controller.familyContacts.map((contact) => (
          <ContactRow key={contact.key} contact={contact} accentDeep={accent.clayDeep} onPress={messageFamily.pick} />
        ))}
      </GSheet>
    </View>
  );
}

function FamilyContactsCard({
  controller,
  firstName,
  accentDeep,
  onMessage,
}: {
  controller: TeacherStudentDetailController;
  firstName: string;
  accentDeep: string;
  onMessage: (contact: MessageContact) => void;
}) {
  const { familyContacts, inboxLoading, inboxError } = controller;
  return (
    <GCard index={1} title="Message the family" testID="teacher-student-family-contacts">
      <Text style={styles.description}>
        Send {firstName}&apos;s family a message. Replies show up in your Messages tab.
      </Text>
      {inboxLoading ? (
        <View style={styles.contactsLoading}>
          <GSkeleton style={styles.skContact} />
        </View>
      ) : familyContacts.length > 0 ? (
        familyContacts.map((contact) => (
          <ContactRow key={contact.key} contact={contact} accentDeep={accentDeep} onPress={onMessage} />
        ))
      ) : inboxError ? (
        <View style={styles.contactsEmpty}>
          <Text style={styles.body}>Couldn&apos;t load family contacts. {inboxError}</Text>
          <GLink label="Try again" icon="refresh" onPress={() => void controller.refreshInbox()} />
        </View>
      ) : (
        <Text style={styles.body}>
          No guardian you can message in the app yet. Ask your school office to invite the family.
        </Text>
      )}
    </GCard>
  );
}

function ContactRow({
  contact,
  accentDeep,
  onPress,
}: {
  contact: MessageContact;
  accentDeep: string;
  onPress: (contact: MessageContact) => void;
}) {
  return (
    <GPressable
      accessibilityRole="button"
      accessibilityLabel={`Message ${contact.name}${contact.subtitle ? `, ${contact.subtitle}` : ''}`}
      haptic="press"
      onPress={() => onPress(contact)}
      style={styles.contactRow}>
      <AdminIconChip name="person-outline" tint={Garden.sky} />
      <View style={styles.copy}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {contact.name}
        </Text>
        {contact.subtitle ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {contact.subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.cta, { color: accentDeep }]}>Message</Text>
      <Ionicons name="chevron-forward" size={16} color={accentDeep} />
    </GPressable>
  );
}

function DetailError({ controller }: { controller: TeacherStudentDetailController }) {
  const bleed = useDetailBleed();
  const notFound = (controller.error ?? '').startsWith('Student not found');
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <GBackHeader backLabel="Back" backAccessibilityLabel="Back" onBack={controller.goBack} title="Student" />
      <GErrorCard
        title={notFound ? "We couldn't find this student" : "We couldn't load this student"}
        message={controller.error ?? 'Student not found.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function TeacherStudentDetailSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading student"
      contentContainerStyle={styles.skeleton}>
      <StatusBar style="dark" />
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
  messageButton: { alignSelf: 'flex-start', marginTop: 4 },
  panel: { flex: 1 },
  hidden: { display: 'none' },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 8 },
  body: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  enrollment: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  rowMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  healthNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    marginTop: 8,
  },
  cta: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  contactsLoading: { gap: 8 },
  contactsEmpty: { gap: 8, alignItems: 'flex-start' },
  skContact: { height: 60, borderRadius: 16 },
  errorWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 80, height: 20, borderRadius: 10 },
  skHero: { flexDirection: 'row', gap: 12 },
  skHeroCopy: { flex: 1, gap: 8 },
  skTitle: { width: '70%', height: 30, borderRadius: 10 },
  skSub: { width: '85%', height: 14, borderRadius: 7 },
  skChip: { width: 80, height: 24, borderRadius: 12 },
  skPhoto: { width: 56, height: 56, borderRadius: 28 },
  skTabs: { height: 40, borderRadius: 20, marginTop: 4 },
  skCard: { height: 200, borderRadius: 22 },
  skCardTall: { height: 160, borderRadius: 22 },
});
