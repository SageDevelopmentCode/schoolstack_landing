import { Ionicons } from '@expo/vector-icons';
import type { SupabaseClient } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// keyboard: verified on device — project details use ParentKeyboardAwareScrollView; supply items use ParentBottomSheet

import { GBackHeader } from '@/components/parent/garden/back-header';
import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GCheckRow, GChoiceChips, GInlineBanner, GSwitchRow, GTextField } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GHand, GOutlineButton, GPressable, GSkeleton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { committeeMembersToProjectOptions } from '@/lib/committees/committee-project-members';
import { committeeProjectDisplayName, type CommitteeProject } from '@/lib/committees/committee-project-mappers';
import { deleteCommitteeProject, getCommitteeProject, updateCommitteeProject } from '@/lib/committees/committee-projects';
import {
  buildSupplyListContext,
  deleteCommitteeProjectSupplyItem,
  insertCommitteeProjectSupplyItem,
  listCommitteeProjectSupplyList,
  saveCommitteeProjectSupplyItem,
} from '@/lib/committees/committee-project-supply-storage';
import {
  SUPPLY_ITEM_TYPE_OPTIONS,
  formatSupplyQuantity,
  newCoopSupplyListItem,
  supplyItemDisplayName,
  supplyItemTypeLabel,
  type CoopSupplyListItem,
  type SupplyItemType,
} from '@/lib/committees/committee-supply-types';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import type { CommitteeMember } from '@/lib/parent/parent-committees-types';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import { mapMemberRow } from '@/lib/school-admin/committees/mappers';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type DetailTab = 'supply_list' | 'details';

/* ------------------------------------------------------------------ */
/* Supply item sheet                                                   */
/* ------------------------------------------------------------------ */

