import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdminMessagesAudiencePicker, filterParentContactsForBroadcast } from '@/components/school-admin/messages/admin-messages-audience-picker';
import { AdminMessagesBroadcastCompose } from '@/components/school-admin/messages/admin-messages-broadcast-compose';
import { NewConversationContactsSkeleton } from '@/components/school-admin/messages/new-conversation-contacts-skeleton';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
import {
  ADMIN_BROADCAST_CONFIRM_THRESHOLD,
  BroadcastSendError,
  broadcastSendButtonLabel,
  continueRecipientsLabel,
  emptyAdminBroadcastAudience,
  formatBroadcastRecipientSummary,
  hasAdminBroadcastAudienceSelection,
  newBroadcastBatchId,
  type AdminBroadcastAudienceState,
  type AdminBroadcastOptionClassroom,
  type AdminBroadcastOptionProgram,
  type BroadcastFailure,
} from '@/lib/messages/admin-broadcast';
import {
  loadBroadcastOptions,
  previewBroadcastAudience,
  sendBroadcast,
} from '@/lib/messages/api';
import type { MessageContact, StagedMessageFile } from '@/lib/messages/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type Step = 'recipients' | 'compose';

type AdminMessagesBroadcastSheetProps = {
  visible: boolean;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  onClose: () => void;
  onSent: () => void;
};

