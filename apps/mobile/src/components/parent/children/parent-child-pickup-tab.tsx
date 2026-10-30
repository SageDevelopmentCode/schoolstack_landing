import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  createParentStudentPickupContact,
  deleteParentStudentPickupContact,
  fetchParentStudentPickupContacts,
  updateParentStudentPickupContact,
  type AuthorizedPickupContact,
  type PickupContactInput,
} from '@/lib/parent/parent-portal-pickup-api';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentChildPickupTabProps = {
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  onSaved?: () => void;
};

type FormState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; contact: AuthorizedPickupContact };

const EMPTY_FORM: PickupContactInput = {
  firstName: '',
  lastName: '',
  relationship: '',
  phone: '',
  notes: '',
};

function formatContactName(contact: AuthorizedPickupContact): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || 'Contact';
}

export function ParentChildPickupTab({
  organizationId,
  studentId,
  studentFirstName,
  onSaved,
}: ParentChildPickupTabProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [contacts, setContacts] = useState<AuthorizedPickupContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [formValues, setFormValues] = useState<PickupContactInput>(EMPTY_FORM);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchParentStudentPickupContacts(organizationId, studentId);
      setContacts(next);
    } catch (error) {
      reportError('parent_pickup_load', error, { entityType: 'student', entityId: studentId });
      Alert.alert(
        'Could not load pickup list',
        error instanceof Error ? error.message : 'Failed to load authorized pickup contacts.',
      );
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, studentId]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const openCreateForm = () => {
    setFormValues(EMPTY_FORM);
    setFormState({ mode: 'create' });
  };

  const openEditForm = (contact: AuthorizedPickupContact) => {
    setFormValues({
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationship: contact.relationship ?? '',
      phone: contact.phone ?? '',
      notes: contact.notes ?? '',
    });
    setFormState({ mode: 'edit', contact });
  };

  const closeForm = () => {
    setFormState({ mode: 'closed' });
  };

  const handleSave = async () => {
    if (!formValues.firstName.trim() || !formValues.lastName.trim()) {
      Alert.alert('Missing name', 'First and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: PickupContactInput = {
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        relationship: formValues.relationship?.trim() || null,
        phone: formValues.phone?.trim() || null,
        notes: formValues.notes?.trim() || null,
      };

      if (formState.mode === 'edit') {
        await updateParentStudentPickupContact(
          organizationId,
          studentId,
          formState.contact.id,
          payload,
        );
      } else {
        await createParentStudentPickupContact(organizationId, studentId, payload);
      }

      closeForm();
      await loadContacts();
      onSaved?.();
    } catch (error) {
      reportError('parent_pickup_save', error, { entityType: 'student', entityId: studentId });
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Failed to save pickup contact.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contact: AuthorizedPickupContact) => {
    Alert.alert(
      'Remove contact',
      `Remove ${formatContactName(contact)} from the authorized pickup list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setSaving(true);
              try {
                await deleteParentStudentPickupContact(organizationId, studentId, contact.id);
                closeForm();
                await loadContacts();
                onSaved?.();
              } catch (error) {
                reportError('parent_pickup_delete', error, {
                  entityType: 'student',
                  entityId: studentId,
                });
                Alert.alert(
                  'Remove failed',
                  error instanceof Error ? error.message : 'Failed to remove pickup contact.',
                );
              } finally {
                setSaving(false);
              }
            })();
          },
        },
      ],
    );
  };

  const sheetOpen = formState.mode !== 'closed';
  const sheetTitle = formState.mode === 'edit' ? 'Edit pickup contact' : 'Add pickup contact';

  return (
    <View style={styles.container} testID="parent-child-pickup-tab">
      <View style={[styles.hero, { borderColor: theme.line, backgroundColor: Story.white }]}>
        <StorySectionKicker>Authorized pickup</StorySectionKicker>
        <StoryDisplayHeading size="section" style={styles.heroTitle}>
          Who can pick up {studentFirstName}?
        </StoryDisplayHeading>
        <Text style={[styles.heroCopy, { color: theme.muted }]}>
          People allowed to pick up your child. They do not need a MudKitchen account.
        </Text>
        <StoryButton label="Add contact" onPress={openCreateForm} disabled={saving} />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : contacts.length === 0 ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No authorized pickup contacts yet. Add grandparents, nannies, or other trusted adults.
        </Text>
      ) : (
        <View style={styles.list}>
          {contacts.map((contact) => (
            <Pressable
              key={contact.id}
              accessibilityRole="button"
              onPress={() => openEditForm(contact)}
              style={({ pressed }) => [
                styles.card,
                { borderColor: theme.line, backgroundColor: Story.white },
                pressed && { opacity: 0.92 },
              ]}>
              <Text style={[styles.cardName, { color: theme.ink }]}>{formatContactName(contact)}</Text>
              {contact.relationship ? (
                <Text style={[styles.cardMeta, { color: theme.muted }]}>{contact.relationship}</Text>
              ) : null}
              {contact.phone ? (
                <Text style={[styles.cardMeta, { color: theme.muted }]}>{contact.phone}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      <StoryBottomSheet
        visible={sheetOpen}
        onClose={closeForm}
        accessibilityLabel="Close pickup contact form">
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.ink }]}>{sheetTitle}</Text>
          <StoryTextField
            label="First name"
            value={formValues.firstName}
            onChangeText={(firstName) => setFormValues((prev) => ({ ...prev, firstName }))}
            autoCapitalize="words"
          />
          <StoryTextField
            label="Last name"
            value={formValues.lastName}
            onChangeText={(lastName) => setFormValues((prev) => ({ ...prev, lastName }))}
            autoCapitalize="words"
          />
          <StoryTextField
            label="Relationship"
            value={formValues.relationship ?? ''}
            onChangeText={(relationship) => setFormValues((prev) => ({ ...prev, relationship }))}
          />
          <StoryTextField
            label="Phone"
            value={formValues.phone ?? ''}
            onChangeText={(phone) => setFormValues((prev) => ({ ...prev, phone }))}
            keyboardType="phone-pad"
          />
          <StoryTextField
            label="Notes"
            value={formValues.notes ?? ''}
            onChangeText={(notes) => setFormValues((prev) => ({ ...prev, notes }))}
            multiline
          />
          <StoryButton
            label={formState.mode === 'edit' ? 'Save changes' : 'Add contact'}
            onPress={() => void handleSave()}
            disabled={saving}
          />
          {formState.mode === 'edit' ? (
            <StoryButton
              label="Remove contact"
              variant="soft"
              onPress={() => handleDelete(formState.contact)}
              disabled={saving}
            />
          ) : null}
        </View>
      </StoryBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 16,
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  heroCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  loader: {
    paddingVertical: Spacing.four,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: 4,
  },
  cardName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  cardMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  sheetContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  sheetTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
});
