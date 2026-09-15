import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteesTab } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteesStoryHeaderProps = {
  activeTab: ParentCommitteesTab;
  exploreCount: number;
  myCount: number;
  onSelectTab: (tab: ParentCommitteesTab) => void;
};

function resolveTitle(activeTab: ParentCommitteesTab): string {
  return activeTab === 'explore' ? 'Explore committees' : 'Your committees';
}

function resolveSubtitle(
  activeTab: ParentCommitteesTab,
  exploreCount: number,
  myCount: number,
): string {
  if (activeTab === 'explore') {
    if (exploreCount === 0) {
      return 'No volunteer committees are open right now.';
    }
    const label = exploreCount === 1 ? '1 committee' : `${exploreCount} committees`;
    return `${label} open for volunteers`;
  }

  if (myCount === 0) {
    return 'Approved committee workspaces will appear here.';
  }
  const label = myCount === 1 ? '1 active workspace' : `${myCount} active workspaces`;
  return label;
}

export function ParentCommitteesStoryHeader({
  activeTab,
  exploreCount,
  myCount,
  onSelectTab,
}: ParentCommitteesStoryHeaderProps) {
  const theme = useParentTheme();
  const title = resolveTitle(activeTab);
  const subtitle = resolveSubtitle(activeTab, exploreCount, myCount);

  return (
    <View style={styles.container} testID="parent-committees-story-header">
      <View style={styles.copyBlock}>
        <StorySectionKicker style={styles.kicker}>Volunteer & committees</StorySectionKicker>
        <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      </View>
      <StoryPillNav
        items={[
          { key: 'explore', label: 'Explore', testID: 'parent-committees-explore-nav' },
          { key: 'mine', label: 'My committees', testID: 'parent-committees-mine-nav' },
        ]}
        activeKey={activeTab}
        onChange={(key) => onSelectTab(key as ParentCommitteesTab)}
        accessibilityLabel="Committee sections"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  copyBlock: {
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
});
