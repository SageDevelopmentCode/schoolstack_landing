import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import {
  GCard,
  GDashedRule,
  GHand,
  GLink,
  GNoteTile,
  GPressable,
  GSegmentDots,
  GTick,
} from '@/components/parent/garden/ui';
import { Garden, GardenFonts, NOTE_TINTS, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  attentionCountTitle,
  openAttentionItem,
  type HomeLabCtx,
} from '@/components/parent/home-lab/types';
import { getQuickActionIconStyle } from '@/lib/parent/parent-nav';

export function attentionIcon(item: ParentHomeAttentionItem) {
  return item.urgent ? ('alert-circle-outline' as const) : getQuickActionIconStyle(item.iconSlug).icon;
}

/** Visual "Open" pill on the accent strip (the strip itself is the button). */
function OpenPill() {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillUnderlay} />
      <View style={styles.pillFace}>
        <Text style={styles.pillLabel}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
      </View>
    </View>
  );
}

/** The urgent first to-do as a solid accent strip; one tap target with the title in its name. */
export function UrgentStrip({ ctx, item }: { ctx: HomeLabCtx; item: ParentHomeAttentionItem }) {
  const accent = useGardenAccent();
  return (
    <GPressable
      accessibilityLabel={`${item.title}${item.subtitle ? `. ${item.subtitle}` : ''}. Open`}
      haptic="press"
      onPress={() => openAttentionItem(ctx, item)}
      style={[styles.strip, { backgroundColor: accent.clay }]}>
      <View style={styles.stripCopy}>
        <Text style={styles.stripTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.stripSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <OpenPill />
    </GPressable>
  );
}

export function SetupFooter({
  ctx,
  hidden = 0,
}: {
  ctx: HomeLabCtx;
  hidden?: number;
}) {
  const { onboardingDone, onboardingTotal, setOnboardingOpen } = ctx.model;
  if (onboardingTotal === 0 && hidden === 0) return null;
  return (
    <View style={styles.footerWrap}>
    <GDashedRule />
    <View style={styles.footer}>
      {onboardingTotal > 0 ? (
        <View style={styles.footerProgress}>
          <GSegmentDots done={onboardingDone} total={onboardingTotal} />
          <Text style={styles.footerText}>
            Account setup · {onboardingDone} of {onboardingTotal} complete
          </Text>
        </View>
      ) : null}
      {hidden > 0 ? (
        <GLink
          label={`+${hidden} more`}
          icon={null}
          onPress={() => setOnboardingOpen(true)}
          accessibilityLabel={`See ${hidden} more to-dos`}
        />
      ) : null}
    </View>
    </View>
  );
}

export function CaughtUpPanel() {
  return (
    <View style={styles.caughtUp} accessible accessibilityLabel="You're all caught up. No urgent tasks right now. Check back for updates from school.">
      <GTick size={44} />
      <Text style={styles.caughtUpCopy}>
        No urgent tasks right now. Check back for updates from school.
      </Text>
      <GHand>enjoy the quiet ✿</GHand>
    </View>
  );
}

export function startHereTitle(ctx: HomeLabCtx): string {
  const { attentionItems, isCaughtUp } = ctx.model;
  if (attentionItems.length > 0) return attentionCountTitle(attentionItems.length);
  if (isCaughtUp) return "You're all caught up";
  return 'Finish setting up your account';
}

/** Web "Start here" recipe, phone-sized (tiles stack in one column). */
export function StartHereSection({
  ctx,
  index = 1,
  maxTiles = 4,
  onLayout,
}: {
  ctx: HomeLabCtx;
  index?: number;
  maxTiles?: number;
  onLayout?: (y: number) => void;
}) {
  const { attentionItems, isCaughtUp, showTodosLink, setOnboardingOpen } = ctx.model;
  const lead = attentionItems[0]?.urgent ? attentionItems[0] : null;
  const rest = lead ? attentionItems.slice(1) : attentionItems;
  const tiles = rest.slice(0, maxTiles);
  const hidden = rest.length - tiles.length;

  return (
    <GCard
      index={index}
      kicker="Start here"
      title={startHereTitle(ctx)}
      onLayout={onLayout}
      testID="home-lab-start-here"
      action={
        showTodosLink && attentionItems.length > 0 ? (
          <GLink
            label="To-dos"
            onPress={() => setOnboardingOpen(true)}
            accessibilityLabel="Review today's to-dos"
          />
        ) : null
      }>
      <View style={styles.body}>
        {lead ? <UrgentStrip ctx={ctx} item={lead} /> : null}
        {tiles.map((item, i) => (
          <GNoteTile
            key={item.key}
            tint={NOTE_TINTS[i % NOTE_TINTS.length]}
            icon={attentionIcon(item)}
            title={item.title}
            subtitle={item.subtitle}
            accessibilityHint={item.href ? undefined : 'Opens your to-do list'}
            onPress={() => openAttentionItem(ctx, item)}
          />
        ))}
        {attentionItems.length === 0 && isCaughtUp ? <CaughtUpPanel /> : null}
        {attentionItems.length === 0 && !isCaughtUp ? (
          <Text style={styles.setupCopy}>A few quick steps to get the most from your portal</Text>
        ) : null}
        <SetupFooter ctx={ctx} hidden={hidden} />
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 12,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  stripCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  stripTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 17,
    lineHeight: 22,
    color: Garden.white,
  },
  stripSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: {
    paddingBottom: 3,
  },
  pillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 3,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  pillFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  pillLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerWrap: {
    gap: 12,
  },
  footerProgress: {
    gap: 6,
    flexShrink: 1,
  },
  footerText: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.soft,
  },
  caughtUp: {
    backgroundColor: Garden.mint,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    alignItems: 'flex-start',
  },
  caughtUpCopy: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.forestDeep,
  },
  setupCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
});
