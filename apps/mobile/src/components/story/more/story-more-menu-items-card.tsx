import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryCardPadding } from '@/constants/story-theme';

type StoryMoreMenuItemsCardProps = {
  children: ReactNode;
};

export function StoryMoreMenuItemsCard({ children }: StoryMoreMenuItemsCardProps) {
  return <StoryCard compact style={styles.card}>{children}</StoryCard>;
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: StoryCardPadding,
    paddingVertical: 0,
  },
});
