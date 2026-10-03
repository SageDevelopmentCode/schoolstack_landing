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
import { useCommitteeUnreadRefresh } from '@/contexts/committee-unread-refresh-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { sectionUnreadForCommittee } from '@/lib/committees/committee-unread-section-labels';
import type { CommitteesPortal } from '@/lib/committees/committees-portal-config';
import { useCommitteeUnreadSummary } from '@/lib/committees/use-committee-unread-summary';
import { PARENT_VISIBLE_SECTIONS } from '@/lib/parent/committees/constants';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import {
  fetchParentCommitteeWorkspace,
  markParentCommitteeSectionRead,
} from '@/lib/parent/parent-portal-api';
import { markTeacherCommitteeSectionRead } from '@/lib/teacher/teacher-portal-api';
import type { Committee, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
  portalApiNamespace?: CommitteePortalApiNamespace;
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

function portalFromApiNamespace(
  portalApiNamespace: CommitteePortalApiNamespace,
): CommitteesPortal {
  return portalApiNamespace === 'teacher-portal' ? 'teacher' : 'parent';
}

function CommitteeWorkspaceScreen({
  organizationId,
  committeeId,
  portalApiNamespace = 'parent-portal',
  fetchWorkspace,
}: CommitteeWorkspaceScreenProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const committeeUnreadRefresh = useCommitteeUnreadRefresh();
  const portal = portalFromApiNamespace(portalApiNamespace);
  const { summary: unreadSummary } = useCommitteeUnreadSummary(portal, organizationId);
  const sectionUnreadCounts = useMemo(
    () => sectionUnreadForCommittee(unreadSummary, committeeId),
    [committeeId, unreadSummary],
  );
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

  useEffect(() => {
    if (!currentMemberId) return;
    const section = activeSection;
    if (
      section !== 'messages' &&
      section !== 'tasks' &&
      section !== 'resources' &&
      section !== 'calendar'
    ) {
      return;
    }
    const markRead =
      portalApiNamespace === 'teacher-portal'
        ? markTeacherCommitteeSectionRead(organizationId, committeeId, section)
        : markParentCommitteeSectionRead(organizationId, committeeId, section);
    void markRead
      .then(() => {
        committeeUnreadRefresh?.notifyCommitteeUnreadChanged();
      })
      .catch((markReadError) => {
        reportError('committees.mark_section_read', markReadError, {
          entityType: 'committee',
          entityId: committeeId,
        });
      });
  }, [
    activeSection,
    committeeId,
    committeeUnreadRefresh,
    currentMemberId,
    organizationId,
    portalApiNamespace,
    reportError,
  ]);

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
        portalApiNamespace,
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
            organizationId={sectionProps.organizationId}
            portalApiNamespace={portalApiNamespace}
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
        sectionUnreadCounts={sectionUnreadCounts}
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
