import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { AdminFormSheet, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import type { CommitteeTemplate } from '@/lib/parent/parent-committees-types';

type TemplateOption = { id: string | null; name: string; description: string; defaultTermLabel: string };

export type CreateCommitteeInput = { templateId: string | null; name: string; description: string; termLabel?: string };

function buildTemplateOptions(templates: CommitteeTemplate[]): TemplateOption[] {
  return [
    ...templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      defaultTermLabel: template.config.defaultTermLabel ?? '',
    })),
    { id: null, name: 'Custom committee', description: 'Start from a blank workspace with default sections.', defaultTermLabel: '' },
  ];
}

/**
 * Garden "Create committee" sheet in two steps: pick a template (horizontal
 * cards), then name + term. Same template defaults as the Story sheet;
 * creation runs in the parent and failures come back as `notice`.
 */
export function AdminCreateCommitteeSheet({
  visible,
  templates,
  saving,
  notice,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  templates: CommitteeTemplate[];
  saving: boolean;
  notice: AdminSheetNotice | null;
  onClose: () => void;
  onSubmit: (input: CreateCommitteeInput) => void;
}) {
  const accent = useGardenAccent();
  const options = useMemo(() => buildTemplateOptions(templates), [templates]);
  const first = options[0];
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const [name, setName] = useState(first && first.name !== 'Custom committee' ? first.name : '');
  const [termLabel, setTermLabel] = useState(first?.defaultTermLabel ?? '');
  const [wasVisible, setWasVisible] = useState(visible);

  // Fresh choice each time the sheet opens (previous-value pattern).
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) {
      setSelectedId(first?.id ?? null);
      setName(first && first.name !== 'Custom committee' ? first.name : '');
      setTermLabel(first?.defaultTermLabel ?? '');
    }
  }

  const selected = options.find((option) => option.id === selectedId) ?? first;
  const isDirty = Boolean(name.trim() || termLabel.trim());

  const choose = (option: TemplateOption) => {
    setSelectedId(option.id);
    setName(option.name === 'Custom committee' ? '' : option.name);
    setTermLabel(option.defaultTermLabel);
  };

  return (
    <AdminFormSheet
      visible={visible}
      onClose={onClose}
      title="Create committee"
      subtitle="Choose a template and name your new volunteer workspace."
      closeAccessibilityLabel="Close create committee sheet"
      isDirty={isDirty}
      saving={saving}
      canSave={Boolean(name.trim())}
      saveLabel="Create committee"
      savingLabel="Creating…"
      saveIcon="add"
      statusLine={saving ? 'Creating the workspace…' : name.trim() ? `Ready: ${name.trim()}` : 'Give the committee a name'}
      notice={notice}
      onSave={() =>
        onSubmit({
          templateId: selected?.id ?? null,
          name: name.trim(),
          description: selected?.description ?? '',
          termLabel: termLabel.trim() || undefined,
        })
      }>
      <Text style={styles.step}>1 · Pick a template</Text>
      {/* keyboard: nested horizontal ScrollView ok */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templates}>
        {options.map((option) => {
          const active = option.id === selectedId;
          return (
            <GPressable
              key={option.id ?? 'custom'}
              accessibilityRole="radio"
              accessibilityLabel={`${option.name}. ${option.description}`}
              accessibilityState={{ selected: active }}
              haptic="select"
              onPress={() => choose(option)}
              style={[styles.template, active ? { borderColor: accent.clay, backgroundColor: accent.wash } : null]}>
              <Text style={[styles.templateName, active && { color: accent.clayDeep }]}>{option.name}</Text>
              <Text style={styles.templateDescription} numberOfLines={3}>
                {option.description}
              </Text>
            </GPressable>
          );
        })}
      </ScrollView>
      <Text style={styles.step}>2 · Name it</Text>
      <View style={styles.fields}>
        <GTextField label="Committee name" value={name} onChangeText={setName} placeholder="Committee name" autoCapitalize="words" />
        <GTextField label="Term label" optional value={termLabel} onChangeText={setTermLabel} placeholder="e.g. 2025–26 school year" />
      </View>
    </AdminFormSheet>
  );
}

const styles = StyleSheet.create({
  step: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.soft },
  templates: { gap: 10, paddingRight: 8 },
  template: {
    width: 200,
    minHeight: 112,
    padding: 14,
    gap: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  templateName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  templateDescription: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  fields: { gap: 14 },
});
