import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentFormListItem } from '@/lib/parent/parent-forms-documents-types';
import {
  formatFormDueDate,
  formatFormSignedDate,
} from '@/lib/parent/parent-forms-documents-utils';

type ParentFormListItemCardProps = {
  item: ParentFormListItem;
  onPress: () => void;
};

function getStatusPresentation(item: ParentFormListItem) {
  if (item.listStatus === 'signed') {
    return { tone: 'success' as const, label: 'Signed' };
  }
  if (item.response.status === 'overdue') {
    return { tone: 'alert' as const, label: 'Overdue' };
  }
  return { tone: 'warning' as const, label: 'Needs action' };
}

export function ParentFormListItemCard({ item, onPress }: ParentFormListItemCardProps) {
  const theme = useParentTheme();
  const status = getStatusPresentation(item);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <StoryCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text-outline" size={18} color="#475569" />
          </View>
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
                {item.form.title}
              </Text>
              <StoryChip tone={status.tone} label={status.label} />
            </View>
            {item.response.studentNames.length > 0 ? (
              <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={2}>
                {item.response.studentNames.join(', ')}
              </Text>
            ) : null}
            {item.listStatus === 'signed' && item.response.signedAt ? (
              <Text style={[styles.meta, { color: theme.muted }]}>
                Signed on {formatFormSignedDate(item.response.signedAt)}
              </Text>
            ) : item.form.dueDate ? (
              <Text style={[styles.meta, { color: theme.muted }]}>
                Due {formatFormDueDate(item.form.dueDate)}
              </Text>
            ) : null}
          </View>
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    fontFamily: StoryFonts.display,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
