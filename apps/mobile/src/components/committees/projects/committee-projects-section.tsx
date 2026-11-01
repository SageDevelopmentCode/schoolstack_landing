import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CommitteeProjectCard } from '@/components/committees/projects/committee-project-card';
import { CommitteeProjectCreateSheet } from '@/components/committees/projects/committee-project-create-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { committeeProjectRouteForPortal } from '@/lib/committees/committee-project-nav';
import {
  createCommitteeProject,
  listCommitteeProjects,
  type CommitteeProject,
} from '@/lib/committees/committee-projects';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { useRouter } from 'expo-router';

type CommitteeProjectsSectionProps = ParentCommitteeSectionProps & {
  schoolSlug: string;
};

export function CommitteeProjectsSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  portalApiNamespace = 'parent-portal',
  schoolSlug,
  initialProjectId,
}: CommitteeProjectsSectionProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const deepLinkHandledRef = useRef(false);

  const [projects, setProjects] = useState<CommitteeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listCommitteeProjects(supabase, committee.id);
      setProjects(rows);
    } catch (err) {
      reportError('committees.projects.load', err, {
        entityType: 'committee',
        entityId: committee.id,
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [committee.id, reportError, supabase]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const openProject = useCallback(
    (projectId: string) => {
      router.push(
        committeeProjectRouteForPortal(
          portalApiNamespace,
          schoolSlug,
          committee.id,
          projectId,
        ),
      );
    },
    [committee.id, portalApiNamespace, router, schoolSlug],
  );

  useEffect(() => {
    if (!initialProjectId || deepLinkHandledRef.current || loading) return;
    const match = projects.find((project) => project.id === initialProjectId);
    if (!match) return;
    deepLinkHandledRef.current = true;
    queueMicrotask(() => {
      openProject(match.id);
    });
  }, [initialProjectId, loading, openProject, projects]);

  const handleCreate = async (input: {
    name: string;
    description: string;
    status: 'draft' | 'active';
  }) => {
    setCreating(true);
    try {
      const created = await createCommitteeProject(supabase, committee.id, {
        organizationId,
        name: input.name,
        description: input.description,
        status: input.status,
        createdByMemberId: currentMemberId ?? null,
        workspaceRecord: {
          organizationId,
          portalApiNamespace,
          createdByMemberId: currentMemberId ?? null,
        },
      });
      setProjects((current) => [...current, created]);
      setCreateOpen(false);
      openProject(created.id);
    } catch (err) {
      reportError('committees.projects.create', err, {
        entityType: 'committee',
        entityId: committee.id,
      });
      throw err;
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StoryDetailSection title="Projects">
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Track committee projects and supply lists.
        </Text>
        {!readOnly ? (
          <View style={styles.createButton}>
            <StoryButton label="New project" onPress={() => setCreateOpen(true)} />
          </View>
        ) : null}
        {projects.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>No projects yet.</Text>
        ) : (
          <View style={styles.list}>
            {projects.map((project) => (
              <CommitteeProjectCard
                key={project.id}
                project={project}
                onPress={() => openProject(project.id)}
              />
            ))}
          </View>
        )}
      </StoryDetailSection>

      <CommitteeProjectCreateSheet
        visible={createOpen}
        saving={creating}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    marginBottom: Spacing.three,
  },
  createButton: {
    marginBottom: Spacing.three,
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  list: {
    gap: Spacing.three,
  },
});
