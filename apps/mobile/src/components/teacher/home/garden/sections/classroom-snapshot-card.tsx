import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { DateStamp, eventWhen, GCard, GDashedRule, GKicker, GLink, GPressable } from '@/components/parent/garden/ui';
import { AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import type { OrganizationEvent } from '@/lib/school-events/types';

function snapshotCopy(schoolName: string, studentCount: number, myStudentsEnabled: boolean) {
  const plural = studentCount === 1 ? '' : 's';
  return {
    title: studentCount > 0 ? `${studentCount} learner${plural} in your care` : 'Your classroom',
    body:
      studentCount > 0
        ? `You're assigned to ${studentCount} enrolled learner${plural} at ${schoolName}.`
        : myStudentsEnabled
          ? 'No learners are assigned to you yet. Your administrator can link students from the staff directory.'
          : `Welcome to ${schoolName}'s staff portal.`,
  };
}

/** Paper ticket with notched sides: date stamp → dashed perforation → title/time. */
function EventTicket({ event, onPress }: { event: OrganizationEvent; onPress?: () => void }) {
  const when = eventWhen(event);
  const body = (
    <>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
      <DateStamp date={event.date} />
      <GDashedRule vertical color={Garden.ink25} style={styles.perforation} />
      <View style={styles.ticketCopy}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.ticketMeta} numberOfLines={1}>
          {when}
        </Text>
      </View>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.ticket} accessible accessibilityLabel={`Next up: ${event.title}, ${when}`}>
        {body}
      </View>
    );
  }
  return (
    <GPressable
      accessibilityLabel={`Next up: ${event.title}, ${when}. Open school calendar`}
      onPress={onPress}
      style={styles.ticket}>
      {body}
    </GPressable>
  );
}

/**
 * Classroom snapshot: who's in your care, the next school event as a ticket, and
 * (when the bulletin is off) the school-updates row into Messages.
 */
export function ClassroomSnapshotCard({
  schoolName,
  studentCount,
  myStudentsEnabled,
  nextEvent,
  calendarEnabled,
  onViewCalendar,
  showSchoolUpdates,
  messagesUnreadCount,
  onOpenMessages,
  index = 0,
}: {
  schoolName: string;
  studentCount: number;
  myStudentsEnabled: boolean;
  nextEvent: OrganizationEvent | null;
  calendarEnabled: boolean;
  onViewCalendar: () => void;
  showSchoolUpdates: boolean;
  messagesUnreadCount: number;
  onOpenMessages: () => void;
  index?: number;
}) {
  const copy = snapshotCopy(schoolName, studentCount, myStudentsEnabled);
  const unread = messagesUnreadCount > 0;

  return (
    <GCard title={copy.title} index={index} testID="teacher-home-snapshot">
      <Text style={styles.body}>{copy.body}</Text>

      {nextEvent ? (
        <View style={styles.block}>
          <GKicker>Next up</GKicker>
          <EventTicket event={nextEvent} onPress={calendarEnabled ? onViewCalendar : undefined} />
        </View>
      ) : null}

      {showSchoolUpdates ? (
        <View style={styles.block}>
          <GKicker>School updates</GKicker>
          <AdminWorkRow
            testID="teacher-home-school-updates"
            icon="chatbubble-outline"
            tint={unread ? Garden.butter : Garden.lav}
            title={
              unread
                ? `${messagesUnreadCount} unread message${messagesUnreadCount === 1 ? '' : 's'}`
                : 'Messages from families and staff'
            }
            meta={unread ? 'Families are waiting on your response.' : 'Check your inbox for school communications.'}
            ctaLabel="Open messages"
            onPress={onOpenMessages}
          />
        </View>
      ) : null}

      {calendarEnabled ? (
        <GLink label="View school calendar" onPress={onViewCalendar} style={styles.link} />
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 21, color: Garden.soft },
  block: { gap: 8, marginTop: 16 },
  link: { marginTop: 12 },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Garden.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 76,
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: '50%',
    width: 18,
    height: 18,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: Garden.white,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  notchLeft: { left: -10 },
  notchRight: { right: -10 },
  perforation: { marginVertical: -4 },
  ticketCopy: { flex: 1, minWidth: 0, gap: 2 },
  ticketTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  ticketMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
});
