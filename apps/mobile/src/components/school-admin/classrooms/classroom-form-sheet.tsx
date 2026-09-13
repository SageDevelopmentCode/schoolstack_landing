import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomStatus, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
import { createClassroomApi, updateClassroomApi } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

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
  const insets = useSafeAreaInsets();
  const isEdit = classroom != null;

  const [name, setName] = useState('');
  const [programId, setProgramId] = useState('');
  const [status, setStatus] = useState<ClassroomStatus>('open');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(classroom?.name ?? '');
    setProgramId(classroom?.programId ?? '');
    setStatus(classroom?.status ?? 'open');
    setError(null);
  }, [visible, classroom]);

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
      setError(saveError instanceof Error ? saveError.message : 'Failed to save classroom.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.duration(260)}
          exiting={SlideOutDown.duration(220)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.white,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.ink }]}>
                {isEdit ? 'Edit classroom' : 'Add classroom'}
              </Text>
              <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
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
            </ScrollView>

            <View style={styles.footer}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={onClose}>
                <Text style={[styles.cancelLabel, { color: theme.muted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving || !name.trim()}
                onPress={() => void handleSave()}
                style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveLabel}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(40, 57, 67, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
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
