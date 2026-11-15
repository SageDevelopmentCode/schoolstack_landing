import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// keyboard: verified on device — pickup contact form uses ParentBottomSheet (keyboard avoiding + scroll inset)

import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  ChildThumb,
  GErrorCard,
  GHand,
  GKicker,
  GOutlineButton,
  GPressable,
  GSkeleton,
  GToyButton,
  gText,
} from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import {
  EMPTY_PICKUP_FORM,
  formatContactName,
  normalizePickupForm,
  pickupFormErrors,
} from '@/lib/parent/parent-children-garden';
import {
  createParentStudentPickupContact,
  deleteParentStudentPickupContact,
  fetchParentStudentPickupContacts,
  updateParentStudentPickupContact,
  type AuthorizedPickupContact,
  type PickupContactInput,
} from '@/lib/parent/parent-portal-pickup-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; contact: AuthorizedPickupContact };

/** Authorized pickup contacts for one child (same API as before). */
export function ChildPickupSection({
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
  const keyboardOpen = useKeyboardHeight() > 0;

  const [contacts, setContacts] = useState<AuthorizedPickupContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [values, setValues] = useState<PickupContactInput>(EMPTY_PICKUP_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setContacts(await fetchParentStudentPickupContacts(organizationId, studentId));
    } catch (error) {
      reportError('parent_pickup_load', error, { entityType: 'student', entityId: studentId });
      setLoadError(error instanceof Error ? error.message : 'Failed to load authorized pickup contacts.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, studentId]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const openForm = (next: FormState, initial: PickupContactInput) => {
    setValues(initial);
    setShowErrors(false);
    setSaveError(null);
    setFormState(next);
  };
  const openCreate = guard(() => openForm({ mode: 'create' }, EMPTY_PICKUP_FORM));
  const openEdit = guard((contact: AuthorizedPickupContact) =>
    openForm(
      { mode: 'edit', contact },
      {
        firstName: contact.firstName,
        lastName: contact.lastName,
        relationship: contact.relationship ?? '',
        phone: contact.phone ?? '',
        notes: contact.notes ?? '',
      },
    ),
  );
  const closeForm = () => setFormState({ mode: 'closed' });

  const errors = pickupFormErrors(values);

  const handleSave = async () => {
    if (errors.firstName || errors.lastName) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setSaveError(null);
    const editing = formState.mode === 'edit';
    try {
      const payload = normalizePickupForm(values);
      if (formState.mode === 'edit') {
        await updateParentStudentPickupContact(organizationId, studentId, formState.contact.id, payload);
      } else {
        await createParentStudentPickupContact(organizationId, studentId, payload);
      }
      const name = formatContactName(payload);
      closeThen(closeForm, () =>
        toast.success(editing ? 'Contact updated' : 'Contact added', {
          description: editing
            ? `${name}'s details are saved.`
            : `${name} can now pick up ${studentFirstName}.`,
        }),
      );
      await loadContacts();
      onSaved?.();
    } catch (error) {
      reportError('parent_pickup_save', error, { entityType: 'student', entityId: studentId });
      setSaveError(error instanceof Error ? error.message : 'Failed to save pickup contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contact: AuthorizedPickupContact) => {
    const name = formatContactName(contact);
    const confirmed = await confirmDestructive({
      title: 'Remove contact',
      message: `Remove ${name} from the authorized pickup list?`,
      confirmLabel: 'Remove',
    });
    if (!confirmed) return;
    setSaving(true);
    setSaveError(null);
    try {
      await deleteParentStudentPickupContact(organizationId, studentId, contact.id);
      closeThen(closeForm, () =>
        toast.success('Contact removed', {
          description: `${name} is no longer on ${studentFirstName}'s pickup list.`,
        }),
      );
      await loadContacts();
      onSaved?.();
    } catch (error) {
      reportError('parent_pickup_delete', error, { entityType: 'student', entityId: studentId });
      setSaveError(error instanceof Error ? error.message : 'Failed to remove pickup contact.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof PickupContactInput) => (text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  return (
    <View style={styles.container} testID="parent-child-pickup-tab">
      <View style={styles.hero}>
        <GKicker>Authorized pickup</GKicker>
        <Text accessibilityRole="header" style={styles.heroTitle}>
          Who can pick up {studentFirstName}?
        </Text>
        <Text style={gText.meta}>
          People allowed to pick up your child. They do not need a MudKitchen account.
        </Text>
        <GToyButton label="Add contact" icon="person-add-outline" onPress={openCreate} disabled={saving} style={styles.heroButton} />
      </View>

      {loading ? (
        <View style={styles.list} accessibilityLabel="Loading pickup contacts">
          {[0, 1].map((i) => (
            <GSkeleton key={i} style={{ height: 68, borderRadius: 16 }} />
          ))}
        </View>
      ) : loadError ? (
        <GErrorCard
          kicker="Authorized pickup"
          title="We couldn't load the pickup list"
          message={`${loadError} Check your connection, then try again.`}
          onRetry={() => void loadContacts()}
        />
      ) : contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={gText.meta}>
            No authorized pickup contacts yet. Add grandparents, nannies, or other trusted adults.
          </Text>
          <GHand>Add someone you trust.</GHand>
        </View>
      ) : (
        <View style={styles.list}>
          {contacts.map((contact, index) => {
            const name = formatContactName(contact);
            const meta = [contact.relationship, contact.phone].filter(Boolean).join(' · ');
            return (
              <GPressable
                key={contact.id}
                accessibilityLabel={`${name}${meta ? `, ${meta}` : ''}. Edit contact`}
                pressedScale={0.98}
                onPress={() => openEdit(contact)}
                style={styles.card}>
                <ChildThumb name={name} photoUrl={null} size={46} index={index + 2} />
                <View style={styles.cardCopy}>
                  <Text style={gText.itemTitle} numberOfLines={1}>
                    {name}
                  </Text>
                  {contact.relationship ? <Text style={gText.meta}>{contact.relationship}</Text> : null}
                  {contact.phone ? (
                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={13} color={Garden.soft} />
                      <Text style={gText.meta}>{contact.phone}</Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="create-outline" size={18} color={Garden.ink60} />
              </GPressable>
            );
          })}
        </View>
      )}

      <ParentBottomSheet
        visible={formState.mode !== 'closed'}
        onClose={closeForm}
        title={formState.mode === 'edit' ? 'Edit pickup contact' : 'Add pickup contact'}
        subtitle={`Allowed to pick up ${studentFirstName}`}
        accessibilityLabel="Close pickup contact form">
        <View style={styles.form}>
          <GTextField
            label="First name"
            value={values.firstName}
            onChangeText={set('firstName')}
            autoCapitalize="words"
            textContentType="givenName"
            error={showErrors ? errors.firstName : null}
          />
          <GTextField
            label="Last name"
            value={values.lastName}
            onChangeText={set('lastName')}
            autoCapitalize="words"
            textContentType="familyName"
            error={showErrors ? errors.lastName : null}
          />
          <GTextField
            label="Relationship"
            optional
            value={values.relationship ?? ''}
            onChangeText={set('relationship')}
            placeholder="e.g. Grandparent"
          />
          <GTextField
            label="Phone"
            optional
            value={values.phone ?? ''}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <GTextField
            label="Notes"
            optional
            value={values.notes ?? ''}
            onChangeText={set('notes')}
            multiline
            helper="Anything staff should know, like a code word."
          />
          {saveError ? (
            <GInlineBanner tone="error" title="Couldn't save" description={`${saveError} Your changes are still here — try again.`} />
          ) : null}
          {keyboardOpen ? null : (
            <View style={styles.actions}>
              <GToyButton
                label={saving ? 'Saving…' : 'Save contact'}
                icon="checkmark"
                loading={saving}
                fullWidth
                size="md"
                onPress={() => void handleSave()}
              />
              {formState.mode === 'edit' ? (
                <GOutlineButton
                  label="Remove contact"
                  icon="trash-outline"
                  onPress={() => void handleDelete(formState.contact)}
                  style={styles.remove}
                />
              ) : null}
            </View>
          )}
        </View>
      </ParentBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  hero: {
    gap: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Garden.sky,
  },
  heroTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  heroButton: { marginTop: 8 },
  list: { gap: 10 },
  empty: { gap: 8 },
  card: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  cardCopy: { flex: 1, gap: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  form: { gap: 14 },
  actions: { gap: 10, marginTop: 4 },
  remove: { alignSelf: 'center' },
});
