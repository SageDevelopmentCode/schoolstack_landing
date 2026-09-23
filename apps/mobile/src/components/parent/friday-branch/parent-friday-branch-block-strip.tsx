import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { FridayBranchBlock } from '@/lib/parent/parent-friday-branch-types';
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from '@/lib/parent/parent-friday-branch-utils';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentFridayBranchBlockStripProps = {
  blocks: FridayBranchBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ParentFridayBranchBlockStrip({
  blocks,
  selectedId,
  onSelect,
}: ParentFridayBranchBlockStripProps) {
  const theme = useParentTheme();

  if (blocks.length === 0) return null;

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: Spacing.four,
  },
  content: {
    gap: Spacing.three,
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
});
