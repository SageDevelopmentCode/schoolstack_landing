import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GOutlineButton, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { AdminHealthFormSheet } from '@/components/school-admin/students/garden/admin-health-form-sheet';
import { useStudentHealth, type StudentHealthSource } from '@/components/school-admin/students/garden/use-student-health';
import type { HealthFormValues } from '@/components/school-admin/students/student-health-form-sheet';
import { SEVERITY_LABELS, type HealthItemType, type StudentHealthProfile } from '@/lib/student-health/types';

const TYPE_NOUN: Record<HealthItemType, string> = {
  allergy: 'Allergy',
  medication: 'Medication',
  update: 'Health update',
};

function valuesLabel(values: HealthFormValues): string {
  if (values.type === 'allergy') return values.allergen.trim() || 'Allergy';
  if (values.type === 'medication') return values.name.trim() || 'Medication';
  return values.title.trim() || 'Health update';
}

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Garden Health tab: Allergies / Medications / Health updates with severity
 * chips, Edit and Delete per item, "Add …" buttons, the Garden form sheet,
 * in-sheet save errors, toasts after close and after deletes (with Retry),
 * and the read-only preview gate. Data and saves: `useStudentHealth`.
 */
export function StudentHealthPanel({
  organizationId,
  slug,
  studentId,
  studentFirstName,
  onProfileChange,
  source,
}: {
  organizationId: string;
  slug: string;
  studentId: string;
  studentFirstName: string;
  onProfileChange?: (profile: StudentHealthProfile) => void;
  /** Teacher portal passes its own API + operations; admin uses the default. */
  source?: StudentHealthSource;
}) {
  const health = useStudentHealth({ slug, studentId, onProfileChange, source });
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { formState, setFormState, save, remove, profile } = health;

  const openForm = useCallback(
    (state: Exclude<typeof formState, { mode: 'closed' }>) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      setSaveError(null);
      setFormState(state);
    },
    [notifyReadOnly, readOnly, setFormState],
  );

  const closeForm = useCallback(() => {
    setSaveError(null);
    setFormState({ mode: 'closed' });
  }, [setFormState]);

  const submit = useCallback(
    async (values: HealthFormValues) => {
      const editing = formState.mode === 'edit';
      const noun = TYPE_NOUN[values.type];
      const label = valuesLabel(values);
      const key = `health-${values.type}`;
      setSaveError(null);
      let failure: unknown = null;
      const ok = await action.run(() => save(values), {
        key,
        silent: true,
        error: (err) => {
          failure = err;
          return { title: 'Not saved', description: errorText(err, 'Failed to save health item.') };
        },
      });
      if (!ok) {
        setSaveError(errorText(failure, 'Failed to save health item.'));
        return;
      }
      closeThen(closeForm, () => {
        action.toast.success(`${noun} ${editing ? 'updated' : 'added'}`, {
          id: key,
          description: `${label} is on ${studentFirstName}'s health profile. Staff see it on the roster.`,
        });
      });
    },
    [action, closeForm, formState.mode, save, studentFirstName],
  );

  const deleteItem = useCallback(
    async (itemType: HealthItemType, itemId: string, label: string) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      const ok = await confirmDestructive({
        title: 'Delete health item',
        message: `Remove ${label} from ${studentFirstName}'s health profile?`,
        confirmLabel: 'Delete',
      });
      if (!ok) return;
      await action.run(() => remove(itemType, itemId), {
        key: `health-delete-${itemId}`,
        success: { title: `${label} removed`, description: `It's no longer on ${studentFirstName}'s health profile.` },
        error: (err) => ({
          title: "Couldn't delete the health item",
          description: `${errorText(err, 'Failed to delete health item.')} ${label} is still on the profile.`,
        }),
        retry: true,
      });
    },
    [action, notifyReadOnly, readOnly, remove, studentFirstName],
  );

  if (health.loading) return <StudentHealthPanelSkeleton />;

  if (health.error) {
    return (
      <GErrorCard
        title="We couldn't load the health profile"
        message={health.error}
        onRetry={() => void health.retryLoad()}
      />
    );
  }

  const flashFor = (type: HealthItemType) => action.flashKey === `health-${type}`;

  return (
    <View style={styles.root}>
      <HealthSection
        index={0}
        title="Allergies"
        description={`Food, environmental, and other allergies on file for ${studentFirstName}.`}
        emptyCopy="No allergies on file."
        addLabel="Add allergy"
        flash={flashFor('allergy')}
        onAdd={() => openForm({ mode: 'create', itemType: 'allergy' })}>
        {profile.allergies.map((item, i) => (
          <HealthItemRow
            key={item.id}
            divider={i > 0}
            title={item.allergen}
            subtitle={item.treatmentNotes || 'No treatment notes'}
            chipLabel={SEVERITY_LABELS[item.severity]}
            chipTone={item.severity === 'high' ? 'alert' : item.severity === 'medium' ? 'warning' : 'success'}
            deleting={action.pendingKey === `health-delete-${item.id}`}
            onEdit={() =>
              openForm({
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
            onDelete={() => void deleteItem('allergy', item.id, item.allergen)}
          />
        ))}
      </HealthSection>

      <HealthSection
        index={1}
        title="Medications"
        description="Medications scheduled or administered at school."
        emptyCopy="No medications on file."
        addLabel="Add medication"
        flash={flashFor('medication')}
        onAdd={() => openForm({ mode: 'create', itemType: 'medication' })}>
        {profile.medications.map((item, i) => (
          <HealthItemRow
            key={item.id}
            divider={i > 0}
            title={item.name}
            subtitle={[item.timeOfDay, item.dose, item.instructions].filter(Boolean).join(' · ')}
            chipLabel={item.ongoing ? 'Ongoing' : 'Scheduled'}
            chipTone="info"
            deleting={action.pendingKey === `health-delete-${item.id}`}
            onEdit={() =>
              openForm({
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
            onDelete={() => void deleteItem('medication', item.id, item.name)}
          />
        ))}
      </HealthSection>

      <HealthSection
        index={2}
        title="Health updates"
        description="Temporary conditions, injuries, and other notes for staff."
        emptyCopy="No health updates on file."
        addLabel="Add health update"
        flash={flashFor('update')}
        onAdd={() => openForm({ mode: 'create', itemType: 'update' })}>
        {profile.updates.map((item, i) => (
          <HealthItemRow
            key={item.id}
            divider={i > 0}
            title={item.title}
            subtitle={item.details}
            chipLabel={item.startDate}
            chipTone="info"
            deleting={action.pendingKey === `health-delete-${item.id}`}
            onEdit={() =>
              openForm({
                mode: 'edit',
                itemType: 'update',
                itemId: item.id,
                values: { type: 'update', title: item.title, details: item.details, startDate: item.startDate },
              })
            }
            onDelete={() => void deleteItem('update', item.id, item.title)}
          />
        ))}
      </HealthSection>

      <AdminHealthFormSheet
        visible={formState.mode !== 'closed'}
        itemType={formState.mode === 'closed' ? 'allergy' : formState.itemType}
        initialValues={formState.mode === 'edit' ? formState.values : null}
        studentFirstName={studentFirstName}
        saving={health.saving}
        saveError={saveError}
        onClose={closeForm}
        onSave={(values) => void submit(values)}
      />
    </View>
  );
}

function HealthSection({
  title,
  description,
  emptyCopy,
  addLabel,
  onAdd,
  flash,
  index,
  children,
}: {
  title: string;
  description: string;
  emptyCopy: string;
  addLabel: string;
  onAdd: () => void;
  flash: boolean;
  index: number;
  children: ReactNode[];
}) {
  const count = children.length;
  return (
    <GCard
      title={title}
      index={index}
      style={flash && styles.flash}
      action={count > 0 ? <GChip label={String(count)} tone="neutral" /> : null}>
      <Text style={styles.description}>{description}</Text>
      {count === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="leaf-outline" size={18} color={Garden.soft} />
          <Text style={styles.emptyCopy}>{emptyCopy}</Text>
        </View>
      ) : (
        <View>{children}</View>
      )}
      <GOutlineButton label={addLabel} icon="add" onPress={onAdd} style={styles.add} />
    </GCard>
  );
}

function HealthItemRow({
  title,
  subtitle,
  chipLabel,
  chipTone,
  onEdit,
  onDelete,
  deleting,
  divider,
}: {
  title: string;
  subtitle: string;
  chipLabel: string;
  chipTone: GChipTone;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  divider: boolean;
}) {
  const accent = useGardenAccent();
  return (
    <View style={[styles.item, divider && styles.divider, deleting && styles.dim]}>
      <View style={styles.itemCopy}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.itemSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <GChip label={chipLabel} tone={chipTone} style={styles.itemChip} />
      </View>
      <View style={styles.itemActions}>
        <GPressable
          accessibilityLabel={`Edit ${title}`}
          onPress={onEdit}
          disabled={deleting}
          style={styles.iconButton}>
          <Ionicons name="create-outline" size={18} color={accent.clayDeep} />
          <Text style={[styles.iconLabel, { color: accent.clayDeep }]}>Edit</Text>
        </GPressable>
        <GPressable
          accessibilityLabel={`Delete ${title}`}
          accessibilityState={{ busy: deleting }}
          onPress={onDelete}
          disabled={deleting}
          style={styles.iconButton}>
          {deleting ? (
            <ActivityIndicator size="small" color="#9A3B2C" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#9A3B2C" />
          )}
          <Text style={[styles.iconLabel, { color: '#9A3B2C' }]}>Delete</Text>
        </GPressable>
      </View>
    </View>
  );
}

export function StudentHealthPanelSkeleton() {
  return (
    <View style={styles.root} accessibilityLabel="Loading health profile">
      {[0, 1, 2].map((i) => (
        <GSkeleton key={i} style={styles.skCard} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  flash: { backgroundColor: Garden.mint },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 8 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  emptyCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft },
  add: { alignSelf: 'flex-start', marginTop: 12 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  dim: { opacity: 0.55 },
  itemCopy: { flex: 1, gap: 4 },
  itemTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  itemSubtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  itemChip: { alignSelf: 'flex-start', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 4 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 2 },
  iconLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 11.5 },
  skCard: { height: 150, borderRadius: 22 },
});
