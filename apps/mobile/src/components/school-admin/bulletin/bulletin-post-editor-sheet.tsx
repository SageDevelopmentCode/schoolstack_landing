import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { BulletinAttachmentList } from '@/components/school-admin/bulletin/bulletin-attachment-list';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { AUDIENCE_OPTIONS } from '@/lib/school-bulletin/bulletin-audience';
import {
  BULLETIN_ATTACHMENT_MIME_TYPES,
  MAX_BULLETIN_ATTACHMENT_BYTES,
  MAX_BULLETIN_ATTACHMENTS,
} from '@/lib/school-bulletin/constants';
import type { BulletinPost, ProgramOption } from '@/lib/school-bulletin/types';
import {
  bulletinEditorSheetSubtitle,
  bulletinEditorSheetTitle,
  useBulletinPostEditor,
} from '@/lib/school-bulletin/use-bulletin-post-editor';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

type BulletinPostEditorSheetProps = {
  visible: boolean;
  onClose: () => void;
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  isNew?: boolean;
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
};

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const theme = useParentTheme();

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleLabel, { color: theme.ink }]}>{label}</Text>
        <Text style={[styles.toggleDescription, { color: theme.muted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.line, true: theme.primary }}
        thumbColor={Story.white}
      />
    </View>
  );
}

