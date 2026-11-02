import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommitteeProjectSupplyItemSheet } from '@/components/committees/projects/committee-project-supply-item-sheet';
import { CommitteeProjectSupplyListSkeleton } from '@/components/committees/projects/committee-project-supply-list-skeleton';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { committeeMembersToProjectOptions } from '@/lib/committees/committee-project-members';
import {
  buildSupplyListContext,
  deleteCommitteeProjectSupplyItem,
  insertCommitteeProjectSupplyItem,
  listCommitteeProjectSupplyList,
  saveCommitteeProjectSupplyItem,
} from '@/lib/committees/committee-project-supply-storage';
import type { CommitteeProject } from '@/lib/committees/committee-project-mappers';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import {
  newCoopSupplyListItem,
  supplyItemDisplayName,
  supplyItemTypeLabel,
  formatSupplyQuantity,
  type CoopSupplyListItem,
} from '@/lib/committees/committee-supply-types';
import type { CommitteeMember } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type CommitteeProjectSupplyListSectionProps = {
  project: CommitteeProject;
  committeeId: string;
  organizationId: string;
  supabase: SupabaseClient;
  members: CommitteeMember[];
  readOnly?: boolean;
  portalApiNamespace?: CommitteePortalApiNamespace;
  currentMemberId?: string;
};

export function CommitteeProjectSupplyListSection({
  project,
  committeeId,
  organizationId,
  supabase,
  members,
  readOnly = false,
  portalApiNamespace = 'parent-portal',
  currentMemberId,
}: CommitteeProjectSupplyListSectionProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const memberOptions = committeeMembersToProjectOptions(members);

  const [items, setItems] = useState<CoopSupplyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<CoopSupplyListItem | null>(null);
  const [saving, setSaving] = useState(false);

  const supplyCtx = buildSupplyListContext({
    organizationId,
    committeeId,
    projectId: project.id,
    portalApiNamespace,
    createdByMemberId: currentMemberId,
    usePortalRecord: portalApiNamespace !== 'school-admin',
  });

  const loadSupply = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCommitteeProjectSupplyList(supabase, project.id);
      setItems(result.items);
    } catch (err) {
      reportError('committees.projects.supply_load', err, {
        entityType: 'committee_project',
        entityId: project.id,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [project.id, reportError, supabase]);

  useEffect(() => {
    void loadSupply();
  }, [loadSupply]);

  const openCreate = () => {
    setSelectedItem(newCoopSupplyListItem());
    setSheetMode('create');
  };

  const openEdit = (item: CoopSupplyListItem) => {
    setSelectedItem({ ...item });
    setSheetMode('edit');
  };

  const closeSheet = () => {
    setSheetMode(null);
    setSelectedItem(null);
  };

  const handleSave = async (item: CoopSupplyListItem) => {
    setSaving(true);
    try {
      if (sheetMode === 'create') {
        const created = await insertCommitteeProjectSupplyItem(supabase, supplyCtx, item);
        setItems((current) => [...current, created]);
      } else {
        const updated = await saveCommitteeProjectSupplyItem(supabase, supplyCtx, item);
        setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      }
      closeSheet();
    } catch (err) {
      reportError('committees.projects.supply_save', err, {
        entityType: 'committee_project_supply_item',
        entityId: item.id,
      });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CoopSupplyListItem) => {
    try {
      await deleteCommitteeProjectSupplyItem(
        supabase,
        supplyCtx,
        item.id,
        supplyItemDisplayName(item),
      );
      setItems((current) => current.filter((row) => row.id !== item.id));
      closeSheet();
    } catch (err) {
      reportError('committees.projects.supply_delete', err, {
        entityType: 'committee_project_supply_item',
        entityId: item.id,
      });
    }
  };

  return (
    <>
      <StoryCard compact style={styles.card}>
        <View style={styles.headerRow}>
          <StorySectionKicker style={styles.kicker}>Supply list</StorySectionKicker>
          {!readOnly ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add supply item"
              onPress={openCreate}
              hitSlop={8}
              style={({ pressed }) => [
                styles.addAction,
                pressed && { opacity: 0.7 },
              ]}>
              <Text style={[styles.addActionLabel, { color: theme.primary }]}>Add item</Text>
            </Pressable>
          ) : null}
        </View>
        {loading ? (
          <CommitteeProjectSupplyListSkeleton showAddButton={false} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>No supply items yet.</Text>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => openEdit(item)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderColor: theme.line,
                    backgroundColor: theme.white,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>
                  {supplyItemDisplayName(item)}
                </Text>
                <View style={styles.rowMeta}>
                  <StoryChip tone="info" label={supplyItemTypeLabel(item.itemType)} />
                  <Text style={[styles.rowMetaText, { color: theme.muted }]}>
                    Qty {formatSupplyQuantity(item)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </StoryCard>

      <CommitteeProjectSupplyItemSheet
        visible={sheetMode !== null && selectedItem !== null}
        mode={sheetMode ?? 'edit'}
        item={selectedItem}
        memberOptions={memberOptions}
        readOnly={readOnly}
        saving={saving}
        onClose={closeSheet}
        onSave={handleSave}
        onDelete={sheetMode === 'edit' && selectedItem ? () => void handleDelete(selectedItem) : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 44,
  },
  kicker: {
    marginBottom: 0,
    flex: 1,
  },
  addAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  addActionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  rowMetaText: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
});
