import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// keyboard: verified on device — new project form uses ParentBottomSheet

import { closeThen } from '@/components/parent/garden/feedback';
import { GInlineBanner, GSwitchRow, GTextField } from '@/components/parent/garden/fields';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GHand, GIcon, GPressable, GSkeleton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { committeeProjectRouteForPortal } from '@/lib/committees/committee-project-nav';
import { committeeProjectDisplayName } from '@/lib/committees/committee-project-mappers';
import { createCommitteeProject, listCommitteeProjects, type CommitteeProject } from '@/lib/committees/committee-projects';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { pluralize } from '@/lib/parent/parent-committees-garden';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function CreateProjectSheet({
  visible,
  saving,
  error,
  onClose,
  onCreate,
}: {
  visible: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (input: { name: string; description: string; status: 'draft' | 'active' }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setDescription('');
      setActive(true);
      setShowErrors(false);
    }
  }, [visible]);

  const submit = () => {
    if (!name.trim()) {
      setShowErrors(true);
      return;
    }
    onCreate({ name: name.trim(), description: description.trim(), status: active ? 'active' : 'draft' });
  };

  return (
    <ParentBottomSheet visible={visible} onClose={onClose} title="New project" subtitle="Committee project" accessibilityLabel="Close new project">
      <View style={styles.form}>
        <GTextField
          label="Project name"
          value={name}
          onChangeText={setName}
          placeholder="Spring fair"
          error={showErrors && !name.trim() ? 'Give the project a name.' : null}
        />
        <GTextField label="Description" optional value={description} onChangeText={setDescription} multiline />
        <GSwitchRow
          label="Active project"
          meta={active ? 'Shows as Active to the committee' : 'Saved as a draft'}
          value={active}
          onValueChange={setActive}
        />
        {error ? <GInlineBanner tone="error" title="Couldn't create the project" description={`${error} Try again.`} /> : null}
        <GToyButton label={saving ? 'Creating…' : 'Create project'} icon="add" size="md" fullWidth loading={saving} onPress={submit} />
      </View>
    </ParentBottomSheet>
  );
}

/** Committee projects (cards → pushed project screen). Same requests and operation names. */
export function WorkspaceProjectsSection({
  committee,
  organizationId,
  supabase,
  currentMemberId,
  readOnly = false,
  portalApiNamespace = 'parent-portal',
  schoolSlug,
  initialProjectId,
}: ParentCommitteeSectionProps & { schoolSlug: string }) {
  const router = useRouter();
  const toast = useGardenToast();
  const { reportError } = useMobileErrorReporter(organizationId);
  const deepLinkHandled = useRef(false);
  const [projects, setProjects] = useState<CommitteeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setProjects(await listCommitteeProjects(supabase, committee.id));
    } catch (err) {
      reportError('committees.projects.load', err, { entityType: 'committee', entityId: committee.id });
      setLoadError(err instanceof Error ? err.message : 'Failed to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [committee.id, reportError, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const openProject = useCallback(
    (projectId: string) =>
      router.push(committeeProjectRouteForPortal(portalApiNamespace, schoolSlug, committee.id, projectId)),
    [committee.id, portalApiNamespace, router, schoolSlug],
  );

  useEffect(() => {
    if (!initialProjectId || deepLinkHandled.current || loading) return;
    const match = projects.find((project) => project.id === initialProjectId);
    if (!match) return;
    deepLinkHandled.current = true;
    queueMicrotask(() => openProject(match.id));
  }, [initialProjectId, loading, openProject, projects]);

  const create = async (input: { name: string; description: string; status: 'draft' | 'active' }) => {
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createCommitteeProject(supabase, committee.id, {
        organizationId,
        name: input.name,
        description: input.description,
        status: input.status,
        createdByMemberId: currentMemberId ?? null,
        workspaceRecord: { organizationId, portalApiNamespace, createdByMemberId: currentMemberId ?? null },
      });
      setProjects((current) => [...current, created]);
      closeThen(
        () => setCreateOpen(false),
        () => {
          toast.success('Project created', { description: `${input.name} is ready. Add items to its supply list.` });
          openProject(created.id);
        },
      );
    } catch (err) {
      reportError('committees.projects.create', err, { entityType: 'committee', entityId: committee.id });
      setCreateError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.list} accessibilityLabel="Loading projects">
        {[0, 1].map((i) => (
          <GSkeleton key={i} style={{ height: 96, borderRadius: 20 }} />
        ))}
      </View>
    );
  }

  if (loadError) {
    return (
      <GErrorCard kicker="Projects" title="We couldn't load projects" message={`${loadError} Check your connection, then try again.`} onRetry={() => void load()} />
    );
  }

  return (
    <>
      <GCard kicker="Projects" title="Committee projects" index={0}>
        <View style={styles.body}>
          <Text style={gText.meta}>Track committee projects and supply lists.</Text>
          {!readOnly ? (
            <GToyButton
              label="New project"
              icon="add"
              onPress={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
            />
          ) : null}
          {projects.length === 0 ? (
            <View style={styles.empty}>
              <Text style={gText.meta}>No projects yet.</Text>
              <GHand>Big plans start here.</GHand>
            </View>
          ) : (
            <View style={styles.list}>
              {projects.map((project) => {
                const name = committeeProjectDisplayName(project);
                const count = project.supplyItemCount ?? 0;
                return (
                  <GPressable
                    key={project.id}
                    accessibilityLabel={`${name}, ${project.status === 'active' ? 'Active' : 'Draft'}, ${pluralize(count, 'supply item')}. Open project`}
                    pressedScale={0.98}
                    onPress={() => openProject(project.id)}
                    style={styles.card}>
                    <GIcon name="folder-open-outline" size="md" bg={project.status === 'active' ? Garden.mint : Garden.butter} />
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {name}
                      </Text>
                      {project.description.trim() ? (
                        <Text style={gText.meta} numberOfLines={2}>
                          {project.description.trim()}
                        </Text>
                      ) : null}
                      <View style={styles.metaRow}>
                        <GChip label={project.status === 'active' ? 'Active' : 'Draft'} tone={project.status === 'active' ? 'success' : 'warning'} />
                        <Text style={gText.meta}>{pluralize(count, 'supply item')}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
                  </GPressable>
                );
              })}
            </View>
          )}
        </View>
      </GCard>
      <CreateProjectSheet
        visible={createOpen}
        saving={creating}
        error={createError}
        onClose={() => setCreateOpen(false)}
        onCreate={(input) => void create(input)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  body: { gap: 14 },
  empty: { gap: 8 },
  list: { gap: 10 },
  flex: { flex: 1, gap: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.paper,
  },
  cardTitle: { fontFamily: GardenFonts.display, fontSize: 18, lineHeight: 22, color: Garden.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
});
