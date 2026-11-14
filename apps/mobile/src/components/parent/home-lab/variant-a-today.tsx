import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { GSegmented, type GSegmentedItem } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { HomeLabHeader, HomeLabToolbar } from '@/components/parent/home-lab/sections/home-lab-header';
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
import { StartHereSection } from '@/components/parent/home-lab/sections/start-here';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';
import { haptic } from '@/lib/haptics';

type AnchorId = 'today' | 'family' | 'forms' | 'help';

const OVERLAY_HEIGHT = 108;

/**
 * Variant A · Today — one continuous Garden scroll. The greeting fades away as
 * you scroll and a compact bar (name + bell/avatar + jump chips) takes over.
 * Chips jump to sections and follow your position (scroll-spy).
 */
export function HomeVariantToday({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(160);
  const anchorYs = useSharedValue<number[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<AnchorId>('today');
  const anchorsRef = useRef<Partial<Record<AnchorId, number>>>({});
  const programmaticScroll = useRef(false);

  const { props, model } = ctx;
  const hasForms = Boolean(props.data.formSnapshot);

  const anchors = useMemo<GSegmentedItem<AnchorId>[]>(() => {
    const list: GSegmentedItem<AnchorId>[] = [
      { id: 'today', label: 'Today', badge: model.attentionItems.length || undefined },
      { id: 'family', label: 'Family' },
    ];
    if (hasForms) {
      list.push({
        id: 'forms',
        label: 'Forms',
        badge: props.data.formSnapshot?.counts.needsAction || undefined,
      });
    }
    list.push({ id: 'help', label: 'Help' });
    return list;
  }, [hasForms, model.attentionItems.length, props.data.formSnapshot?.counts.needsAction]);

  const anchorOrder = useMemo(() => anchors.map((anchor) => anchor.id), [anchors]);

  const recordAnchor = useCallback(
    (id: AnchorId) => (y: number) => {
      anchorsRef.current[id] = y;
      anchorYs.value = anchorOrder.map((anchorId) => anchorsRef.current[anchorId] ?? Number.MAX_SAFE_INTEGER);
    },
    [anchorOrder, anchorYs],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const updateActive = useCallback(
    (index: number) => {
      const id = anchorOrder[index];
      if (!id || programmaticScroll.current) return;
      setActive((current) => {
        if (current !== id) haptic.select();
        return id;
      });
    },
    [anchorOrder],
  );

  useAnimatedReaction(
    () => scrollY.value > headerHeight.value - 24,
    (isCollapsed, previous) => {
      if (isCollapsed !== previous) runOnJS(setCollapsed)(isCollapsed);
    },
  );

  useAnimatedReaction(
    () => {
      const y = scrollY.value + OVERLAY_HEIGHT + 40;
      const ys = anchorYs.value;
      let index = 0;
      for (let i = 0; i < ys.length; i += 1) {
        if (ys[i] <= y) index = i;
      }
      return index;
    },
    (index, previous) => {
      if (index !== previous) runOnJS(updateActive)(index);
    },
  );

  const headerStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return {
      opacity: interpolate(scrollY.value, [0, headerHeight.value * 0.8], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [-100, 0, 200], [0, 0, 60], 'clamp') },
        { scale: interpolate(scrollY.value, [-120, 0], [1.04, 1], 'clamp') },
      ],
    };
  });

  const jumpTo = (id: AnchorId) => {
    const y = anchorsRef.current[id];
    setActive(id);
    if (y == null) return;
    programmaticScroll.current = true;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - OVERLAY_HEIGHT - 8), animated: !reduceMotion });
    setTimeout(() => {
      programmaticScroll.current = false;
    }, 600);
  };

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingTop: 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={props.isRefreshing}
            onRefresh={props.onRefresh}
            tintColor={accent.clay}
          />
        }>
        <Animated.View
          style={headerStyle}
          onLayout={(event) => {
            headerHeight.value = event.nativeEvent.layout.height + 12;
          }}>
          <HomeLabHeader ctx={ctx} />
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.inlineChips}>
          <GSegmented compact items={anchors} activeId={active} onChange={jumpTo} />
        </ScrollView>

        <StartHereSection ctx={ctx} index={1} onLayout={recordAnchor('today')} />
        <EventsTicketsSection ctx={ctx} index={2} carousel />
        <BulletinTile ctx={ctx} />
        <MessagesTile ctx={ctx} />
        <FridayBranchIsland ctx={ctx} />
        <ChildrenSection ctx={ctx} index={3} carousel onLayout={recordAnchor('family')} />
        <FormsNotebookSection ctx={ctx} index={4} onLayout={recordAnchor('forms')} />
        <CoopFamiliesIsland ctx={ctx} />
        <WhatsNewSection ctx={ctx} index={5} />
        <View onLayout={(event) => recordAnchor('help')(event.nativeEvent.layout.y)} style={styles.helpGroup}>
          <GuidesSection ctx={ctx} index={6} />
          <HelpSection ctx={ctx} index={7} />
        </View>
        <Text
          style={styles.endLine}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          That&apos;s everything for today
        </Text>
      </Animated.ScrollView>

      {collapsed ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={[styles.overlay, { paddingTop: 6 }]}>
          <View style={styles.overlayTop}>
            <Text style={styles.overlayTitle} numberOfLines={1} accessibilityRole="header">
              {model.greeting.firstName
                ? `${model.greeting.prefix}, ${model.greeting.firstName}`
                : model.greeting.familyLabel}
            </Text>
            <HomeLabToolbar ctx={ctx} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.overlayChips}>
            <GSegmented compact items={anchors} activeId={active} onChange={jumpTo} />
          </ScrollView>
        </Animated.View>
      ) : null}
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
  inlineChips: {
    paddingVertical: 2,
  },
  helpGroup: {
    gap: 16,
  },
  endLine: {
    textAlign: 'center',
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
    marginTop: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: Garden.cream,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  overlayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  overlayTitle: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  overlayChips: {
    paddingVertical: 1,
  },
});
