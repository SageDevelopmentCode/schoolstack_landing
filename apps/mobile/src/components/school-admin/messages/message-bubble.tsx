import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { ThemedText } from '@/components/themed-text';
import { StoryFonts } from '@/constants/story-theme';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useOptionalParentTheme } from '@/contexts/parent-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { colorForKey } from '@/lib/messages/format';
import type { MessagesLayoutVariant } from '@/lib/messages/messages-layout-variant';
import { isStoryMessagesVariant } from '@/lib/messages/messages-layout-variant';
import type { PortalMessage } from '@/lib/messages/types';

const BUBBLE_RADIUS = Radius.lg;
const BUBBLE_TAIL_RADIUS = 4;

type MessageBubbleProps = {
  message: PortalMessage;
  showSenderName: boolean;
  isGroupedWithPrevious: boolean;
  variant?: MessagesLayoutVariant;
};

export function MessageBubble({
  message,
  showSenderName,
  isGroupedWithPrevious,
  variant = 'default',
}: MessageBubbleProps) {
  const theme = useAdminTheme();
  const parentTheme = useOptionalParentTheme();
  const parentStory = isStoryMessagesVariant(variant) && parentTheme;
  const isOwn = message.isOwn;

  if (parentStory) {
    const displaySenderName = true;
    const grouped = false;

    return (
      <View
        style={[
          styles.storyRow,
          isOwn ? styles.storyRowOwn : styles.storyRowOther,
          grouped ? styles.grouped : null,
        ]}>
        <MessagesAvatar
          name={message.senderName}
          color={colorForKey(message.senderUserId)}
          photoUrl={message.profilePhotoUrl}
          size="sm"
        />
        <View
          style={[
            styles.storyBubble,
            {
              backgroundColor: isOwn ? parentTheme.primary : parentTheme.white,
              borderColor: isOwn ? 'transparent' : parentTheme.line,
              borderWidth: isOwn ? 0 : StyleSheet.hairlineWidth,
              opacity: message.pending ? 0.75 : 1,
            },
          ]}>
          {displaySenderName ? (
            <Text
              style={[
                styles.storySenderName,
                { color: isOwn ? 'rgba(255,255,255,0.75)' : parentTheme.primary },
              ]}>
              {message.senderName}
            </Text>
          ) : null}
          {message.body ? (
            <Text
              style={[
                styles.storyBody,
                { color: isOwn ? '#FFFFFF' : parentTheme.ink },
              ]}>
              {message.body}
            </Text>
          ) : null}
          {message.attachments.length > 0 ? (
            <View style={styles.attachments}>
              {message.attachments.map((attachment) => (
                <AttachmentRow
                  key={attachment.id}
                  attachment={attachment}
                  isOwn={isOwn}
                  accentColor={parentTheme.primary}
                  labelColor={isOwn ? '#FFFFFF' : parentTheme.primary}
                />
              ))}
            </View>
          ) : null}
          <Text
            style={[
              styles.storyTime,
              { color: isOwn ? 'rgba(255,255,255,0.7)' : parentTheme.muted },
            ]}>
            {message.pending ? 'Sending…' : message.timeLabel}
          </Text>
        </View>
      </View>
    );
  }

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
            {message.attachments.map((attachment) => (
              <AttachmentRow
                key={attachment.id}
                attachment={attachment}
                isOwn={isOwn}
                accentColor={theme.accent}
                labelColor={isOwn ? '#FFFFFF' : theme.accent}
              />
            ))}
          </View>
        ) : null}
        <ThemedText type="small" color={timeColor} style={styles.time}>
          {message.pending ? 'Sending…' : message.timeLabel}
        </ThemedText>
      </View>
    </View>
  );
}

function AttachmentRow({
  attachment,
  isOwn,
  accentColor,
  labelColor,
}: {
  attachment: PortalMessage['attachments'][number];
  isOwn: boolean;
  accentColor: string;
  labelColor: string;
}) {
  const isImage = attachment.mimeType?.startsWith('image/');

  if (isImage && attachment.url) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (attachment.url) {
            void WebBrowser.openBrowserAsync(attachment.url);
          }
        }}>
        <Image source={{ uri: attachment.url }} style={styles.imageAttachment} contentFit="cover" />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (attachment.url) {
          void WebBrowser.openBrowserAsync(attachment.url);
        }
      }}
      style={styles.fileAttachment}>
      <Ionicons name="document-text-outline" size={14} color={isOwn ? '#FFFFFF' : accentColor} />
      <ThemedText type="small" numberOfLines={1} color={labelColor} style={styles.fileName}>
        {attachment.fileName}
      </ThemedText>
    </Pressable>
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
  storyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  storyRowOwn: {
    flexDirection: 'row-reverse',
  },
  storyRowOther: {},
  storyBubble: {
    maxWidth: '75%',
    borderRadius: BUBBLE_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  storySenderName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  storyBody: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  storyTime: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
    alignSelf: 'flex-end',
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