export function AdminMessagesBroadcastSheet({
  visible,
  organizationId,
  organizationSlug,
  schoolName,
  contacts,
  loadingContacts = false,
  onClose,
  onSent,
}: AdminMessagesBroadcastSheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { keyboardOpen, scrollContentStyle: composeScrollContentStyle } =
    useBottomSheetKeyboardScrollStyle(styles.scrollContent);

  const [step, setStep] = useState<Step>('recipients');
  const [audience, setAudience] = useState<AdminBroadcastAudienceState>(
    emptyAdminBroadcastAudience(),
  );
  const [programs, setPrograms] = useState<AdminBroadcastOptionProgram[]>([]);
  const [classrooms, setClassrooms] = useState<AdminBroadcastOptionClassroom[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [previewRecipientNames, setPreviewRecipientNames] = useState<string[]>([]);
  const [previewExceedsLimit, setPreviewExceedsLimit] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [files, setFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const [sendFailures, setSendFailures] = useState<BroadcastFailure[]>([]);
  const [broadcastBatchId, setBroadcastBatchId] = useState<string | null>(null);

  const parentContacts = useMemo(
    () => filterParentContactsForBroadcast(contacts),
    [contacts],
  );

  const formattedRecipientNames = useMemo(
    () => formatBroadcastRecipientSummary(previewRecipientNames),
    [previewRecipientNames],
  );

  const resetState = useCallback(() => {
    setStep('recipients');
    setAudience(emptyAdminBroadcastAudience());
    setPreviewCount(0);
    setPreviewRecipientNames([]);
    setPreviewExceedsLimit(false);
    setPreviewLoading(false);
    setMessageBody('');
    setFiles([]);
    setSending(false);
    setSendFailures([]);
    setBroadcastBatchId(null);
  }, []);

  const handleClose = useCallback(() => {
    if (sending) return;
    resetState();
    onClose();
  }, [onClose, resetState, sending]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoadingOptions(true);

    void loadBroadcastOptions(organizationId)
      .then((data) => {
        if (cancelled) return;
        setPrograms(data.programs);
        setClassrooms(data.classrooms);
      })
      .catch((err) => {
        if (cancelled) return;
        reportError('school_admin_broadcast_options_load', err);
        Alert.alert('Could not load options', 'Failed to load bulk message options.');
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, reportError, visible]);

  useEffect(() => {
    if (!visible) return undefined;

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      setPreviewCount(0);
      setPreviewRecipientNames([]);
      setPreviewExceedsLimit(false);
      setPreviewLoading(false);
      return undefined;
    }

    let cancelled = false;
    setPreviewLoading(true);
    const timeout = setTimeout(() => {
      void previewBroadcastAudience(organizationId, audience)
        .then((data) => {
          if (cancelled) return;
          setPreviewCount(data.count);
          setPreviewRecipientNames(data.recipientNames);
          setPreviewExceedsLimit(data.exceedsLimit);
        })
        .catch((err) => {
          if (cancelled) return;
          reportError('school_admin_broadcast_preview', err);
          Alert.alert('Could not preview recipients', 'Failed to preview recipients.');
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [audience, organizationId, reportError, visible]);

  const canContinueRecipients =
    hasAdminBroadcastAudienceSelection(audience) &&
    previewCount > 0 &&
    !previewExceedsLimit &&
    !previewLoading;

  const canSend =
    Boolean(messageBody.trim() || files.length > 0) &&
    previewCount > 0 &&
    !previewExceedsLimit;

  const handleSend = async () => {
    if (!canSend || sending) return;

    const batchId = broadcastBatchId ?? newBroadcastBatchId();
    if (!broadcastBatchId) {
      setBroadcastBatchId(batchId);
    }

    setSending(true);
    setSendFailures([]);

    try {
      const result = await sendBroadcast({
        organizationId,
        organizationSlug,
        schoolName,
        body: messageBody.trim(),
        audience,
        broadcastBatchId: batchId,
        files,
      });

      if (result.failedCount > 0) {
        setSendFailures(result.failures);
        if (result.sentCount > 0) {
          Alert.alert(
            'Partially sent',
            `Sent to ${result.sentCount} parent${result.sentCount === 1 ? '' : 's'}. ${result.failedCount} could not be reached.`,
          );
          onSent();
        } else {
          Alert.alert('Unable to send', 'Unable to send messages to the selected parents.');
        }
        return;
      }

      Alert.alert(
        'Messages sent',
        `Sent to ${result.sentCount} parent${result.sentCount === 1 ? '' : 's'}.`,
      );
      onSent();
      handleClose();
    } catch (err) {
      if (err instanceof BroadcastSendError && err.failures.length > 0) {
        setSendFailures(err.failures);
      }
      reportError('school_admin_broadcast_send', err);
      Alert.alert(
        'Send failed',
        err instanceof Error ? err.message : 'Failed to send bulk messages.',
      );
    } finally {
      setSending(false);
    }
  };

  const sendButtonLabel = broadcastSendButtonLabel(previewCount, formattedRecipientNames);

  const handleComposeSendPress = () => {
    if (previewCount > ADMIN_BROADCAST_CONFIRM_THRESHOLD) {
      const title = formattedRecipientNames
        ? `Send bulk message to ${formattedRecipientNames}?`
        : `Send bulk message to ${previewCount} parents?`;
      Alert.alert(
        title,
        "MudKitchen will send this message individually to each parent's school office thread.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send messages', onPress: () => void handleSend() },
        ],
      );
      return;
    }
    void handleSend();
  };

  const recipientsLoading = loadingOptions || loadingContacts;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={handleClose}
      scrollable={step === 'compose'}
      keyboardAvoiding={step === 'compose'}
      keyboardShouldPersistTaps="handled"
      maxHeight="92%"
      bottomInset={insets.bottom + Spacing.two}
      backgroundColor={theme.white}
      borderColor={theme.line}
      handleColor={theme.line}
      header={
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={handleClose} disabled={sending} hitSlop={8}>
            <Text style={[styles.cancelLabel, { color: theme.primary }]}>Cancel</Text>
          </Pressable>
          <StoryDisplayHeading size="section" style={styles.headerTitle}>
            {step === 'recipients' ? 'Bulk message' : 'Write your message'}
          </StoryDisplayHeading>
          <View style={styles.headerSpacer} />
        </View>
      }
      footer={
        step === 'compose' && keyboardOpen ? undefined : (
        <View style={[styles.footer, { borderTopColor: theme.line }]}>
          {step === 'compose' ? (
            <StoryButton
              label="Back"
              variant="outline"
              disabled={sending}
              onPress={() => setStep('recipients')}
              style={styles.footerBack}
            />
          ) : null}
          {step === 'recipients' ? (
            <StoryButton
              label={continueRecipientsLabel(audience, previewCount, previewExceedsLimit)}
              disabled={!canContinueRecipients}
              onPress={() => setStep('compose')}
              trailingIcon={
                previewLoading && hasAdminBroadcastAudienceSelection(audience) ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : undefined
              }
              style={styles.footerPrimary}
            />
          ) : (
            <StoryButton
              label={sending ? 'Sending…' : sendButtonLabel}
              disabled={!canSend || sending}
              onPress={handleComposeSendPress}
              style={styles.footerPrimary}
            />
          )}
        </View>
        )
      }
      scrollContentStyle={
        step === 'compose' ? composeScrollContentStyle : styles.recipientsBody
      }>
      {step === 'recipients' ? (
        recipientsLoading ? (
          <NewConversationContactsSkeleton />
        ) : (
          <View style={styles.recipientsPickerWrap}>
            <AdminMessagesAudiencePicker
              theme={theme}
              audience={audience}
              onAudienceChange={setAudience}
              programs={programs}
              classrooms={classrooms}
              parentContacts={parentContacts}
            />
          </View>
        )
      ) : (
        <View style={styles.composeBody}>
          <View style={[styles.recipientSummary, { borderColor: theme.line, backgroundColor: '#F4F7F5' }]}>
            <Text style={[styles.recipientSummaryText, { color: theme.ink }]}>
              {formattedRecipientNames ? (
                <>
                  Sending individually to{' '}
                  <Text style={styles.recipientSummaryStrong}>{formattedRecipientNames}</Text>.
                </>
              ) : (
                <>
                  Sending individually to{' '}
                  <Text style={styles.recipientSummaryStrong}>{previewCount}</Text> parent
                  {previewCount === 1 ? '' : 's'}.
                </>
              )}
            </Text>
          </View>

          <AdminMessagesBroadcastCompose
            value={messageBody}
            onChange={setMessageBody}
            files={files}
            onFilesChange={setFiles}
            disabled={sending}
          />

          {sendFailures.length > 0 ? (
            <View style={[styles.failureBox, { borderColor: '#F5C2C7', backgroundColor: '#FFF5F5' }]}>
              <Text style={[styles.failureTitle, { color: theme.ink }]}>
                {sendFailures.length === 1
                  ? '1 parent could not be reached:'
                  : `${sendFailures.length} parents could not be reached:`}
              </Text>
              {sendFailures.map((failure) => (
                <Text key={failure.guardianId} style={[styles.failureItem, { color: theme.ink }]}>
                  <Text style={styles.failureName}>{failure.name}</Text>
                  {failure.error ? ` — ${failure.error}` : null}
                </Text>
              ))}
              <Text style={[styles.failureHint, { color: theme.muted }]}>
                Fix any issues, then send again. Parents who already received this message will not
                get a duplicate.
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 52,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
  },
  recipientsBody: {
    flex: 1,
    minHeight: 0,
    paddingBottom: 0,
  },
  recipientsPickerWrap: {
    flex: 1,
    minHeight: 0,
  },
  composeBody: {
    gap: Spacing.four,
  },
  recipientSummary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  recipientSummaryText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  recipientSummaryStrong: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
  failureBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  failureTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  failureItem: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  failureName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
  },
  failureHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBack: {
    flex: 0,
    minWidth: 88,
  },
  footerPrimary: {
    flex: 1,
  },
});
