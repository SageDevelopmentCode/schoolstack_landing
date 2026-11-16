import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GIcon,
  GKicker,
  GLink,
  GOutlineButton,
  GPressable,
  GToyButton,
  gText,
} from '@/components/parent/garden/ui';
import type { ParentNotificationSettings } from '@/lib/parent/parent-portal-api';

export function sourceLabel(source: string): string {
  switch (source) {
    case 'configured':
      return 'Notification settings';
    case 'guardian_email':
      return 'Guardian contact email';
    case 'primary_email':
      return 'Family primary email';
    case 'auth_email':
      return 'Login email';
    default:
      return source;
  }
}

/* ------------------------------------------------------------------ */
/* Currently sending to                                                */
/* ------------------------------------------------------------------ */

export function SendingToCard({
  settings,
  index,
}: {
  settings: ParentNotificationSettings;
  index: number;
}) {
  return (
    <GCard title="Currently sending to" index={index}>
      {settings.effectiveEmails.length > 0 ? (
        <View style={styles.list}>
          {settings.effectiveEmails.map((email, i) => (
            <View
              key={`${email}-${i}`}
              style={styles.sendingRow}
              accessible
              accessibilityLabel={
                settings.sources[i] ? `${email}, ${sourceLabel(settings.sources[i])}` : email
              }>
              <GIcon name="mail-outline" size="sm" bg={Garden.sky} />
              <View style={styles.sendingCopy}>
                <Text style={gText.itemTitle} numberOfLines={1}>
                  {email}
                </Text>
                {settings.sources[i] ? (
                  <GChip
                    tone="info"
                    label={sourceLabel(settings.sources[i])}
                    style={styles.sourceChip}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={gText.meta}>No email address on file yet.</Text>
      )}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Login email                                                         */
/* ------------------------------------------------------------------ */

export function LoginEmailRow({ loginEmail, index }: { loginEmail: string | null; index: number }) {
  return (
    <GCard tone="paper" index={index}>
      <View
        style={styles.loginRow}
        accessible
        accessibilityLabel={`Login email, ${loginEmail ?? 'none'}. Used for sign-in codes only.`}>
        <GIcon name="lock-closed-outline" size="sm" bg={Garden.lav} />
        <View style={styles.sendingCopy}>
          <GKicker>Login email</GKicker>
          <Text style={gText.itemTitle} numberOfLines={1}>
            {loginEmail ?? '—'}
          </Text>
          <Text style={gText.meta}>Used for sign-in codes only.</Text>
        </View>
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function EmailRow({
  email,
  disabled,
  onEdit,
  onRemove,
}: {
  email: string;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.emailRow}>
      <Ionicons name="mail-outline" size={18} color={Garden.soft} />
      <Text style={[gText.body, styles.emailText]} numberOfLines={1}>
        {email}
      </Text>
      <GPressable
        accessibilityLabel={`Edit ${email}`}
        disabled={disabled}
        onPress={onEdit}
        style={styles.iconButton}>
        <Ionicons name="pencil" size={18} color={Garden.ink} />
      </GPressable>
      <GPressable
        accessibilityLabel={`Remove ${email}`}
        disabled={disabled}
        onPress={onRemove}
        style={styles.iconButton}>
        <Ionicons name="trash-outline" size={18} color={Garden.ink} />
      </GPressable>
    </View>
  );
}

function EmailInput({
  label,
  value,
  disabled,
  error,
  autoFocus,
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  disabled: boolean;
  error: string | null;
  autoFocus: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <GTextField
      label={label}
      value={value}
      disabled={disabled}
      error={error}
      autoFocus={autoFocus}
      onChangeText={onChange}
      onSubmitEditing={onSubmit}
      returnKeyType="done"
      placeholder="name@example.com"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      textContentType="emailAddress"
    />
  );
}

export function EmailEditorCard({
  index,
  emails,
  maxEmails,
  editingIndex,
  addingNew,
  newEmailDraft,
  showFirstEmailInput,
  canAddEmail,
  emailError,
  saving,
  isDirty,
  showUseDefaults,
  onEdit,
  onRemove,
  onChangeEmail,
  onChangeDraft,
  onAdd,
  onSave,
  onUseDefaults,
}: {
  index: number;
  emails: string[];
  maxEmails: number;
  editingIndex: number | null;
  addingNew: boolean;
  newEmailDraft: string;
  showFirstEmailInput: boolean;
  canAddEmail: boolean;
  emailError: string | null;
  saving: boolean;
  isDirty: boolean;
  showUseDefaults: boolean;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onChangeEmail: (index: number, value: string) => void;
  onChangeDraft: (value: string) => void;
  onAdd: () => void;
  onSave: () => void;
  onUseDefaults: () => void;
}) {
  const draftActive = showFirstEmailInput || addingNew;
  // The inline error sits on the field being typed in; otherwise under the list.
  const errorOnField = editingIndex !== null || draftActive;
  const count = emails.length + (draftActive && newEmailDraft.trim() ? 1 : 0);

  return (
    <GCard
      title="Notification emails"
      action={<GChip tone="neutral" label={`${count} of ${maxEmails}`} />}
      index={index}>
      <Text style={[gText.meta, styles.explainer]}>
        Add up to {maxEmails} addresses for all family notifications. Your login email is
        included by default — remove it here if you prefer notifications elsewhere.
      </Text>

      <View style={styles.list}>
        {emails.map((email, i) =>
          editingIndex === i ? (
            <EmailInput
              key={`edit-${i}`}
              label={`Email ${i + 1}`}
              value={email}
              disabled={saving}
              error={emailError}
              autoFocus
              onChange={(value) => onChangeEmail(i, value)}
              onSubmit={onSave}
            />
          ) : (
            <EmailRow
              key={`${email}-${i}`}
              email={email}
              disabled={saving}
              onEdit={() => onEdit(i)}
              onRemove={() => onRemove(i)}
            />
          ),
        )}

        {draftActive ? (
          <EmailInput
            label={showFirstEmailInput ? 'Email address' : 'New email'}
            value={newEmailDraft}
            disabled={saving}
            error={editingIndex === null ? emailError : null}
            autoFocus={addingNew}
            onChange={onChangeDraft}
            onSubmit={onSave}
          />
        ) : null}

        {emailError && !errorOnField ? (
          <View style={styles.errorRow} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Ionicons name="alert-circle" size={14} color="#7E4533" />
            <Text style={styles.errorText}>{emailError}</Text>
          </View>
        ) : null}
      </View>

      {canAddEmail ? (
        <GOutlineButton
          label="Add another email"
          icon="add"
          onPress={onAdd}
          style={styles.addButton}
        />
      ) : null}

      <View style={styles.saveRow}>
        <GToyButton
          label="Save"
          icon="checkmark"
          size="md"
          loading={saving}
          onPress={onSave}
          accessibilityLabel={saving ? 'Saving notification emails' : 'Save notification emails'}
        />
        {isDirty ? <GChip tone="warning" icon="ellipse" label="Unsaved changes" /> : null}
      </View>

      {showUseDefaults ? (
        <GLink
          label="Use defaults"
          icon="refresh"
          accessibilityLabel="Use default notification emails"
          onPress={onUseDefaults}
          style={styles.defaultsLink}
        />
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  sendingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sendingCopy: { flex: 1, gap: 4 },
  sourceChip: { alignSelf: 'flex-start' },
  loginRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  explainer: { marginBottom: 14 },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.paper,
  },
  emailText: { flex: 1 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: '#7E4533', flex: 1 },
  addButton: { alignSelf: 'flex-start', marginTop: 14 },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  defaultsLink: { alignSelf: 'flex-start', marginTop: 14, minHeight: 36 },
});
