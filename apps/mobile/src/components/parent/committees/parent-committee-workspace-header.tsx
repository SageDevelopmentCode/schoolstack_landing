import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeDescriptionSheet } from '@/components/parent/committees/parent-committee-description-sheet';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { PARENT_VISIBLE_SECTIONS } from '@/lib/parent/committees/constants';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { COMMITTEE_SECTION_LABELS } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, keyof typeof Ionicons.glyphMap>> = {
  home: 'home-outline',
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
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const leaders = committee.members.filter((member) => member.role === 'lead');
  const leaderLine =
    leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(', ')}` : null;

  const sections = useMemo(
    () =>
      committee.config.sections.filter((section): section is CommitteeWorkspaceSection =>
        PARENT_VISIBLE_SECTIONS.includes(section as CommitteeWorkspaceSection),
      ),
    [committee.config.sections],
  );

  const navItems = sections.map((section) => ({
    key: section,
    label: COMMITTEE_SECTION_LABELS[section],
    icon: SECTION_ICONS[section],
    testID: `parent-committee-section-${section}`,
  }));

  const showDescriptionButton = Boolean(committee.description.trim());

  return (
    <>
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
            <StoryDisplayHeading size="section">{committee.name}</StoryDisplayHeading>

            <View style={styles.metaRow}>
              <StoryChip tone="info" label={committee.termLabel} />
              {showDescriptionButton ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setDescriptionOpen(true)}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                  <Text style={[styles.viewDescriptionLabel, { color: theme.primary }]}>
                    View description
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {leaderLine ? (
              <Text style={[styles.leadersCopy, { color: theme.muted }]}>{leaderLine}</Text>
            ) : null}
          </View>

          <StoryPillNav
            items={navItems}
            activeKey={activeSection}
            onChange={(key) => onSectionChange(key as CommitteeWorkspaceSection)}
            accessibilityLabel="Committee sections"
            size="comfortable"
          />
        </View>
      </View>

      <ParentCommitteeDescriptionSheet
        visible={descriptionOpen}
        committeeName={committee.name}
        description={committee.description}
        leaderLine={leaderLine}
        onClose={() => setDescriptionOpen(false)}
      />
    </>
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
    gap: Spacing.two,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  viewDescriptionLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  leadersCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
