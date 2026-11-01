import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeProjectMemberOption } from '@/lib/committees/committee-project-members';
import {
  SUPPLY_ITEM_TYPE_OPTIONS,
  supplyItemDisplayName,
  type CoopSupplyListItem,
  type SupplyItemType,
} from '@/lib/committees/committee-supply-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type CommitteeProjectSupplyItemSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  item: CoopSupplyListItem | null;
  memberOptions: CommitteeProjectMemberOption[];
  readOnly?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (item: CoopSupplyListItem) => void | Promise<void>;
  onDelete?: () => void;
};

export function CommitteeProjectSupplyItemSheet({
  visible,
  mode,
  item,
  memberOptions,
  readOnly = false,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: CommitteeProjectSupplyItemSheetProps) {
  const theme = useParentTheme();
  const [draft, setDraft] = useState<CoopSupplyListItem | null>(item);

  useEffect(() => {
    setDraft(item ? { ...item } : null);
  }, [item, visible]);

  if (!draft) return null;

  const update = (patch: Partial<CoopSupplyListItem>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const toggleMember = (memberId: string) => {
    const set = new Set(draft.assignedFamilyIds);
    if (set.has(memberId)) set.delete(memberId);
    else set.add(memberId);
    update({ assignedFamilyIds: [...set] });
  };

  const handleSave = async () => {
    if (!draft.name.trim()) return;
    await onSave(draft);
    onClose();
  };

  const footerLabel = mode === 'create' ? 'Add supply item' : 'Save changes';

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New supply item' : supplyItemDisplayName(draft)}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Item name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => update({ name })}
          editable={!readOnly}
          style={[
            styles.input,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: theme.muted }]}>Type</Text>
      <View style={styles.chipRow}>
        {SUPPLY_ITEM_TYPE_OPTIONS.map((option) => {
          const selected = draft.itemType === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => !readOnly && update({ itemType: option.value as SupplyItemType })}
              style={[
                styles.typeChip,
                {
                  borderColor: selected ? theme.primary : theme.line,
                  backgroundColor: selected ? theme.primarySoft : theme.white,
                },
              ]}>
              <Text style={{ color: theme.ink, fontSize: 13 }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Quantity</Text>
        <TextInput
          value={String(draft.quantity)}
          onChangeText={(value) => {
            const parsed = Number.parseInt(value, 10);
            update({ quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
          }}
          keyboardType="number-pad"
          editable={!readOnly}
          style={[
            styles.input,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.muted }]}>Where to buy</Text>
        <TextInput
          value={draft.whereToBuy}
          onChangeText={(whereToBuy) => update({ whereToBuy })}
          editable={!readOnly}
          style={[
            styles.input,
            { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
          ]}
        />
      </View>
      {memberOptions.length > 0 ? (
        <>
          <Text style={[styles.label, { color: theme.muted }]}>Assigned members</Text>
          <View style={styles.memberList}>
            {memberOptions.map((member) => {
              const selected = draft.assignedFamilyIds.includes(member.memberId);
              return (
                <Pressable
                  key={member.memberId}
                  onPress={() => !readOnly && toggleMember(member.memberId)}
                  style={[
                    styles.memberRow,
                    { borderColor: selected ? theme.primary : theme.line },
                  ]}>
                  <Text style={{ color: theme.ink }}>{member.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
      {!readOnly ? (
        <View style={styles.footer}>
          {mode === 'edit' && onDelete ? (
            <StoryButton label="Remove item" variant="outline" onPress={onDelete} />
          ) : null}
          <StoryButton
            label={saving ? 'Saving…' : footerLabel}
            onPress={() => void handleSave()}
            disabled={saving || !draft.name.trim()}
          />
        </View>
      ) : null}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  memberList: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  memberRow: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
  },
  footer: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
