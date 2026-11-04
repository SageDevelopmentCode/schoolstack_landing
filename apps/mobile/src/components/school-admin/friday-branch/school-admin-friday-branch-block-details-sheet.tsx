import { StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDateField } from '@/components/story/story-date-field';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { FridayBranchBlock } from '@/lib/school-admin/friday-branch/friday-branch-types';
import {
  formatBlockCompletionStatus,
  formatBlockStats,
  formatBlockTabDateRange,
} from '@/lib/school-admin/friday-branch/friday-branch-utils';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

type SchoolAdminFridayBranchBlockDetailsSheetProps = {
  visible: boolean;
  block: FridayBranchBlock | null;
  onClose: () => void;
  onChange: (block: FridayBranchBlock) => void;
};

export function SchoolAdminFridayBranchBlockDetailsSheet({
  visible,
  block,
  onClose,
  onChange,
}: SchoolAdminFridayBranchBlockDetailsSheetProps) {
  const theme = useParentTheme();
  const keyboardOpen = useKeyboardHeight() > 0;

  if (!block) return null;

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close block details">
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.ink }]}>Block details</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Name this block and set its Friday date range.
        </Text>

        <StoryTextField
          label="Block name (optional)"
          value={block.label}
          onChangeText={(label) => onChange({ ...block, label })}
          placeholder="e.g. Block 3, Winter rhythm"
        />

        <StoryTextField
          label="Description (optional)"
          value={block.description ?? ''}
          onChangeText={(description) => onChange({ ...block, description })}
          placeholder="Optional note about this block's Friday rhythm"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <StoryDateField
              label="Start date"
              value={block.startDate}
              onChange={(startDate) => onChange({ ...block, startDate })}
            />
          </View>
          <View style={styles.dateField}>
            <StoryDateField
              label="End date"
              value={block.endDate}
              onChange={(endDate) => onChange({ ...block, endDate })}
            />
          </View>
        </View>

        <View style={[styles.metaCard, { borderColor: theme.line, backgroundColor: theme.white }]}>
          <Text style={[styles.metaLabel, { color: theme.muted }]}>Date range</Text>
          <Text style={[styles.metaValue, { color: theme.ink }]}>
            {formatBlockTabDateRange(block.startDate, block.endDate)}
          </Text>
          <Text style={[styles.metaLabel, { color: theme.muted }]}>Schedule</Text>
          <Text style={[styles.metaValue, { color: theme.ink }]}>{formatBlockStats(block)}</Text>
          <Text style={[styles.metaLabel, { color: theme.muted }]}>Status</Text>
          <Text style={[styles.metaValue, { color: theme.ink }]}>
            {formatBlockCompletionStatus(block)}
          </Text>
        </View>

        {!keyboardOpen ? <StoryButton label="Done" previewSafe onPress={onClose} /> : null}
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.two,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dateField: {
    flex: 1,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  metaLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
});
