import { useCallback } from 'react';
import { Alert } from 'react-native';

import { confirmDestructive } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import type { ParentNotificationSettingsController } from '@/components/parent/notifications/garden/use-parent-notification-settings-controller';
import { haptic } from '@/lib/haptics';

const SAVE_TOAST_ID = 'notification-settings-save';

function describeRecipients(emails: string[]): string | undefined {
  if (emails.length === 0) return undefined;
  return `Family notifications will go to ${emails.join(', ')}.`;
}

/**
 * Wraps the controller's actions with Garden feedback (skill §6): confirms,
 * toasts and haptics. Never changes what is saved or reported.
 */
export function useParentNotificationSettingsFeedback(
  controller: ParentNotificationSettingsController,
) {
  const toast = useGardenToast();
  const {
    saving,
    save,
    clearSettings,
    removeEmail,
    startEdit,
    startAdd,
    isDirty,
    onBack: onBackNow,
  } = controller;

  const onSave = useCallback(async () => {
    if (saving) return;
    const result = await save();
    switch (result.status) {
      case 'saved':
        toast.success('Notification emails saved', {
          id: SAVE_TOAST_ID,
          description: describeRecipients(result.settings.effectiveEmails),
        });
        break;
      case 'invalid':
        haptic.error();
        break;
      case 'failed':
        toast.error("Couldn't save your emails", {
          id: SAVE_TOAST_ID,
          description: result.message,
          action: { label: 'Try again', onPress: () => void onSave() },
        });
        break;
      case 'skipped':
        break;
    }
  }, [save, saving, toast]);

  const resetToDefaults = useCallback(async () => {
    const result = await clearSettings();
    if (result.status === 'saved') {
      toast.success('Back to your default emails', {
        id: SAVE_TOAST_ID,
        description: describeRecipients(result.settings.effectiveEmails),
      });
    } else if (result.status === 'failed') {
      toast.error("Couldn't reset your emails", {
        id: SAVE_TOAST_ID,
        description: result.message,
        action: { label: 'Try again', onPress: () => void resetToDefaults() },
      });
    }
  }, [clearSettings, toast]);

  const onUseDefaults = useCallback(() => {
    if (saving) return;
    Alert.alert(
      'Use default emails?',
      'Family notifications will go to your default login and guardian email addresses again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use defaults', onPress: () => void resetToDefaults() },
      ],
    );
  }, [resetToDefaults, saving]);

  const onRemove = useCallback(
    async (index: number) => {
      if (saving) return;
      const confirmed = await confirmDestructive({
        title: 'Remove email?',
        message: 'This address will be removed from your notification list.',
        confirmLabel: 'Remove',
      });
      if (confirmed) removeEmail(index);
    },
    [removeEmail, saving],
  );

  const onEdit = useCallback(
    (index: number) => {
      if (saving) return;
      startEdit(index);
    },
    [saving, startEdit],
  );

  const onAdd = useCallback(() => {
    if (saving) return;
    startAdd();
  }, [saving, startAdd]);

  // Ask before leaving with unsaved edits, but only from this screen's own back
  // link. Intercepting navigation (`beforeRemove`) also caught tab switches and,
  // after a native swipe-back, left a stale screen that blocked every tab.
  const onBack = useCallback(async () => {
    if (!isDirty) {
      onBackNow();
      return;
    }
    const discard = await confirmDestructive({
      title: 'Discard unsaved changes?',
      message: "Your notification email changes haven't been saved.",
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
    });
    if (discard) onBackNow();
  }, [isDirty, onBackNow]);

  return { onSave, onUseDefaults, onRemove, onEdit, onAdd, onBack };
}
