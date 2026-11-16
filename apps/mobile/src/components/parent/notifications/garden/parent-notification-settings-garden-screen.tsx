import { StatusBar } from 'expo-status-bar';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GErrorCard } from '@/components/parent/garden/ui';
import {
  EmailEditorCard,
  LoginEmailRow,
  SendingToCard,
} from '@/components/parent/notifications/garden/notification-settings-sections';
import { ParentNotificationSettingsGardenSkeleton } from '@/components/parent/notifications/garden/parent-notification-settings-garden-skeleton';
import type { ParentNotificationSettingsController } from '@/components/parent/notifications/garden/use-parent-notification-settings-controller';
import { useParentNotificationSettingsFeedback } from '@/components/parent/notifications/garden/use-parent-notification-settings-feedback';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';

const SUBTITLE =
  'Choose where family emails go for applications, billing, messages, and other parent portal updates. This can differ from the email you use to sign in. School admin alerts are not affected.';

function Header({ onBack }: { onBack: () => void }) {
  return (
    <GBackHeader
      testID="parent-notification-settings-story-header"
      backLabel="More"
      backAccessibilityLabel="Back"
      onBack={onBack}
      title="Notification settings"
      accentWord="Notification"
      subtitle={SUBTITLE}
    />
  );
}

/**
 * Parent Notification settings in Garden: where family emails go, the login
 * email, and an inline editor with save / use defaults. Text fields live in
 * `ParentKeyboardAwareScrollView` (AGENTS.md keyboard layouts).
 */
export function ParentNotificationSettingsGardenScreen({
  controller,
}: {
  controller: ParentNotificationSettingsController;
}) {
  const accent = useGardenAccent();
  const feedback = useParentNotificationSettingsFeedback(controller);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Notification settings',
    id: 'notification-settings-refresh',
  });

  if (controller.isInitialLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentNotificationSettingsGardenSkeleton onBack={controller.onBack} />
      </>
    );
  }

  const { settings } = controller;

  if (!settings) {
    return (
      <View style={[styles.root, styles.errorRoot]} testID="parent-notification-settings-screen">
        <StatusBar style="dark" />
        <Header onBack={controller.onBack} />
        {controller.error ? (
          <GErrorCard
            title="We couldn't load your settings"
            message={`${controller.error} Check your connection, then try again.`}
            onRetry={controller.retry}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root} testID="parent-notification-settings-screen">
      <StatusBar style="dark" />
      <ParentKeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || controller.isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        <Header onBack={() => void feedback.onBack()} />

        <SendingToCard settings={settings} index={0} />
        <LoginEmailRow loginEmail={settings.loginEmail} index={1} />
        <EmailEditorCard
          index={2}
          emails={controller.emails}
          maxEmails={controller.maxEmails}
          editingIndex={controller.editingIndex}
          addingNew={controller.addingNew}
          newEmailDraft={controller.newEmailDraft}
          showFirstEmailInput={controller.showFirstEmailInput}
          canAddEmail={controller.canAddEmail}
          emailError={controller.emailError}
          saving={controller.saving}
          isDirty={controller.isDirty}
          showUseDefaults={settings.configuredEmails.length > 0}
          onEdit={feedback.onEdit}
          onRemove={(index) => void feedback.onRemove(index)}
          onChangeEmail={controller.changeEmail}
          onChangeDraft={controller.setNewEmailDraft}
          onAdd={feedback.onAdd}
          onSave={() => void feedback.onSave()}
          onUseDefaults={feedback.onUseDefaults}
        />
      </ParentKeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  errorRoot: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
});
