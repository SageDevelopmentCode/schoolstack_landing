import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { GChoiceChips, GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { AdminFormSheet, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import type { CreateStaffMemberInput, StaffPortalRole } from '@/lib/school-admin-api';

type StaffFormState = { firstName: string; lastName: string; email: string; roleTitle: string; portalRole: StaffPortalRole };

const EMPTY_FORM: StaffFormState = { firstName: '', lastName: '', email: '', roleTitle: '', portalRole: 'teacher' };

/**
 * Garden "Add staff" sheet: same fields, validation and portal role chips as
 * the Story `StaffFormSheet`. `onSubmit` resolves `true` when the member was
 * added (the parent closes and toasts); failures stay here as `notice`.
 */
export function AdminStaffFormSheet({
  visible,
  saving,
  notice,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  saving: boolean;
  notice: AdminSheetNotice | null;
  onClose: () => void;
  onSubmit: (input: CreateStaffMemberInput) => void;
}) {
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [wasVisible, setWasVisible] = useState(visible);

  // Fresh form each time the sheet opens (previous-value pattern).
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (visible) setForm(EMPTY_FORM);
  }

  const isDirty = Boolean(form.firstName.trim() || form.lastName.trim() || form.email.trim() || form.roleTitle.trim());
  const missing = useMemo(() => {
    const fields: string[] = [];
    if (!form.firstName.trim()) fields.push('first name');
    if (!form.lastName.trim()) fields.push('last name');
    if (!form.email.trim()) fields.push('email');
    if (!form.roleTitle.trim()) fields.push('job title');
    return fields;
  }, [form]);
  const canSave = isDirty && missing.length === 0;

  const statusLine = saving
    ? 'Adding to your roster…'
    : missing.length === 0
      ? 'Ready to add'
      : `Still needed: ${missing.join(', ')}`;

  const set = (patch: Partial<StaffFormState>) => setForm((current) => ({ ...current, ...patch }));

  return (
    <AdminFormSheet
      visible={visible}
      onClose={onClose}
      title="Add staff"
      subtitle="They can sign in with a one-time code sent to their email."
      isDirty={isDirty}
      saving={saving}
      canSave={canSave}
      saveLabel="Add staff"
      savingLabel="Adding…"
      saveIcon="person-add"
      statusLine={statusLine}
      notice={notice}
      onSave={() =>
        onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          roleTitle: form.roleTitle.trim(),
          portalRole: form.portalRole,
        })
      }>
      <GTextField
        label="First name"
        value={form.firstName}
        onChangeText={(firstName) => set({ firstName })}
        placeholder="First name"
        textContentType="givenName"
      />
      <GTextField
        label="Last name"
        value={form.lastName}
        onChangeText={(lastName) => set({ lastName })}
        placeholder="Last name"
        textContentType="familyName"
      />
      <GTextField
        label="Email"
        value={form.email}
        onChangeText={(email) => set({ email })}
        placeholder="name@school.org"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        helper="Their sign-in code goes here."
      />
      <GTextField
        label="Job title"
        value={form.roleTitle}
        onChangeText={(roleTitle) => set({ roleTitle })}
        placeholder="Lead Teacher"
      />
      <GChoiceChips<StaffPortalRole>
        label="Portal role"
        options={[
          { id: 'teacher', label: 'Teacher', icon: 'school-outline' },
          { id: 'staff', label: 'Staff', icon: 'briefcase-outline' },
        ]}
        value={form.portalRole}
        onChange={(portalRole) => set({ portalRole })}
      />
      <Text style={styles.note}>You can assign learners and classrooms after they&apos;re added.</Text>
    </AdminFormSheet>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
});
