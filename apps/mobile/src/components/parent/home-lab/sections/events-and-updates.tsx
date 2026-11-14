import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DateStamp,
  eventWhen,
  GCard,
  GDashedRule,
  GNoteTile,
  GOutlineButton,
  GPressable,
} from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import { haptic } from '@/lib/haptics';
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

/**
 * The page's ONE dark card: up to 3 upcoming events. `carousel` turns the list
 * into a horizontal snap carousel with page dots.
 */
export function EventsTicketsSection({
  ctx,
  index = 2,
  carousel = false,
  onLayout,
}: {
  ctx: HomeLabCtx;
  index?: number;
  carousel?: boolean;
  onLayout?: (y: number) => void;
}) {
  const accent = useGardenAccent();
  const events = ctx.props.data.upcomingEvents.slice(0, 3);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const pageWidth = Math.max(0, width - 24);

  return (
    <GCard
      tone="dark"
      index={index}
      kicker="Upcoming events"
      title="Coming up"
      onLayout={onLayout}
      testID="home-lab-events">
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.events}>
        {events.length === 0 ? (
          <Text style={styles.empty}>No upcoming events right now.</Text>
        ) : carousel && events.length > 1 && pageWidth > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={pageWidth + 10}
              decelerationRate="fast"
              contentContainerStyle={styles.carousel}
              onMomentumScrollEnd={(event) => {
                const next = Math.round(event.nativeEvent.contentOffset.x / (pageWidth + 10));
                if (next !== page) {
                  haptic.select();
                  setPage(next);
                }
              }}>
              {events.map((event) => (
                <EventTicket
                  key={event.id}
                  event={event}
                  width={pageWidth}
                  notchColor={accent.clayDeep}
                  onPress={ctx.props.onViewCalendar}
                />
              ))}
            </ScrollView>
            <View style={styles.pageDots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {events.map((event, i) => (
                <View
                  key={event.id}
                  style={[styles.pageDot, i === page ? styles.pageDotActive : null]}
                />
              ))}
            </View>
          </>
        ) : (
          events.map((event) => (
            <EventTicket
              key={event.id}
              event={event}
              notchColor={accent.clayDeep}
              onPress={ctx.props.onViewCalendar}
            />
          ))
        )}
        <GOutlineButton
          onDark
          label="View family calendar"
          icon="arrow-forward"
          onPress={ctx.props.onViewCalendar}
        />
      </View>
    </GCard>
  );
}

/** Butter "School Bulletin" launcher (opens the bulletin sheet). */
export function BulletinTile({ ctx }: { ctx: HomeLabCtx }) {
  const { bulletinEnabled, bulletinPosts, setBulletinOpen } = ctx.model;
  if (!bulletinEnabled) return null;
  const latest = bulletinPosts[0];
  return (
    <GNoteTile
      tint={Garden.butter}
      icon="megaphone-outline"
      title="School Bulletin"
      subtitle={latest ? latest.title : 'No posts right now.'}
      subtitleLines={1}
      accessibilityLabel={`School bulletin${bulletinPosts.length ? `, ${bulletinPosts.length} posts` : ''}`}
      onPress={() => setBulletinOpen(true)}
    />
  );
}

/** Sky "Messages" launcher (co-op portals without a bulletin, like the web Home). */
export function MessagesTile({ ctx }: { ctx: HomeLabCtx }) {
  if (!ctx.model.showCoopSchoolUpdates) return null;
  return (
    <GNoteTile
      tint={Garden.sky}
      icon="chatbubbles-outline"
      title="Messages from teachers and staff"
      subtitle="Check your inbox for school communications."
      onPress={ctx.props.onOpenMessages}
    />
  );
}

const styles = StyleSheet.create({
  events: {
    gap: 10,
  },
  empty: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  carousel: {
    gap: 10,
  },
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
  pageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  pageDotActive: {
    width: 18,
    backgroundColor: Garden.butter,
  },
});
