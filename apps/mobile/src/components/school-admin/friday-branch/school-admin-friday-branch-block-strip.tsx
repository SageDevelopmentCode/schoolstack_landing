import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { FridayBranchBlock } from '@/lib/school-admin/friday-branch/friday-branch-types';
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchBlockStripProps = {
  blocks: FridayBranchBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBlockLongPress?: (id: string) => void;
  onAddBlock: () => void;
};

export function SchoolAdminFridayBranchBlockStrip({
  blocks,
  selectedId,
  onSelect,
  onBlockLongPress,
  onAddBlock,
}: SchoolAdminFridayBranchBlockStripProps) {
  const theme = useParentTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}>
      {blocks.map((block, index) => {
        const active = block.id === selectedId;
        const dateRange = formatBlockTabDateRange(block.startDate, block.endDate);

        return (
          <Pressable
            key={block.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(block.id)}
            onLongPress={onBlockLongPress ? () => onBlockLongPress(block.id) : undefined}
            style={[
              styles.card,
              {
                backgroundColor: active ? theme.primarySoft : theme.white,
                borderColor: active ? theme.primary : theme.line,
              },
            ]}>
            <Text style={[styles.label, { color: theme.ink }]}>
              {getBlockDisplayLabel(block, index)}
            </Text>
            <Text style={[styles.dateRange, { color: theme.muted }]}>{dateRange}</Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add block"
        onPress={onAddBlock}
        style={[styles.addCard, { borderColor: theme.line, backgroundColor: theme.white }]}>
        <Ionicons name="add" size={18} color={theme.primary} />
        <Text style={[styles.addLabel, { color: theme.primary }]}>Add block</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  card: {
    minWidth: 132,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dateRange: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  addCard: {
    minWidth: 108,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  addLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
