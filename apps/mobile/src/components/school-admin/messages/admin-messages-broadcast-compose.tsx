import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { MAX_MESSAGE_ATTACHMENTS } from '@/lib/messages/constants';
import {
  appendStagedMessageFiles,
  pickDocumentsFromLibrary,
  pickPhotosFromLibrary,
  promptMessageAttachmentSource,
  remainingAttachmentSlots,
} from '@/lib/messages/pick-message-attachments';
import type { StagedMessageFile } from '@/lib/messages/types';

type AdminMessagesBroadcastComposeProps = {
  value: string;
  onChange: (value: string) => void;
  files: StagedMessageFile[];
  onFilesChange: (files: StagedMessageFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function AdminMessagesBroadcastCompose({
  value,
  onChange,
  files,
  onFilesChange,
  disabled = false,
  placeholder = 'Write a message to send to each parent individually…',
}: AdminMessagesBroadcastComposeProps) {
  const theme = useParentTheme();
  const attachDisabled = disabled || files.length >= MAX_MESSAGE_ATTACHMENTS;

  const handlePickAttachment = () => {
    if (attachDisabled) return;

    promptMessageAttachmentSource(async (source) => {
      const slots = remainingAttachmentSlots(files.length);
      if (slots <= 0) return;

      const picked =
        source === 'photos'
          ? await pickPhotosFromLibrary(slots)
          : await pickDocumentsFromLibrary(slots);

      if (picked.length === 0) return;
      onFilesChange(appendStagedMessageFiles(files, picked));
    });
  };

  return (
    <View style={styles.root}>
      {files.length > 0 ? (
        <View style={styles.fileChips}>
          {files.map((file, index) => (
            <View
              key={`${file.uri}-${index}`}
              style={[styles.fileChip, { borderColor: theme.line, backgroundColor: theme.paper }]}>
              <Text style={[styles.fileName, { color: theme.muted }]} numberOfLines={1}>
                {file.name}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${file.name}`}
                disabled={disabled}
                onPress={() => onFilesChange(files.filter((_, i) => i !== index))}
                hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={theme.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        multiline
        editable={!disabled}
        textAlignVertical="top"
        style={[
          styles.textArea,
          {
            borderColor: theme.line,
            backgroundColor: theme.white,
            color: theme.ink,
          },
        ]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Attach photo or file"
        disabled={attachDisabled}
        onPress={handlePickAttachment}
        style={({ pressed }) => [
          styles.attachRow,
          { borderColor: theme.line, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Ionicons name="attach" size={20} color={theme.muted} />
        <Text style={[styles.attachLabel, { color: theme.muted }]}>Add attachment</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  fileChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  fileName: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    maxWidth: 160,
  },
  textArea: {
    minHeight: 140,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  attachLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
