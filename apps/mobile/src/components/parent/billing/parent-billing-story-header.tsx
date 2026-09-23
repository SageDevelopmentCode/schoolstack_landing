import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParentBillingNeedsScheduleBadge } from '@/components/parent/billing/parent-billing-needs-schedule-badge';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentBillingChildView } from '@/lib/parent/parent-portal-api';
import {
  childFirstNameFromFullName,
  PARENT_BILLING_AGREEMENTS_TAB,
  PARENT_BILLING_SUMMARY_TAB,
} from '@/lib/tuition/billing-helpers';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { formatCents } from '@/lib/tuition/format-cents';

type ParentBillingStoryHeaderProps = {
  activeTabKey: string;
  childViews: ParentBillingChildView[];
  openChargeCount: number;
  totalRemainingCents: number;
  hasAgreements: boolean;
  pendingAgreementCount: number;
  onSelectTab: (tabKey: string) => void;
};

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

export function ParentBillingStoryHeader({
  activeTabKey,
  childViews,
  openChargeCount,
  totalRemainingCents,
  hasAgreements,
  pendingAgreementCount,
  onSelectTab,
}: ParentBillingStoryHeaderProps) {
  const theme = useParentTheme();
  const hasMultipleChildren = childViews.length > 1;
  const isAgreementsTab = activeTabKey === PARENT_BILLING_AGREEMENTS_TAB;
  const isSummaryTab = activeTabKey === PARENT_BILLING_SUMMARY_TAB;
  const activeChild = childViews.find((child) => child.childKey === activeTabKey);

  const title = isAgreementsTab
    ? 'Forms & agreements'
    : isSummaryTab || !activeChild
      ? 'Family tuition'
      : `${childFirstNameFromFullName(activeChild.studentName)}'s tuition`;

  const subtitle = resolveSubtitle(openChargeCount, totalRemainingCents);

  const navItems = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      testID: string;
      suffix?: ReactNode;
    }> = [];

    if (hasMultipleChildren) {
      items.push({
        key: PARENT_BILLING_SUMMARY_TAB,
        label: 'Family view',
        testID: 'parent-billing-summary-nav',
      });
    }

    for (const child of childViews) {
      items.push({
        key: child.childKey,
        label: childFirstNameFromFullName(child.studentName),
        testID: `parent-billing-child-summary-${child.childKey}`,
        suffix:
          child.status === 'needs_schedule' ? (
            <ParentBillingNeedsScheduleBadge label="Setup" size="sm" />
          ) : undefined,
      });
    }

    if (hasAgreements) {
      items.push({
        key: PARENT_BILLING_AGREEMENTS_TAB,
        label: 'Forms',
        testID: 'parent-billing-agreements-nav',
        suffix:
          pendingAgreementCount > 0 ? (
            <Ionicons
              name="alert-circle"
              size={14}
              color={theme.warning}
              accessibilityLabel={`${pendingAgreementCount} agreement${
                pendingAgreementCount === 1 ? '' : 's'
              } need your signature`}
            />
          ) : undefined,
      });
    }

    return items;
  }, [childViews, hasAgreements, hasMultipleChildren, pendingAgreementCount, theme.warning]);

  return (
    <View style={styles.container} testID="parent-billing-story-header">
      <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      {hasMultipleChildren || hasAgreements ? (
        <StoryPillNav
          fullWidth
          items={navItems}
          activeKey={activeTabKey}
          onChange={onSelectTab}
          accessibilityLabel="Billing sections"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
