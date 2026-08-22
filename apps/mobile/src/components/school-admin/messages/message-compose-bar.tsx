import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MESSAGE_ATTACHMENT_MIME_TYPES,
} from '@/lib/messages/constants';
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
}: MessageComposeBarProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const canSend = Boolean(value.trim() || files.length > 0);
  const bottomPadding = applyBottomSafeArea
    ? Math.max(insets.bottom, Spacing.two)
    : disabled
      ? Spacing.one
      : Spacing.two;

  const handlePickFiles = async () => {
    if (disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS) return;

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [...MESSAGE_ATTACHMENT_MIME_TYPES],
    });

    if (result.canceled) return;

    const next = [...files];
    for (const asset of result.assets) {
      if (next.length >= MAX_MESSAGE_ATTACHMENTS) break;
      const size = asset.size ?? null;
      if (size != null && size > MAX_MESSAGE_ATTACHMENT_BYTES) continue;
      next.push({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? null,
        size,
      });
    }
    onFilesChange(next);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: bottomPadding,
        },
      ]}>
      {files.length > 0 ? (
        <View style={styles.fileChips}>
          {files.map((file, index) => (
            <View
              key={`${file.uri}-${index}`}
              style={[styles.fileChip, { borderColor: theme.border, backgroundColor: theme.bg }]}>
              <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary, flex: 1 }}>
                {file.name}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${file.name}`}
                onPress={() => onFilesChange(files.filter((_, i) => i !== index))}
                hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={theme.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.bg }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach files"
          disabled={disabled || sending || files.length >= MAX_MESSAGE_ATTACHMENTS}
          onPress={() => {
            void handlePickFiles();
          }}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="attach" size={22} color={theme.textSecondary} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Write a message..."
          placeholderTextColor={theme.textTertiary}
          multiline
          editable={!disabled && !sending}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
              fontFamily: Fonts.body,
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
              backgroundColor: canSend && !disabled ? theme.accent : theme.border,
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
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
