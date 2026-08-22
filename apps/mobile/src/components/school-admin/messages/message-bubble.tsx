import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { PortalMessage } from '@/lib/messages/types';

type MessageBubbleProps = {
  message: PortalMessage;
  showSenderName: boolean;
  isGroupedWithPrevious: boolean;
};

export function MessageBubble({
  message,
  showSenderName,
  isGroupedWithPrevious,
}: MessageBubbleProps) {
  const theme = useAdminTheme();
  const isOwn = message.isOwn;
  const bubbleColor = isOwn ? theme.accent : theme.input;
  const textColor = isOwn ? '#FFFFFF' : theme.textPrimary;
  const metaColor = isOwn ? 'rgba(255,255,255,0.8)' : theme.textTertiary;

  return (
    <View
      style={[
        styles.wrapper,
        isOwn ? styles.wrapperOwn : styles.wrapperOther,
        isGroupedWithPrevious ? styles.grouped : null,
      ]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor,
            opacity: message.pending ? 0.7 : 1,
          },
        ]}>
        {showSenderName ? (
          <ThemedText type="smallBold" style={{ color: metaColor, marginBottom: 2 }}>
            {message.senderName}
          </ThemedText>
        ) : null}
        {message.body ? (
          <ThemedText type="default" style={{ color: textColor }}>
            {message.body}
          </ThemedText>
        ) : null}
        {message.attachments.length > 0 ? (
          <View style={styles.attachments}>
            {message.attachments.map((attachment) => {
              const isImage = attachment.mimeType?.startsWith('image/');
              if (isImage && attachment.url) {
                return (
                  <Pressable
                    key={attachment.id}
                    accessibilityRole="button"
                    onPress={() => {
                      if (attachment.url) {
                        void WebBrowser.openBrowserAsync(attachment.url);
                      }
                    }}>
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.imageAttachment}
                      contentFit="cover"
                    />
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={attachment.id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (attachment.url) {
                      void WebBrowser.openBrowserAsync(attachment.url);
                    }
                  }}
                  style={styles.fileAttachment}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={isOwn ? '#FFFFFF' : theme.accent}
                  />
                  <ThemedText
                    type="small"
                    numberOfLines={1}
                    style={{ color: isOwn ? '#FFFFFF' : theme.accent, flex: 1 }}>
                    {attachment.fileName}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <ThemedText type="small" style={{ color: metaColor, marginTop: 4, alignSelf: 'flex-end' }}>
          {message.timeLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.four,
  },
  wrapperOwn: {
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignItems: 'flex-start',
  },
  grouped: {
    marginTop: -4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  attachments: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  imageAttachment: {
    width: 200,
    height: 150,
    borderRadius: Radius.md,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: 220,
  },
});
