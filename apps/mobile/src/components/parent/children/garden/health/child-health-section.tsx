import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GardenHealthFormSheet } from '@/components/parent/children/garden/health/garden-health-form-sheet';
import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, type GChipTone } from '@/components/parent/garden/tokens';
import {
  GChip,
  GErrorCard,
  GIcon,
  GKicker,
  GOutlineButton,
  GPressable,
  GSkeleton,
  gText,
} from '@/components/parent/garden/ui';
import {
  healthItemNoun,
  healthValuesToPayload,
  type HealthFormValues,
} from '@/lib/parent/parent-children-garden';
import {
  createParentStudentHealthItem,
  deleteParentStudentHealthItem,
  fetchParentStudentHealthProfile,
  updateParentStudentHealthItem,
} from '@/lib/parent/parent-portal-student-health-api';
import {
  SEVERITY_LABELS,
  emptyStudentHealthProfile,
  type HealthItemType,
  type StudentHealthProfile,
} from '@/lib/student-health/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type FormState =
  | { mode: 'closed' }
  | { mode: 'create'; itemType: HealthItemType }
  | { mode: 'edit'; itemType: HealthItemType; itemId: string; values: HealthFormValues };

const SECTION_META: Record<
  HealthItemType,
  { title: string; description: (first: string) => string; empty: string; add: string; icon: 'nutrition-outline' | 'medkit-outline' | 'bandage-outline'; tint: string }
> = {
  allergy: {
    title: 'Allergies',
    description: (first) => `Food, environmental, and other allergies on file for ${first}.`,
    empty: 'No allergies on file.',
    add: 'Add allergy',
    icon: 'nutrition-outline',
    tint: Garden.peach,
  },
  medication: {
    title: 'Medications',
    description: () => 'Medications scheduled or administered at school.',
    empty: 'No medications on file.',
    add: 'Add medication',
    icon: 'medkit-outline',
    tint: Garden.sky,
  },
  update: {
    title: 'Health updates',
    description: () => 'Temporary conditions, injuries, and other notes for staff.',
    empty: 'No health updates on file.',
    add: 'Add health update',
    icon: 'bandage-outline',
    tint: Garden.lav,
  },
};

function HealthRow({
  title,
  subtitle,
  chip,
  first,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  chip: { label: string; tone: GChipTone };
  first: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.row, !first && styles.rowRule]}>
      <GPressable
        accessibilityLabel={`${title}, ${chip.label}. Edit`}
        pressedScale={0.99}
        onPress={onEdit}
        style={styles.rowMain}>
        <View style={styles.rowCopy}>
          <Text style={gText.itemTitle} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={gText.meta} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
          <GChip label={chip.label} tone={chip.tone} style={styles.rowChip} />
        </View>
      </GPressable>
      <View style={styles.rowActions}>
        <GPressable accessibilityLabel={`Edit ${title}`} onPress={onEdit} hitSlop={6} style={styles.iconButton}>
          <Ionicons name="create-outline" size={19} color={Garden.ink} />
        </GPressable>
        <GPressable accessibilityLabel={`Delete ${title}`} onPress={onDelete} hitSlop={6} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={19} color="#7E4533" />
        </GPressable>
      </View>
    </View>
  );
}

function HealthGroup({
  type,
  firstName,
  count,
  onAdd,
  children,
}: {
  type: HealthItemType;
  firstName: string;
  count: number;
  onAdd: () => void;
  children: ReactNode;
}) {
  const meta = SECTION_META[type];
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <GIcon name={meta.icon} size="sm" bg={meta.tint} />
        <View style={styles.rowCopy}>
          <GKicker>{meta.title}</GKicker>
          <Text style={gText.meta}>{meta.description(firstName)}</Text>
        </View>
      </View>
      {count === 0 ? (
        <Text style={[gText.meta, styles.empty]}>{meta.empty}</Text>
      ) : (
        <View style={styles.notebook}>{children}</View>
      )}
      <GOutlineButton label={meta.add} icon="add" onPress={onAdd} />
    </View>
  );
}