function SupplyItemSheet({
  visible,
  mode,
  item,
  members,
  readOnly,
  saving,
  error,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  mode: 'create' | 'edit';
  item: CoopSupplyListItem | null;
  members: { memberId: string; name: string }[];
  readOnly: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (item: CoopSupplyListItem) => void;
  onDelete?: () => void;
}) {
  const { notifyReadOnly } = useGardenReadOnlyGate();
  const [draft, setDraft] = useState<CoopSupplyListItem | null>(item);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setDraft(item ? { ...item } : null);
    setShowErrors(false);
  }, [item, visible]);

  if (!draft) return null;
  const update = (patch: Partial<CoopSupplyListItem>) => setDraft((current) => (current ? { ...current, ...patch } : current));
  const toggleMember = (memberId: string) => {
    const set = new Set(draft.assignedFamilyIds);
    if (set.has(memberId)) set.delete(memberId);
    else set.add(memberId);
    update({ assignedFamilyIds: [...set] });
  };
  const assigned = draft.assignedFamilyIds.length;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New supply item' : supplyItemDisplayName(draft)}
      subtitle="Supply list"
      accessibilityLabel="Close supply item">
      <View style={styles.form}>
        <GTextField
          label="Item name"
          value={draft.name}
          onChangeText={(name) => update({ name })}
          placeholder="What do you need?"
          disabled={readOnly}
          error={showErrors && !draft.name.trim() ? 'Name the item.' : null}
        />
        <GChoiceChips
          label="Type"
          layout="stack"
          value={draft.itemType}
          onChange={(itemType) => update({ itemType: itemType as SupplyItemType })}
          disabled={readOnly}
          onBlocked={notifyReadOnly}
          options={SUPPLY_ITEM_TYPE_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
        />
        <GTextField
          label="Quantity"
          value={String(draft.quantity)}
          onChangeText={(value) => {
            const parsed = Number.parseInt(value, 10);
            update({ quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
          }}
          keyboardType="number-pad"
          disabled={readOnly}
        />
        <GTextField
          label="Where to buy"
          optional
          value={draft.whereToBuy}
          onChangeText={(whereToBuy) => update({ whereToBuy })}
          placeholder="Store, link, or notes"
          disabled={readOnly}
        />
        {members.length > 0 ? (
          <View>
            <Text style={gText.itemTitle}>Assigned members</Text>
            <Text style={gText.meta}>
              {assigned === 0 ? 'No members assigned' : assigned === 1 ? '1 member selected' : `${assigned} members selected`}
            </Text>
            {members.map((member) => (
              <GCheckRow
                key={member.memberId}
                label={member.name}
                checked={draft.assignedFamilyIds.includes(member.memberId)}
                onToggle={() => toggleMember(member.memberId)}
                disabled={readOnly}
                onBlocked={notifyReadOnly}
              />
            ))}
          </View>
        ) : null}
        {error ? <GInlineBanner tone="error" title="Couldn't save the item" description={`${error} Your changes are still here.`} /> : null}
        {!readOnly ? (
          <View style={styles.actions}>
            <GToyButton
              label={saving ? 'Saving…' : mode === 'create' ? 'Add supply item' : 'Save changes'}
              icon="checkmark"
              size="md"
              fullWidth
              loading={saving}
              onPress={() => {
                if (!draft.name.trim()) return setShowErrors(true);
                onSave(draft);
              }}
            />
            {mode === 'edit' && onDelete ? (
              <GOutlineButton label="Remove item" icon="trash-outline" onPress={onDelete} style={styles.center} />
            ) : null}
          </View>
        ) : null}
      </View>
    </ParentBottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/* Supply list tab                                                     */
/* ------------------------------------------------------------------ */

function SupplyListTab({
  project,
  committeeId,
  organizationId,
  supabase,
  members,
  readOnly,
  portalApiNamespace,
  currentMemberId,
}: {
  project: CommitteeProject;
  committeeId: string;
  organizationId: string;
  supabase: SupabaseClient;
  members: CommitteeMember[];
  readOnly: boolean;
  portalApiNamespace: CommitteePortalApiNamespace;
  currentMemberId?: string;
}) {
  const toast = useGardenToast();
  const { reportError } = useMobileErrorReporter(organizationId);
  const memberOptions = committeeMembersToProjectOptions(members);
  const [items, setItems] = useState<CoopSupplyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<CoopSupplyListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctx = buildSupplyListContext({
    organizationId,
    committeeId,
    projectId: project.id,
    portalApiNamespace,
    createdByMemberId: currentMemberId,
    usePortalRecord: portalApiNamespace !== 'school-admin',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await withCommitteeWorkspaceLoadTimeout(listCommitteeProjectSupplyList(supabase, project.id));
      setItems(result.items);
    } catch (err) {
      reportError(
        isCommitteeWorkspaceLoadTimeoutError(err) ? 'committees.projects.supply_load_timeout' : 'committees.projects.supply_load',
        err,
        { entityType: 'committee_project', entityId: project.id },
      );
      setLoadError(err instanceof Error ? err.message : 'Failed to load the supply list.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [project.id, reportError, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const close = () => {
    setSheetMode(null);
    setSelected(null);
  };

  const save = async (item: CoopSupplyListItem) => {
    setSaving(true);
    setError(null);
    const creating = sheetMode === 'create';
    try {
      if (creating) {
        const created = await insertCommitteeProjectSupplyItem(supabase, ctx, item);
        setItems((current) => [...current, created]);
      } else {
        const updated = await saveCommitteeProjectSupplyItem(supabase, ctx, item);
        setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      }
      const name = supplyItemDisplayName(item);
      closeThen(close, () => toast.success(creating ? 'Item added' : 'Item saved', { description: `${name} is on the supply list.` }));
    } catch (err) {
      reportError('committees.projects.supply_save', err, { entityType: 'committee_project_supply_item', entityId: item.id });
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: CoopSupplyListItem) => {
    const name = supplyItemDisplayName(item);
    const confirmed = await confirmDestructive({
      title: 'Remove item?',
      message: `${name} will be removed from the supply list.`,
      confirmLabel: 'Remove',
    });
    if (!confirmed) return;
    try {
      await deleteCommitteeProjectSupplyItem(supabase, ctx, item.id, name);
      setItems((current) => current.filter((row) => row.id !== item.id));
      closeThen(close, () => toast.success('Item removed', { description: `${name} is off the list.` }));
    } catch (err) {
      reportError('committees.projects.supply_delete', err, { entityType: 'committee_project_supply_item', entityId: item.id });
      setError(err instanceof Error ? err.message : 'Failed to remove item.');
    }
  };

  return (
    <>
      <GCard
        kicker="Supply list"
        title={items.length > 0 ? `${items.length} item${items.length === 1 ? '' : 's'}` : 'What you need'}
        index={0}>
        <View style={styles.body}>
          {!readOnly ? (
            <GToyButton
              label="Add item"
              icon="add"
              accessibilityLabel="Add supply item"
              onPress={() => {
                setError(null);
                setSelected(newCoopSupplyListItem());
                setSheetMode('create');
              }}
            />
          ) : null}
          {loading ? (
            <View style={styles.list}>
              {[0, 1, 2].map((i) => (
                <GSkeleton key={i} style={{ height: 60, borderRadius: 14 }} />
              ))}
            </View>
          ) : loadError ? (
            <GErrorCard kicker="Supply list" title="We couldn't load the supply list" message={`${loadError} Try again.`} onRetry={() => void load()} />
          ) : items.length === 0 ? (
            <View style={styles.list}>
              <Text style={gText.meta}>No supply items yet.</Text>
              <GHand>Start with the first thing you need.</GHand>
            </View>
          ) : (
            <View style={styles.notebook}>
              {items.map((item, i) => (
                <GPressable
                  key={item.id}
                  accessibilityLabel={`${supplyItemDisplayName(item)}, ${supplyItemTypeLabel(item.itemType)}, quantity ${formatSupplyQuantity(item)}. ${readOnly ? 'View' : 'Edit'}`}
                  pressedScale={0.99}
                  onPress={() => {
                    setError(null);
                    setSelected({ ...item });
                    setSheetMode('edit');
                  }}
                  style={[styles.row, i > 0 && styles.rule]}>
                  <View style={styles.flex}>
                    <Text style={gText.itemTitle}>{supplyItemDisplayName(item)}</Text>
                    <View style={styles.metaRow}>
                      <GChip label={supplyItemTypeLabel(item.itemType)} tone="info" />
                      <Text style={gText.meta}>Qty {formatSupplyQuantity(item)}</Text>
                      {item.assignedFamilyIds.length > 0 ? (
                        <Text style={gText.meta}>· {item.assignedFamilyIds.length} assigned</Text>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
                </GPressable>
              ))}
            </View>
          )}
        </View>
      </GCard>
      <SupplyItemSheet
        visible={sheetMode !== null && selected !== null}
        mode={sheetMode ?? 'edit'}
        item={selected}
        members={memberOptions}
        readOnly={readOnly}
        saving={saving}
        error={error}
        onClose={close}
        onSave={(item) => void save(item)}
        onDelete={sheetMode === 'edit' && selected ? () => void remove(selected) : undefined}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Details tab (autosave)                                              */
/* ------------------------------------------------------------------ */

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function DetailsTab({
  project,
  organizationId,
  supabase,
  readOnly,
  portalApiNamespace,
  currentMemberId,
  onProjectChange,
  onDeleted,
}: {
  project: CommitteeProject;
  organizationId: string;
  supabase: SupabaseClient;
  readOnly: boolean;
  portalApiNamespace: CommitteePortalApiNamespace;
  currentMemberId?: string;
  onProjectChange: (project: CommitteeProject) => void;
  onDeleted: () => void;
}) {
  const toast = useGardenToast();
  const { reportError } = useMobileErrorReporter(organizationId);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [active, setActive] = useState(project.status === 'active');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setActive(project.status === 'active');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the project changes
  }, [project.id]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const persist = useCallback(
    async (patch: { name?: string; description?: string; status?: 'draft' | 'active' }) => {
      if (readOnly) return;
      const gen = ++generation.current;
      setSaveState('saving');
      try {
        const updated = await updateCommitteeProject(supabase, project.id, patch);
        if (gen !== generation.current) return;
        onProjectChange({ ...project, ...updated, supplyItemCount: project.supplyItemCount });
        setSaveState('saved');
      } catch (err) {
        reportError('committees.projects.update', err, { entityType: 'committee_project', entityId: project.id });
        if (gen === generation.current) setSaveState('error');
      }
    },
    [onProjectChange, project, readOnly, reportError, supabase],
  );

  const schedule = (patch: { name?: string; description?: string; status?: 'draft' | 'active' }) => {
    if (timer.current) clearTimeout(timer.current);
    setSaveState('saving');
    timer.current = setTimeout(() => void persist(patch), 450);
  };

  const remove = async () => {
    const confirmed = await confirmDestructive({
      title: 'Delete project?',
      message: `Remove "${committeeProjectDisplayName(project)}" and its supply list? This cannot be undone.`,
    });
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteCommitteeProject(supabase, project.id, {
        organizationId,
        workspaceRecord: { organizationId, portalApiNamespace, createdByMemberId: currentMemberId ?? null },
      });
      toast.success('Project deleted', { description: `${committeeProjectDisplayName(project)} and its supply list are gone.` });
      onDeleted();
    } catch (err) {
      reportError('committees.projects.delete', err, { entityType: 'committee_project', entityId: project.id });
      toast.error("Couldn't delete the project", { description: 'Check your connection, then try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const status = active ? 'active' : 'draft';
  const chip =
    saveState === 'saving'
      ? { label: 'Saving…', tone: 'neutral' as const }
      : saveState === 'saved'
        ? { label: 'Saved', tone: 'success' as const }
        : saveState === 'error'
          ? { label: "Couldn't save", tone: 'alert' as const }
          : null;

  return (
    <GCard
      kicker="Project details"
      title={readOnly ? 'About this project' : 'Edit project'}
      index={0}
      action={chip ? <GChip label={chip.label} tone={chip.tone} icon={saveState === 'saved' ? 'checkmark' : undefined} /> : null}>
      <View style={styles.body}>
        {!readOnly ? <Text style={gText.meta}>Changes save automatically.</Text> : null}
        <GTextField
          label="Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            schedule({ name: value, description, status });
          }}
          disabled={readOnly}
        />
        <GTextField
          label="Description"
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            schedule({ name, description: value, status });
          }}
          multiline
          disabled={readOnly}
        />
        <GSwitchRow
          label="Active"
          meta={active ? 'Shows as Active' : 'Saved as a draft'}
          value={active}
          disabled={readOnly}
          onValueChange={(value) => {
            setActive(value);
            schedule({ name, description, status: value ? 'active' : 'draft' });
          }}
        />
        {saveState === 'error' ? (
          <GInlineBanner tone="error" title="Your last change didn't save" description="Edit a field again to retry." />
        ) : null}
        {!readOnly ? (
          <GOutlineButton
            label={deleting ? 'Deleting…' : 'Delete project'}
            icon="trash-outline"
            onPress={() => {
              if (!deleting) void remove();
            }}
            style={styles.center}
          />
        ) : null}
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Screen + loader                                                     */
/* ------------------------------------------------------------------ */

function ProjectDetailScreen({
  organizationId,
  committeeId,
  projectId,
  supabase,
  members,
  readOnly,
  portalApiNamespace,
  currentMemberId,
}: {
  organizationId: string;
  committeeId: string;
  projectId: string;
  supabase: SupabaseClient;
  members: CommitteeMember[];
  readOnly: boolean;
  portalApiNamespace: CommitteePortalApiNamespace;
  currentMemberId?: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [project, setProject] = useState<CommitteeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>('supply_list');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProject(await withCommitteeWorkspaceLoadTimeout(getCommitteeProject(supabase, projectId)));
    } catch (err) {
      reportError(
        isCommitteeWorkspaceLoadTimeoutError(err) ? 'committees.projects.detail_load_timeout' : 'committees.projects.detail_load',
        err,
        { entityType: 'committee_project', entityId: projectId },
      );
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, reportError, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const header = (
    <GBackHeader
      backLabel="Projects"
      backAccessibilityLabel="Back to projects"
      onBack={() => router.back()}
      kicker="Committee project"
      title={project ? committeeProjectDisplayName(project) : 'Project'}
      aside={project ? <GChip label={project.status === 'active' ? 'Active' : 'Draft'} tone={project.status === 'active' ? 'success' : 'warning'} /> : null}>
      {project ? (
        <GSegmented
          accessibilityLabel="Project sections"
          items={[
            { id: 'supply_list' as const, label: 'Supply list', icon: 'list-outline' as const },
            { id: 'details' as const, label: 'Details', icon: 'create-outline' as const },
          ]}
          activeId={tab}
          onChange={setTab}
        />
      ) : null}
    </GBackHeader>
  );

  if (loading) return <ProjectDetailSkeleton />;

  if (!project) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          {header}
          <GErrorCard kicker="Project" title="Project not found." message="It may have been deleted, or the connection dropped." onRetry={() => void load()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ParentKeyboardAwareScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {header}
        {tab === 'supply_list' ? (
          <SupplyListTab
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
          <DetailsTab
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
      </ParentKeyboardAwareScrollView>
    </View>
  );
}

function ProjectDetailSkeleton() {
  return (
    <View style={[styles.root, styles.content]} accessibilityLabel="Loading project" accessibilityState={{ busy: true }}>
      <StatusBar style="dark" />
      <GSkeleton style={{ width: 90, height: 14 }} />
      <GSkeleton style={{ width: '65%', height: 28 }} />
      <GSkeleton style={{ height: 44, borderRadius: 999 }} />
      <GSkeleton style={{ height: 220, borderRadius: 24 }} />
    </View>
  );
}

/**
 * Garden project screen for parent + teacher routes. Same member load (with
 * timeout), read-only rule and operation names as `CommitteeProjectDetailLoader`.
 */
export function GardenCommitteeProjectDetailLoader({
  organizationId,
  committeeId,
  projectId,
  portalApiNamespace,
  currentMemberId,
}: {
  organizationId: string;
  committeeId: string;
  projectId: string;
  portalApiNamespace: CommitteePortalApiNamespace;
  currentMemberId?: string;
}) {
  const { isPreview } = usePortalPreview();
  const { reportError } = useMobileErrorReporter(organizationId);
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [resolvedMemberId, setResolvedMemberId] = useState<string | undefined>(currentMemberId);

  useEffect(() => {
    if (currentMemberId) {
      setResolvedMemberId(currentMemberId);
      return;
    }
    if (portalApiNamespace === 'school-admin') return;
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      setResolvedMemberId(members.find((entry) => entry.userId === user.id && entry.status === 'active')?.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentMemberId, members, portalApiNamespace, supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMembers(true);
      try {
        const mapped = await withCommitteeWorkspaceLoadTimeout(
          (async () => {
            const { data, error } = await supabase
              .from('committee_members')
              .select('*')
              .eq('committee_id', committeeId)
              .order('display_name');
            if (error) throw error;
            return (data ?? []).map((row) => mapMemberRow(row));
          })(),
        );
        if (!cancelled) setMembers(mapped);
      } catch (err) {
        reportError(
          isCommitteeWorkspaceLoadTimeoutError(err) ? 'committees.projects.members_load_timeout' : 'committees.projects.members_load',
          err,
          { entityType: 'committee', entityId: committeeId },
        );
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committeeId, reportError, supabase]);

  const readOnly = portalApiNamespace === 'school-admin' ? isPreview : isPreview || !resolvedMemberId;

  if (loadingMembers) return <ProjectDetailSkeleton />;

  return (
    <ProjectDetailScreen
      organizationId={organizationId}
      committeeId={committeeId}
      projectId={projectId}
      supabase={supabase}
      members={members}
      readOnly={readOnly}
      portalApiNamespace={portalApiNamespace}
      currentMemberId={resolvedMemberId}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 56, gap: 16 },
  form: { gap: 16 },
  body: { gap: 14 },
  list: { gap: 10 },
  flex: { flex: 1, gap: 4 },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  rule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  actions: { gap: 10, marginTop: 4 },
  center: { alignSelf: 'center' },
});
