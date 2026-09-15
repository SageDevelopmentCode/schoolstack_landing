import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  displayStatusLabel,
  displayStatusTone,
  formatBulletinAudiencesLabel,
  formatBulletinPostDate,
  resolveBulletinDisplayStatus,
} from '@/lib/school-bulletin/bulletin-audience';
import type { BulletinPost, ProgramOption } from '@/lib/school-bulletin/types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type BulletinPostListItemProps = {
  post: BulletinPost;
  programs: ProgramOption[];
  onPress: () => void;
};

export function BulletinPostListItem({ post, programs, onPress }: BulletinPostListItemProps) {
  const theme = useParentTheme();
  const programNameById = new Map(programs.map((program) => [program.id, program.name]));
  const displayStatus = resolveBulletinDisplayStatus(post);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
            {post.title.trim() || 'Untitled post'}
          </Text>
          <StoryChip tone={displayStatusTone(displayStatus)} label={displayStatusLabel(displayStatus)} />
        </View>
        <Text style={[styles.audience, { color: theme.muted }]} numberOfLines={2}>
          {formatBulletinAudiencesLabel(post.audiences, programNameById, post.programIds)}
        </Text>
        <Text style={[styles.updated, { color: theme.muted }]}>
          Updated {formatBulletinPostDate(post.updatedAt)}
        </Text>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  audience: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  updated: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
