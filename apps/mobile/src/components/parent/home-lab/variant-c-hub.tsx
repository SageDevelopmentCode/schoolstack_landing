import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { Garden, GardenFonts, NOTE_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GCountUp,
  GPressable,
  GSegmentDots,
  GTick,
  GToyButton,
} from '@/components/parent/garden/ui';
import { HomeLabHeader } from '@/components/parent/home-lab/sections/home-lab-header';
import { EventTicket } from '@/components/parent/home-lab/sections/events-and-updates';
import {
  ChildrenSection,
  FormsCounts,
  FormsNotebookList,
} from '@/components/parent/home-lab/sections/family';
import {
  CoopFamiliesIsland,
  FridayBranchIsland,
  GuidesSection,
  HelpSection,
  WhatsNewSection,
} from '@/components/parent/home-lab/sections/more';
import { UrgentStrip } from '@/components/parent/home-lab/sections/start-here';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import {
  getQuickActionIconStyle,
  resolveParentWebParentHrefToMobileRoute,
} from '@/lib/parent/parent-nav';

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */

function Widget({
  kicker,
  tint,
  icon,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  children,
}: {
  kicker: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <GPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      pressedScale={0.96}
      onPress={onPress}
      style={[styles.widget, { backgroundColor: tint }]}>
      <View style={styles.widgetTop}>
        <Text style={styles.widgetKicker}>{kicker}</Text>
        <View style={styles.widgetIcon}>
          <Ionicons name={icon} size={15} color={Garden.ink} />
        </View>
      </View>
      <View style={styles.widgetBody}>{children}</View>
    </GPressable>
  );
}

