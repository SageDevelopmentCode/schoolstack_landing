import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import {
  StudentHealthFormSheet,
  type HealthFormValues,
} from '@/components/school-admin/students/student-health-form-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  createStudentHealthItemAdmin,
  deleteStudentHealthItemAdmin,
  fetchStudentHealthProfileAdmin,
  updateStudentHealthItemAdmin,
} from '@/lib/school-admin-api';
import type { HealthItemType, StudentHealthProfile } from '@/lib/student-health/types';
import { SEVERITY_LABELS, emptyStudentHealthProfile } from '@/lib/student-health/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type StudentHealthTabProps = {
  slug: string;
  studentId: string;
  studentFirstName: string;
  onProfileChange?: (profile: StudentHealthProfile) => void;
};

type FormState =
  | { mode: 'closed' }
  | { mode: 'create'; itemType: HealthItemType }
  | { mode: 'edit'; itemType: HealthItemType; itemId: string; values: HealthFormValues };

function valuesToPayload(values: HealthFormValues): Record<string, unknown> {
  if (values.type === 'allergy') {
    return {
      allergen: values.allergen,
      severity: values.severity,
      treatmentNotes: values.treatmentNotes,
    };
  }
  if (values.type === 'medication') {
    return {
      name: values.name,
      dose: values.dose,
      timeOfDay: values.timeOfDay,
      instructions: values.instructions,
      startDate: values.startDate,
      ongoing: values.ongoing,
    };
  }
  return {
    title: values.title,
    details: values.details,
    startDate: values.startDate,
  };
}

