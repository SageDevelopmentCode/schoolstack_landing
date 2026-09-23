import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentCommitteeCalendarSection } from '@/components/parent/committees/sections/parent-committee-calendar-section';
import { ParentCommitteeMessagesSection } from '@/components/parent/committees/sections/parent-committee-messages-section';
import { ParentCommitteeResourcesSection } from '@/components/parent/committees/sections/parent-committee-resources-section';
import { ParentCommitteeTasksSection } from '@/components/parent/committees/sections/parent-committee-tasks-section';
import { SchoolAdminCommitteeAboutSection } from '@/components/school-admin/committees/school-admin-committee-about-section';
import { SchoolAdminCommitteeActivitySection } from '@/components/school-admin/committees/school-admin-committee-activity-section';
import { SchoolAdminCommitteeHomeSection } from '@/components/school-admin/committees/school-admin-committee-home-section';
import { SchoolAdminCommitteeMembersSection } from '@/components/school-admin/committees/school-admin-committee-members-section';
import { SchoolAdminCommitteeSettingsSection } from '@/components/school-admin/committees/school-admin-committee-settings-section';
import { SchoolAdminCommitteeWorkspaceHeader } from '@/components/school-admin/committees/school-admin-committee-workspace-header';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useSchoolAdminCommittees } from '@/contexts/school-admin-committees-context';
import { getCommittee } from '@/lib/school-admin/committees/queries';
import {
  ADMIN_VISIBLE_SECTIONS,
  type Committee,
  type CommitteeWorkspaceSection,
} from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

type SchoolAdminCommitteeWorkspaceScreenProps = {
  slug: string;
  organizationId: string;
  committeeId: string;
  initialSection?: CommitteeWorkspaceSection;
};

function resolveVisibleSection(
  sections: CommitteeWorkspaceSection[],
  current: CommitteeWorkspaceSection,
): CommitteeWorkspaceSection {
  const visible = sections.filter((section) => ADMIN_VISIBLE_SECTIONS.includes(section));
  if (visible.includes(current)) return current;
  return visible[0] ?? 'home';
}

export function SchoolAdminCommitteeWorkspaceScreen({
  slug,
  organizationId,
  committeeId,
  initialSection = 'home',
}: SchoolAdminCommitteeWorkspaceScreenProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const reportError = createSchoolAdminErrorReporter(organizationId);
  const { refresh: refreshCommitteesList } = useSchoolAdminCommittees();

  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommitteeWorkspaceSection>(initialSection);

  const loadWorkspace = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const loaded = await getCommittee(supabase, organizationId, committeeId);
        if (!loaded) {
          throw new Error('Committee not found.');
        }
        setCommittee(loaded);
        const sections = loaded.config.sections.filter(
          (section): section is CommitteeWorkspaceSection =>
            ADMIN_VISIBLE_SECTIONS.includes(section as CommitteeWorkspaceSection),
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
    },
    [committeeId, organizationId, reportError, supabase],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const onRefresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await loadWorkspace({ silent: options?.silent ?? true });
    },
    [loadWorkspace],
  );

  const handleJoinRequestsChanged = useCallback(() => {
    void refreshCommitteesList({ silent: true });
  }, [refreshCommitteesList]);

  const sectionProps: ParentCommitteeSectionProps | null = committee
    ? {
        committee,
        organizationId,
        supabase,
        readOnly: false,
        isAdmin: true,
        schoolSlug: slug,
        onCommitteeChange: setCommittee,
        onRefresh,
        onNavigate: setActiveSection,
        onJoinRequestsChanged: handleJoinRequestsChanged,
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
        return <SchoolAdminCommitteeHomeSection {...sectionProps} />;
      case 'about':
        return <SchoolAdminCommitteeAboutSection {...sectionProps} />;
      case 'resources':
        return <ParentCommitteeResourcesSection {...sectionProps} />;
      case 'calendar':
        return <ParentCommitteeCalendarSection {...sectionProps} />;
      case 'tasks':
        return <ParentCommitteeTasksSection {...sectionProps} />;
      case 'members':
        return <SchoolAdminCommitteeMembersSection {...sectionProps} />;
      case 'activity':
        return <SchoolAdminCommitteeActivitySection {...sectionProps} />;
      case 'settings':
        return <SchoolAdminCommitteeSettingsSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <SchoolAdminCommitteeWorkspaceHeader
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