function BigNumber({ value, caption, meta }: { value: number; caption: string; meta?: string }) {
  return (
    <>
      <GCountUp value={value} style={styles.bigNumber} />
      <Text style={styles.widgetCaption} numberOfLines={2}>
        {caption}
      </Text>
      {meta ? (
        <Text style={styles.widgetMeta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Jump to                                                             */
/* ------------------------------------------------------------------ */

function JumpToCard({ ctx }: { ctx: HomeLabCtx }) {
  const router = useRouter();
  const { slug, data } = ctx.props;

  const links = useMemo(() => {
    const result: { key: string; label: string; route: Href; icon: keyof typeof Ionicons.glyphMap }[] =
      [];
    for (const action of data.quickActions) {
      if (!action.enabled) continue;
      const route = resolveParentWebParentHrefToMobileRoute(slug, action.href);
      if (route == null || String(route) === `/parent/${slug}/home`) continue;
      result.push({
        key: action.key,
        label: action.label,
        route,
        icon: getQuickActionIconStyle(action.iconSlug).icon,
      });
    }
    return result.slice(0, 6);
  }, [data.quickActions, slug]);

  if (links.length === 0) return null;

  const tabPattern = new RegExp(`^/parent/${slug}/(calendar|messages|billing|home)(\\?|$)`);

  return (
    <GCard index={3} kicker="Jump to">
      <View style={styles.jumpGrid}>
        {links.map(({ key, label, route, icon }, i) => (
          <GPressable
            key={key}
            accessibilityLabel={label}
            onPress={() => {
              if (tabPattern.test(String(route))) router.replace(route);
              else router.push(route);
            }}
            style={styles.jumpItem}>
            <View
              style={[styles.jumpIcon, { backgroundColor: NOTE_TINTS[i % NOTE_TINTS.length] }]}>
              <Ionicons name={icon} size={18} color={Garden.ink} />
            </View>
            <Text style={styles.jumpLabel} numberOfLines={2}>
              {label}
            </Text>
          </GPressable>
        ))}
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Variant                                                             */
/* ------------------------------------------------------------------ */

/**
 * Variant C · Hub — the four things a parent checks, as widgets above the fold.
 * Each widget opens its details in a sheet (or the existing to-dos / bulletin sheets).
 */
export function HomeVariantHub({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const { props, model } = ctx;
  const [eventsOpen, setEventsOpen] = useState(false);
  const [formsOpen, setFormsOpen] = useState(false);

  const todoCount = model.attentionItems.length;
  const lead = model.attentionItems[0]?.urgent ? model.attentionItems[0] : null;
  const events = props.data.upcomingEvents.slice(0, 3);
  const nextEvent = model.nextEvent;
  const snapshot = props.data.formSnapshot ?? null;
  const unread = props.notificationUnreadCount;

  const closeThen = (close: () => void, action: () => void) => {
    close();
    setTimeout(action, 220);
  };

  const todoCaption =
    todoCount > 0
      ? todoCount === 1
        ? 'thing needs your attention'
        : 'things need your attention'
      : model.isCaughtUp
        ? "You're all caught up"
        : 'Finish setting up your account';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={props.isRefreshing}
            onRefresh={props.onRefresh}
            tintColor={accent.clay}
          />
        }>
        <HomeLabHeader ctx={ctx} compact subtitle={model.greeting.todayLabel} />

        <View style={styles.grid} testID="home-lab-widgets">
          <Widget
            kicker="To-dos"
            tint={Garden.butter}
            icon="checkbox-outline"
            accessibilityLabel={
              todoCount > 0 ? `To-dos, ${todoCount} ${todoCaption}` : `To-dos. ${todoCaption}`
            }
            accessibilityHint="Opens your to-do list"
            onPress={() => model.setOnboardingOpen(true)}>
            {todoCount === 0 && model.isCaughtUp ? (
              <>
                <GTick size={36} />
                <Text style={styles.widgetCaption}>{todoCaption}</Text>
              </>
            ) : (
              <BigNumber value={todoCount} caption={todoCaption} />
            )}
            {model.onboardingTotal > 0 ? (
              <GSegmentDots done={model.onboardingDone} total={model.onboardingTotal} max={6} />
            ) : null}
          </Widget>

          <Widget
            kicker="Next event"
            tint={Garden.peach}
            icon="calendar-outline"
            accessibilityLabel={
              nextEvent ? `Next event, ${nextEvent.title}` : 'Next event. No upcoming events right now.'
            }
            accessibilityHint="Shows upcoming events"
            onPress={() => setEventsOpen(true)}>
            {nextEvent ? (
              <View style={styles.eventWidget}>
                <DateStamp date={nextEvent.date} />
                <Text style={styles.widgetTitle} numberOfLines={3}>
                  {nextEvent.title}
                </Text>
              </View>
            ) : (
              <Text style={styles.widgetCaption}>No upcoming events right now.</Text>
            )}
          </Widget>

          {model.bulletinEnabled ? (
            <Widget
              kicker="Bulletin"
              tint={Garden.sky}
              icon="megaphone-outline"
              accessibilityLabel={`School bulletin, ${model.bulletinPosts.length} posts`}
              onPress={() => model.setBulletinOpen(true)}>
              <BigNumber
                value={model.bulletinPosts.length}
                caption={model.bulletinPosts[0]?.title ?? 'No posts right now.'}
              />
            </Widget>
          ) : (
            <Widget
              kicker="Notifications"
              tint={Garden.sky}
              icon="notifications-outline"
              accessibilityLabel={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
              onPress={() => model.setNotificationsOpen(true)}>
              <BigNumber value={unread} caption="unread" />
            </Widget>
          )}

          {snapshot ? (
            <Widget
              kicker="Forms"
              tint={Garden.mint}
              icon="document-text-outline"
              accessibilityLabel={`Forms, ${snapshot.counts.needsAction} need action, ${snapshot.counts.signed} signed`}
              accessibilityHint="Shows your family's forms"
              onPress={() => setFormsOpen(true)}>
              <BigNumber
                value={snapshot.counts.needsAction}
                caption="Needs action"
                meta={`Signed · ${snapshot.counts.signed}`}
              />
            </Widget>
          ) : (
            <Widget
              kicker="Need help?"
              tint={Garden.lav}
              icon="help-buoy-outline"
              accessibilityLabel="Need help? Tell us what's going on"
              onPress={() => model.setSupportSheetOpen(true)}>
              <Text style={styles.widgetCaption}>
                Tell us what&apos;s going on and attach screenshots if helpful.
              </Text>
            </Widget>
          )}
        </View>

        {lead ? <UrgentStrip ctx={ctx} item={lead} /> : null}

        <JumpToCard ctx={ctx} />
        <ChildrenSection ctx={ctx} index={4} carousel />
        <FridayBranchIsland ctx={ctx} />
        <CoopFamiliesIsland ctx={ctx} />
        <WhatsNewSection ctx={ctx} index={5} />
        <GuidesSection ctx={ctx} index={6} />
        <HelpSection ctx={ctx} index={7} />
      </ScrollView>

      <ParentBottomSheet
        visible={eventsOpen}
        onClose={() => setEventsOpen(false)}
        title="Coming up"
        subtitle="Upcoming events">
        {events.length === 0 ? (
          <Text style={styles.sheetEmpty}>No upcoming events right now.</Text>
        ) : (
          events.map((event) => (
            <EventTicket
              key={event.id}
              event={event}
              notchColor={Garden.white}
              onPress={() => closeThen(() => setEventsOpen(false), props.onViewCalendar)}
            />
          ))
        )}
        <GToyButton
          label="View family calendar"
          fullWidth
          onPress={() => closeThen(() => setEventsOpen(false), props.onViewCalendar)}
        />
      </ParentBottomSheet>

      <ParentBottomSheet
        visible={formsOpen}
        onClose={() => setFormsOpen(false)}
        title="Your family's forms"
        subtitle="Forms & documents">
        {snapshot ? (
          <>
            <FormsCounts snapshot={snapshot} />
            <FormsNotebookList
              snapshot={snapshot}
              max={10}
              onOpenForm={(formId) =>
                closeThen(() => setFormsOpen(false), () => props.onOpenForm(formId))
              }
            />
          </>
        ) : null}
        <GToyButton
          label="View all forms"
          fullWidth
          onPress={() => closeThen(() => setFormsOpen(false), props.onViewAllForms)}
        />
      </ParentBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  widget: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 150,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 14,
    gap: 8,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
  },
  widgetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.ink65,
  },
  widgetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetBody: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 6,
  },
  bigNumber: {
    fontFamily: GardenFonts.display,
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -1.5,
    color: Garden.ink,
  },
  widgetCaption: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.ink65,
  },
  widgetMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
  widgetTitle: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 18,
    color: Garden.ink,
  },
  eventWidget: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  jumpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  jumpItem: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
  },
  jumpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    textAlign: 'center',
    color: Garden.ink,
  },
  sheetEmpty: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: Garden.soft,
  },
});
