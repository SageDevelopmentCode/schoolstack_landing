import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { COMMITTEE_SECTION_LABELS } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, keyof typeof Ionicons.glyphMap>> = {
  home: 'home-outline',
  about: 'book-outline',
  resources: 'document-text-outline',
  calendar: 'calendar-outline',
  tasks: 'checkbox-outline',
  messages: 'chatbubble-outline',
  members: 'people-outline',
};

type ParentCommitteeWorkspaceHeaderProps = {
  committee: Committee;
  activeSection: CommitteeWorkspaceSection;
  onSectionChange: (section: CommitteeWorkspaceSection) => void;
};

export function ParentCommitteeWorkspaceHeader({
  committee,
  activeSection,
  onSectionChange,
}: ParentCommitteeWorkspaceHeaderProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const leaders = committee.members.filter((member) => member.role === 'lead');

  const sections = committee.config.sections.filter(
    (section): section is CommitteeWorkspaceSection => section !== 'settings',
  );

  const navItems = sections.map((section) => ({
    key: section,
    label: COMMITTEE_SECTION_LABELS[section],
    icon: SECTION_ICONS[section],
    testID: `parent-committee-section-${section}`,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.white, borderBottomColor: theme.line }]}>
      <View style={styles.inner}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={18} color={theme.muted} />
          <Text style={[styles.backLabel, { color: theme.muted }]}>My committees</Text>
        </Pressable>

        <View style={styles.titleBlock}>
          <View style={styles.chipRow}>
            <StoryDisplayHeading size="section">{committee.name}</StoryDisplayHeading>
            <StoryChip tone="info" label={committee.termLabel} />
          </View>
          <Text style={[styles.description, { color: theme.muted }]}>{committee.description}</Text>
          {leaders.length > 0 ? (
            <Text style={[styles.leadersCopy, { color: theme.muted }]}>
              Led by {leaders.map((leader) => leader.name).join(', ')}
            </Text>
          ) : null}
        </View>

        <StoryPillNav
          items={navItems}
          activeKey={activeSection}
          onChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
          accessibilityLabel="Committee sections"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  titleBlock: {
    gap: Spacing.one,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  leadersCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
