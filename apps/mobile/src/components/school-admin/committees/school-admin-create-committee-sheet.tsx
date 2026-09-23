import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { createCommitteeFromTemplate } from '@/lib/school-admin/committees/mutations';
import type { Committee, CommitteeTemplate } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

type TemplateOption = {
  id: string | null;
  name: string;
  description: string;
  defaultTermLabel: string;
};

type SchoolAdminCreateCommitteeSheetProps = {
  visible: boolean;
  organizationId: string;
  templates: CommitteeTemplate[];
  onClose: () => void;
  onCreated: (committee: Committee) => void;
};

function buildTemplateOptions(templates: CommitteeTemplate[]): TemplateOption[] {
  const options: TemplateOption[] = templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    defaultTermLabel: template.config.defaultTermLabel ?? '',
  }));

  options.push({
    id: null,
    name: 'Custom committee',
    description: 'Start from a blank workspace with default sections.',
    defaultTermLabel: '',
  });

  return options;
}

export function SchoolAdminCreateCommitteeSheet({
  visible,
  organizationId,
  templates,
  onClose,
  onCreated,
}: SchoolAdminCreateCommitteeSheetProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const reportError = createSchoolAdminErrorReporter(organizationId);

  const options = useMemo(() => buildTemplateOptions(templates), [templates]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(options[0]?.id ?? null);
  const [name, setName] = useState('');
  const [termLabel, setTermLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? options[0];

  useEffect(() => {
    if (!visible) return;
    const first = options[0];
    setSelectedOptionId(first?.id ?? null);
    setName('');
    setTermLabel(first?.defaultTermLabel ?? '');
    setError(null);
  }, [options, visible]);

  useEffect(() => {
    if (!selectedOption) return;
    if (!name.trim()) {
      setName(selectedOption.name === 'Custom committee' ? '' : selectedOption.name);
    }
    if (!termLabel.trim() && selectedOption.defaultTermLabel) {
      setTermLabel(selectedOption.defaultTermLabel);
    }
  }, [name, selectedOption, termLabel]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createCommitteeFromTemplate(supabase, organizationId, {
        templateId: selectedOption?.id ?? null,
        name: name.trim(),
        description: selectedOption?.description ?? '',
        termLabel: termLabel.trim() || undefined,
        status: 'active',
      });
      onCreated(created);
      onClose();
    } catch (createError) {
      reportError('committees.create', createError);
      setError(createError instanceof Error ? createError.message : 'Failed to create committee.');
    } finally {
      setSaving(false);
    }
  }, [
    name,
    onClose,
    onCreated,
    organizationId,
    reportError,
    selectedOption,
    supabase,
    termLabel,
  ]);

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close create committee sheet">
      <View style={styles.sheetContent}>
        <Text style={[styles.title, { color: theme.ink }]}>Create committee</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Choose a template and name your new volunteer workspace.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateRow}>
          {options.map((option) => {
            const active = option.id === selectedOptionId;
            return (
              <Pressable
                key={option.id ?? 'custom'}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedOptionId(option.id);
                  setName(option.name === 'Custom committee' ? '' : option.name);
                  setTermLabel(option.defaultTermLabel);
                }}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
                <StoryCard
                  compact
                  style={{
                    ...styles.templateCard,
                    ...(active
                      ? { borderColor: theme.primary, backgroundColor: '#EAF4EB' }
                      : null),
                  }}>
                  <Text style={[styles.templateName, { color: theme.ink }]}>{option.name}</Text>
                  <Text style={[styles.templateDescription, { color: theme.muted }]} numberOfLines={3}>
                    {option.description}
                  </Text>
                </StoryCard>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>Committee name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Committee name"
            style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
            placeholderTextColor={theme.muted}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>Term label</Text>
          <TextInput
            value={termLabel}
            onChangeText={setTermLabel}
            placeholder="e.g. 2025–26 school year"
            style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
            placeholderTextColor={theme.muted}
          />
        </View>

        {error ? <Text style={[styles.errorCopy, { color: theme.alert }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <StoryButton label="Cancel" variant="soft" onPress={onClose} disabled={saving} style={styles.action} />
          <StoryButton
            label={saving ? 'Creating…' : 'Create committee'}
            onPress={() => void handleCreate()}
            disabled={saving || !name.trim()}
            style={styles.action}
            trailingIcon={saving ? <ActivityIndicator color={theme.white} size="small" /> : undefined}
          />
        </View>
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  templateRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  templateCard: {
    width: 220,
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  templateName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  templateDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldBlock: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
});
