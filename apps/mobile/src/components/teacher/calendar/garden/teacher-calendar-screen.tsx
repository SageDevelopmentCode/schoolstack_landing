import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CalendarPortal } from '@/components/parent/calendar/garden/calendar-portal';
import {
  ParentCalendarGardenScreen,
  type CalendarManage,
} from '@/components/parent/calendar/garden/parent-calendar-garden-screen';
import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GToyButton } from '@/components/parent/garden/ui';
import { errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { EventFormSheet } from '@/components/school-admin/schedule/garden/schedule-events-panel';
import {
  useOrganizationEventsManager,
  type OrganizationEventsManagerFeedback,
} from '@/components/school-admin/schedule/use-organization-events-manager';
import {
  useTeacherCalendarController,
  type TeacherCalendarController,
} from '@/components/teacher/calendar/garden/use-teacher-calendar-controller';
import { formatDateOnlyLabel } from '@/lib/admissions/admissions-availability';
import { haptic } from '@/lib/haptics';
import type { OrganizationEvent } from '@/lib/school-events/types';

const TEACHER_CALENDAR_PORTAL: CalendarPortal = {
  testIdPrefix: 'teacher-calendar',
  operationPrefix: 'teacher_calendar',
  previewShareNotice: 'Copying and sharing are turned off while previewing.',
  shareTip: '“Share event” sends it to Messages, Notes or email, so your co-teachers have the plan too.',
};

const READ_ONLY_NOTICE = {
  tone: 'info' as const,
  title: 'Read-only preview',
  description: 'Actions are turned off while previewing.',
};

/**
 * Teacher › Calendar (Garden). Reuses the parent Garden calendar (Day / Week /
 * Month, swipe, spotlight, school agenda, event sheet with Copy / Share / Maps).
 * Staff who can manage events also get Add / Edit / Delete on the shared events
 * manager (same `teacher_calendar_event_*` operations), with in-sheet status,
 * a delete confirm and toasts after each sheet closes.
 */
export function TeacherCalendarScreen({ organizationId }: { organizationId: string; slug: string }) {
  const controller = useTeacherCalendarController(organizationId);

  if (!controller.calendarEnabled) return <CalendarDisabled />;
  if (controller.canManageEvents) return <ManageCalendar controller={controller} />;
  return (
    <ParentCalendarGardenScreen
      controller={controller.screen}
      agendaTitle="School agenda"
      portal={TEACHER_CALENDAR_PORTAL}
    />
  );
}

function ManageCalendar({ controller }: { controller: TeacherCalendarController }) {
  const { screen, reportError } = controller;
  const toast = useGardenToast();
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [formNotice, setFormNotice] = useState<AdminSheetNotice | null>(null);
  const [sheetNotice, setSheetNotice] = useState<CalendarManage['sheetNotice']>(null);

  const feedback = useMemo<OrganizationEventsManagerFeedback>(
    () => ({
      onValidationError: (title, message) => {
        haptic.warning();
        setFormNotice({ tone: 'info', title, description: message });
      },
      onSaved: ({ mode, title, date }) => {
        haptic.success();
        // The form closes first; toasts sit behind open sheets.
        setTimeout(
          () =>
            toast.success(mode === 'create' ? 'Event added' : 'Event updated', {
              id: 'teacher-calendar-event-saved',
              description: `${title} · ${formatDateOnlyLabel(date)}. Families see it in the parent portal.`,
            }),
          220,
        );
      },
      onSaveError: (error) => {
        haptic.error();
        setFormNotice({
          tone: 'error',
          title: "The event wasn't saved",
          description: `${errorText(error, 'Failed to save event.')} Your details are still here.`,
        });
      },
      onDeleted: ({ title }) => {
        haptic.success();
        setTimeout(
          () =>
            toast.success('Event deleted', {
              id: 'teacher-calendar-event-deleted',
              description: `${title} is off the calendar.`,
            }),
          220,
        );
      },
      onDeleteError: (error) => {
        haptic.error();
        setSheetNotice({
          tone: 'error',
          title: "Couldn't delete the event",
          description: `${errorText(error, 'Failed to delete event.')} The event is still on the calendar.`,
        });
      },
    }),
    [toast],
  );

  const manager = useOrganizationEventsManager({
    organizationId: screen.organizationId,
    events: screen.events,
    onAfterMutate: screen.refresh,
    reportError,
    reportErrorPrefix: 'teacher_calendar',
    feedback,
  });
  const { openCreateForm, openEditForm, deleteEvent } = manager;

  const onAddEvent = useCallback(
    (date?: string) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      haptic.press();
      setFormNotice(null);
      openCreateForm(date);
    },
    [notifyReadOnly, openCreateForm, readOnly],
  );

  const onEditEvent = useCallback(
    (event: OrganizationEvent) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      setFormNotice(null);
      openEditForm(event);
    },
    [notifyReadOnly, openEditForm, readOnly],
  );

  const onDeleteEvent = useCallback(
    async (event: OrganizationEvent) => {
      if (readOnly) {
        haptic.warning();
        setSheetNotice(READ_ONLY_NOTICE);
        return false;
      }
      const ok = await confirmDestructive({
        title: 'Delete event?',
        message: `${event.title} will be removed from the parent calendar.`,
      });
      if (!ok) return false;
      setSheetNotice(null);
      return deleteEvent(event);
    },
    [deleteEvent, readOnly],
  );

  const manage: CalendarManage = {
    onAddEvent,
    // Runs after the event sheet has closed, so the read-only toast is visible.
    onEditEvent,
    onDeleteEvent,
    deleting: manager.deleting,
    sheetNotice,
    onSheetClosed: () => setSheetNotice(null),
    header: (
      <View style={styles.manageHeader}>
        <View style={styles.manageCopy}>
          <GChip label="You can edit" tone="info" icon="create-outline" />
          <Text style={styles.manageHelper}>Add and manage events families see in the parent portal.</Text>
        </View>
        <GToyButton
          testID="teacher-calendar-add-event"
          label="Add event"
          icon="add"
          size="sm"
          accessibilityHint={
            screen.calendar.selectedDate ? 'Opens the event form for the selected day' : 'Opens the event form'
          }
          onPress={() => onAddEvent(screen.calendar.selectedDate ?? undefined)}
        />
      </View>
    ),
  };

  return (
    <>
      <ParentCalendarGardenScreen
        controller={screen}
        agendaTitle="School agenda"
        portal={TEACHER_CALENDAR_PORTAL}
        manage={manage}
      />
      <EventFormSheet
        visible={manager.formOpen}
        mode={manager.formMode}
        form={manager.form}
        isDirty={manager.isFormDirty}
        saving={manager.saving}
        notice={formNotice}
        onClose={() => {
          setFormNotice(null);
          manager.setFormOpen(false);
        }}
        onChange={(next) => {
          if (formNotice?.tone === 'info') setFormNotice(null);
          manager.setForm(next);
        }}
        onSave={() => {
          if (readOnly) {
            setFormNotice({ tone: 'info', title: READ_ONLY_NOTICE.title, description: READ_ONLY_NOTICE.description });
            return;
          }
          setFormNotice(null);
          void manager.handleSave();
        }}
      />
    </>
  );
}

function CalendarDisabled() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.disabledWrap}>
      <StatusBar style="dark" />
      <GCard title="Calendar is not enabled" index={0} testID="teacher-calendar-disabled">
        <Text style={styles.disabledCopy}>
          Your school has not turned on the calendar for teachers in the mobile app.
        </Text>
      </GCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  disabledWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  disabledCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14.5, lineHeight: 22, color: Garden.soft },
  manageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  manageCopy: { flex: 1, minWidth: 0, gap: 6, alignItems: 'flex-start' },
  manageHelper: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
});
