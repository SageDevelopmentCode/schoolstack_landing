import { useEffect, useState, type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: { muted: string };
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

function SelectionControl({
  selected,
  variant,
  theme,
}: {
  selected: boolean;
  variant: 'radio' | 'checkbox';
  theme: { primary: string; line: string; white: string };
}) {
  if (variant === 'radio') {
    return (
      <View
        style={[
          styles.radioOuter,
          { borderColor: selected ? theme.primary : theme.line },
        ]}>
        {selected ? (
          <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.checkbox,
        {
          borderColor: selected ? theme.primary : theme.line,
          backgroundColor: selected ? theme.primary : theme.white,
        },
      ]}>
      {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
    </View>
  );
}

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
  };

  const assignedCount = draft.assignedFamilyIds.length;
  const membersHelper =
    assignedCount === 0
      ? 'No members assigned'
      : assignedCount === 1
        ? '1 member selected'
        : `${assignedCount} members selected`;

  const footerLabel = mode === 'create' ? 'Add supply item' : 'Save changes';

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New supply item' : supplyItemDisplayName(draft)}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}>
        <Field label="Item name" theme={theme}>
          <TextInput
            value={draft.name}
            onChangeText={(name) => update({ name })}
            editable={!readOnly}
            placeholder="What do you need?"
            placeholderTextColor={theme.muted}
            style={[
              styles.input,
              { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
            ]}
          />
        </Field>

        <Field label="Type" theme={theme}>
          <View style={styles.selectionList}>
            {SUPPLY_ITEM_TYPE_OPTIONS.map((option) => {
              const selected = draft.itemType === option.value;
              return (
                <Pressable
                  key={option.value}
                  disabled={readOnly}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => update({ itemType: option.value as SupplyItemType })}
                  style={({ pressed }) => [
                    styles.selectionRow,
                    {
                      borderColor: selected ? theme.primary : theme.line,
                      backgroundColor: selected ? theme.primarySoft : theme.white,
                    },
                    pressed && !readOnly && { opacity: 0.9 },
                  ]}>
                  <Text
                    style={[styles.selectionLabel, { color: theme.ink }]}
                    numberOfLines={2}>
                    {option.label}
                  </Text>
                  <SelectionControl selected={selected} variant="radio" theme={theme} />
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Quantity" theme={theme}>
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
        </Field>

        <Field label="Where to buy" theme={theme}>
          <TextInput
            value={draft.whereToBuy}
            onChangeText={(whereToBuy) => update({ whereToBuy })}
            editable={!readOnly}
            placeholder="Store, link, or notes"
            placeholderTextColor={theme.muted}
            style={[
              styles.input,
              { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
            ]}
          />
        </Field>

        {memberOptions.length > 0 ? (
          <Field label="Assigned members" theme={theme}>
            <Text style={[styles.helper, { color: theme.muted }]}>{membersHelper}</Text>
            <View style={styles.selectionList}>
              {memberOptions.map((member) => {
                const selected = draft.assignedFamilyIds.includes(member.memberId);
                return (
                  <Pressable
                    key={member.memberId}
                    disabled={readOnly}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleMember(member.memberId)}
                    style={({ pressed }) => [
                      styles.selectionRow,
                      {
                        borderColor: selected ? theme.primary : theme.line,
                        backgroundColor: selected ? theme.primarySoft : theme.white,
                      },
                      pressed && !readOnly && { opacity: 0.9 },
                    ]}>
                    <Text style={[styles.selectionLabel, { color: theme.ink }]}>
                      {member.name}
                    </Text>
                    <SelectionControl selected={selected} variant="checkbox" theme={theme} />
                  </Pressable>
                );
              })}
            </View>
          </Field>
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
      </ScrollView>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  helper: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  selectionList: {
    gap: Spacing.two,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  selectionLabel: {
    flex: 1,
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
