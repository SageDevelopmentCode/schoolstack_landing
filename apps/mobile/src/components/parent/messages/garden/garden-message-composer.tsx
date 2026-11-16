import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { haptic } from '@/lib/haptics';
import { MAX_MESSAGE_ATTACHMENTS } from '@/lib/messages/constants';
import {
  appendStagedMessageFiles,
  pickDocumentsFromLibrary,
  pickPhotosFromLibrary,
  promptMessageAttachmentSource,
  remainingAttachmentSlots,
} from '@/lib/messages/pick-message-attachments';
import type { StagedMessageFile } from '@/lib/messages/types';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';

type GardenMessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  files: StagedMessageFile[];
  onFilesChange: (files: StagedMessageFile[]) => void;
  onSend: () => void;
  sending: boolean;
  editMode: boolean;
  onCancelEdit: () => void;
  inputRef: RefObject<TextInput | null>;
  /** Tapped send / attach while previewing (actions are off). */
  onReadOnlyPress: () => void;
  /** Compose is off for this thread (e.g. admin compose gating); editing still works. */
  disabled?: boolean;
};

/**
 * Garden composer. Same rules as `MessageComposeBar`: attachment prompt +
 * limits, edit mode, read-only gating, "Write a message..." placeholder.
 */
export function GardenMessageComposer({
  value,
  onChange,
  files,
  onFilesChange,
  onSend,
  sending,
  editMode,
  onCancelEdit,
  inputRef,
  onReadOnlyPress,
  disabled = false,
}: GardenMessageComposerProps) {
  const accent = useGardenAccent();
  const readOnly = usePortalReadOnly();
  const canSend = editMode ? Boolean(value.trim()) : Boolean(value.trim() || files.length > 0);
  const full = files.length >= MAX_MESSAGE_ATTACHMENTS;
  const composeOff = disabled && !editMode;
  const attachDisabled = sending || full || editMode || composeOff;
  const sendActive = canSend && !sending && !readOnly && !composeOff;

  const handlePickAttachment = () => {
    if (readOnly) {
      onReadOnlyPress();
      return;
    }
    if (sending || full || composeOff) return;
    haptic.tap();
    promptMessageAttachmentSource(async (source) => {
      const slots = remainingAttachmentSlots(files.length);
      if (slots <= 0) return;
      const picked =
        source === 'photos'
          ? await pickPhotosFromLibrary(slots)
          : await pickDocumentsFromLibrary(slots);
      if (picked.length === 0) return;
      haptic.select();
      onFilesChange(appendStagedMessageFiles(files, picked));
    });
  };

  const handleSend = () => {
    if (readOnly) {
      onReadOnlyPress();
      return;
    }
    if (!sendActive) return;
    haptic.press();
    onSend();
  };

  return (
    <View style={styles.container}>
      {editMode ? (
        <View style={styles.editStrip} accessibilityLiveRegion="polite">
          <Ionicons name="pencil" size={15} color={Garden.ink} />
          <View style={styles.editCopy}>
            <Text style={styles.editTitle}>Editing message</Text>
            <Text style={styles.editHint}>Change the text, then tap the tick to save.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
            disabled={sending}
            hitSlop={8}
            onPress={() => {
              haptic.tap();
              onCancelEdit();
            }}
            style={({ pressed }) => [styles.editCancel, pressed && styles.pressed]}>
            <Text style={styles.editCancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {!editMode && files.length > 0 ? (
        <View style={styles.files}>
          <Text style={styles.filesCount}>
            {files.length} of {MAX_MESSAGE_ATTACHMENTS} files
            {full ? ' · that’s the limit for one message' : ''}
          </Text>
          <View style={styles.fileChips}>
            {files.map((file, index) => (
              <View key={`${file.uri}-${index}`} style={styles.fileChip}>
                <Ionicons
                  name={file.mimeType?.startsWith('image/') ? 'image-outline' : 'document-text-outline'}
                  size={14}
                  color={accent.clayDeep}
                />
                <Text numberOfLines={1} style={styles.fileName}>
                  {file.name}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${file.name}`}
                  hitSlop={10}
                  disabled={sending}
                  onPress={() => {
                    haptic.select();
                    onFilesChange(files.filter((_, i) => i !== index));
                  }}>
                  <Ionicons name="close-circle" size={18} color={Garden.ink60} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {readOnly ? (
        <Text style={styles.readOnly}>Read-only preview — sending is off.</Text>
      ) : null}

      <View style={[styles.inputRow, editMode ? { borderColor: Garden.ink } : null]}>
        {!editMode ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach photo or file"
            accessibilityHint={
              full ? `You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files` : 'Choose photos or files'
            }
            accessibilityState={{ disabled: attachDisabled || readOnly }}
            onPress={handlePickAttachment}
            style={({ pressed }) => [
              styles.attach,
              (attachDisabled || readOnly) && styles.dim,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="attach" size={22} color={Garden.ink} />
          </Pressable>
        ) : null}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          placeholder={editMode ? 'Edit message…' : composeOff ? 'Replies are off in this conversation' : 'Write a message...'}
          placeholderTextColor={Garden.ink60}
          multiline
          editable={!readOnly && !sending && !composeOff}
          accessibilityLabel={editMode ? 'Edit message' : 'Message'}
          style={styles.input}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editMode ? 'Save edit' : 'Send message'}
          accessibilityState={{ disabled: !sendActive, busy: sending }}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.send,
            sendActive
              ? { backgroundColor: accent.clay, borderColor: Garden.ink }
              : styles.sendInactive,
            pressed && sendActive && styles.pressed,
          ]}>
          {sending ? (
            <ActivityIndicator size="small" color={Garden.white} />
          ) : (
            <Ionicons
              name={editMode ? 'checkmark' : 'arrow-up'}
              size={20}
              color={sendActive ? Garden.white : Garden.ink60}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: Garden.cream,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
  editStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Garden.butter,
  },
  editCopy: {
    flex: 1,
  },
  editTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    lineHeight: 18,
    color: Garden.ink,
  },
  editHint: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    color: Garden.ink65,
  },
  editCancel: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: Garden.ink,
  },
  files: {
    gap: 6,
  },
  filesCount: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    color: Garden.soft,
    paddingHorizontal: 4,
  },
  fileChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  fileName: {
    flexShrink: 1,
    maxWidth: 200,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.ink,
  },
  readOnly: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    color: Garden.soft,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    padding: 4,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
  },
  attach: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 6,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendInactive: {
    backgroundColor: Garden.ink06,
    borderColor: 'transparent',
  },
  dim: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
