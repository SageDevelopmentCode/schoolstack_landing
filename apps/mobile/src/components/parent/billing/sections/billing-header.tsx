import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { BillingCtx } from '@/components/parent/billing/billing-ctx';
import { GSegmented, type GSegmentedItem } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GKicker } from '@/components/parent/garden/ui';
import {
  childFirstNameFromFullName,
  PARENT_BILLING_AGREEMENTS_TAB,
  PARENT_BILLING_SUMMARY_TAB,
} from '@/lib/tuition/billing-helpers';
import { formatCents } from '@/lib/tuition/format-cents';

function resolveSubtitle(openChargeCount: number, totalRemainingCents: number): string {
  const paymentLabel =
    openChargeCount === 1 ? '1 payment remaining' : `${openChargeCount} payments remaining`;
  if (totalRemainingCents > 0) {
    return `${paymentLabel} · ${formatCents(totalRemainingCents)} left this school year`;
  }
  if (openChargeCount > 0) {
    return paymentLabel;
  }
  return 'Your tuition schedule is up to date';
}

/** Kicker, title with one accent word, subtitle, and the Family / child / Forms tabs. */
export function BillingHeader({ ctx }: { ctx: BillingCtx }) {
  const accent = useGardenAccent();
  const { view } = ctx;
  const activeChild = view.childViews.find((child) => child.childKey === view.activeTabKey);
  const isSummary = view.activeTabKey === PARENT_BILLING_SUMMARY_TAB;

  // Titles are unchanged from the pre-Garden header; Maestro waits for "Family tuition".
  const title = view.isAgreementsTab ? (
    <>
      Forms & <Text style={{ color: accent.clay }}>agreements</Text>
    </>
  ) : isSummary || !activeChild ? (
    <>
      Family <Text style={{ color: accent.clay }}>tuition</Text>
    </>
  ) : (
    <>
      <Text style={{ color: accent.clay }}>
        {childFirstNameFromFullName(activeChild.studentName)}&apos;s
      </Text>{' '}
      tuition
    </>
  );

  const items: GSegmentedItem<string>[] = [];
  if (view.hasMultipleChildren) {
    items.push({
      id: PARENT_BILLING_SUMMARY_TAB,
      label: 'Family view',
      icon: 'people-outline',
      testID: 'parent-billing-summary-nav',
    });
  }
  for (const child of view.childViews) {
    items.push({
      id: child.childKey,
      label: childFirstNameFromFullName(child.studentName),
      badge: child.status === 'needs_schedule' ? 1 : undefined,
      testID: `parent-billing-child-summary-${child.childKey}`,
    });
  }
  if (view.hasAgreements) {
    items.push({
      id: PARENT_BILLING_AGREEMENTS_TAB,
      label: 'Forms',
      icon: 'document-text-outline',
      badge: view.pendingAgreementCount > 0 ? view.pendingAgreementCount : undefined,
      testID: 'parent-billing-agreements-nav',
    });
  }

  const showTabs = view.hasMultipleChildren || view.hasAgreements;
  const scrollTabs = items.length > 3;
  const tabScrollRef = useRef<ScrollView>(null);
  const activeIndex = items.findIndex((item) => item.id === view.activeTabKey);
  const lastIndex = items.length - 1;

  // Keep the active pill in view when the tab strip scrolls (e.g. Forms at the far end).
  useEffect(() => {
    if (!scrollTabs) return;
    if (activeIndex === lastIndex) tabScrollRef.current?.scrollToEnd({ animated: true });
    else if (activeIndex <= 1) tabScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [activeIndex, lastIndex, scrollTabs]);

  return (
    <View style={styles.header} testID="parent-billing-story-header">
      <GKicker>Tuition & payments</GKicker>
      <Text accessibilityRole="header" style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle}>
        {resolveSubtitle(view.openCharges.length, view.totalRemainingCents)}
      </Text>
      {showTabs ? (
        <View accessibilityLabel="Billing sections" style={styles.tabs}>
          {scrollTabs ? (
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScroll}
              contentContainerStyle={styles.tabScrollContent}>
              <GSegmented
                compact
                items={items}
                activeId={view.activeTabKey}
                onChange={view.selectTab}
              />
            </ScrollView>
          ) : (
            <GSegmented items={items} activeId={view.activeTabKey} onChange={view.selectTab} />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -1,
    color: Garden.ink,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.soft,
  },
  tabs: {
    marginTop: 10,
  },
  tabScroll: {
    marginHorizontal: -16,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
});
