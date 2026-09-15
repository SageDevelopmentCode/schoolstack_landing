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
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PARENT_FLOATING_TAB_BAR_HEIGHT } from '@/components/parent/parent-floating-tab-bar';
import { ParentNotificationSettingsSkeleton } from '@/components/parent/parent-notification-settings-skeleton';
import { ParentNotificationSettingsStoryHeader } from '@/components/parent/notifications/parent-notification-settings-story-header';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryTextField } from '@/components/story/story-text-field';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Story, StoryCardPadding, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
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
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

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

type SettingsCardProps = {
  title: string;
  children: ReactNode;
  compact?: boolean;
};

function SettingsCard({ title, children, compact = false }: SettingsCardProps) {
  return (
    <StoryCard compact={compact} style={styles.card}>
      <StoryDisplayHeading size="section" style={styles.cardTitle}>
        {title}
      </StoryDisplayHeading>
      {children}
    </StoryCard>
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
  const theme = useParentTheme();

  return (
    <View style={[styles.emailRow, { borderColor: Story.line, backgroundColor: Story.white }]}>
      <Ionicons name="mail-outline" size={18} color={theme.primary} style={styles.emailIcon} />
      <Text numberOfLines={1} style={[styles.emailText, { color: theme.ink }]}>
        {email}
      </Text>
      {onEdit || onDelete ? (
        <View style={styles.emailActions}>
          {onEdit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit email"
              disabled={disabled}
              onPress={onEdit}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="pencil" size={18} color={theme.muted} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete email"
              disabled={disabled}
              onPress={onDelete}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="trash-outline" size={18} color={theme.muted} />
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
  return (
    <StoryTextField
      value={value}
      editable={!disabled}
      onChangeText={onChange}
      placeholder="name@example.com"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      style={styles.emailInput}
    />
  );
}

export function ParentNotificationSettingsScreen() {
  const router = useRouter();
  const theme = useParentTheme();
  const { selectedSchool } = useAuth();
  const organizationId = selectedSchool?.id ?? '';
  const { reportError } = useMobileErrorReporter(organizationId);

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
        reportError('parent_notification_settings_load', loadError);
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
    [applyConfiguredEmails, organizationId, reportError],
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
      reportError('parent_notification_settings_save', saveError);
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
      reportError('parent_notification_settings_clear', clearError);
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

  if (loading && !settings) {
    return (
      <View style={styles.container}>
        <ParentNotificationSettingsSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && !settings ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
          <StoryTextLink label="Try again" onPress={() => void loadSettings()} />
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
                tintColor={theme.primary}
              />
            }>
            <View style={styles.headerBlock}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
                <Ionicons name="chevron-back" size={20} color={theme.primary} />
                <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
              </Pressable>

              <Animated.View entering={FadeInDown.duration(350)}>
                <ParentNotificationSettingsStoryHeader />
              </Animated.View>
            </View>

            <View style={styles.infoCards}>
              <SettingsCard title="Login email" compact>
                <Text style={[styles.bodyText, { color: theme.ink }]}>
                  {settings.loginEmail ?? '—'}
                </Text>
                <Text style={[styles.captionText, { color: theme.muted }]}>
                  Used for sign-in codes only.
                </Text>
              </SettingsCard>

              <SettingsCard title="Currently sending to" compact>
                {settings.effectiveEmails.length > 0 ? (
                  <View style={styles.effectiveList}>
                    {settings.effectiveEmails.map((email, index) => (
                      <View key={`${email}-${index}`} style={styles.effectiveRow}>
                        <Ionicons
                          name="mail-outline"
                          size={16}
                          color={theme.primary}
                          style={styles.effectiveIcon}
                        />
                        <View style={styles.effectiveText}>
                          <Text style={[styles.bodyText, { color: theme.ink }]}>{email}</Text>
                          {settings.sources[index] ? (
                            <StoryChip
                              tone="info"
                              label={sourceLabel(settings.sources[index])}
                              style={styles.sourceChip}
                            />
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.bodyText, { color: theme.muted }]}>
                    No email address on file yet.
                  </Text>
                )}
              </SettingsCard>
            </View>

            <SettingsCard title="Notification emails">
              <Text style={[styles.bodyText, { color: theme.muted, marginBottom: Spacing.three }]}>
                Add up to {MAX_FAMILY_NOTIFICATION_EMAILS} addresses for all family notifications.
                Your login email is included by default — remove it here if you prefer notifications
                elsewhere.
              </Text>

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
                  <Ionicons name="add" size={18} color={theme.primary} />
                  <Text style={[styles.addLabel, { color: theme.primary }]}>Add another email</Text>
                </Pressable>
              ) : null}

              <View style={styles.actions}>
                <StoryButton
                  label={saving ? 'Saving…' : 'Save'}
                  disabled={saving}
                  onPress={() => void handleSave()}
                />
                {settings.configuredEmails.length > 0 ? (
                  <StoryButton
                    label="Use defaults"
                    variant="outline"
                    disabled={saving}
                    onPress={handleClear}
                    style={styles.defaultsButton}
                  />
                ) : null}
              </View>
            </SettingsCard>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {saving ? (
        <View style={styles.savingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  flex: {
    flex: 1,
  },
  headerBlock: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.four,
  },
  infoCards: {
    gap: Spacing.four,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: Spacing.one,
  },
  bodyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
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
    gap: Spacing.one,
  },
  sourceChip: {
    marginTop: 2,
  },
  emailList: {
    gap: Spacing.three,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: StoryRadius.input,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  emailIcon: {
    marginRight: Spacing.two,
  },
  emailText: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
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
    minHeight: 48,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  addLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  defaultsButton: {
    alignSelf: 'flex-start',
    width: 'auto',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 248, 243, 0.72)',
  },
});
