import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MESSAGE_ATTACHMENT_MIME_TYPES } from '@/lib/messages/constants';
import {
  MAX_SUPPORT_REQUEST_FILE_BYTES,
  MAX_SUPPORT_REQUEST_FILES,
  submitAdminSupportRequest,
  SUPPORT_REQUEST_TOPIC_OPTIONS,
  supportRequestTopicLabel,
  type StagedSupportAttachment,
  type SupportRequestTopic,
} from '@/lib/school-admin/support-request';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type AdminSupportRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  userEmail?: string | null;
  sourcePagePath?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminSupportRequestSheet({
  visible,
  onClose,
  organizationId,
  slug,
  userEmail,
  sourcePagePath,
}: AdminSupportRequestSheetProps) {
  const theme = useAdminTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [topic, setTopic] = useState<SupportRequestTopic>('general');
  const [topicOpen, setTopicOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<StagedSupportAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = useCallback(() => {
    setTopic('general');
    setTopicOpen(false);
    setDescription('');
    setAttachments([]);
    setAttachmentError(null);
    setSubmitError(null);
    setSubmitting(false);
    setSubmitted(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    resetForm();
    onClose();
  }, [onClose, resetForm, submitting]);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [resetForm, visible]);

  const handlePickAttachments = async () => {
    if (submitting || attachments.length >= MAX_SUPPORT_REQUEST_FILES) return;

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [...MESSAGE_ATTACHMENT_MIME_TYPES],
    });

    if (result.canceled) return;

    setAttachmentError(null);
    const next = [...attachments];
    const errors: string[] = [];

    for (const asset of result.assets) {
      if (next.length >= MAX_SUPPORT_REQUEST_FILES) {
        errors.push(`You can attach up to ${MAX_SUPPORT_REQUEST_FILES} files.`);
        break;
      }

      const size = asset.size ?? null;
      if (size != null && size > MAX_SUPPORT_REQUEST_FILE_BYTES) {
        errors.push(`${asset.name} exceeds 10 MB.`);
        continue;
      }

      next.push({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? null,
        size,
      });
    }

    setAttachments(next);
    if (errors.length > 0) {
      setAttachmentError(errors.join(' '));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setAttachmentError(null);
  };

  const handleSubmit = async () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitAdminSupportRequest({
        organizationId,
        topic,
        description: trimmedDescription,
        sourcePagePath: sourcePagePath ?? `/school-admin/${slug}/dashboard`,
        attachments,
      });
      setSubmitted(true);
    } catch (error) {
      reportError('school_admin_support_request_submit', error, {
        metadata: { topic },
      });
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit your request. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = description.trim().length > 0 && !submitting;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={handleClose}
      title="Get help"
      subtitle="Tell us what's going on — screenshots help a lot."
      accessibilityLabel="Close support request form">
      {submitted ? (
        <View style={styles.success}>
          <View style={[styles.successIcon, { backgroundColor: theme.accentLight }]}>
            <Ionicons name="checkmark-circle" size={32} color={theme.accent} />
          </View>
          <ThemedText type="subtitle" style={{ color: theme.textPrimary, textAlign: 'center' }}>
            Request received
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {userEmail?.trim()
              ? `Thanks — we'll follow up at ${userEmail.trim()}.`
              : "Thanks — we'll be in touch soon."}
          </ThemedText>
          <PrimaryButton
            label="Done"
            variant="accent"
            appearance="native"
            onPress={handleClose}
            style={styles.doneButton}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
              Topic
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTopicOpen((open) => !open)}
              style={[
                styles.select,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}>
              <ThemedText type="small" style={{ color: theme.textPrimary, flex: 1 }}>
                {supportRequestTopicLabel(topic)}
              </ThemedText>
              <Ionicons
                name={topicOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.textTertiary}
              />
            </Pressable>
            {topicOpen ? (
              <View style={[styles.topicList, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                {SUPPORT_REQUEST_TOPIC_OPTIONS.map((option) => {
                  const active = option.value === topic;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => {
                        setTopic(option.value);
                        setTopicOpen(false);
                      }}
                      style={[
                        styles.topicOption,
                        active && { backgroundColor: theme.accentLight },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{ color: active ? theme.accent : theme.textPrimary }}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
              Description
            </ThemedText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
              placeholder="What were you trying to do? What happened instead?"
              placeholderTextColor={theme.textTertiary}
              multiline
              textAlignVertical="top"
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
              Attachments{' '}
              <ThemedText type="small" style={{ color: theme.textTertiary, fontWeight: '400' }}>
                (optional)
              </ThemedText>
            </ThemedText>

            {attachments.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => void handlePickAttachments()}
                style={[
                  styles.uploadBox,
                  { borderColor: theme.borderStrong, opacity: submitting ? 0.7 : 1 },
                ]}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.textTertiary} />
                <ThemedText type="smallBold" style={{ color: theme.textPrimary, marginTop: Spacing.two }}>
                  Tap to upload files
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Screenshots, PDFs, or other files that help explain the issue.
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: Spacing.one }}>
                  Up to {MAX_SUPPORT_REQUEST_FILES} files, 10 MB each
                </ThemedText>
              </Pressable>
            ) : (
              <View style={styles.attachmentList}>
                {attachments.map((file, index) => (
                  <View
                    key={`${file.uri}-${index}`}
                    style={[styles.attachmentRow, { borderColor: theme.border, backgroundColor: theme.bg }]}>
                    <View style={styles.attachmentMeta}>
                      <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.textPrimary }}>
                        {file.name}
                      </ThemedText>
                      {file.size != null ? (
                        <ThemedText type="small" style={{ color: theme.textTertiary }}>
                          {formatFileSize(file.size)}
                        </ThemedText>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${file.name}`}
                      disabled={submitting}
                      onPress={() => handleRemoveAttachment(index)}
                      hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
                    </Pressable>
                  </View>
                ))}
                {attachments.length < MAX_SUPPORT_REQUEST_FILES ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={submitting}
                    onPress={() => void handlePickAttachments()}
                    style={styles.addAttachment}>
                    <Ionicons name="add-circle-outline" size={18} color={theme.accent} />
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      Add another file
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            )}

            {attachmentError ? (
              <ThemedText type="small" style={{ color: theme.error }}>
                {attachmentError}
              </ThemedText>
            ) : null}
          </View>

          {submitError ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {submitError}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleClose}
              style={[
                styles.cancelButton,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={[
                styles.submitButton,
                {
                  backgroundColor: canSubmit ? theme.accent : theme.border,
                },
              ]}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  Submit request
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  topicList: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  topicOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  textArea: {
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  uploadBox: {
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  attachmentList: {
    gap: Spacing.two,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  attachmentMeta: {
    flex: 1,
    gap: 2,
  },
  addAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  submitButton: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  success: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
});
