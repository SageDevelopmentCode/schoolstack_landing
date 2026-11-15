import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { ChildThumb, GCard, GChip, GPressable, GProgress } from '@/components/parent/garden/ui';
import type { ParentBillingChildView } from '@/lib/parent/parent-portal-api';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';
import { formatBillingDueDate, formatCents } from '@/lib/tuition/format-cents';

function ChildBillingCard({
  child,
  index,
  width,
  onPress,
}: {
  child: ParentBillingChildView;
  index: number;
  width?: number;
  onPress: () => void;
}) {
  const firstName = childFirstNameFromFullName(child.studentName);
  const planLabel = child.paymentPlanLabel ?? `Annual ${formatCents(child.annualTuitionCents)}`;
  const dueLabel = child.nextCharge
    ? `Due ${formatBillingDueDate(child.nextCharge.dueDate)} · ${formatCents(child.balanceDueCents)}`
    : `Due ${formatCents(child.balanceDueCents)}`;
  const showProgress = child.status === 'ready' && child.annualTuitionCents > 0;
  const paidShare = showProgress
    ? Math.max(0, child.annualTuitionCents - child.totalRemainingCents) / child.annualTuitionCents
    : 0;
  const leftLabel =
    child.totalRemainingCents > 0
      ? `${formatCents(child.totalRemainingCents)} left this year`
      : 'Paid in full for the year';

  return (
    <GPressable
      accessibilityLabel={`${firstName}. ${planLabel}. ${dueLabel}. Open ${firstName}'s tuition`}
      pressedScale={0.97}
      onPress={onPress}
      style={[styles.card, width ? { width } : null]}>
      <View style={styles.top}>
        <ChildThumb name={child.studentName} photoUrl={null} size={56} index={index} />
        <View style={styles.topCopy}>
          <Text style={styles.name} numberOfLines={1}>
            {firstName}
          </Text>
          <Text style={styles.plan} numberOfLines={1}>
            {planLabel}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </View>
      <View style={styles.chips}>
        {child.status === 'needs_schedule' ? (
          <GChip tone="warning" icon="calendar-outline" label="Schedule needed" />
        ) : child.status === 'ready' ? (
          <GChip tone="success" icon="checkmark" label="Billing active" />
        ) : null}
        {child.balanceDueCents > 0 ? <GChip tone="alert" label={dueLabel} /> : null}
      </View>
      {showProgress ? (
        <View style={styles.progressBlock}>
          <GProgress
            value={paidShare}
            done={child.totalRemainingCents === 0}
            label={`${firstName}: ${leftLabel}`}
          />
          <Text style={styles.left}>{leftLabel}</Text>
        </View>
      ) : null}
    </GPressable>
  );
}

/** "Each student": one card per child in the family view; tapping opens that child's tab. */
export function BillingChildren({
  childViews,
  onSelectChild,
  index = 0,
}: {
  childViews: ParentBillingChildView[];
  onSelectChild: (childKey: string) => void;
  index?: number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  if (childViews.length <= 1) return null;
  const cardWidth = Math.min(300, windowWidth - 32 - 36 - 28);

  return (
    <GCard index={index} kicker="Each student" title="By student">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}>
        {childViews.map((child, i) => (
          <ChildBillingCard
            key={child.childKey}
            child={child}
            index={i}
            width={cardWidth}
            onPress={() => onSelectChild(child.childKey)}
          />
        ))}
      </ScrollView>
    </GCard>
  );
}

const styles = StyleSheet.create({
  carousel: {
    marginHorizontal: -18,
    marginTop: 12,
  },
  carouselContent: {
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topCopy: {
    flex: 1,
  },
  name: {
    fontFamily: GardenFonts.display,
    fontSize: 21,
    color: Garden.ink,
  },
  plan: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.soft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  progressBlock: {
    gap: 6,
  },
  left: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    color: Garden.ink65,
  },
});
