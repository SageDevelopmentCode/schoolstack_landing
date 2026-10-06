import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryAttentionItem } from '@/components/story/story-attention-item';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ResolvedParentOnboardingItem } from '@/lib/parent/parent-portal-api';
import { getQuickActionIconStyle } from '@/lib/parent/parent-nav';

type ParentOnboardingSheetProps = {
  visible: boolean;
  items: ResolvedParentOnboardingItem[];
  attentionItems: ParentHomeAttentionItem[];
  onClose: () => void;
  onSelectItem: (item: ResolvedParentOnboardingItem) => void;
  onSelectAttentionItem: (item: ParentHomeAttentionItem) => void;
};

function AttentionIcon({ item }: { item: ParentHomeAttentionItem }) {
  const theme = useParentTheme();
  const iconStyle = getQuickActionIconStyle(item.iconSlug);

  if (item.urgent) {
    return <Ionicons name="alert-circle-outline" size={18} color={theme.alert} />;
  }

  return <Ionicons name={iconStyle.icon} size={18} color={iconStyle.iconColor} />;
}

export function ParentOnboardingSheet({
  visible,
  items,
  attentionItems,
  onClose,
  onSelectItem,
  onSelectAttentionItem,
}: ParentOnboardingSheetProps) {
  const theme = useAdminTheme();

  const trackedItems = useMemo(() => items.filter((item) => item.autoTracked), [items]);
  const completedCount = trackedItems.filter((item) => item.completed).length;
  const totalCount = trackedItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close onboarding"
      backgroundColor={theme.surface}
      borderColor={theme.border}
      handleColor={theme.borderStrong}
      maxHeight="85%"
      header={
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            Get started
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
            {completedCount} of {totalCount} complete
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: `${theme.accent}22` }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: theme.accent },
              ]}
            />
          </View>
        </View>
      }
      scrollContentStyle={styles.list}>
      {attentionItems.map((item, index) => {
        const iconStyle = getQuickActionIconStyle(item.iconSlug);
        const row = (
          <StoryAttentionItem
            icon={<AttentionIcon item={item} />}
            title={item.title}
            subtitle={item.subtitle}
            iconBg={item.urgent ? undefined : iconStyle.iconBg}
            urgent={item.urgent}
            isFirst={index === 0}
          />
        );

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            onPress={() => onSelectAttentionItem(item)}
            style={({ pressed }) => [
              styles.attentionRow,
              { borderColor: theme.border },
              pressed && { backgroundColor: theme.elevated },
            ]}>
            <View style={styles.attentionCopy}>{row}</View>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </Pressable>
        );
      })}
      {items.map((item) => {
        const iconStyle = getQuickActionIconStyle(item.icon ?? 'puzzle');
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onSelectItem(item)}
            style={({ pressed }) => [
              styles.itemRow,
              { borderColor: theme.border },
              pressed && { backgroundColor: theme.elevated },
            ]}>
            {item.completed ? (
              <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark" size={18} color="#059669" />
              </View>
            ) : (
              <View style={[styles.iconCircle, { backgroundColor: iconStyle.iconBg }]}>
                <Ionicons name={iconStyle.icon} size={18} color={iconStyle.iconColor} />
              </View>
            )}
            <View style={styles.itemCopy}>
              <ThemedText
                type="smallBold"
                style={{
                  color: item.completed ? theme.textTertiary : theme.textPrimary,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                }}>
                {item.label}
              </ThemedText>
            </View>
            {!item.completed ? (
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            ) : null}
          </Pressable>
        );
      })}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  list: {
    paddingVertical: Spacing.two,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  attentionCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
  },
});
