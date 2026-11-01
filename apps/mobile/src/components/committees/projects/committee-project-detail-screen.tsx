import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SupabaseClient } from '@supabase/supabase-js';

import { CommitteeProjectDetailsSection } from '@/components/committees/projects/committee-project-details-section';
import { CommitteeProjectSupplyListSection } from '@/components/committees/projects/committee-project-supply-list-section';
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
  const insets = useSafeAreaInsets();
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

  const tabs = useMemo(
    () =>
      [
        { id: 'supply_list' as const, label: 'Supply list' },
        { id: 'details' as const, label: 'Details' },
      ] as const,
    [],
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={{ color: theme.alert }}>Project not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.muted} />
          <Text style={[styles.backLabel, { color: theme.muted }]}>Projects</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.ink }]}>
          {committeeProjectDisplayName(project)}
        </Text>
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tab,
                  {
                    borderColor: selected ? theme.primary : theme.line,
                    backgroundColor: selected ? theme.primarySoft : theme.white,
                  },
                ]}>
                <Text style={[styles.tabLabel, { color: theme.ink }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
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
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  tabLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
  },
});
