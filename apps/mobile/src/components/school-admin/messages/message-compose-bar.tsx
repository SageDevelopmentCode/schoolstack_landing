import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useOptionalParentTheme } from '@/contexts/parent-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MAX_MESSAGE_ATTACHMENTS } from '@/lib/messages/constants';
import type { MessagesLayoutVariant } from '@/lib/messages/messages-layout-variant';
import { isStoryMessagesVariant } from '@/lib/messages/messages-layout-variant';
import {
  appendStagedMessageFiles,
  pickDocumentsFromLibrary,
  pickPhotosFromLibrary,
  promptMessageAttachmentSource,
  remainingAttachmentSlots,
} from '@/lib/messages/pick-message-attachments';
import type { StagedMessageFile } from '@/lib/messages/types';

type MessageComposeBarProps = {
  value: string;
  onChange: (value: string) => void;
  files: StagedMessageFile[];
  onFilesChange: (files: StagedMessageFile[]) => void;
  onSend: () => void;
  sending: boolean;
  disabled?: boolean;
  /** When false, parent SafeAreaView already handles the home indicator inset. */
  applyBottomSafeArea?: boolean;
  variant?: MessagesLayoutVariant;
};

export function MessageComposeBar({
  value,
  onChange,
  files,
  onFilesChange,
  onSend,
  sending,
  disabled = false,
  applyBottomSafeArea = false,
  variant = 'default',
}: MessageComposeBarProps) {
  const theme = useAdminTheme();
  const parentTheme = useOptionalParentTheme();
  const parentStory = isStoryMessagesVariant(variant) && parentTheme;
  const insets = useSafeAreaInsets();
  const canSend = Boolean(value.trim() || files.length > 0);
  const bottomPadding = applyBottomSafeArea
    ? Math.max(insets.bottom, Spacing.two)
    : disabled
      ? Spacing.one
      : Spacing.two;

  const surfaceColor = parentStory ? parentTheme.paper : theme.surface;
  const fieldBg = parentStory ? parentTheme.white : theme.bg;
  const borderColor = parentStory ? parentTheme.line : theme.border;
  const accentColor = parentStory ? parentTheme.primary : theme.accent;
  const textPrimary = parentStory ? parentTheme.ink : theme.textPrimary;
  const textSecondary = parentStory ? parentTheme.muted : theme.textSecondary;
  const textTertiary = parentStory ? parentTheme.muted : theme.textTertiary;
  const chipBg = parentStory ? parentTheme.paper : theme.bg;

  const handlePickAttachment = () => {
    if (disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS) return;

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
    <View
      style={[
        styles.container,
        parentStory ? styles.containerParentStory : null,
        {
          backgroundColor: surfaceColor,
          borderTopColor: borderColor,
          paddingBottom: bottomPadding,
        },
      ]}>
      {files.length > 0 ? (
        <View style={styles.fileChips}>
          {files.map((file, index) => (
            <View
              key={`${file.uri}-${index}`}
              style={[styles.fileChip, { borderColor, backgroundColor: chipBg }]}>
              <ThemedText type="small" numberOfLines={1} style={{ color: textSecondary, flex: 1 }}>
                {file.name}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${file.name}`}
                onPress={() => onFilesChange(files.filter((_, i) => i !== index))}
                hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={[
          styles.inputRow,
          parentStory ? styles.inputRowParentStory : null,
          { borderColor, backgroundColor: fieldBg },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach photo or file"
          disabled={disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS}
          onPress={handlePickAttachment}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="attach" size={22} color={textSecondary} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Write a message..."
          placeholderTextColor={textTertiary}
          multiline
          editable={!disabled && !sending}
          style={[
            styles.input,
            {
              color: textPrimary,
              fontFamily: parentStory ? StoryFonts.body : Fonts.body,
            },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={disabled || sending || !canSend}
          onPress={onSend}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: canSend && !disabled ? accentColor : borderColor,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  containerParentStory: {
    borderTopWidth: 0,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  inputRowParentStory: Platform.select({
    ios: {
      shadowColor: '#32483D',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    default: {
      elevation: 2,
    },
  }),
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
