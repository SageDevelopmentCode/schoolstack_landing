import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius } from '@/constants/theme';
import {
  canPreviewBulletinAttachment,
  isBulletinImageAttachment,
  isBulletinPdfAttachment,
} from '@/lib/school-bulletin/attachment-preview';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';

const MAX_VISIBLE_CELLS = 4;
const MAX_PREVIEW_BEFORE_OVERFLOW = 3;

type BulletinAttachmentPreviewGridProps = {
  attachments: BulletinAttachment[];
  onOpen?: () => void;
};

function PdfPlaceholderCell({
  fileName,
  onOpen,
  height,
}: {
  fileName: string;
  onOpen?: () => void;
  height?: number;
}) {
  const theme = useParentTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${fileName}`}
      onPress={onOpen}
      style={[
        styles.cell,
        styles.cellCentered,
        height ? { height } : null,
        { borderColor: theme.line, backgroundColor: theme.infoBg },
      ]}>
      <Ionicons name="document-text-outline" size={24} color={theme.info} />
      <Text style={[styles.fileName, { color: theme.muted }]} numberOfLines={2}>
        {fileName}
      </Text>
      <View style={[styles.pdfBadge, { backgroundColor: theme.white }]}>
        <Text style={[styles.pdfBadgeText, { color: theme.info }]}>PDF</Text>
      </View>
    </Pressable>
  );
}

function PreviewCell({
  attachment,
  onOpen,
}: {
  attachment: BulletinAttachment;
  onOpen?: () => void;
}) {
  const theme = useParentTheme();

  if (!attachment.downloadUrl) {
    return (
      <View style={[styles.cell, styles.cellCentered, { borderColor: theme.line }]}>
        <Ionicons name="document-outline" size={20} color={theme.muted} />
      </View>
    );
  }

  if (isBulletinImageAttachment(attachment.mimeType)) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${attachment.fileName}`}
        onPress={onOpen}
        style={[styles.cell, { borderColor: theme.line }]}>
        <Image
          source={{ uri: attachment.downloadUrl }}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={attachment.fileName}
        />
      </Pressable>
    );
  }

  if (isBulletinPdfAttachment(attachment.mimeType) && attachment.downloadUrl) {
    return <PdfPlaceholderCell fileName={attachment.fileName} onOpen={onOpen} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${attachment.fileName}`}
      onPress={onOpen}
      style={[styles.cell, styles.cellCentered, { borderColor: theme.line }]}>
      <Ionicons name="document-outline" size={20} color={theme.info} />
      <Text style={[styles.fileName, { color: theme.muted }]} numberOfLines={2}>
        {attachment.fileName}
      </Text>
    </Pressable>
  );
}

export function BulletinAttachmentPreviewGrid({
  attachments,
  onOpen,
}: BulletinAttachmentPreviewGridProps) {
  const theme = useParentTheme();

  if (attachments.length === 0) return null;

  const previewableAttachments = attachments.filter(
    (attachment) =>
      attachment.downloadUrl && canPreviewBulletinAttachment(attachment.mimeType),
  );
  const displayAttachments =
    previewableAttachments.length > 0 ? previewableAttachments : attachments;
  const hasOverflow = displayAttachments.length > MAX_VISIBLE_CELLS;
  const visibleCount = hasOverflow
    ? MAX_PREVIEW_BEFORE_OVERFLOW
    : Math.min(displayAttachments.length, MAX_VISIBLE_CELLS);
  const visibleAttachments = displayAttachments.slice(0, visibleCount);
  const overflowCount = displayAttachments.length - visibleCount;

  if (displayAttachments.length === 1) {
    const attachment = displayAttachments[0];
    if (isBulletinImageAttachment(attachment.mimeType) && attachment.downloadUrl) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${attachment.fileName}`}
          onPress={onOpen}
          style={[styles.singleImage, { borderColor: theme.line }]}>
          <Image
            source={{ uri: attachment.downloadUrl }}
            style={styles.singleImageContent}
            contentFit="cover"
            accessibilityLabel={attachment.fileName}
          />
        </Pressable>
      );
    }

    if (isBulletinPdfAttachment(attachment.mimeType) && attachment.downloadUrl) {
      return (
        <PdfPlaceholderCell fileName={attachment.fileName} onOpen={onOpen} height={160} />
      );
    }
  }

  return (
    <View style={styles.grid}>
      {visibleAttachments.map((attachment) => (
        <View key={attachment.id} style={styles.gridCell}>
          <PreviewCell attachment={attachment} onOpen={onOpen} />
        </View>
      ))}
      {hasOverflow ? (
        <View style={styles.gridCell}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${overflowCount} more attachments`}
            onPress={onOpen}
            style={[styles.cell, styles.overflowCell, { borderColor: theme.line, backgroundColor: theme.infoBg }]}>
            <Text style={[styles.overflowCount, { color: theme.info }]}>+{overflowCount}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridCell: {
    width: '48.5%',
  },
  cell: {
    aspectRatio: 4 / 3,
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cellCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fileName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    textAlign: 'center',
  },
  singleImage: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  singleImageContent: {
    width: '100%',
    height: 220,
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
  overflowCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowCount: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '700',
  },
});
