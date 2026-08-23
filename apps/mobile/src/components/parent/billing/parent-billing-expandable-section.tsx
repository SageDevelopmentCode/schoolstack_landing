import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BillingListSeparator } from '@/components/parent/billing/parent-billing-list-separator';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
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
  const theme = useAdminTheme();
  const shouldCollapse = items.length > BILLING_VISIBLE_ROW_LIMIT;
  const useBottomSheet = Boolean(onShowAll);
  const visibleItems =
    shouldCollapse && (useBottomSheet || !expanded)
      ? items.slice(0, BILLING_VISIBLE_ROW_LIMIT)
      : items;

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        {title}
      </ThemedText>

      {items.length === 0 ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {emptyMessage}
        </ThemedText>
      ) : (
        <>
          {visibleItems.map((item, index) => (
            <Fragment key={keyExtractor(item)}>
              {index > 0 ? <BillingListSeparator /> : null}
              {renderItem(item)}
            </Fragment>
          ))}

          {shouldCollapse ? (
            <Pressable
              onPress={useBottomSheet ? onShowAll : onToggleExpanded}
              accessibilityRole="button"
              accessibilityLabel={
                useBottomSheet || !expanded ? `Show all ${items.length}` : 'Show less'
              }
              style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.8 }]}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {useBottomSheet || !expanded
                  ? `Show all (${items.length})`
                  : 'Show less'}
              </ThemedText>
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
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
});