export function BulletinPostEditorSheet({
  visible,
  onClose,
  slug,
  post,
  programs,
  isNew = false,
  onSaved,
  onDeleted,
}: BulletinPostEditorSheetProps) {
  const theme = useParentTheme();
  const editor = useBulletinPostEditor({
    slug,
    post,
    programs,
    onSaved,
    onDeleted,
  });

  const {
    title,
    setTitle,
    body,
    setBody,
    audiences,
    toggleAudience,
    programIds,
    toggleProgramId,
    publishedAt,
    setPublishedAt,
    expiresAt,
    setExpiresAt,
    publishScheduleEnabled,
    expiryEnabled,
    togglePublishSchedule,
    toggleExpiry,
    saving,
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    canUploadAttachments,
    atAttachmentLimit,
    savePost,
    handleArchive,
    handleDelete,
    uploadFiles,
    handleRemoveAttachment,
  } = editor;

  const isDirty = Boolean(
    title.trim() ||
      body.trim() ||
      audiences.length > 1 ||
      programIds.length > 0 ||
      publishScheduleEnabled ||
      expiryEnabled,
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handlePickFiles = async () => {
    if (uploading || !canUploadAttachments || atAttachmentLimit) return;

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [...BULLETIN_ATTACHMENT_MIME_TYPES],
    });

    if (result.canceled) return;

    const files = [];
    for (const asset of result.assets) {
      if (files.length + (activePost?.attachments.length ?? 0) >= MAX_BULLETIN_ATTACHMENTS) break;
      const size = asset.size ?? null;
      if (size != null && size > MAX_BULLETIN_ATTACHMENT_BYTES) continue;
      files.push({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? null,
        size,
      });
    }

    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const sheetTitle = bulletinEditorSheetTitle(isNew && !activePost, activePost ?? post);
  const sheetSubtitle = bulletinEditorSheetSubtitle(isNew);

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%"
      scrollContentStyle={styles.content}
      header={
        <View style={[styles.header, { borderBottomColor: Story.line }]}>
          <Pressable accessibilityRole="button" onPress={requestClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Close</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: theme.ink }]} numberOfLines={1}>
              {sheetTitle}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      }
      footer={
        <View style={[styles.footer, { borderTopColor: Story.line }]}>
          <StoryButton
            label="Save draft"
            variant="soft"
            disabled={saving}
            onPress={() => void savePost('draft')}
          />
          <StoryButton
            label="Publish"
            disabled={saving}
            onPress={() => void savePost('published')}
          />
          {editingExisting && activePost && activePost.status !== 'archived' ? (
            <StoryButton
              label="Archive"
              variant="outline"
              disabled={saving}
              onPress={() => void handleArchive()}
            />
          ) : null}
          {editingExisting && activePost && onDeleted ? (
            <StoryButton
              label="Delete"
              variant="outline"
              disabled={saving}
              onPress={handleDelete}
            />
          ) : null}
        </View>
      }>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{sheetSubtitle}</Text>

      <StoryTextField
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Spring festival flyer"
      />

      <StoryTextField
        label="Message"
        value={body}
        onChangeText={setBody}
        placeholder="Share details families and staff should know..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        style={styles.messageInput}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.ink }]}>Attachments</Text>
        <Pressable
          accessibilityRole="button"
          disabled={uploading || !canUploadAttachments || atAttachmentLimit}
          onPress={() => void handlePickFiles()}
          style={({ pressed }) => [
            styles.uploadZone,
            {
              borderColor: theme.line,
              backgroundColor: theme.white,
              opacity: uploading || !canUploadAttachments || atAttachmentLimit ? 0.7 : 1,
            },
            pressed && styles.pressed,
          ]}>
          {uploading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={28} color={theme.muted} />
          )}
          <Text style={[styles.uploadTitle, { color: theme.ink }]}>
            {uploading ? 'Uploading files…' : 'Tap to upload PDFs or images'}
          </Text>
          <Text style={[styles.uploadHint, { color: theme.muted }]}>
            Up to {MAX_BULLETIN_ATTACHMENTS} files, 10 MB each
          </Text>
          {!canUploadAttachments ? (
            <Text style={[styles.uploadHint, { color: theme.muted }]}>Add a title to upload files.</Text>
          ) : null}
          {atAttachmentLimit ? (
            <Text style={[styles.uploadHint, { color: theme.muted }]}>
              Maximum {MAX_BULLETIN_ATTACHMENTS} attachments reached.
            </Text>
          ) : null}
        </Pressable>
        {activePost && activePost.attachments.length > 0 ? (
          <BulletinAttachmentList
            attachments={activePost.attachments}
            removingId={removingAttachmentId}
            onRemove={(attachmentId) => void handleRemoveAttachment(attachmentId)}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.ink }]}>Audience</Text>
        <Text style={[styles.sectionHint, { color: theme.muted }]}>Select one or more audiences.</Text>
        <View style={styles.optionList}>
          {AUDIENCE_OPTIONS.map((option) => {
            const selected = audiences.includes(option.value);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => toggleAudience(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  {
                    borderColor: selected ? theme.primary : theme.line,
                    backgroundColor: selected ? theme.primarySoft : theme.white,
                  },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, { color: theme.ink }]}>{option.label}</Text>
                  <Text style={[styles.optionDescription, { color: theme.muted }]}>
                    {option.description}
                  </Text>
                </View>
                {selected ? <StoryChip tone="success" label="Selected" /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {showProgramPicker ? (
        <View style={styles.section}>
          {programRequired ? (
            <Text style={[styles.sectionHint, { color: theme.muted }]}>
              Choose at least one program.
            </Text>
          ) : null}
          {programs.length === 0 ? (
            <Text style={[styles.sectionHint, { color: theme.muted }]}>
              No programs available for this school.
            </Text>
          ) : (
            <View style={styles.optionList}>
              {programs.map((program) => {
                const selected = programIds.includes(program.id);
                return (
                  <Pressable
                    key={program.id}
                    accessibilityRole="button"
                    onPress={() => toggleProgramId(program.id)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        borderColor: selected ? theme.primary : theme.line,
                        backgroundColor: selected ? theme.primarySoft : theme.white,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.optionLabel, { color: theme.ink }]}>{program.name}</Text>
                    {selected ? <StoryChip tone="success" label="Selected" /> : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <ToggleRow
          label="Schedule publish"
          description="Publish later instead of right away"
          value={publishScheduleEnabled}
          onValueChange={togglePublishSchedule}
        />
        {publishScheduleEnabled ? (
          <StoryTextField
            label="Publish date and time"
            value={publishedAt}
            onChangeText={setPublishedAt}
            placeholder="YYYY-MM-DDTHH:mm"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <ToggleRow
          label="Set expiry"
          description="Hide from feeds after this date"
          value={expiryEnabled}
          onValueChange={toggleExpiry}
        />
        {expiryEnabled ? (
          <StoryTextField
            label="Expiry date and time"
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="YYYY-MM-DDTHH:mm"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : null}
      </View>
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
    borderBottomWidth: 1,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  headerAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  messageInput: {
    minHeight: 140,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  uploadZone: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  uploadTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  optionList: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  optionDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
});
