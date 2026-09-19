import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import {
  canPreviewBulletinAttachment,
  isBulletinImageAttachment,
  isBulletinPdfAttachment,
} from '@/lib/school-bulletin/attachment-preview';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';

type BulletinAttachmentListProps = {
  attachments: BulletinAttachment[];
  onOpenAttachment: (attachment: BulletinAttachment, index: number) => void;
};

async function openAttachmentUrl(url: string) {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

function AttachmentRow({
  attachment,
  index,
  onOpenAttachment,
}: {
  attachment: BulletinAttachment;
  index: number;
  onOpenAttachment: (attachment: BulletinAttachment, index: number) => void;
}) {
  const theme = useParentTheme();
  const isPreviewable =
    Boolean(attachment.downloadUrl) && canPreviewBulletinAttachment(attachment.mimeType);
  const isImage = isBulletinImageAttachment(attachment.mimeType);
  const isPdf = isBulletinPdfAttachment(attachment.mimeType);

  if (!attachment.downloadUrl) {
    return (
      <View
        style={[
          styles.row,
          styles.rowDisabled,
          { borderColor: theme.line, backgroundColor: theme.white },
        ]}>
        <Ionicons name="document-outline" size={16} color={theme.muted} />
        <Text style={[styles.fileName, { color: theme.muted }]} numberOfLines={1}>
          {attachment.fileName}
        </Text>
      </View>
    );
  }

  if (isPreviewable) {
    const handlePress = () => {
      if (isPdf) {
        void openAttachmentUrl(attachment.downloadUrl!);
        return;
      }
      onOpenAttachment(attachment, index);
    };

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${attachment.fileName}`}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.row,
          { borderColor: theme.line, backgroundColor: theme.white },
          pressed && { opacity: 0.9 },
        ]}>
        {isImage ? (
          <View style={[styles.thumbnail, { borderColor: theme.line }]}>
            <Image
              source={{ uri: attachment.downloadUrl }}
              style={styles.thumbnailImage}
              contentFit="cover"
              accessibilityLabel=""
            />
          </View>
        ) : (
          <View style={[styles.thumbnail, styles.pdfThumbnail, { borderColor: theme.line, backgroundColor: theme.infoBg }]}>
            <Ionicons name="document-text-outline" size={16} color={theme.info} />
          </View>
        )}
        <Text style={[styles.fileName, { color: theme.ink }]} numberOfLines={1}>
          {attachment.fileName}
        </Text>
        {isPdf ? (
          <View style={[styles.pdfBadge, { backgroundColor: theme.infoBg }]}>
            <Text style={[styles.pdfBadgeText, { color: theme.info }]}>PDF</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Download ${attachment.fileName}`}
      onPress={() => void Linking.openURL(attachment.downloadUrl!)}
      style={({ pressed }) => [
        styles.row,
        styles.downloadRow,
        { borderColor: theme.line, backgroundColor: theme.infoBg },
        pressed && { opacity: 0.9 },
      ]}>
      <Ionicons name="document-outline" size={14} color={theme.info} />
      <Text style={[styles.fileName, { color: theme.info }]} numberOfLines={1}>
        {attachment.fileName}
      </Text>
    </Pressable>
  );
}

export function BulletinAttachmentList({
  attachments,
  onOpenAttachment,
}: BulletinAttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <View style={styles.list}>
      {attachments.map((attachment, index) => (
        <AttachmentRow
          key={attachment.id}
          attachment={attachment}
          index={index}
          onOpenAttachment={onOpenAttachment}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  downloadRow: {
    alignSelf: 'flex-start',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pdfThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  pdfBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pdfBadgeText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
