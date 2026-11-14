import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  useReducedMotion,
} from 'react-native-reanimated';

import { GSegmented, type GSegmentedItem } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, NOTE_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GIcon,
  GLink,
  GPressable,
  GToyButton,
  parseEventDate,
} from '@/components/parent/garden/ui';
import { HomeLabHeader } from '@/components/parent/home-lab/sections/home-lab-header';
import {
  BulletinTile,
  EventsTicketsSection,
  MessagesTile,
} from '@/components/parent/home-lab/sections/events-and-updates';
import { ChildrenSection, FormsNotebookSection } from '@/components/parent/home-lab/sections/family';
import {
  CoopFamiliesIsland,
  FridayBranchIsland,
  GuidesSection,
  HelpSection,
  WhatsNewSection,
} from '@/components/parent/home-lab/sections/more';
import {
  attentionIcon,
  CaughtUpPanel,
  SetupFooter,
  startHereTitle,
} from '@/components/parent/home-lab/sections/start-here';
import { openAttentionItem, type HomeLabCtx } from '@/components/parent/home-lab/types';
import { haptic } from '@/lib/haptics';

type PageId = 'overview' | 'family' | 'coop' | 'help';

/* ------------------------------------------------------------------ */
/* Next step stack                                                     */
/* ------------------------------------------------------------------ */

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <GPressable
      accessibilityLabel={label}
      haptic="select"
      disabled={disabled}
      onPress={onPress}
      style={styles.stepButton}>
      <Ionicons name={icon} size={20} color={Garden.ink} />
    </GPressable>
  );
}

