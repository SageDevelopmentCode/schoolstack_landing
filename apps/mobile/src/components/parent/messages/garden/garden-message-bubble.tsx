import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { LinkifiedText } from '@/components/text/linkified-text';
import { haptic } from '@/lib/haptics';
import { PORTAL_MESSAGE_DELETED_PREVIEW } from '@/lib/messages/constants';
import type { PortalMessage } from '@/lib/messages/types';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function timeLabelFor(message: PortalMessage): string {
  if (message.pending) return 'Sending…';
  if (message.editedAt && !message.deletedAt) return `${message.timeLabel} (Edited)`;
  return message.timeLabel;
}

function formatBytes(bytes: number | null): string | null {
  if (bytes == null || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Attachment({
  attachment,
  isOwn,
}: {
  attachment: PortalMessage['attachments'][number];
  isOwn: boolean;
}) {
  const accent = useGardenAccent();
  const { reportError } = useMobileErrorReporter();
  const isImage = attachment.mimeType?.startsWith('image/');
  const open = () => {
    if (!attachment.url) return;
    haptic.tap();
    void openExternalUrlSafely(attachment.url, reportError, {
      operation: 'message_attachment_open',
      entityType: 'message_attachment',
      entityId: attachment.id,
      errorTitle: 'Could not open attachment',
    });
  };

  if (isImage && attachment.url) {
    return (
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`Open photo ${attachment.fileName}`}
        onPress={open}
        style={({ pressed }) => [styles.imageWrap, pressed && styles.pressed]}>
        <Image source={{ uri: attachment.url }} style={styles.image} contentFit="cover" transition={150} />
      </Pressable>
    );
  }

  const size = formatBytes(attachment.sizeBytes);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open file ${attachment.fileName}${size ? `, ${size}` : ''}`}
      onPress={open}
      style={({ pressed }) => [
        styles.file,
        isOwn ? styles.fileOwn : styles.fileOther,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.fileIcon, { backgroundColor: isOwn ? Garden.white : accent.wash }]}>
        <Ionicons name="document-text-outline" size={16} color={accent.clayDeep} />
      </View>
      <View style={styles.fileCopy}>
        <Text numberOfLines={1} style={[styles.fileName, { color: isOwn ? Garden.white : Garden.ink }]}>
          {attachment.fileName}
        </Text>
        <Text style={[styles.fileMeta, { color: isOwn ? 'rgba(255,255,255,0.8)' : Garden.soft }]}>
          {size ? `${size} · Tap to open` : 'Tap to open'}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Garden chat bubble. Own = school accent with white text; others = white card
 * with the sender's name (hidden when grouped). Long press opens edit/delete.
 */
export function GardenMessageBubble({
  message,
  isGroupedWithPrevious,
  showSent,
  onLongPress,
}: {
  message: PortalMessage;
  isGroupedWithPrevious: boolean;
  /** Last confirmed message this session sent: show "Sent ✓ · Hold to edit". */
  showSent: boolean;
  onLongPress?: () => void;
}) {
  const accent = useGardenAccent();
  const isOwn = message.isOwn;
  const isDeleted = Boolean(message.deletedAt);
  const timeLabel = timeLabelFor(message);
  const showName = !isOwn && !isDeleted && !isGroupedWithPrevious;

  const a11yLabel = [
    isOwn ? 'You' : message.senderName,
    isDeleted ? PORTAL_MESSAGE_DELETED_PREVIEW : message.body,
    message.attachments.length > 0
      ? `${message.attachments.length} ${message.attachments.length === 1 ? 'attachment' : 'attachments'}`
      : null,
    timeLabel,
  ]
    .filter(Boolean)
    .join(', ');

  const bubble = (
    <View
      style={[
        styles.bubble,
        isOwn ? styles.bubbleOwn : styles.bubbleOther,
        isDeleted
          ? styles.bubbleDeleted
          : isOwn
            ? { backgroundColor: accent.clay, borderColor: accent.clayDeep }
            : null,
        message.pending ? styles.pending : null,
      ]}>
      {showName ? (
        <Text style={[styles.sender, { color: accent.clayDeep }]} numberOfLines={1}>
          {message.senderName}
        </Text>
      ) : null}
      {isDeleted ? (
        <Text style={styles.deleted}>{PORTAL_MESSAGE_DELETED_PREVIEW}</Text>
      ) : (
        <>
          {message.body ? (
            <LinkifiedText
              text={message.body}
              style={[styles.body, { color: isOwn ? Garden.white : Garden.ink }]}
              linkColor={isOwn ? Garden.white : accent.clayDeep}
            />
          ) : null}
          {message.attachments.length > 0 ? (
            <View style={styles.attachments}>
              {message.attachments.map((attachment) => (
                <Attachment key={attachment.id} attachment={attachment} isOwn={isOwn} />
              ))}
            </View>
          ) : null}
        </>
      )}
      <View style={styles.footer}>
        {message.pending ? (
          <Ionicons
            name="time-outline"
            size={11}
            color={isOwn ? 'rgba(255,255,255,0.8)' : Garden.soft}
          />
        ) : null}
        <Text
          style={[
            styles.time,
            { color: isDeleted ? Garden.soft : isOwn ? 'rgba(255,255,255,0.8)' : Garden.soft },
          ]}>
          {timeLabel}
        </Text>
        {isOwn && !message.pending && !isDeleted ? (
          <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.9)" />
        ) : null}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.row,
        isOwn ? styles.rowOwn : styles.rowOther,
        isGroupedWithPrevious ? styles.rowGrouped : null,
      ]}>
      <View style={styles.slot}>
        {onLongPress ? (
          <Pressable
            accessibilityLabel={a11yLabel}
            accessibilityHint="Double tap and hold to edit or delete"
            accessibilityActions={[{ name: 'longpress', label: 'Edit or delete' }]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'longpress') onLongPress();
            }}
            delayLongPress={400}
            onLongPress={() => {
              haptic.press();
              onLongPress();
            }}
            style={({ pressed }) => [styles.longPress, pressed && styles.pressedBubble]}>
            {bubble}
          </Pressable>
        ) : (
          <View accessible accessibilityLabel={a11yLabel} style={styles.longPress}>
            {bubble}
          </View>
        )}
        {showSent ? (
          <Text style={styles.sent} accessibilityLiveRegion="polite">
            Sent ✓{onLongPress ? ' · Hold to edit' : ''}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    paddingHorizontal: 14,
    marginTop: 10,
  },
  rowOwn: {
    alignItems: 'flex-end',
  },
  rowOther: {
    alignItems: 'flex-start',
  },
  rowGrouped: {
    marginTop: 4,
  },
  slot: {
    maxWidth: '82%',
    flexShrink: 1,
  },
  longPress: {
    maxWidth: '100%',
  },
  pressedBubble: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 2,
  },
  bubbleOwn: {
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: Garden.white,
    borderColor: Garden.ink12,
    borderBottomLeftRadius: 6,
  },
  bubbleDeleted: {
    backgroundColor: Garden.paper,
    borderColor: Garden.ink25,
    borderStyle: 'dashed',
  },
  pending: {
    opacity: 0.7,
  },
  sender: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  body: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
  },
  deleted: {
    fontFamily: GardenFonts.bodySemi,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 21,
    color: Garden.soft,
  },
  attachments: {
    marginTop: 6,
    gap: 6,
  },
  imageWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Garden.ink12,
  },
  image: {
    width: 220,
    height: 165,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    maxWidth: 240,
  },
  fileOwn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  fileOther: {
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileCopy: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    lineHeight: 17,
  },
  fileMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 11,
    lineHeight: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
  },
  sent: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 4,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    color: Garden.soft,
  },
});
