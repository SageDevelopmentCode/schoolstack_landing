import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkspaceProjectsSection } from '@/components/parent/committees/garden/projects/workspace-projects-section';
import { WorkspaceCalendarSection } from '@/components/parent/committees/garden/sections/workspace-calendar-section';
import { WorkspaceMessagesSection } from '@/components/parent/committees/garden/sections/workspace-messages-section';
import { WorkspaceResourcesSection } from '@/components/parent/committees/garden/sections/workspace-resources-section';
import { WorkspaceTasksSection } from '@/components/parent/committees/garden/sections/workspace-tasks-section';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GLink, GSkeleton, gText } from '@/components/parent/garden/ui';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { AdminCommitteeAbout } from '@/components/school-admin/committees/garden/admin-committee-about';
import { AdminCommitteeActivitySection, AdminCommitteeHome } from '@/components/school-admin/committees/garden/admin-committee-home';
import { AdminCommitteeMembers } from '@/components/school-admin/committees/garden/admin-committee-members';
import { AdminCommitteeSettings } from '@/components/school-admin/committees/garden/admin-committee-settings';
import { useSchoolAdminCommittees } from '@/contexts/school-admin-committees-context';
import { haptic } from '@/lib/haptics';
import { resolveSchoolAdminCommitteeNavSections } from '@/lib/committees/committee-workspace-nav-sections';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { COMMITTEE_SECTION_LABELS, type Committee, type CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import {
  CommitteeWorkspaceLoadCoalescer,
  fetchSchoolAdminCommitteeWorkspace,
  isCommitteeWorkspaceLoadTimeoutError,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { getCommittee } from '@/lib/school-admin/committees/queries';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, keyof typeof Ionicons.glyphMap>> = {
  home: 'home-outline',
  about: 'information-circle-outline',
  resources: 'document-text-outline',
  calendar: 'calendar-outline',
  tasks: 'checkbox-outline',
  projects: 'folder-outline',
  messages: 'chatbubble-outline',
  members: 'people-outline',
  activity: 'pulse-outline',
  settings: 'settings-outline',
};

function statusTone(status: string): GChipTone {
  if (status === 'active') return 'success';
  if (status === 'archived') return 'neutral';
  return 'warning';
}

function resolveVisibleSection(configSections: CommitteeWorkspaceSection[], current: CommitteeWorkspaceSection, preview: boolean) {
  const visible = resolveSchoolAdminCommitteeNavSections(configSections, { preview });
  return visible.includes(current) ? current : (visible[0] ?? 'home');
}

function useDetailBleed() {
  const insets = useSafeAreaInsets();
  return { marginTop: -insets.top, paddingTop: insets.top };
}

type Props = {
  slug: string;
  organizationId: string;
  committeeId: string;
  initialSection?: CommitteeWorkspaceSection;
  initialProjectId?: string | null;
};

/**
 * School admin › Committees › one workspace (Garden). Same timeout-wrapped,
 * coalesced load and `committees.load_workspace[_timeout]` reports as Story.
 * Shared sections are the parent Garden ones in admin mode; Home, Role &
 * Duties, Members, Activity and Settings are admin Garden sections.
 */
export function SchoolAdminCommitteeWorkspaceScreen({ slug, organizationId, committeeId, initialSection = 'home', initialProjectId }: Props) {
  const router = useRouter();
  const bleed = useDetailBleed();
  const { isPreview } = usePortalPreview();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const { refresh: refreshCommitteesList } = useSchoolAdminCommittees();
  const loadCoalescerRef = useRef(new CommitteeWorkspaceLoadCoalescer());
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommitteeWorkspaceSection>(initialSection);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const loadWorkspace = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      await loadCoalescerRef.current.run(silent, async () => {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        try {
          const loaded = await fetchSchoolAdminCommitteeWorkspace(async (orgId, id) => getCommittee(supabase, orgId, id), organizationId, committeeId);
          setCommittee(loaded);
          const sections = loaded.config.sections.filter((section): section is CommitteeWorkspaceSection => section !== 'settings');
          setActiveSection((current) => resolveVisibleSection(sections, current, isPreview));
        } catch (loadError) {
          const operation = isCommitteeWorkspaceLoadTimeoutError(loadError) ? 'committees.load_workspace_timeout' : 'committees.load_workspace';
          reportError(operation, loadError, { entityType: 'committee', entityId: committeeId, metadata: { slug, committeeId } });
          if (!silent) {
            setError(loadError instanceof Error ? loadError.message : 'Failed to load committee.');
            setCommittee(null);
          }
          if (silent) throw loadError;
        } finally {
          if (!silent) setLoading(false);
        }
      });
    },
    [committeeId, isPreview, organizationId, reportError, slug, supabase],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (initialSection) queueMicrotask(() => setActiveSection(initialSection));
  }, [initialSection]);

  const onRefresh = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        await loadWorkspace({ silent: options?.silent ?? true });
      } catch {
        // intentionally silent: the load already reported; sections keep their data.
      }
    },
    [loadWorkspace],
  );

  const [pullError, setPullError] = useState<string | null>(null);
  const pullRefresh = useCallback(async () => {
    try {
      await loadWorkspace({ silent: true });
      setPullError(null);
    } catch (err) {
      setPullError(err instanceof Error ? err.message : 'Failed to refresh.');
    }
  }, [loadWorkspace]);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: pullRefresh,
    error: pullError,
    label: 'Committee',
    id: `admin-committee-refresh-${committeeId}`,
  });

  const changeSection = useCallback((section: CommitteeWorkspaceSection) => {
    haptic.select();
    setActiveSection(section);
  }, []);

  const handleJoinRequestsChanged = useCallback(() => {
    void refreshCommitteesList({ silent: true });
  }, [refreshCommitteesList]);

  if (loading) return <WorkspaceSkeleton />;

  if (error || !committee) {
    return (
      <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
        <StatusBar style="dark" />
        <GBackHeader backLabel="Committees" backAccessibilityLabel="Back to committees" onBack={() => router.back()} title="Committee" />
        <GErrorCard title="We couldn't load this committee" message={error ?? 'Committee not found.'} onRetry={() => void loadWorkspace()} />
      </ScrollView>
    );
  }

  const sectionProps: ParentCommitteeSectionProps = {
    committee,
    organizationId,
    supabase,
    readOnly: false,
    isAdmin: true,
    portalApiNamespace: 'school-admin',
    schoolSlug: slug,
    onCommitteeChange: setCommittee,
    onRefresh,
    onNavigate: setActiveSection,
    onJoinRequestsChanged: handleJoinRequestsChanged,
    initialProjectId,
  };

  const sections = resolveSchoolAdminCommitteeNavSections(committee.config.sections, { preview: isPreview });
  const leaders = committee.members.filter((member) => member.role === 'lead');
  const leaderLine = leaders.length > 0 ? `Led by ${leaders.map((leader) => leader.name).join(', ')}` : null;

  const header = (
    <View style={styles.header}>
      <GBackHeader
        backLabel="Committees"
        backAccessibilityLabel="Back to committees"
        onBack={() => router.back()}
        title={committee.name}
        subtitle={leaderLine}>
        <View style={styles.chips}>
          {committee.termLabel ? <GChip label={committee.termLabel} tone="info" /> : null}
          <GChip label={committee.status} tone={statusTone(committee.status)} />
          {committee.description.trim() ? <GLink label="View description" icon={null} onPress={() => setDescriptionOpen(true)} /> : null}
        </View>
      </GBackHeader>
      <GSegmented<CommitteeWorkspaceSection>
        scrollable
        compact
        accessibilityLabel="Committee sections"
        items={sections.map((section) => ({
          id: section,
          label: COMMITTEE_SECTION_LABELS[section],
          icon: SECTION_ICONS[section],
          testID: `school-admin-committee-section-${section}`,
        }))}
        activeId={activeSection}
        onChange={changeSection}
      />
    </View>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <AdminCommitteeHome {...sectionProps} />;
      case 'about':
        return <AdminCommitteeAbout {...sectionProps} />;
      case 'resources':
        return <WorkspaceResourcesSection {...sectionProps} />;
      case 'calendar':
        return <WorkspaceCalendarSection {...sectionProps} />;
      case 'tasks':
        return <WorkspaceTasksSection {...sectionProps} />;
      case 'projects':
        return <WorkspaceProjectsSection {...sectionProps} schoolSlug={slug} />;
      case 'members':
        return <AdminCommitteeMembers {...sectionProps} />;
      case 'activity':
        return <AdminCommitteeActivitySection {...sectionProps} />;
      case 'settings':
        return <AdminCommitteeSettings {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.root, bleed]}>
      <StatusBar style="dark" />
      {activeSection === 'messages' ? (
        <>
          {header}
          <WorkspaceMessagesSection {...sectionProps} />
        </>
      ) : (
        <ParentKeyboardAwareScrollView
          includeTabBarPadding={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}>
          {header}
          <View style={styles.content}>{renderSection()}</View>
        </ParentKeyboardAwareScrollView>
      )}

      <GSheet
        visible={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
        accessibilityLabel="Close description"
        title={committee.name}
        subtitle={leaderLine ?? undefined}>
        <Text style={gText.body}>{committee.description}</Text>
      </GSheet>
    </View>
  );
}

function WorkspaceSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView style={[styles.root, bleed]} scrollEnabled={false} accessibilityLabel="Loading committee" contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skBack} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skChips} />
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skCard} />
      <GSkeleton style={styles.skCard} />
      <Text style={styles.skCopy}>Loading committee…</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  header: { gap: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Garden.ink10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  scroll: { paddingBottom: 56 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  errorWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 110, height: 20, borderRadius: 10 },
  skTitle: { width: '70%', height: 30, borderRadius: 10 },
  skChips: { width: '50%', height: 24, borderRadius: 12 },
  skTabs: { height: 40, borderRadius: 20 },
  skCard: { height: 180, borderRadius: 22 },
  skCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, textAlign: 'center' },
});