export function StudentHealthTab({
  slug,
  studentId,
  studentFirstName,
  onProfileChange,
}: StudentHealthTabProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();
  const [profile, setProfile] = useState<StudentHealthProfile>(emptyStudentHealthProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextProfile = await fetchStudentHealthProfileAdmin(slug, studentId);
      setProfile(nextProfile);
      onProfileChange?.(nextProfile);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load health profile.');
      setProfile(emptyStudentHealthProfile());
    } finally {
      setLoading(false);
    }
  }, [onProfileChange, slug, studentId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async (values: HealthFormValues) => {
    setSaving(true);
    try {
      const payload = valuesToPayload(values);
      if (formState.mode === 'edit') {
        await updateStudentHealthItemAdmin(
          slug,
          studentId,
          formState.itemId,
          formState.itemType,
          payload,
        );
      } else {
        await createStudentHealthItemAdmin(slug, studentId, values.type, payload);
      }
      await loadProfile();
    } catch (saveError) {
      reportError('school_admin_student_health_save', saveError, {
        entityType: 'student',
        entityId: studentId,
        metadata: { itemType: formState.mode === 'edit' ? formState.itemType : values.type },
      });
      Alert.alert(
        'Save failed',
        saveError instanceof Error ? saveError.message : 'Failed to save health item.',
      );
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (itemType: HealthItemType, itemId: string, label: string) => {
    Alert.alert('Delete health item', `Remove ${label} from ${studentFirstName}'s health profile?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteStudentHealthItemAdmin(slug, studentId, itemId);
              await loadProfile();
            } catch (deleteError) {
              reportError('school_admin_student_health_delete', deleteError, {
                entityType: 'student',
                entityId: studentId,
                metadata: { itemType, itemId },
              });
              Alert.alert(
                'Delete failed',
                deleteError instanceof Error ? deleteError.message : 'Failed to delete health item.',
              );
            }
          })();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorCopy, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" variant="soft" onPress={() => void loadProfile()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StoryDetailSection
        title="Allergies"
        description={`Food, environmental, and other allergies on file for ${studentFirstName}.`}>
        {profile.allergies.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No allergies on file.</Text>
        ) : (
          profile.allergies.map((item) => (
            <HealthItemRow
              key={item.id}
              title={item.allergen}
              subtitle={item.treatmentNotes || 'No treatment notes'}
              chipLabel={SEVERITY_LABELS[item.severity]}
              chipTone={item.severity === 'high' ? 'alert' : item.severity === 'medium' ? 'warning' : 'success'}
              onEdit={() =>
                setFormState({
                  mode: 'edit',
                  itemType: 'allergy',
                  itemId: item.id,
                  values: {
                    type: 'allergy',
                    allergen: item.allergen,
                    severity: item.severity,
                    treatmentNotes: item.treatmentNotes,
                  },
                })
              }
              onDelete={() => handleDelete('allergy', item.id, item.allergen)}
            />
          ))
        )}
        <StoryButton
          label="Add allergy"
          variant="soft"
          onPress={() => setFormState({ mode: 'create', itemType: 'allergy' })}
        />
      </StoryDetailSection>

      <StoryDetailSection
        title="Medications"
        description="Medications scheduled or administered at school.">
        {profile.medications.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No medications on file.</Text>
        ) : (
          profile.medications.map((item) => (
            <HealthItemRow
              key={item.id}
              title={item.name}
              subtitle={[item.timeOfDay, item.dose, item.instructions].filter(Boolean).join(' · ')}
              chipLabel={item.ongoing ? 'Ongoing' : 'Scheduled'}
              chipTone="info"
              onEdit={() =>
                setFormState({
                  mode: 'edit',
                  itemType: 'medication',
                  itemId: item.id,
                  values: {
                    type: 'medication',
                    name: item.name,
                    dose: item.dose,
                    timeOfDay: item.timeOfDay,
                    instructions: item.instructions,
                    startDate: item.startDate,
                    ongoing: item.ongoing,
                  },
                })
              }
              onDelete={() => handleDelete('medication', item.id, item.name)}
            />
          ))
        )}
        <StoryButton
          label="Add medication"
          variant="soft"
          onPress={() => setFormState({ mode: 'create', itemType: 'medication' })}
        />
      </StoryDetailSection>

      <StoryDetailSection
        title="Health updates"
        description="Temporary conditions, injuries, and other notes for staff.">
        {profile.updates.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No health updates on file.</Text>
        ) : (
          profile.updates.map((item) => (
            <HealthItemRow
              key={item.id}
              title={item.title}
              subtitle={item.details}
              chipLabel={item.startDate}
              chipTone="info"
              onEdit={() =>
                setFormState({
                  mode: 'edit',
                  itemType: 'update',
                  itemId: item.id,
                  values: {
                    type: 'update',
                    title: item.title,
                    details: item.details,
                    startDate: item.startDate,
                  },
                })
              }
              onDelete={() => handleDelete('update', item.id, item.title)}
            />
          ))
        )}
        <StoryButton
          label="Add health update"
          variant="soft"
          onPress={() => setFormState({ mode: 'create', itemType: 'update' })}
        />
      </StoryDetailSection>

      <StudentHealthFormSheet
        visible={formState.mode !== 'closed'}
        itemType={
          formState.mode === 'closed' ? 'allergy' : formState.itemType
        }
        initialValues={formState.mode === 'edit' ? formState.values : null}
        saving={saving}
        onClose={() => setFormState({ mode: 'closed' })}
        onSave={handleSave}
      />
    </View>
  );
}

function HealthItemRow({
  title,
  subtitle,
  chipLabel,
  chipTone,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  chipLabel: string;
  chipTone: 'success' | 'warning' | 'alert' | 'info';
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useParentTheme();

  return (
    <View style={[styles.itemRow, { borderColor: theme.line }]}>
      <View style={styles.itemCopy}>
        <Text style={[styles.itemTitle, { color: theme.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.itemSubtitle, { color: theme.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <StoryChip tone={chipTone} label={chipLabel} />
      </View>
      <View style={styles.itemActions}>
        <Pressable accessibilityRole="button" onPress={onEdit}>
          <Text style={[styles.actionLabel, { color: theme.primary }]}>Edit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDelete}>
          <Text style={[styles.actionLabel, { color: '#B5594A' }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  itemRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  itemCopy: {
    gap: Spacing.one,
  },
  itemTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  itemSubtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
  },
});
