import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
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
import { goBackOrReplace } from '@/lib/navigation';
import { parentTabRoute } from '@/lib/parent/parent-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export { MAX_FAMILY_NOTIFICATION_EMAILS };

/** Outcome of a save / reset, for the feedback layer (toasts + haptics). */
export type NotificationSettingsWriteResult =
  | { status: 'saved'; settings: ParentNotificationSettings }
  | { status: 'invalid'; message: string }
  | { status: 'failed'; message: string }
  | { status: 'skipped' };

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

/** Compare email lists ignoring case, surrounding spaces and empty entries. */
function sameList(a: string[], b: string[]): boolean {
  const clean = (list: string[]) =>
    list.map((email) => email.trim().toLowerCase()).filter(Boolean);
  const left = clean(a);
  const right = clean(b);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/**
 * Notification settings data + editor state (no UI). Same requests, editor
 * rules and `reportError` operation names as the Story screen; the Garden
 * screen and feedback hook only change how results are shown.
 */
export function useParentNotificationSettingsController() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const { selectedSchool } = useAuth();
  const organizationId = selectedSchool?.id ?? '';
  const { reportError } = useMobileErrorReporter(organizationId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ParentNotificationSettings | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [baselineEmails, setBaselineEmails] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newEmailDraft, setNewEmailDraftState] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const applyConfiguredEmails = useCallback(
    (configuredEmails: string[], loginEmail: string | null) => {
      const next = resetEmailEditorState(configuredEmails, loginEmail);
      setEmails(next.emails);
      setBaselineEmails(next.emails);
      setEditingIndex(next.editingIndex);
      setAddingNew(next.addingNew);
      setNewEmailDraftState(next.newEmailDraft);
      setEmailError(null);
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

  const collectEmailsForSave = useCallback((): string[] => {
    const saved = emails.map((email) => email.trim()).filter(Boolean);
    const draft = newEmailDraft.trim();
    if ((addingNew || showFirstEmailInput) && draft) {
      return [...saved, draft];
    }
    return saved;
  }, [addingNew, emails, newEmailDraft, showFirstEmailInput]);

  const isDirty = useMemo(
    () => settings !== null && !sameList(collectEmailsForSave(), baselineEmails),
    [baselineEmails, collectEmailsForSave, settings],
  );

  // The first screen in this stack can't pop; fall back to Home instead of a dead link.
  const onBack = useCallback(() => {
    if (slug) goBackOrReplace(router, parentTabRoute(slug, 'home'));
    else router.back();
  }, [router, slug]);

  const startEdit = useCallback((index: number) => {
    setEditingIndex(index);
    setAddingNew(false);
    setNewEmailDraftState('');
    setEmailError(null);
  }, []);

  /** Removes the row and shifts the edit index, like the Story screen did after its confirm. */
  const removeEmail = useCallback(
    (index: number) => {
      setEmails((current) => current.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
      setEmailError(null);
    },
    [editingIndex],
  );

  const startAdd = useCallback(() => {
    setEditingIndex(null);
    setAddingNew(true);
    setNewEmailDraftState('');
    setEmailError(null);
  }, []);

  const changeEmail = useCallback((index: number, value: string) => {
    setEmails((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setEmailError(null);
  }, []);

  const setNewEmailDraft = useCallback((value: string) => {
    setNewEmailDraftState(value);
    setEmailError(null);
  }, []);

  const save = useCallback(async (): Promise<NotificationSettingsWriteResult> => {
    if (!organizationId) return { status: 'skipped' };

    const emailsToSave = collectEmailsForSave();
    const normalized = normalizeNotificationEmails(emailsToSave);
    if (normalized.error) {
      setEmailError(normalized.error);
      return { status: 'invalid', message: normalized.error };
    }

    setSaving(true);
    try {
      const payload = await updateParentNotificationSettings(organizationId, normalized.emails);
      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
      return { status: 'saved', settings: payload };
    } catch (saveError) {
      reportError('parent_notification_settings_save', saveError);
      return {
        status: 'failed',
        message:
          saveError instanceof Error ? saveError.message : 'Failed to save notification settings.',
      };
    } finally {
      setSaving(false);
    }
  }, [applyConfiguredEmails, collectEmailsForSave, organizationId, reportError]);

  const clearSettings = useCallback(async (): Promise<NotificationSettingsWriteResult> => {
    if (!organizationId) return { status: 'skipped' };

    applyConfiguredEmails([], settings?.loginEmail ?? null);
    setSaving(true);
    try {
      const payload = await updateParentNotificationSettings(organizationId, []);
      setSettings(payload);
      applyConfiguredEmails(payload.configuredEmails, payload.loginEmail);
      return { status: 'saved', settings: payload };
    } catch (clearError) {
      reportError('parent_notification_settings_clear', clearError);
      return {
        status: 'failed',
        message:
          clearError instanceof Error
            ? clearError.message
            : 'Failed to clear notification settings.',
      };
    } finally {
      setSaving(false);
    }
  }, [applyConfiguredEmails, organizationId, reportError, settings?.loginEmail]);

  const refresh = useCallback(() => loadSettings(true), [loadSettings]);
  const retry = useCallback(() => void loadSettings(), [loadSettings]);

  return {
    organizationId,
    isInitialLoading: loading && !settings,
    isRefreshing: refreshing,
    saving,
    error,
    settings,
    emails,
    editingIndex,
    addingNew,
    newEmailDraft,
    emailError,
    showFirstEmailInput,
    canAddEmail,
    isDirty,
    maxEmails: MAX_FAMILY_NOTIFICATION_EMAILS,
    onBack,
    refresh,
    retry,
    startEdit,
    removeEmail,
    startAdd,
    changeEmail,
    setNewEmailDraft,
    save,
    clearSettings,
  };
}

export type ParentNotificationSettingsController = ReturnType<
  typeof useParentNotificationSettingsController
>;
