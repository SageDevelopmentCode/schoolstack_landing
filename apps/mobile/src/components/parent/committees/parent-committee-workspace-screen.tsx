import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WorkspaceProjectsSection } from '@/components/parent/committees/garden/projects/workspace-projects-section';
import { WorkspaceCalendarSection } from '@/components/parent/committees/garden/sections/workspace-calendar-section';
import { WorkspaceHomeSection } from '@/components/parent/committees/garden/sections/workspace-home-section';
import { WorkspaceMembersSection } from '@/components/parent/committees/garden/sections/workspace-members-section';
import { WorkspaceMessagesSection } from '@/components/parent/committees/garden/sections/workspace-messages-section';
import { WorkspaceResourcesSection } from '@/components/parent/committees/garden/sections/workspace-resources-section';
import { WorkspaceTasksSection } from '@/components/parent/committees/garden/sections/workspace-tasks-section';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GLink, GSkeleton, gText } from '@/components/parent/garden/ui';
import { useCommitteeUnreadRefresh } from '@/contexts/committee-unread-refresh-context';
import { sectionUnreadForCommittee } from '@/lib/committees/committee-unread-section-labels';
import type { CommitteeSectionUnreadCounts } from '@/lib/committees/committee-unread-types';
import { resolveParentTeacherCommitteeNavSections } from '@/lib/committees/committee-workspace-nav-sections';
import type { CommitteesPortal } from '@/lib/committees/committees-portal-config';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import { useCommitteeUnreadSummary } from '@/lib/committees/use-committee-unread-summary';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { fetchParentCommitteeWorkspace, markParentCommitteeSectionRead } from '@/lib/parent/parent-portal-api';
import {
  COMMITTEE_SECTION_LABELS,
  type Committee,
  type CommitteeWorkspaceLoad,
  type CommitteeWorkspaceSection,
} from '@/lib/parent/parent-committees-types';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { getSupabaseClient } from '@/lib/supabase';
import { markTeacherCommitteeSectionRead } from '@/lib/teacher/teacher-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeWorkspaceScreenProps = {
  organizationId: string;
  committeeId: string;
  portalApiNamespace?: CommitteePortalApiNamespace;
  fetchWorkspace: (organizationId: string, committeeId: string) => Promise<CommitteeWorkspaceLoad>;
  initialSection?: CommitteeWorkspaceSection;
  initialEventId?: string | null;
  initialResourceId?: string | null;
  initialTaskId?: string | null;
  initialProjectId?: string | null;
  schoolSlug: string;
};

const SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, keyof typeof Ionicons.glyphMap>> = {
  home: 'home-outline',
  resources: 'document-text-outline',
  calendar: 'calendar-outline',
  tasks: 'checkbox-outline',
  projects: 'folder-outline',
  messages: 'chatbubble-outline',
  members: 'people-outline',
};

function unreadFor(counts: CommitteeSectionUnreadCounts | undefined, section: CommitteeWorkspaceSection): number {
  if (!counts) return 0;
  if (section === 'messages') return counts.messages;
  if (section === 'tasks') return counts.tasks;
  if (section === 'resources') return counts.resources;
  if (section === 'calendar') return counts.calendar;
  return 0;
}

function resolveVisibleSection(
  configSections: CommitteeWorkspaceSection[],
  current: CommitteeWorkspaceSection,
): CommitteeWorkspaceSection {
  const visible = resolveParentTeacherCommitteeNavSections(configSections);
  return visible.includes(current) ? current : (visible[0] ?? 'home');
}

function portalFromApiNamespace(ns: CommitteePortalApiNamespace): CommitteesPortal {
  return ns === 'teacher-portal' ? 'teacher' : 'parent';
}

function WorkspaceSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root} accessibilityLabel="Loading committee" accessibilityState={{ busy: true }}>
      <StatusBar style="dark" />
      <View style={styles.headerWrap}>
        <GBackHeader backLabel="My committees" backAccessibilityLabel="Back to My committees" onBack={onBack} kicker="Committee" title="Loading…" />
        <GSkeleton style={{ height: 44, borderRadius: 999 }} />
      </View>
      <View style={styles.content}>
        <GSkeleton style={{ height: 140, borderRadius: 24 }} />
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <GSkeleton key={i} style={{ flexBasis: '45%', flexGrow: 1, height: 130, borderRadius: 22 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

function CommitteeWorkspaceScreen({
  organizationId,
  committeeId,
  portalApiNamespace = 'parent-portal',
  fetchWorkspace,
  initialSection = 'home',
  initialEventId,
  initialResourceId,
  initialTaskId,
  initialProjectId,
  schoolSlug,
}: CommitteeWorkspaceScreenProps) {
  const router = useRouter();
  const accent = useGardenAccent();
  const { isPreview } = usePortalPreview();
  const { reportError } = useMobileErrorReporter(organizationId);
  const unreadRefresh = useCommitteeUnreadRefresh();
  const portal = portalFromApiNamespace(portalApiNamespace);
  const { summary } = useCommitteeUnreadSummary(portal, organizationId);
  const sectionUnread = useMemo(() => sectionUnreadForCommittee(summary, committeeId), [committeeId, summary]);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [previewViewerMemberId, setPreviewViewerMemberId] = useState<string | null>(null);
  const [currentMemberId, setCurrentMemberId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommitteeWorkspaceSection>(initialSection);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const loadWorkspace = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      setRefreshError(null);
      try {
        const loaded = await withCommitteeWorkspaceLoadTimeout(fetchWorkspace(organizationId, committeeId));
        setCommittee(loaded.committee);
        setPreviewViewerMemberId(loaded.viewerMemberId);
        const sections = loaded.committee.config.sections.filter(
          (section): section is CommitteeWorkspaceSection => section !== 'settings',
        );
        setActiveSection((current) => resolveVisibleSection(sections, current));
      } catch (loadError) {
        const operation = isCommitteeWorkspaceLoadTimeoutError(loadError)
          ? 'committees.load_workspace_timeout'
          : 'committees.load_workspace';
        reportError(operation, loadError, { entityType: 'committee', entityId: committeeId, metadata: { committeeId } });
        const message = loadError instanceof Error ? loadError.message : 'Failed to load committee.';
        if (!silent) {
          setError(message);
          setCommittee(null);
        } else {
          setRefreshError(message);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [committeeId, fetchWorkspace, organizationId, reportError],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!committee) return;
    if (isPreview) {
      setCurrentMemberId(previewViewerMemberId ?? undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      setCurrentMemberId(committee.members.find((entry) => entry.userId === user.id && entry.status === 'active')?.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [committee, isPreview, previewViewerMemberId, supabase]);

  useEffect(() => {
    if (!currentMemberId || isPreview) return;
    const section = activeSection;
    if (section !== 'messages' && section !== 'tasks' && section !== 'resources' && section !== 'calendar') return;
    const markRead =
      portalApiNamespace === 'teacher-portal'
        ? markTeacherCommitteeSectionRead(organizationId, committeeId, section)
        : markParentCommitteeSectionRead(organizationId, committeeId, section);
    void markRead
      .then(() => unreadRefresh?.notifyCommitteeUnreadChanged())
      .catch((markReadError) => {
        reportError('committees.mark_section_read', markReadError, { entityType: 'committee', entityId: committeeId });
      });
  }, [activeSection, committeeId, currentMemberId, isPreview, organizationId, portalApiNamespace, reportError, unreadRefresh]);

  const onRefresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await loadWorkspace({ silent: options?.silent ?? true });
    },
    [loadWorkspace],
  );

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: () => onRefresh({ silent: true }),
    error: refreshError,
    label: 'Committee',
    id: 'committee-workspace-refresh',
  });

  if (loading) return <WorkspaceSkeleton onBack={() => router.back()} />;

  if (error || !committee) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <GBackHeader backLabel="My committees" backAccessibilityLabel="Back to My committees" onBack={() => router.back()} kicker="Committee" title="Committee" />
          <GErrorCard
            kicker="Committee"
            title="We couldn't open this committee"
            message={error ?? 'Committee not found.'}
            onRetry={() => void loadWorkspace()}
          />
        </ScrollView>
      </View>
    );
  }

  const sectionProps: ParentCommitteeSectionProps = {
    committee,
    organizationId,
    supabase,
    currentMemberId,
    readOnly: !currentMemberId || isPreview,
    portalApiNamespace,
    onCommitteeChange: setCommittee,
    onRefresh,
    onNavigate: setActiveSection,
    initialEventId,
    initialResourceId,
    initialTaskId,
    initialProjectId,
  };

  const leaders = committee.members.filter((member) => member.role === 'lead');
  const leaderLine = leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(', ')}` : null;
  const sections = resolveParentTeacherCommitteeNavSections(committee.config.sections);

  const header = (
    <View style={styles.headerWrap}>
      <GBackHeader
        backLabel="My committees"
        backAccessibilityLabel="Back to My committees"
        onBack={() => router.back()}
        kicker="Committee workspace"
        title={committee.name}
        subtitle={leaderLine}>
        <View style={styles.metaRow}>
          <GChip label={committee.termLabel} tone="info" />
          {!currentMemberId && !isPreview ? <GChip label="View only" tone="neutral" icon="eye-outline" /> : null}
          {isPreview ? <GChip label="Preview · read-only" tone="warning" /> : null}
          {committee.description.trim() ? (
            <GLink label="View description" icon="information-circle-outline" onPress={() => setDescriptionOpen(true)} />
          ) : null}
        </View>
      </GBackHeader>
      <GSegmented
        scrollable
        accessibilityLabel="Committee sections"
        items={sections.map((section) => ({
          id: section,
          label: COMMITTEE_SECTION_LABELS[section],
          icon: SECTION_ICONS[section],
          badge: unreadFor(sectionUnread, section) || undefined,
          testID: `parent-committee-section-${section}`,
        }))}
        activeId={activeSection}
        onChange={setActiveSection}
      />
    </View>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <WorkspaceHomeSection
            committee={committee}
            organizationId={organizationId}
            portalApiNamespace={portalApiNamespace}
            messagesUnread={unreadFor(sectionUnread, 'messages')}
            onNavigate={setActiveSection}
          />
        );
      case 'resources':
        return <WorkspaceResourcesSection {...sectionProps} />;
      case 'calendar':
        return <WorkspaceCalendarSection {...sectionProps} />;
      case 'tasks':
        return <WorkspaceTasksSection {...sectionProps} />;
      case 'projects':
        return <WorkspaceProjectsSection {...sectionProps} schoolSlug={schoolSlug} />;
      case 'members':
        return <WorkspaceMembersSection committee={committee} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.root} testID="parent-committee-workspace-screen">
      <StatusBar style="dark" />
      {activeSection === 'messages' ? (
        <>
          {header}
          <WorkspaceMessagesSection {...sectionProps} />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={accent.clay} />
          }>
          {header}
          <View style={styles.content}>{renderSection()}</View>
        </ScrollView>
      )}

      <GSheet
        visible={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
        accessibilityLabel="Close description"
        kicker="Committee description"
        title={committee.name}
        subtitle={leaderLine ?? undefined}>
        <Text style={gText.body}>{committee.description}</Text>
      </GSheet>
    </View>
  );
}

export function ParentCommitteeWorkspaceScreen(props: Omit<CommitteeWorkspaceScreenProps, 'fetchWorkspace' | 'portalApiNamespace'>) {
  return <CommitteeWorkspaceScreen {...props} fetchWorkspace={fetchParentCommitteeWorkspace} />;
}

export { CommitteeWorkspaceScreen };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  headerWrap: {
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Garden.cream,
    borderBottomWidth: 1,
    borderBottomColor: Garden.ink10,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  scrollContent: { paddingBottom: 56 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
