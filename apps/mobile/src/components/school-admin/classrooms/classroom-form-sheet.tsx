import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomStatus, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
import { createClassroomApi, updateClassroomApi } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { requestCloseIfClean } from '@/lib/unsaved-changes';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ClassroomFormSheetProps = {
  visible: boolean;
  slug: string;
  programs: ProgramOption[];
  classroom?: ClassroomSummary | null;
  onClose: () => void;
  onSaved: () => void;
};

const STATUS_OPTIONS: ClassroomStatus[] = ['open', 'full', 'inactive'];

export function ClassroomFormSheet({
  visible,
  slug,
  programs,
  classroom = null,
  onClose,
  onSaved,
}: ClassroomFormSheetProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();
  const isEdit = classroom != null;

  const [name, setName] = useState('');
  const [programId, setProgramId] = useState('');
  const [status, setStatus] = useState<ClassroomStatus>('open');
  const [baselineName, setBaselineName] = useState('');
  const [baselineProgramId, setBaselineProgramId] = useState('');
  const [baselineStatus, setBaselineStatus] = useState<ClassroomStatus>('open');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    const nextName = classroom?.name ?? '';
    const nextProgramId = classroom?.programId ?? '';
    const nextStatus = classroom?.status ?? 'open';
    setName(nextName);
    setProgramId(nextProgramId);
    setStatus(nextStatus);
    setBaselineName(nextName);
    setBaselineProgramId(nextProgramId);
    setBaselineStatus(nextStatus);
    setError(null);
  }, [visible, classroom]);

  const isDirty = useMemo(
    () =>
      name !== baselineName ||
      programId !== baselineProgramId ||
      status !== baselineStatus,
    [name, baselineName, programId, baselineProgramId, status, baselineStatus],
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const canSave = isDirty && Boolean(name.trim());

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && classroom) {
        await updateClassroomApi(slug, classroom.id, {
          name: name.trim(),
          programId: programId || null,
          status,
        });
      } else {
        await createClassroomApi(slug, {
          name: name.trim(),
          programId: programId || null,
          status,
        });
      }
      onSaved();
      onClose();
    } catch (saveError) {
      reportError('school_admin_classroom_save', saveError, {
        entityType: 'classroom',
        entityId: classroom?.id,
        metadata: { mode: isEdit ? 'edit' : 'create' },
      });
      setError(saveError instanceof Error ? saveError.message : 'Failed to save classroom.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={theme.white}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="88%"
      sheetStyle={styles.sheet}
      scrollContentStyle={styles.scrollContent}
      header={
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.ink }]}>
            {isEdit ? 'Edit classroom' : 'Add classroom'}
          </Text>
          <Pressable accessibilityRole="button" onPress={requestClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.muted} />
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" disabled={saving} onPress={requestClose}>
            <Text style={[styles.cancelLabel, { color: theme.muted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving || !canSave}
            onPress={() => void handleSave()}
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.primary,
                opacity: canSave && !saving ? 1 : DISABLED_BUTTON_OPACITY,
              },
            ]}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveLabel}>Save</Text>
            )}
          </Pressable>
        </View>
      }>
      <Field label="Name" value={name} onChangeText={setName} />
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>Program (optional)</Text>
      <View style={styles.pillRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setProgramId('')}
          style={[
            styles.pill,
            {
              backgroundColor: !programId ? '#E9F2EA' : Story.paper,
              borderColor: !programId ? '#BCD4C1' : Story.line,
            },
          ]}>
          <Text style={{ color: !programId ? theme.primary : theme.muted }}>All programs</Text>
        </Pressable>
        {programs.map((program) => {
          const active = programId === program.id;
          return (
            <Pressable
              key={program.id}
              accessibilityRole="button"
              onPress={() => setProgramId(program.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? '#E9F2EA' : Story.paper,
                  borderColor: active ? '#BCD4C1' : Story.line,
                },
              ]}>
              <Text style={{ color: active ? theme.primary : theme.muted }}>{program.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.fieldLabel, { color: theme.muted }]}>Status</Text>
      <View style={styles.pillRow}>
        {STATUS_OPTIONS.map((option) => {
          const active = status === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => setStatus(option)}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? '#E9F2EA' : Story.paper,
                  borderColor: active ? '#BCD4C1' : Story.line,
                },
              ]}>
              <Text style={{ color: active ? theme.primary : theme.muted }}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </BottomSheetShell>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const theme = useParentTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          { color: theme.ink, borderColor: Story.line, backgroundColor: Story.paper },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  field: {
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  pill: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  error: {
    color: '#B5594A',
    fontFamily: StoryFonts.body,
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.two,
  },
  saveButton: {
    borderRadius: Radius.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: 'center',
  },
  saveLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
  },
});
