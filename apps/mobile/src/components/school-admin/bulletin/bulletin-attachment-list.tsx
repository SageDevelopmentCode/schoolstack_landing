import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type BulletinAttachmentListProps = {
  attachments: BulletinAttachment[];
  removingId?: string | null;
  onRemove: (attachmentId: string) => void;
};

export function BulletinAttachmentList({
  attachments,
  removingId,
  onRemove,
}: BulletinAttachmentListProps) {
  const theme = useParentTheme();

  if (attachments.length === 0) return null;

  return (
    <View style={styles.list}>
      {attachments.map((attachment) => {
        const removing = removingId === attachment.id;
        return (
          <View
            key={attachment.id}
            style={[styles.row, { borderColor: theme.line, backgroundColor: theme.white }]}>
            <Ionicons name="document-outline" size={18} color={theme.muted} />
            <Text style={[styles.fileName, { color: theme.ink }]} numberOfLines={1}>
              {attachment.fileName}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${attachment.fileName}`}
              disabled={removing}
              onPress={() => onRemove(attachment.id)}
              hitSlop={8}>
              {removing ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="close-circle" size={18} color={theme.muted} />
              )}
            </Pressable>
          </View>
        );
      })}
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
  fileName: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
