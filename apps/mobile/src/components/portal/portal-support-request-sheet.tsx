import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { MESSAGE_ATTACHMENT_MIME_TYPES } from '@/lib/messages/constants';
import {
  MAX_SUPPORT_REQUEST_FILE_BYTES,
  MAX_SUPPORT_REQUEST_FILES,
  SUPPORT_REQUEST_TOPIC_OPTIONS,
  supportRequestTopicLabel,
  type StagedSupportAttachment,
  type SubmitPortalSupportRequestInput,
  type SupportRequestTopic,
} from '@/lib/support-request';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type PortalSupportRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  userEmail?: string | null;
  sourcePagePath?: string;
  errorOperation: string;
  onSubmit: (input: SubmitPortalSupportRequestInput) => Promise<void>;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PortalSupportRequestSheet({
  visible,
  onClose,
  organizationId,
  userEmail,
  sourcePagePath,
  errorOperation,
  onSubmit,
}: PortalSupportRequestSheetProps) {
  const theme = useParentTheme();
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
      await onSubmit({
        organizationId,
        topic,
        description: trimmedDescription,
        sourcePagePath,
        attachments,
      });
      setSubmitted(true);
    } catch (error) {
      reportError(errorOperation, error, {
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
          <View style={[styles.successIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.successTitle, { color: theme.ink }]}>Request received</Text>
          <Text style={[styles.successCopy, { color: theme.muted }]}>
            {userEmail?.trim()
              ? `Thanks — we'll follow up at ${userEmail.trim()}.`
              : "Thanks — we'll be in touch soon."}
          </Text>
          <StoryButton label="Done" onPress={handleClose} style={styles.doneButton} />
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.muted }]}>Topic</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTopicOpen((open) => !open)}
              style={[styles.select, { backgroundColor: theme.paper, borderColor: theme.line }]}>
              <Text style={[styles.selectText, { color: theme.ink, flex: 1 }]}>
                {supportRequestTopicLabel(topic)}
              </Text>
              <Ionicons
                name={topicOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.muted}
              />
            </Pressable>
            {topicOpen ? (
              <View style={[styles.topicList, { borderColor: theme.line, backgroundColor: theme.paper }]}>
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
                        active && { backgroundColor: theme.primarySoft },
                      ]}>
                      <Text
                        style={[
                          styles.topicOptionText,
                          { color: active ? theme.primary : theme.ink },
                        ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.muted }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
              placeholder="What were you trying to do? What happened instead?"
              placeholderTextColor={theme.muted}
              multiline
              textAlignVertical="top"
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.paper,
                  borderColor: theme.line,
                  color: theme.ink,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.muted }]}>
              Attachments <Text style={styles.optional}>(optional)</Text>
            </Text>

            {attachments.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => void handlePickAttachments()}
                style={[
                  styles.uploadBox,
                  { borderColor: theme.line, opacity: submitting ? 0.7 : 1 },
                ]}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.muted} />
                <Text style={[styles.uploadTitle, { color: theme.ink }]}>Tap to upload files</Text>
                <Text style={[styles.uploadCopy, { color: theme.muted }]}>
                  Screenshots, PDFs, or other files that help explain the issue.
                </Text>
                <Text style={[styles.uploadMeta, { color: theme.muted }]}>
                  Up to {MAX_SUPPORT_REQUEST_FILES} files, 10 MB each
                </Text>
              </Pressable>
            ) : (
              <View style={styles.attachmentList}>
                {attachments.map((file, index) => (
                  <View
                    key={`${file.uri}-${index}`}
                    style={[styles.attachmentRow, { borderColor: theme.line, backgroundColor: theme.paper }]}>
                    <View style={styles.attachmentMeta}>
                      <Text style={[styles.attachmentName, { color: theme.ink }]} numberOfLines={1}>
                        {file.name}
                      </Text>
                      {file.size != null ? (
                        <Text style={[styles.attachmentSize, { color: theme.muted }]}>
                          {formatFileSize(file.size)}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${file.name}`}
                      disabled={submitting}
                      onPress={() => handleRemoveAttachment(index)}
                      hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color={theme.muted} />
                    </Pressable>
                  </View>
                ))}
                {attachments.length < MAX_SUPPORT_REQUEST_FILES ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={submitting}
                    onPress={() => void handlePickAttachments()}
                    style={styles.addAttachment}>
                    <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
                    <Text style={[styles.addAttachmentText, { color: theme.primary }]}>
                      Add another file
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            {attachmentError ? (
              <Text style={[styles.errorCopy, { color: theme.alert }]}>{attachmentError}</Text>
            ) : null}
          </View>

          {submitError ? (
            <Text style={[styles.errorCopy, { color: theme.alert }]}>{submitError}</Text>
          ) : null}

          <View style={styles.actions}>
            <StoryButton
              label="Cancel"
              variant="outline"
              onPress={handleClose}
              disabled={submitting}
              style={styles.cancelButton}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={[
                styles.submitButton,
                { backgroundColor: canSubmit ? theme.primary : theme.line },
              ]}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitLabel}>Submit request</Text>
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
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  optional: {
    fontWeight: '400',
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
  selectText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
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
  topicOptionText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
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
  uploadTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.two,
  },
  uploadCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  uploadMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    marginTop: Spacing.one,
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
  attachmentName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  attachmentSize: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  addAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  addAttachmentText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  errorCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  submitLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  successTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  successCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  doneButton: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
});
