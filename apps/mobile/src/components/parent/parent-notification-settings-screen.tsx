import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { ParentNotificationSettingsSkeleton } from '@/components/parent/parent-notification-settings-skeleton';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import {
  getDisplayNotificationEmails,
  MAX_FAMILY_NOTIFICATION_EMAILS,
  normalizeNotificationEmails,
} from '@/lib/notifications/family-notification-email-constants';
import {
  fetchParentNotificationSettings,
  updateParentNotificationSettings,
  type ParentNotificationSettings,
} from '@/lib/parent/parent-portal-api';

function sourceLabel(source: string): string {
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

function resetEmailEditorState(
  configuredEmails: string[],
  loginEmail: string | null,
): {
  emails: string[];
  editingIndex: null;
  addingNew: boolean;
  newEmailDraft: string;
} {
  return {
    emails: getDisplayNotificationEmails(configuredEmails, loginEmail),
    editingIndex: null,
    addingNew: false,
    newEmailDraft: '',
  };
}

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

function InfoCard({ title, children }: InfoCardProps) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.card,
        adminCardShadow(theme),
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

type NotificationEmailRowProps = {
  email: string;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

function NotificationEmailRow({
  email,
  onEdit,
  onDelete,
  disabled = false,
}: NotificationEmailRowProps) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.emailRow,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}>
      <Ionicons name="mail-outline" size={18} color={theme.accent} style={styles.emailIcon} />
      <ThemedText
        type="small"
        numberOfLines={1}
        style={[styles.emailText, { color: theme.textPrimary }]}>
        {email}
      </ThemedText>
      {onEdit || onDelete ? (
        <View style={styles.emailActions}>
          {onEdit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit email"
              disabled={disabled}
              onPress={onEdit}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="pencil" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete email"
              disabled={disabled}
              onPress={onDelete}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type NotificationEmailInputProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function NotificationEmailInput({ value, disabled, onChange }: NotificationEmailInputProps) {
  const theme = useAdminTheme();

  return (
    <TextInput
      value={value}
      editable={!disabled}
      onChangeText={onChange}
      placeholder="name@example.com"
      placeholderTextColor={theme.textTertiary}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      style={[
        styles.emailInput,
        {
          borderColor: theme.inputBorder,
          backgroundColor: theme.input,
          color: theme.textPrimary,
          fontFamily: Fonts.body,
        },
      ]}
    />
  );
}

export function ParentNotificationSettingsScreen() {
  const router = useRouter();
  const theme = useAdminTheme();
  const { selectedSchool } = useAuth();
  const organizationId = selectedSchool?.id ?? '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ParentNotificationSettings | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newEmailDraft, setNewEmailDraft] = useState('');

  const applyConfiguredEmails = useCallback(
    (configuredEmails: string[], loginEmail: string | null) => {
      const next = resetEmailEditorState(configuredEmails, loginEmail);
      setEmails(next.emails);
      setEditingIndex(next.editingIndex);
      setAddingNew(next.addingNew);
      setNewEmailDraft(next.newEmailDraft);
    },
    [],
  );

  const loadSettings = useCallback(
    async (isRefresh = false) => {
      if (!organizationId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const payload = await fetchParentNotificationSettings(organizationId);
        setSettings(payload);
        applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load notification settings.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyConfiguredEmails, organizationId],
  );

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const showFirstEmailInput = emails.length === 0 && !addingNew;
  const canAddEmail =
    emails.length < MAX_FAMILY_NOTIFICATION_EMAILS && !addingNew && !showFirstEmailInput;

  const collectEmailsForSave = (): string[] => {
    const saved = emails.map((email) => email.trim()).filter(Boolean);
    const draft = newEmailDraft.trim();
    if ((addingNew || showFirstEmailInput) && draft) {
      return [...saved, draft];
    }
    return saved;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setAddingNew(false);
    setNewEmailDraft('');
  };

  const handleDelete = (index: number) => {
    Alert.alert('Remove email?', 'This address will be removed from your notification list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setEmails(emails.filter((_, i) => i !== index));
          if (editingIndex === index) {
            setEditingIndex(null);
          } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
          }
        },
      },
    ]);
  };

  const handleAdd = () => {
    setEditingIndex(null);
    setAddingNew(true);
    setNewEmailDraft('');
  };

  const handleSave = async () => {
    if (!organizationId) return;

    const emailsToSave = collectEmailsForSave();
    const normalized = normalizeNotificationEmails(emailsToSave);
    if (normalized.error) {
      Alert.alert('Invalid email', normalized.error);
      return;
    }

    setSaving(true);
    try {
      const payload = await updateParentNotificationSettings(organizationId, normalized.emails);
      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
    } catch (saveError) {
      Alert.alert(
        'Save failed',
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save notification settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Use default emails?',
      'Family notifications will go to your default login and guardian email addresses again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use defaults',
          onPress: () => void clearSettings(),
        },
      ],
    );
  };

  const clearSettings = async () => {
    if (!organizationId) return;

    applyConfiguredEmails([], settings?.loginEmail ?? null);
    setSaving(true);
    try {
      const payload = await updateParentNotificationSettings(organizationId, []);
      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
    } catch (clearError) {
      Alert.alert(
        'Could not reset',
        clearError instanceof Error
          ? clearError.message
          : 'Failed to clear notification settings.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border, backgroundColor: theme.surface },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.accent} />
          <ThemedText type="small" style={{ color: theme.accent }}>
            More
          </ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Notification settings
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {loading && !settings ? (
        <ParentNotificationSettingsSkeleton />
      ) : error && !settings ? (
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {error}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadSettings()}
            style={{ marginTop: Spacing.three }}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Try again
            </ThemedText>
          </Pressable>
        </View>
      ) : settings ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: PARENT_FLOATING_TAB_BAR_HEIGHT + Spacing.six },
            ]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadSettings(true)}
                tintColor={theme.accent}
              />
            }>
            <View style={styles.intro}>
              <ThemedText type="title" style={{ color: theme.textPrimary }}>
                Notification settings
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Choose where family emails go for applications, billing, messages, and other parent
                portal updates. This can differ from the email you use to sign in. School admin
                alerts are not affected.
              </ThemedText>
            </View>

            <InfoCard title="Login email">
              <ThemedText type="small" style={{ color: theme.textPrimary }}>
                {settings.loginEmail ?? '—'}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                Used for sign-in codes only.
              </ThemedText>
            </InfoCard>

            <InfoCard title="Currently sending to">
              {settings.effectiveEmails.length > 0 ? (
                <View style={styles.effectiveList}>
                  {settings.effectiveEmails.map((email, index) => (
                    <View key={`${email}-${index}`} style={styles.effectiveRow}>
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={theme.accent}
                        style={styles.effectiveIcon}
                      />
                      <View style={styles.effectiveText}>
                        <ThemedText type="small" style={{ color: theme.textPrimary }}>
                          {email}
                        </ThemedText>
                        {settings.sources[index] ? (
                          <ThemedText
                            type="small"
                            style={{ color: theme.textSecondary, marginTop: 2 }}>
                            {sourceLabel(settings.sources[index])}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  No email address on file yet.
                </ThemedText>
              )}
            </InfoCard>

            <InfoCard title="Notification emails">
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginBottom: Spacing.three }}>
                Add up to {MAX_FAMILY_NOTIFICATION_EMAILS} addresses for all family notifications.
                Your login email is included by default — remove it here if you prefer notifications
                elsewhere.
              </ThemedText>

              <View style={styles.emailList}>
                {emails.map((email, index) =>
                  editingIndex === index ? (
                    <NotificationEmailInput
                      key={`edit-${index}`}
                      value={email}
                      disabled={saving}
                      onChange={(value) => {
                        const next = [...emails];
                        next[index] = value;
                        setEmails(next);
                      }}
                    />
                  ) : (
                    <NotificationEmailRow
                      key={`${email}-${index}`}
                      email={email}
                      disabled={saving}
                      onEdit={() => handleEdit(index)}
                      onDelete={() => handleDelete(index)}
                    />
                  ),
                )}

                {showFirstEmailInput ? (
                  <NotificationEmailInput
                    value={newEmailDraft}
                    disabled={saving}
                    onChange={setNewEmailDraft}
                  />
                ) : null}

                {addingNew ? (
                  <NotificationEmailInput
                    value={newEmailDraft}
                    disabled={saving}
                    onChange={setNewEmailDraft}
                  />
                ) : null}
              </View>

              {canAddEmail ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={handleAdd}
                  style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}>
                  <Ionicons name="add" size={18} color={theme.accent} />
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    Add another email
                  </ThemedText>
                </Pressable>
              ) : null}

              <View style={styles.actions}>
                <PrimaryButton
                  label={saving ? 'Saving…' : 'Save'}
                  disabled={saving}
                  onPress={() => void handleSave()}
                  style={styles.saveButton}
                />
                {settings.configuredEmails.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={handleClear}
                    style={({ pressed }) => [
                      styles.defaultsButton,
                      { borderColor: theme.border, backgroundColor: theme.surface },
                      pressed && { opacity: 0.8 },
                    ]}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      Use defaults
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </InfoCard>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {saving ? (
        <View style={styles.savingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 80,
  },
  headerSpacer: {
    minWidth: 80,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  intro: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  effectiveList: {
    gap: Spacing.three,
  },
  effectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  effectiveIcon: {
    marginTop: 2,
    marginRight: Spacing.two,
  },
  effectiveText: {
    flex: 1,
  },
  emailList: {
    gap: Spacing.three,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  emailIcon: {
    marginRight: Spacing.two,
  },
  emailText: {
    flex: 1,
  },
  emailActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  actions: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  saveButton: {
    alignSelf: 'stretch',
  },
  defaultsButton: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 244, 0.5)',
  },
});
