import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';

import { CommitteeProjectDetailSkeleton } from '@/components/committees/projects/committee-project-detail-skeleton';
import { CommitteeProjectDetailsSection } from '@/components/committees/projects/committee-project-details-section';
import { CommitteeProjectSupplyListSection } from '@/components/committees/projects/committee-project-supply-list-section';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  committeeProjectDisplayName,
  type CommitteeProject,
} from '@/lib/committees/committee-project-mappers';
import { getCommitteeProject } from '@/lib/committees/committee-projects';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import type { CommitteeMember } from '@/lib/parent/parent-committees-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type DetailTab = 'supply_list' | 'details';

export type CommitteeProjectDetailScreenProps = {
  organizationId: string;
  committeeId: string;
  projectId: string;
  supabase: SupabaseClient;
  members: CommitteeMember[];
  readOnly?: boolean;
  portalApiNamespace?: CommitteePortalApiNamespace;
  currentMemberId?: string;
  initialTab?: DetailTab;
};

export function CommitteeProjectDetailScreen({
  organizationId,
  committeeId,
  projectId,
  supabase,
  members,
  readOnly = false,
  portalApiNamespace = 'parent-portal',
  currentMemberId,
  initialTab = 'supply_list',
}: CommitteeProjectDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [project, setProject] = useState<CommitteeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getCommitteeProject(supabase, projectId);
      setProject(row);
    } catch (err) {
      reportError('committees.projects.detail_load', err, {
        entityType: 'committee_project',
        entityId: projectId,
      });
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, reportError, supabase]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  if (loading) {
    return <CommitteeProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={{ color: theme.alert }}>Project not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.muted} />
          <Text style={[styles.backLabel, { color: theme.muted }]}>Projects</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.ink }]}>
          {committeeProjectDisplayName(project)}
        </Text>
        <StoryPillNav
          fullWidth
          size="compact"
          items={[
            { key: 'supply_list', label: 'Supply list' },
            { key: 'details', label: 'Details' },
          ]}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DetailTab)}
          accessibilityLabel="Project sections"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {activeTab === 'supply_list' ? (
          <CommitteeProjectSupplyListSection
            project={project}
            committeeId={committeeId}
            organizationId={organizationId}
            supabase={supabase}
            members={members}
            readOnly={readOnly}
            portalApiNamespace={portalApiNamespace}
            currentMemberId={currentMemberId}
          />
        ) : (
          <CommitteeProjectDetailsSection
            project={project}
            organizationId={organizationId}
            supabase={supabase}
            readOnly={readOnly}
            portalApiNamespace={portalApiNamespace}
            currentMemberId={currentMemberId}
            onProjectChange={setProject}
            onDeleted={() => router.back()}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
  },
});