/** Allergies, medications and health updates for one child (same API as before). */
export function ChildHealthSection({
  organizationId,
  studentId,
  studentFirstName,
  onSaved,
}: {
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  onSaved?: () => void;
}) {
  const toast = useGardenToast();
  const { guard } = useGardenReadOnlyGate();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [profile, setProfile] = useState<StudentHealthProfile>(emptyStudentHealthProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await fetchParentStudentHealthProfile(organizationId, studentId));
    } catch (loadError) {
      reportError('parent_student_health_load', loadError, { entityType: 'student', entityId: studentId });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load health profile.');
      setProfile(emptyStudentHealthProfile());
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = guard((itemType: HealthItemType) => {
    setSaveError(null);
    setFormState({ mode: 'create', itemType });
  });
  const openEdit = guard((itemType: HealthItemType, itemId: string, values: HealthFormValues) => {
    setSaveError(null);
    setFormState({ mode: 'edit', itemType, itemId, values });
  });

  const handleSave = async (values: HealthFormValues): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    const editing = formState.mode === 'edit';
    try {
      const payload = healthValuesToPayload(values);
      if (formState.mode === 'edit') {
        await updateParentStudentHealthItem(organizationId, studentId, formState.itemId, formState.itemType, payload);
      } else {
        await createParentStudentHealthItem(organizationId, studentId, values.type, payload);
      }
      setProfile(await fetchParentStudentHealthProfile(organizationId, studentId));
      onSaved?.();
      setFormState({ mode: 'closed' });
      const noun = healthItemNoun(values.type);
      setTimeout(
        () =>
          toast.success(editing ? `${noun} updated` : `${noun} added`, {
            description: `Staff will see it on ${studentFirstName}'s health profile.`,
          }),
        220,
      );
      return true;
    } catch (err) {
      reportError('parent_student_health_save', err, {
        entityType: 'student',
        entityId: studentId,
        metadata: { itemType: formState.mode === 'edit' ? formState.itemType : values.type },
      });
      setSaveError(err instanceof Error ? err.message : 'Failed to save health item.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = guard((itemType: HealthItemType, itemId: string, label: string) => {
    void (async () => {
      const confirmed = await confirmDestructive({
        title: 'Delete health item',
        message: `Remove ${label} from ${studentFirstName}'s health profile?`,
      });
      if (!confirmed) return;
      try {
        await deleteParentStudentHealthItem(organizationId, studentId, itemId);
        setProfile(await fetchParentStudentHealthProfile(organizationId, studentId));
        onSaved?.();
        toast.success(`${healthItemNoun(itemType)} removed`, {
          description: `${label} is no longer on ${studentFirstName}'s profile.`,
        });
      } catch (err) {
        reportError('parent_student_health_delete', err, {
          entityType: 'student',
          entityId: studentId,
          metadata: { itemType, itemId },
        });
        toast.error("Couldn't remove it", {
          description: err instanceof Error ? err.message : 'Failed to delete health item.',
          action: { label: 'Try again', onPress: () => handleDelete(itemType, itemId, label) },
        });
      }
    })();
  });

  if (loading) {
    return (
      <View style={styles.container} accessibilityLabel="Loading health profile">
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.group}>
            <GSkeleton style={{ width: 120, height: 12 }} />
            <GSkeleton style={{ height: 56, borderRadius: 14 }} />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <GErrorCard
        title="We couldn't load the health profile"
        message={`${error} Check your connection, then try again.`}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <View style={styles.container} testID="parent-child-health-tab">
      <HealthGroup type="allergy" firstName={studentFirstName} count={profile.allergies.length} onAdd={() => openCreate('allergy')}>
        {profile.allergies.map((item, i) => (
          <HealthRow
            key={item.id}
            first={i === 0}
            title={item.allergen}
            subtitle={item.treatmentNotes || 'No treatment notes'}
            chip={{
              label: SEVERITY_LABELS[item.severity],
              tone: item.severity === 'high' ? 'alert' : item.severity === 'medium' ? 'warning' : 'success',
            }}
            onEdit={() =>
              openEdit('allergy', item.id, {
                type: 'allergy',
                allergen: item.allergen,
                severity: item.severity,
                treatmentNotes: item.treatmentNotes,
              })
            }
            onDelete={() => handleDelete('allergy', item.id, item.allergen)}
          />
        ))}
      </HealthGroup>

      <HealthGroup type="medication" firstName={studentFirstName} count={profile.medications.length} onAdd={() => openCreate('medication')}>
        {profile.medications.map((item, i) => (
          <HealthRow
            key={item.id}
            first={i === 0}
            title={item.name}
            subtitle={[item.timeOfDay, item.dose, item.instructions].filter(Boolean).join(' · ')}
            chip={{ label: item.ongoing ? 'Ongoing' : 'Scheduled', tone: 'info' }}
            onEdit={() =>
              openEdit('medication', item.id, {
                type: 'medication',
                name: item.name,
                dose: item.dose,
                timeOfDay: item.timeOfDay,
                instructions: item.instructions,
                startDate: item.startDate,
                ongoing: item.ongoing,
              })
            }
            onDelete={() => handleDelete('medication', item.id, item.name)}
          />
        ))}
      </HealthGroup>

      <HealthGroup type="update" firstName={studentFirstName} count={profile.updates.length} onAdd={() => openCreate('update')}>
        {profile.updates.map((item, i) => (
          <HealthRow
            key={item.id}
            first={i === 0}
            title={item.title}
            subtitle={item.details}
            chip={{ label: item.startDate, tone: 'info' }}
            onEdit={() =>
              openEdit('update', item.id, {
                type: 'update',
                title: item.title,
                details: item.details,
                startDate: item.startDate,
              })
            }
            onDelete={() => handleDelete('update', item.id, item.title)}
          />
        ))}
      </HealthGroup>

      <GardenHealthFormSheet
        visible={formState.mode !== 'closed'}
        itemType={formState.mode === 'closed' ? 'allergy' : formState.itemType}
        initialValues={formState.mode === 'edit' ? formState.values : null}
        studentFirstName={studentFirstName}
        saving={saving}
        saveError={saveError}
        onClose={() => setFormState({ mode: 'closed' })}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 22 },
  group: { gap: 10 },
  groupHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  empty: { paddingVertical: 4 },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 4 },
  rowRule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  rowMain: { flex: 1, paddingVertical: 12 },
  rowCopy: { flex: 1, gap: 3 },
  rowChip: { marginTop: 4 },
  rowActions: { flexDirection: 'row' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
