import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { PortalMessage } from '@/lib/messages/types';

const BUBBLE_RADIUS = Radius.lg;
const BUBBLE_TAIL_RADIUS = 4;

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

  const bubbleStyle = isOwn
    ? {
        backgroundColor: theme.accent,
        borderTopLeftRadius: BUBBLE_RADIUS,
        borderTopRightRadius: BUBBLE_RADIUS,
        borderBottomLeftRadius: BUBBLE_RADIUS,
        borderBottomRightRadius: BUBBLE_TAIL_RADIUS,
        borderWidth: 0,
      }
    : {
        backgroundColor: theme.surface,
        borderTopLeftRadius: BUBBLE_RADIUS,
        borderTopRightRadius: BUBBLE_RADIUS,
        borderBottomLeftRadius: BUBBLE_TAIL_RADIUS,
        borderBottomRightRadius: BUBBLE_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.border,
      };

  const bodyColor = isOwn ? '#FFFFFF' : theme.textSecondary;
  const timeColor = isOwn ? 'rgba(255,255,255,0.75)' : theme.textTertiary;

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
          styles.bubbleShadow,
          bubbleStyle,
          { opacity: message.pending ? 0.75 : 1 },
        ]}>
        {showSenderName ? (
          <ThemedText type="smallBold" color={theme.accent} style={styles.senderName}>
            {message.senderName}
          </ThemedText>
        ) : null}
        {message.body ? (
          <ThemedText type="default" color={bodyColor} style={styles.body}>
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
                    color={isOwn ? '#FFFFFF' : theme.accent}
                    style={styles.fileName}>
                    {attachment.fileName}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <ThemedText type="small" color={timeColor} style={styles.time}>
          {message.pending ? 'Sending…' : message.timeLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
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
    maxWidth: '75%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  bubbleShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    default: {
      elevation: 1,
    },
  }),
  senderName: {
    marginBottom: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    marginTop: 4,
    alignSelf: 'flex-end',
    fontSize: 10,
    lineHeight: 14,
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
  fileName: {
    flex: 1,
  },
});
