import { StyleSheet, Text, View } from 'react-native';

import { DateStamp, eventWhen, GDashedRule, GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import type { OrganizationEvent } from '@/lib/school-events/types';

/** Paper ticket with notched sides: date stamp → dashed perforation → title/time. */
export function EventTicket({
  event,
  onPress,
  notchColor,
  width,
}: {
  event: OrganizationEvent;
  onPress: () => void;
  notchColor: string;
  width?: number;
}) {
  const when = eventWhen(event);
  return (
    <GPressable
      accessibilityLabel={`${event.title}, ${when}. Open family calendar`}
      onPress={onPress}
      style={[styles.ticket, width ? { width } : null]}>
      <View style={[styles.notch, styles.notchLeft, { backgroundColor: notchColor }]} />
      <View style={[styles.notch, styles.notchRight, { backgroundColor: notchColor }]} />
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
    </GPressable>
  );
}

const styles = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Garden.paper,
    borderRadius: 16,
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
  },
  notchLeft: {
    left: -9,
  },
  notchRight: {
    right: -9,
  },
  perforation: {
    marginVertical: -4,
  },
  ticketCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  ticketTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  ticketMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
});
