import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentCommitteeWorkspaceHeader } from '@/components/parent/committees/parent-committee-workspace-header';
import { ParentCommitteeCalendarSection } from '@/components/parent/committees/sections/parent-committee-calendar-section';
import { ParentCommitteeHomeSection } from '@/components/parent/committees/sections/parent-committee-home-section';
import { ParentCommitteeMembersSection } from '@/components/parent/committees/sections/parent-committee-members-section';
import { ParentCommitteeMessagesSection } from '@/components/parent/committees/sections/parent-committee-messages-section';
import { ParentCommitteeResourcesSection } from '@/components/parent/committees/sections/parent-committee-resources-section';
import { ParentCommitteeTasksSection } from '@/components/parent/committees/sections/parent-committee-tasks-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { PARENT_VISIBLE_SECTIONS } from '@/lib/parent/committees/constants';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { fetchParentCommitteeWorkspace } from '@/lib/parent/parent-portal-api';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
  fetchWorkspace: (organizationId: string, committeeId: string) => Promise<Committee>;
};

function resolveVisibleSection(
  sections: CommitteeWorkspaceSection[],
  current: CommitteeWorkspaceSection,
): CommitteeWorkspaceSection {
  const visible = sections.filter((section) => PARENT_VISIBLE_SECTIONS.includes(section));
  if (visible.includes(current)) return current;
  return visible[0] ?? 'home';
}

function CommitteeWorkspaceScreen({
  organizationId,
  committeeId,
  fetchWorkspace,
}: CommitteeWorkspaceScreenProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommitteeWorkspaceSection>('home');

  const loadWorkspace = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const loaded = await fetchWorkspace(organizationId, committeeId);
      setCommittee(loaded);
      const sections = loaded.config.sections.filter(
        (section): section is CommitteeWorkspaceSection => section !== 'settings',
      );
      setActiveSection((current) => resolveVisibleSection(sections, current));
    } catch (loadError) {
      reportError('committees.load_workspace', loadError, {
        entityType: 'committee',
        entityId: committeeId,
      });
      if (!silent) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load committee.');
        setCommittee(null);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [committeeId, fetchWorkspace, organizationId, reportError]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user || !committee) return;

      const member = committee.members.find(
        (entry) => entry.userId === user.id && entry.status === 'active',
      );
      if (member) {
        setCurrentMemberId(member.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committee, supabase]);

  const onRefresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await loadWorkspace({ silent: options?.silent ?? true });
    },
    [loadWorkspace],
  );

  const sectionProps: ParentCommitteeSectionProps | null = committee
    ? {
        committee,
        organizationId,
        supabase,
        currentMemberId,
        readOnly: !currentMemberId,
        onCommitteeChange: setCommittee,
        onRefresh,
        onNavigate: setActiveSection,
      }
    : null;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading committee…</Text>
      </View>
    );
  }

  if (error || !committee || !sectionProps) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorCopy, { color: theme.alert }]}>
          {error ?? 'Committee not found.'}
        </Text>
      </View>
    );
  }

  const renderScrollSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <ParentCommitteeHomeSection
            committee={sectionProps.committee}
            onNavigate={sectionProps.onNavigate ?? setActiveSection}
          />
        );
      case 'resources':
        return <ParentCommitteeResourcesSection {...sectionProps} />;
      case 'calendar':
        return <ParentCommitteeCalendarSection {...sectionProps} />;
      case 'tasks':
        return <ParentCommitteeTasksSection {...sectionProps} />;
      case 'members':
        return <ParentCommitteeMembersSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <ParentCommitteeWorkspaceHeader
        committee={committee}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {activeSection === 'messages' ? (
        <ParentCommitteeMessagesSection {...sectionProps} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {renderScrollSection()}
        </ScrollView>
      )}
    </View>
  );
}

type ParentCommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
};

export function ParentCommitteeWorkspaceScreen({
  organizationId,
  committeeId,
}: ParentCommitteeWorkspaceScreenProps) {
  return (
    <CommitteeWorkspaceScreen
      organizationId={organizationId}
      committeeId={committeeId}
      fetchWorkspace={fetchParentCommitteeWorkspace}
    />
  );
}

export { CommitteeWorkspaceScreen };

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
