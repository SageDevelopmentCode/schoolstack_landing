import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GLink, GOutlineButton, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import {
  AdminBroadcastAudience,
  parentContactsForBroadcast,
} from '@/components/school-admin/messages/garden/admin-broadcast-audience';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
import { haptic } from '@/lib/haptics';
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
import { loadBroadcastOptions, previewBroadcastAudience, sendBroadcast } from '@/lib/messages/api';
import { MAX_MESSAGE_ATTACHMENTS } from '@/lib/messages/constants';
import {
  appendStagedMessageFiles,
  pickDocumentsFromLibrary,
  pickPhotosFromLibrary,
  promptMessageAttachmentSource,
  remainingAttachmentSlots,
} from '@/lib/messages/pick-message-attachments';
import type { MessageContact, StagedMessageFile } from '@/lib/messages/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type Step = 'recipients' | 'compose';
type Notice = { tone: 'error' | 'warning' | 'info'; title: string; description?: string; retry?: () => void };

export type BroadcastSentResult = { sentCount: number; complete: boolean };

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/** 1 Choose recipients → 2 Write & send. */
function StepPills({ step }: { step: Step }) {
  const accent = useGardenAccent();
  const items: { id: Step; label: string }[] = [
    { id: 'recipients', label: 'Choose recipients' },
    { id: 'compose', label: 'Write & send' },
  ];
  const at = items.findIndex((item) => item.id === step);
  return (
    <View
      accessible
      accessibilityLabel={`Step ${at + 1} of 2: ${items[at].label}`}
      style={styles.steps}>
      {items.map((item, index) => {
        const active = index === at;
        const done = index < at;
        return (
          <View key={item.id} style={styles.stepWrap}>
            {index > 0 ? <Ionicons name="arrow-forward" size={13} color={Garden.ink25} /> : null}
            <View
              style={[
                styles.step,
                active ? { backgroundColor: accent.clay } : done ? styles.stepDone : styles.stepTodo,
              ]}>
              <View style={[styles.stepDot, active ? styles.stepDotActive : done ? styles.stepDotDone : null]}>
                {done ? (
                  <Ionicons name="checkmark" size={11} color={Garden.white} />
                ) : (
                  <Text style={[styles.stepNumber, active && { color: accent.clayDeep }]}>{index + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{item.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Garden bulk message sheet. Same flow and calls as the Story
 * `AdminMessagesBroadcastSheet` (options load, 250ms debounced preview, the
 * 200 limit, a stable `broadcastBatchId` so retries never double-send, the >10
 * confirm) and the same keyboard path. Every former `Alert` is an in-sheet
 * banner with Try again (toasts sit behind modals); a full send closes the
 * sheet and the inbox confirms it.
 */
export function AdminBroadcastSheet({
  visible,
  organizationId,
  organizationSlug,
  schoolName,
  contacts,
  loadingContacts = false,
  onClose,
  onSent,
}: {
  visible: boolean;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  onClose: () => void;
  onSent: (result: BroadcastSentResult) => void;
}) {
  const accent = useGardenAccent();
  const insets = useSafeAreaInsets();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { keyboardOpen, scrollContentStyle: composeScrollContentStyle } = useBottomSheetKeyboardScrollStyle(
    styles.scrollContent,
  );

  const [step, setStep] = useState<Step>('recipients');
  const [audience, setAudience] = useState<AdminBroadcastAudienceState>(emptyAdminBroadcastAudience());
  const [programs, setPrograms] = useState<AdminBroadcastOptionProgram[]>([]);
  const [classrooms, setClassrooms] = useState<AdminBroadcastOptionClassroom[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsNonce, setOptionsNonce] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  const [previewRecipientNames, setPreviewRecipientNames] = useState<string[]>([]);
  const [previewExceedsLimit, setPreviewExceedsLimit] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [messageBody, setMessageBody] = useState('');
  const [files, setFiles] = useState<StagedMessageFile[]>([]);
  const [sending, setSending] = useState(false);
  const [sendFailures, setSendFailures] = useState<BroadcastFailure[]>([]);
  const [broadcastBatchId, setBroadcastBatchId] = useState<string | null>(null);
  const [recipientsNotice, setRecipientsNotice] = useState<Notice | null>(null);
  const [composeNotice, setComposeNotice] = useState<Notice | null>(null);

  const parentContacts = useMemo(() => parentContactsForBroadcast(contacts), [contacts]);
  const formattedRecipientNames = useMemo(
    () => formatBroadcastRecipientSummary(previewRecipientNames),
    [previewRecipientNames],
  );
  const hasSelection = hasAdminBroadcastAudienceSelection(audience);

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
    setRecipientsNotice(null);
    setComposeNotice(null);
  }, []);

  const handleClose = useCallback(() => {
    if (sending) return;
    resetState();
    onClose();
  }, [onClose, resetState, sending]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoadingOptions(true);
    });
    void loadBroadcastOptions(organizationId)
      .then((data) => {
        if (cancelled) return;
        setPrograms(data.programs);
        setClassrooms(data.classrooms);
        setRecipientsNotice((current) => (current?.title === "Couldn't load bulk message options" ? null : current));
      })
      .catch((err) => {
        if (cancelled) return;
        reportError('school_admin_broadcast_options_load', err);
        haptic.error();
        setRecipientsNotice({
          tone: 'error',
          title: "Couldn't load bulk message options",
          description: 'Failed to load bulk message options. You can still pick individual parents.',
          retry: () => setOptionsNonce((n) => n + 1),
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [optionsNonce, organizationId, reportError, visible]);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      queueMicrotask(() => {
        if (cancelled) return;
        setPreviewCount(0);
        setPreviewRecipientNames([]);
        setPreviewExceedsLimit(false);
        setPreviewLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) setPreviewLoading(true);
    });
    const timeout = setTimeout(() => {
      void previewBroadcastAudience(organizationId, audience)
        .then((data) => {
          if (cancelled) return;
          setPreviewCount(data.count);
          setPreviewRecipientNames(data.recipientNames);
          setPreviewExceedsLimit(data.exceedsLimit);
          setRecipientsNotice((current) => (current?.title === "Couldn't preview recipients" ? null : current));
        })
        .catch((err) => {
          if (cancelled) return;
          reportError('school_admin_broadcast_preview', err);
          haptic.error();
          setRecipientsNotice({
            tone: 'error',
            title: "Couldn't preview recipients",
            description: 'Failed to preview recipients. Your selection is kept.',
            retry: () => setPreviewNonce((n) => n + 1),
          });
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [audience, organizationId, previewNonce, reportError, visible]);

  const canContinueRecipients = hasSelection && previewCount > 0 && !previewExceedsLimit && !previewLoading;
  const canSend = Boolean(messageBody.trim() || files.length > 0) && previewCount > 0 && !previewExceedsLimit;

  const handleSend = async () => {
    if (!canSend || sending) return;
    const batchId = broadcastBatchId ?? newBroadcastBatchId();
    if (!broadcastBatchId) setBroadcastBatchId(batchId);

    setSending(true);
    setSendFailures([]);
    setComposeNotice(null);

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
        haptic.warning();
        if (result.sentCount > 0) {
          setComposeNotice({
            tone: 'warning',
            title: 'Partially sent',
            description: `Sent to ${plural(result.sentCount, 'parent')}. ${result.failedCount} could not be reached.`,
          });
          onSent({ sentCount: result.sentCount, complete: false });
        } else {
          setComposeNotice({
            tone: 'error',
            title: 'Unable to send',
            description: 'Unable to send messages to the selected parents.',
          });
        }
        return;
      }

      haptic.success();
      onSent({ sentCount: result.sentCount, complete: true });
      resetState();
      onClose();
    } catch (err) {
      if (err instanceof BroadcastSendError && err.failures.length > 0) {
        setSendFailures(err.failures);
      }
      reportError('school_admin_broadcast_send', err);
      haptic.error();
      setComposeNotice({
        tone: 'error',
        title: 'Send failed',
        description: `${err instanceof Error ? err.message : 'Failed to send bulk messages.'} Parents who already got it won't get it twice.`,
        retry: () => void handleSend(),
      });
    } finally {
      setSending(false);
    }
  };

  const sendButtonLabel = broadcastSendButtonLabel(previewCount, formattedRecipientNames);

  const handleComposeSendPress = () => {
    if (previewCount > ADMIN_BROADCAST_CONFIRM_THRESHOLD) {
      haptic.warning();
      const title = formattedRecipientNames
        ? `Send bulk message to ${formattedRecipientNames}?`
        : `Send bulk message to ${previewCount} parents?`;
      Alert.alert(title, "MudKitchen will send this message individually to each parent's school office thread.", [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send messages', onPress: () => void handleSend() },
      ]);
      return;
    }
    void handleSend();
  };

  const onFilesPicked = (picked: StagedMessageFile[]) => {
    haptic.success();
    setFiles((current) => appendStagedMessageFiles(current, picked));
  };

  const handlePickAttachment = () => {
    if (sending || files.length >= MAX_MESSAGE_ATTACHMENTS) return;
    promptMessageAttachmentSource(async (source) => {
      const slots = remainingAttachmentSlots(files.length);
      if (slots <= 0) return;
      const picked = source === 'photos' ? await pickPhotosFromLibrary(slots) : await pickDocumentsFromLibrary(slots);
      if (picked.length === 0) return;
      onFilesPicked(picked);
    });
  };

  const recipientsLoading = loadingOptions || loadingContacts;

  const reachChip = !hasSelection ? null : previewLoading ? (
    <View style={styles.reach}>
      <ActivityIndicator size="small" color={accent.clayDeep} />
      <Text style={[styles.reachText, { color: accent.clayDeep }]}>Counting…</Text>
    </View>
  ) : previewExceedsLimit ? (
    <GChip label={`${previewCount} · over 200`} tone="alert" icon="alert-circle" />
  ) : (
    <GChip label={`Reaches ${plural(previewCount, 'parent')}`} tone={previewCount > 0 ? 'success' : 'neutral'} icon="people" />
  );

  const banner = (notice: Notice | null) =>
    notice ? (
      <GInlineBanner
        tone={notice.tone}
        title={notice.title}
        description={notice.description}
        action={notice.retry ? <GLink label="Try again" icon="refresh" onPress={notice.retry} /> : undefined}
      />
    ) : null;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={handleClose}
      accessibilityLabel="Close bulk message"
      scrollable={step === 'compose'}
      keyboardAvoiding={step === 'compose'}
      keyboardShouldPersistTaps="handled"
      maxHeight="92%"
      bottomInset={insets.bottom + 8}
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      enableDragToDismiss={!sending}
      header={
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text accessibilityRole="header" style={styles.title}>
              {step === 'recipients' ? 'Bulk message' : 'Write your message'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              disabled={sending}
              hitSlop={8}
              onPress={() => {
                haptic.tap();
                handleClose();
              }}
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed, sending && styles.dim]}>
              <Text style={[styles.cancelLabel, { color: accent.clayDeep }]}>Cancel</Text>
            </Pressable>
          </View>
          <StepPills step={step} />
        </View>
      }
      footer={
        step === 'compose' && keyboardOpen ? undefined : (
          <View style={styles.footer}>
            {step === 'recipients' ? (
              <>
                <View style={styles.footerStatus}>
                  {reachChip ?? <Text style={styles.footerHint}>Pick a program, class, grade or parents.</Text>}
                </View>
                <GToyButton
                  label={continueRecipientsLabel(audience, previewCount, previewExceedsLimit)}
                  size="md"
                  fullWidth
                  loading={previewLoading && hasSelection}
                  disabled={!canContinueRecipients}
                  onPress={() => {
                    haptic.select();
                    setStep('compose');
                  }}
                />
              </>
            ) : (
              <View style={styles.footerRow}>
                <GOutlineButton
                  label="Back"
                  icon="arrow-back"
                  onPress={() => {
                    if (sending) return;
                    haptic.select();
                    setStep('recipients');
                  }}
                />
                <GToyButton
                  label={sending ? 'Sending…' : sendButtonLabel}
                  icon="send"
                  size="md"
                  loading={sending}
                  disabled={!canSend}
                  onPress={handleComposeSendPress}
                  style={styles.footerPrimary}
                  fullWidth
                />
              </View>
            )}
          </View>
        )
      }
      scrollContentStyle={step === 'compose' ? composeScrollContentStyle : styles.recipientsBody}>
      {step === 'recipients' ? (
        recipientsLoading ? (
          <View style={styles.skeletons} accessibilityLabel="Loading recipients">
            <GSkeleton style={styles.skLabel} />
            <GSkeleton style={styles.skChips} />
            <GSkeleton style={styles.skLabel} />
            <GSkeleton style={styles.skChips} />
            {[0, 1, 2].map((i) => (
              <GSkeleton key={i} style={styles.skRow} />
            ))}
          </View>
        ) : (
          <AdminBroadcastAudience
            audience={audience}
            onAudienceChange={setAudience}
            programs={programs}
            classrooms={classrooms}
            parentContacts={parentContacts}
            header={banner(recipientsNotice)}
          />
        )
      ) : (
        <View style={styles.composeBody}>
          <View style={styles.summary}>
            <Ionicons name="people-outline" size={18} color={Garden.forest} />
            <Text style={styles.summaryText}>
              Sending individually to{' '}
              <Text style={styles.summaryStrong}>
                {formattedRecipientNames || plural(previewCount, 'parent')}
              </Text>
              .
            </Text>
          </View>

          {banner(composeNotice)}

          {files.length > 0 ? (
            <View style={styles.fileChips}>
              {files.map((file, index) => (
                <View key={`${file.uri}-${index}`} style={styles.fileChip}>
                  <Ionicons name="document-attach-outline" size={14} color={Garden.ink65} />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${file.name}`}
                    disabled={sending}
                    onPress={() => {
                      haptic.select();
                      setFiles((current) => current.filter((_, i) => i !== index));
                    }}
                    hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={Garden.ink60} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <TextInput
            value={messageBody}
            onChangeText={setMessageBody}
            placeholder="Write a message to send to each parent individually…"
            placeholderTextColor={Garden.ink60}
            accessibilityLabel="Message to parents"
            multiline
            editable={!sending}
            textAlignVertical="top"
            style={styles.textArea}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach photo or file"
            disabled={sending || files.length >= MAX_MESSAGE_ATTACHMENTS}
            onPress={handlePickAttachment}
            style={({ pressed }) => [styles.attach, pressed && styles.pressed, files.length >= MAX_MESSAGE_ATTACHMENTS && styles.dim]}>
            <Ionicons name="attach" size={20} color={Garden.ink65} />
            <Text style={styles.attachLabel}>
              Add attachment{files.length > 0 ? ` · ${files.length}/${MAX_MESSAGE_ATTACHMENTS}` : ''}
            </Text>
          </Pressable>

          {sendFailures.length > 0 ? (
            <View style={styles.failures}>
              <Text style={styles.failureTitle}>
                {sendFailures.length === 1
                  ? '1 parent could not be reached:'
                  : `${sendFailures.length} parents could not be reached:`}
              </Text>
              {sendFailures.map((failure) => (
                <Text key={failure.guardianId} style={styles.failureItem}>
                  <Text style={styles.failureName}>{failure.name}</Text>
                  {failure.error ? ` — ${failure.error}` : null}
                </Text>
              ))}
              <Text style={styles.failureHint}>
                Fix any issues, then send again. Parents who already received this message will not get a duplicate.
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontFamily: GardenFonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.6, color: Garden.ink },
  cancel: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  pressed: { transform: [{ scale: 0.97 }] },
  dim: { opacity: 0.5 },
  steps: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  stepWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 12, height: 30, borderRadius: 15 },
  stepTodo: { backgroundColor: Garden.white, borderWidth: 1.5, borderColor: Garden.ink12 },
  stepDone: { backgroundColor: Garden.mint },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.ink06,
  },
  stepDotActive: { backgroundColor: Garden.white },
  stepDotDone: { backgroundColor: Garden.forest },
  stepNumber: { fontFamily: GardenFonts.bodyExtra, fontSize: 12, color: Garden.ink },
  stepLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
  stepLabelActive: { color: Garden.white },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  recipientsBody: { flex: 1, minHeight: 0, paddingBottom: 0 },
  composeBody: { gap: 14 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: Garden.mint,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryText: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.forestDeep },
  summaryStrong: { fontFamily: GardenFonts.bodyExtra },
  fileChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  fileName: { flexShrink: 1, fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.ink65 },
  textArea: {
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: Garden.ink,
  },
  attach: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Garden.ink25,
    alignSelf: 'flex-start',
  },
  attachLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink65 },
  failures: { borderRadius: 16, backgroundColor: '#F9E5DA', padding: 14, gap: 6 },
  failureTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: '#7C2D12' },
  failureItem: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: '#7C2D12' },
  failureName: { fontFamily: GardenFonts.bodyExtra },
  failureHint: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, lineHeight: 17, color: '#7C2D12' },
  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
  footerStatus: { minHeight: 28, flexDirection: 'row', alignItems: 'center' },
  footerHint: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footerPrimary: { flex: 1 },
  reach: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reachText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13 },
  skeletons: { padding: 16, gap: 10 },
  skLabel: { width: 90, height: 12, borderRadius: 6 },
  skChips: { height: 40, borderRadius: 20 },
  skRow: { height: 56, borderRadius: 16 },
});