/** One to-do at a time: "Step i of n", the task, a single Open button, back/next + dots. */
function NextStepCard({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const reduceMotion = useReducedMotion();
  const { attentionItems, isCaughtUp, setOnboardingOpen, onboardingTotal } = ctx.model;
  const [step, setStep] = useState(0);
  const direction = useRef<1 | -1>(1);
  const total = attentionItems.length;
  const current = attentionItems[Math.min(step, Math.max(0, total - 1))];

  useEffect(() => {
    if (step > Math.max(0, total - 1)) setStep(Math.max(0, total - 1));
  }, [step, total]);

  const go = (next: number) => {
    direction.current = next > step ? 1 : -1;
    setStep(Math.max(0, Math.min(total - 1, next)));
  };

  const entering = reduceMotion
    ? FadeIn.duration(1)
    : (direction.current === 1 ? SlideInRight : SlideInLeft).duration(260);

  return (
    <GCard
      index={1}
      kicker={total > 0 ? `Next step · ${step + 1} of ${total}` : 'Start here'}
      title={startHereTitle(ctx)}
      testID="home-lab-next-step"
      action={
        total > 0 ? (
          <GLink
            label="All"
            onPress={() => setOnboardingOpen(true)}
            accessibilityLabel="Review today's to-dos"
          />
        ) : null
      }>
      {current ? (
        <View style={styles.stepBody}>
          <Animated.View
            key={current.key}
            entering={entering}
            style={[
              styles.stepPanel,
              {
                backgroundColor: current.urgent
                  ? Garden.peach
                  : NOTE_TINTS[(step + 1) % NOTE_TINTS.length],
              },
            ]}>
            <View style={styles.stepPanelTop}>
              <GIcon name={attentionIcon(current)} size="md" />
              {current.urgent ? (
                <View style={[styles.urgentTag, { backgroundColor: accent.clay }]}>
                  <Text style={styles.urgentTagText}>Do this first</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {current.title}
            </Text>
            {current.subtitle ? <Text style={styles.stepSubtitle}>{current.subtitle}</Text> : null}
          </Animated.View>

          <View style={styles.stepActions}>
            <GToyButton
              label="Open"
              accessibilityLabel={`Open: ${current.title}`}
              accessibilityHint={current.href ? undefined : 'Opens your to-do list'}
              onPress={() => openAttentionItem(ctx, current)}
            />
            <View style={styles.stepNav}>
              <StepButton
                icon="chevron-back"
                label="Previous step"
                disabled={step === 0}
                onPress={() => go(step - 1)}
              />
              <StepButton
                icon="chevron-forward"
                label="Next step"
                disabled={step >= total - 1}
                onPress={() => go(step + 1)}
              />
            </View>
          </View>

          {total > 1 ? (
            <View style={styles.stepDots} accessibilityRole="adjustable" accessibilityLabel={`Step ${step + 1} of ${total}`}>
              {attentionItems.map((item, i) => (
                <GPressable
                  key={item.key}
                  accessibilityLabel={`Go to step ${i + 1}: ${item.title}`}
                  haptic="select"
                  hitSlop={8}
                  onPress={() => go(i)}
                  style={[
                    styles.stepDot,
                    i === step
                      ? { width: 22, backgroundColor: accent.clay }
                      : i < step
                        ? { backgroundColor: Garden.ink25 }
                        : null,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : isCaughtUp ? (
        <CaughtUpPanel />
      ) : (
        <View style={styles.stepBody}>
          <Text style={styles.setupCopy}>A few quick steps to get the most from your portal</Text>
          {onboardingTotal > 0 ? (
            <GToyButton
              label="Finish setting up"
              onPress={() => setOnboardingOpen(true)}
            />
          ) : null}
        </View>
      )}
      {onboardingTotal > 0 ? (
        <View style={styles.footerSpace}>
          <SetupFooter ctx={ctx} />
        </View>
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* At a glance chips                                                   */
/* ------------------------------------------------------------------ */

function GlanceChip({
  icon,
  label,
  tint,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <GPressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.glance, { backgroundColor: tint }]}>
      <Ionicons name={icon} size={16} color={Garden.ink} />
      <Text style={styles.glanceText} numberOfLines={1}>
        {label}
      </Text>
    </GPressable>
  );
}

function AtAGlance({ ctx, onOpenFamily }: { ctx: HomeLabCtx; onOpenFamily: () => void }) {
  const { props, model } = ctx;
  const nextEvent = model.nextEvent;
  const needsAction = props.data.formSnapshot?.counts.needsAction ?? 0;
  const unread = props.notificationUnreadCount;
  const nextLabel = nextEvent
    ? parseEventDate(nextEvent.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <View style={styles.glanceWrap}>
      <Text style={styles.glanceKicker}>At a glance</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.glanceRow}>
        {nextEvent && nextLabel ? (
          <GlanceChip
            icon="calendar-outline"
            tint={Garden.butter}
            label={`${nextLabel} · ${nextEvent.title}`}
            accessibilityLabel={`Next event ${nextEvent.title} on ${nextLabel}. Open family calendar`}
            onPress={props.onViewCalendar}
          />
        ) : null}
        {unread > 0 ? (
          <GlanceChip
            icon="notifications-outline"
            tint={Garden.sky}
            label={`${unread} unread`}
            accessibilityLabel={`Open notifications, ${unread} unread`}
            onPress={() => model.setNotificationsOpen(true)}
          />
        ) : null}
        {needsAction > 0 ? (
          <GlanceChip
            icon="document-text-outline"
            tint={Garden.peach}
            label={`Needs action · ${needsAction}`}
            accessibilityLabel={`${needsAction} forms need action. Show forms`}
            onPress={onOpenFamily}
          />
        ) : null}
        {model.bulletinEnabled && model.bulletinPosts.length > 0 ? (
          <GlanceChip
            icon="megaphone-outline"
            tint={Garden.lav}
            label={`Bulletin · ${model.bulletinPosts.length}`}
            accessibilityLabel={`School bulletin, ${model.bulletinPosts.length} posts`}
            onPress={() => model.setBulletinOpen(true)}
          />
        ) : null}
        <GlanceChip
          icon="calendar-number-outline"
          tint={Garden.mint}
          label="Calendar"
          accessibilityLabel="View family calendar"
          onPress={props.onViewCalendar}
        />
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Variant                                                             */
/* ------------------------------------------------------------------ */

/**
 * Variant B · Focus — guided. Overview leads with one next step at a time;
 * Overview / Family / Help are pages you can swipe between or pick from the
 * gliding segmented control.
 */
export function HomeVariantFocus({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const { props, model } = ctx;
  const pagerRef = useRef<ScrollView>(null);

  const pages = useMemo<GSegmentedItem<PageId>[]>(() => {
    const list: GSegmentedItem<PageId>[] = [
      { id: 'overview', label: 'Overview', badge: model.attentionItems.length || undefined },
      {
        id: 'family',
        label: 'Family',
        badge: props.data.formSnapshot?.counts.needsAction || undefined,
      },
    ];
    if (props.coopModeEnabled) list.push({ id: 'coop', label: 'Co-op' });
    list.push({ id: 'help', label: 'Help' });
    return list;
  }, [model.attentionItems.length, props.coopModeEnabled, props.data.formSnapshot?.counts.needsAction]);

  const [active, setActive] = useState<PageId>('overview');
  const [visited, setVisited] = useState<Set<PageId>>(() => new Set(['overview']));
  const activeIndex = Math.max(0, pages.findIndex((page) => page.id === active));

  const select = (id: PageId, fromSwipe = false) => {
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    setActive(id);
    if (!fromSwipe) {
      const index = pages.findIndex((page) => page.id === id);
      pagerRef.current?.scrollTo({ x: index * width, animated: !reduceMotion });
    }
  };

  const refreshControl = (
    <RefreshControl refreshing={props.isRefreshing} onRefresh={props.onRefresh} tintColor={accent.clay} />
  );

  const renderPage = (id: PageId) => {
    switch (id) {
      case 'family':
        return (
          <>
            <ChildrenSection ctx={ctx} index={1} />
            <FormsNotebookSection ctx={ctx} index={2} />
          </>
        );
      case 'coop':
        return <CoopFamiliesIsland ctx={ctx} />;
      case 'help':
        return (
          <>
            <GuidesSection ctx={ctx} index={1} />
            <HelpSection ctx={ctx} index={2} />
          </>
        );
      case 'overview':
      default:
        return (
          <>
            <NextStepCard ctx={ctx} />
            <AtAGlance ctx={ctx} onOpenFamily={() => select('family')} />
            <EventsTicketsSection ctx={ctx} index={2} />
            <BulletinTile ctx={ctx} />
            <MessagesTile ctx={ctx} />
            <FridayBranchIsland ctx={ctx} />
            <WhatsNewSection ctx={ctx} index={3} />
          </>
        );
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: 12 }]}>
        <HomeLabHeader ctx={ctx} compact subtitle={model.greeting.todayLabel} />
        <GSegmented items={pages} activeId={active} onChange={(id) => select(id)} />
      </View>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          const page = pages[index];
          if (page && page.id !== active) {
            haptic.select();
            select(page.id, true);
          }
        }}
        contentOffset={{ x: activeIndex * width, y: 0 }}>
        {pages.map((page) => (
          <View key={page.id} style={{ width }}>
            {visited.has(page.id) ? (
              <ScrollView
                contentContainerStyle={styles.page}
                refreshControl={refreshControl}
                accessibilityElementsHidden={page.id !== active}
                importantForAccessibility={page.id === active ? 'auto' : 'no-hide-descendants'}>
                {renderPage(page.id)}
              </ScrollView>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  top: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 14,
  },
  page: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 16,
  },
  stepBody: {
    gap: 14,
  },
  stepPanel: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
    minHeight: 150,
  },
  stepPanelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  urgentTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  urgentTagText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    color: Garden.white,
  },
  stepTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: Garden.ink,
  },
  stepSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.ink65,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepNav: {
    flexDirection: 'row',
    gap: 8,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  setupCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
  footerSpace: {
    marginTop: 14,
  },
  glanceWrap: {
    gap: 8,
  },
  glanceKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Garden.soft,
    paddingHorizontal: 2,
  },
  glanceRow: {
    gap: 8,
    paddingRight: 16,
  },
  glance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 240,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
  },
  glanceText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: Garden.ink,
    flexShrink: 1,
  },
});
