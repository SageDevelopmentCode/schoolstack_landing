import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { StaffPortalRole } from '@/lib/school-admin-api';
import { createStaffMember } from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';

export type StaffFormState = {
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
};

export const EMPTY_STAFF_FORM: StaffFormState = {
  firstName: '',
  lastName: '',
  email: '',
  roleTitle: '',
  portalRole: 'teacher',
};

type StaffFormSheetProps = {
  visible: boolean;
  slug: string;
  onClose: () => void;
  onCreated: (staffMemberId: string) => void;
};

const PORTAL_ROLES: StaffPortalRole[] = ['teacher', 'staff'];

export function StaffFormSheet({ visible, slug, onClose, onCreated }: StaffFormSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setForm(EMPTY_STAFF_FORM);
    setError(null);
  }, [visible]);

  const canSave = useMemo(
    () =>
      Boolean(
        form.firstName.trim() &&
          form.lastName.trim() &&
          form.email.trim() &&
          form.roleTitle.trim(),
      ),
    [form],
  );

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const member = await createStaffMember(slug, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        roleTitle: form.roleTitle.trim(),
        portalRole: form.portalRole,
      });
      onCreated(member.id);
      onClose();
    } catch (saveError) {
      setError(formatStaffApiError(saveError, 'Failed to add staff member.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Cancel
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Add staff
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave || saving}
            onPress={() => void handleSave()}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <ThemedText
                type="smallBold"
                style={{ color: canSave ? theme.accent : theme.textTertiary }}>
                Add
              </ThemedText>
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {error ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {error}
            </ThemedText>
          ) : null}

          <Field label="First name">
            <TextInput
              value={form.firstName}
              onChangeText={(firstName) => setForm((current) => ({ ...current, firstName }))}
              placeholder="First name"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Last name">
            <TextInput
              value={form.lastName}
              onChangeText={(lastName) => setForm((current) => ({ ...current, lastName }))}
              placeholder="Last name"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Email">
            <TextInput
              value={form.email}
              onChangeText={(email) => setForm((current) => ({ ...current, email }))}
              placeholder="name@school.org"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Job title">
            <TextInput
              value={form.roleTitle}
              onChangeText={(roleTitle) => setForm((current) => ({ ...current, roleTitle }))}
              placeholder="Lead Teacher"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Portal role">
            <View style={styles.chipRow}>
              {PORTAL_ROLES.map((role) => {
                const active = form.portalRole === role;
                return (
                  <Pressable
                    key={role}
                    accessibilityRole="button"
                    onPress={() => setForm((current) => ({ ...current, portalRole: role }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.accentLight : theme.surface,
                        borderColor: active ? theme.accent : theme.border,
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ color: active ? theme.accent : theme.textSecondary }}>
                      {role === 'teacher' ? 'Teacher' : 'Staff'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Field>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useAdminTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useAdminTheme>) {
  return {
    borderColor: theme.inputBorder,
    backgroundColor: theme.input,
    color: theme.textPrimary,
    fontFamily: Fonts.body,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
});
