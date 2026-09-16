import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryAttentionItem } from '@/components/story/story-attention-item';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  focusItemIconBg,
  focusItemIconName,
} from '@/lib/teacher/teacher-home-utils';
import type { TeacherDashboardFocusItem } from '@/lib/teacher/teacher-portal-api';

type TeacherHomeStartHereCardProps = {
  focusItems: TeacherDashboardFocusItem[];
  onPressItem: (item: TeacherDashboardFocusItem) => void;
};

export function TeacherHomeStartHereCard({
  focusItems,
  onPressItem,
}: TeacherHomeStartHereCardProps) {
  const theme = useParentTheme();

  const headline =
    focusItems.length > 0
      ? `${focusItems.length} thing${focusItems.length === 1 ? '' : 's'} need your attention`
      : "You're all caught up";

  return (
    <StoryCard variant="today" style={styles.card}>
      <StorySectionKicker style={styles.kicker}>Start here</StorySectionKicker>
      <Text style={[styles.headline, { color: theme.ink }]}>{headline}</Text>

      {focusItems.length > 0 ? (
        <View style={styles.attentionList}>
          {focusItems.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onPressItem(item)}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <StoryAttentionItem
                icon={
                  <Ionicons
                    name={focusItemIconName(item.icon)}
                    size={18}
                    color={theme.primary}
                  />
                }
                title={item.title}
                subtitle={item.subtitle}
                iconBg={focusItemIconBg(item.icon)}
                isFirst={index === 0}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No urgent tasks right now. Check back for messages and school updates.
        </Text>
      )}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  kicker: {
    marginBottom: 6,
  },
  headline: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  attentionList: {
    gap: 0,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.9,
  },
});
