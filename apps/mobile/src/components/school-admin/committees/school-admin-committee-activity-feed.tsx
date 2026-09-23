import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip, type StoryChipTone } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeActivityItem } from '@/lib/parent/parent-committees-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const CATEGORY_TONES: Record<string, StoryChipTone> = {
  Members: 'success',
  Tasks: 'info',
  Resources: 'info',
  Calendar: 'warning',
  Messages: 'info',
  Roles: 'alert',
};

type SchoolAdminCommitteeActivityFeedProps = {
  items: CommitteeActivityItem[];
  compact?: boolean;
  showCommitteeName?: boolean;
  title?: string;
  emptyMessage?: string;
  onViewAll?: () => void;
  onItemPress?: (item: CommitteeActivityItem) => void;
};

function ActivityRow({
  item,
  showCommitteeName,
  onPress,
}: {
  item: CommitteeActivityItem;
  showCommitteeName: boolean;
  onPress?: (item: CommitteeActivityItem) => void;
}) {
  const theme = useParentTheme();
  const tone = CATEGORY_TONES[item.category] ?? 'info';
  const metaLine = [item.actorName, formatRelativeTime(item.createdAt)].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(item) : undefined}
      style={({ pressed }) => [styles.row, onPress && pressed && { opacity: 0.85 }]}>
      <StoryChip tone={tone} label={item.category.toLowerCase()} uppercase={false} />
      <View style={styles.copyBlock}>
        <Text style={[styles.summary, { color: theme.ink }]} numberOfLines={2}>
          {showCommitteeName && item.committeeName ? (
            <Text style={{ color: theme.primary, fontFamily: StoryFonts.bodySemiBold }}>
              {item.committeeName}
              <Text style={{ color: theme.muted }}> · </Text>
            </Text>
          ) : null}
          {item.summary}
        </Text>
        {metaLine ? (
          <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>
            {metaLine}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SchoolAdminCommitteeActivityFeed({
  items,
  compact = false,
  showCommitteeName = false,
  title = 'Recent activity',
  emptyMessage = 'No activity yet.',
  onViewAll,
  onItemPress,
}: SchoolAdminCommitteeActivityFeedProps) {
  const theme = useParentTheme();

  if (items.length === 0) {
    return (
      <View style={styles.emptyBlock}>
        {title ? (
          <StoryDisplayHeading size="section" style={styles.title}>
            {title}
          </StoryDisplayHeading>
        ) : null}
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>{emptyMessage}</Text>
      </View>
    );
  }

  const visibleItems = compact ? items.slice(0, 6) : items;

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.headerRow}>
          <StoryDisplayHeading size="section" style={styles.title}>
            {title}
          </StoryDisplayHeading>
          {onViewAll ? <StoryTextLink label="View all →" onPress={onViewAll} /> : null}
        </View>
      ) : null}
      <View style={styles.list}>
        {visibleItems.map((item) => (
          <ActivityRow
            key={item.id}
            item={item}
            showCommitteeName={showCommitteeName}
            onPress={onItemPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  copyBlock: {
    width: '100%',
    gap: 2,
  },
  summary: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
  },
  emptyBlock: {
    gap: Spacing.one,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
