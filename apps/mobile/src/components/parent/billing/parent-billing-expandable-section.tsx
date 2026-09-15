import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BillingListSeparator } from '@/components/parent/billing/parent-billing-list-separator';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export const BILLING_VISIBLE_ROW_LIMIT = 3;

type ParentBillingExpandableSectionProps<T> = {
  title: string;
  items: T[];
  emptyMessage: string;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onShowAll?: () => void;
};

export function ParentBillingExpandableSection<T>({
  title,
  items,
  expanded = false,
  onToggleExpanded,
  onShowAll,
  emptyMessage,
  keyExtractor,
  renderItem,
}: ParentBillingExpandableSectionProps<T>) {
  const theme = useParentTheme();
  const shouldCollapse = items.length > BILLING_VISIBLE_ROW_LIMIT;
  const useBottomSheet = Boolean(onShowAll);
  const visibleItems =
    shouldCollapse && (useBottomSheet || !expanded)
      ? items.slice(0, BILLING_VISIBLE_ROW_LIMIT)
      : items;

  return (
    <View style={styles.section}>
      <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>

      {items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.muted }]}>{emptyMessage}</Text>
      ) : (
        <>
          <View style={styles.list}>
            {visibleItems.map((item, index) => (
              <Fragment key={keyExtractor(item)}>
                {index > 0 ? <BillingListSeparator /> : null}
                {renderItem(item)}
              </Fragment>
            ))}
          </View>

          {shouldCollapse ? (
            <Pressable
              onPress={useBottomSheet ? onShowAll : onToggleExpanded}
              accessibilityRole="button"
              accessibilityLabel={
                useBottomSheet || !expanded ? `Show all ${items.length}` : 'Show less'
              }
              style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.8 }]}>
              <Text style={[styles.toggleText, { color: theme.primary }]}>
                {useBottomSheet || !expanded
                  ? `View full schedule (${items.length})`
                  : 'Show less'}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  toggleText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
});
