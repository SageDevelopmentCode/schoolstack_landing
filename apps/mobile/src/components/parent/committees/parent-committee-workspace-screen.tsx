import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentCommitteeWorkspaceHeader } from '@/components/parent/committees/parent-committee-workspace-header';
import { ParentCommitteeAboutSection } from '@/components/parent/committees/sections/parent-committee-about-section';
import { ParentCommitteeCalendarSection } from '@/components/parent/committees/sections/parent-committee-calendar-section';
import { ParentCommitteeHomeSection } from '@/components/parent/committees/sections/parent-committee-home-section';
import { ParentCommitteeMembersSection } from '@/components/parent/committees/sections/parent-committee-members-section';
import { ParentCommitteeMessagesSection } from '@/components/parent/committees/sections/parent-committee-messages-section';
import { ParentCommitteeResourcesSection } from '@/components/parent/committees/sections/parent-committee-resources-section';
import { ParentCommitteeTasksSection } from '@/components/parent/committees/sections/parent-committee-tasks-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { fetchParentCommitteeWorkspace } from '@/lib/parent/parent-portal-api';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentCommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
};

export function ParentCommitteeWorkspaceScreen({
  organizationId,
  committeeId,
}: ParentCommitteeWorkspaceScreenProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommitteeWorkspaceSection>('home');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchParentCommitteeWorkspace(organizationId, committeeId);
      setCommittee(loaded);
      const sections = loaded.config.sections.filter(
        (section): section is Exclude<CommitteeWorkspaceSection, 'settings'> =>
          section !== 'settings',
      );
      setActiveSection((current) =>
        current !== 'settings' && sections.includes(current) ? current : sections[0] ?? 'home',
      );
    } catch (loadError) {
      reportError('committees.load_workspace', loadError, {
        entityType: 'committee',
        entityId: committeeId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load committee.');
      setCommittee(null);
    } finally {
      setLoading(false);
    }
  }, [committeeId, organizationId, reportError]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading committee…</Text>
      </View>
    );
  }

  if (error || !committee) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorCopy, { color: theme.alert }]}>
          {error ?? 'Committee not found.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <ParentCommitteeWorkspaceHeader
        committee={committee}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {activeSection === 'home' ? (
          <ParentCommitteeHomeSection committee={committee} onNavigate={setActiveSection} />
        ) : null}
        {activeSection === 'about' ? <ParentCommitteeAboutSection committee={committee} /> : null}
        {activeSection === 'resources' ? (
          <ParentCommitteeResourcesSection committee={committee} />
        ) : null}
        {activeSection === 'calendar' ? (
          <ParentCommitteeCalendarSection committee={committee} />
        ) : null}
        {activeSection === 'tasks' ? <ParentCommitteeTasksSection committee={committee} /> : null}
        {activeSection === 'messages' ? (
          <ParentCommitteeMessagesSection committee={committee} />
        ) : null}
        {activeSection === 'members' ? <ParentCommitteeMembersSection committee={committee} /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  loadingCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
