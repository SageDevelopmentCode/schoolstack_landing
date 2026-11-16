import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GChip, GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent, withAlpha } from '@/components/parent/garden/tokens';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import {
  isMudKitchenSupportListThread,
  MUDKITCHEN_SUPPORT_TERRACOTTA,
} from '@/lib/messages/platform-support';
import type { MessageStudentRef, MessageThreadSummary } from '@/lib/messages/types';

function showSubtitleLine(thread: MessageThreadSummary): boolean {
  if (isMudKitchenSupportListThread(thread)) return false;
  if (thread.listAvatars?.length) return false;
  if (thread.subtitleStudents?.length) return false;
  return Boolean(thread.subtitle);
}

export function threadRowAccessibilityLabel(thread: MessageThreadSummary): string {
  const parts = [thread.title];
  if (isMudKitchenSupportListThread(thread)) parts.push('pinned');
  if (thread.unreadCount > 0) {
    parts.push(`${thread.unreadCount} unread ${thread.unreadCount === 1 ? 'message' : 'messages'}`);
  }
  if (thread.lastMessageTimeLabel) parts.push(thread.lastMessageTimeLabel);
  const preview = thread.lastMessagePreview ?? thread.subtitle;
  if (preview) parts.push(preview);
  return parts.join(', ');
}

/**
 * Inbox row: the whole row is the tap target. Unread rows are bold with an
 * accent wash + count bubble; MudKitchen Support stays pinned with its edge.
 */
export function GardenThreadRow({
  thread,
  onPress,
  onPressIn,
  onStudentPress,
}: {
  thread: MessageThreadSummary;
  onPress: () => void;
  onPressIn?: () => void;
  /** Teacher inbox: student names under the title open that student's page. */
  onStudentPress?: (studentId: string) => void;
}) {
  const accent = useGardenAccent();
  const unread = thread.unreadCount > 0;
  const support = isMudKitchenSupportListThread(thread);
  const preview = thread.lastMessagePreview ?? (showSubtitleLine(thread) ? null : thread.subtitle);

  return (
    <GPressable
      accessibilityLabel={threadRowAccessibilityLabel(thread)}
      accessibilityHint="Opens the conversation"
      onPress={onPress}
      onPressIn={onPressIn}
      pressedScale={0.985}
      style={[
        styles.row,
        unread ? { backgroundColor: accent.wash, borderColor: withAlpha(accent.clay, 0.35) } : null,
        support ? styles.supportRow : null,
      ]}>
      {support ? (
        <View style={[styles.supportEdge, { backgroundColor: MUDKITCHEN_SUPPORT_TERRACOTTA }]} />
      ) : null}
      <View style={styles.avatar}>
        {thread.listAvatars?.length === 2 ? (
          <MessagesDualAvatar avatars={thread.listAvatars} size="md" />
        ) : (
          <MessagesAvatar
            name={thread.title}
            color={thread.color}
            photoUrl={thread.photoUrl}
            size="lg"
            photoBackgroundColor={support && thread.photoUrl ? Garden.white : undefined}
            photoContentFit={support && thread.photoUrl ? 'contain' : 'cover'}
          />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text
            numberOfLines={1}
            style={[styles.title, { fontFamily: unread ? GardenFonts.bodyExtra : GardenFonts.bodyBold }]}>
            {thread.title}
          </Text>
          {thread.lastMessageTimeLabel ? (
            <Text style={[styles.time, unread ? { color: accent.clayDeep } : null]}>
              {thread.lastMessageTimeLabel}
            </Text>
          ) : null}
        </View>

        {showSubtitleLine(thread) ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {thread.subtitle}
          </Text>
        ) : null}

        {onStudentPress && thread.subtitleStudents?.length ? (
          <StudentLinks students={thread.subtitleStudents} onPress={onStudentPress} color={accent.clayDeep} />
        ) : null}

        <View style={styles.bottomLine}>
          <Text
            numberOfLines={2}
            style={[
              styles.preview,
              unread ? { color: Garden.ink, fontFamily: GardenFonts.bodyBold } : null,
            ]}>
            {preview ?? 'No messages yet'}
          </Text>
          {unread ? (
            <View style={[styles.count, { backgroundColor: accent.clay }]}>
              <Text style={styles.countText}>
                {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>

        {support ? <GChip label="Pinned" icon="pin" tone="neutral" style={styles.pinned} /> : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={Garden.ink25} style={styles.chevron} />
    </GPressable>
  );
}

/** "Ava Lopez · Ben Lopez" with each name opening that student (tap targets padded). */
export function StudentLinks({
  students,
  onPress,
  color,
}: {
  students: MessageStudentRef[];
  onPress: (studentId: string) => void;
  color: string;
}) {
  return (
    <View style={styles.students}>
      {students.map((student) => (
        <GPressable
          key={student.id}
          accessibilityRole="link"
          accessibilityLabel={`${student.name}. Open student profile`}
          haptic="tap"
          hitSlop={8}
          onPress={() => onPress(student.id)}
          style={styles.studentChip}>
          <Ionicons name="happy-outline" size={13} color={color} />
          <Text numberOfLines={1} style={[styles.studentName, { color }]}>
            {student.name}
          </Text>
        </GPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  students: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2, marginBottom: 2 },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 26,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  studentName: { fontFamily: GardenFonts.bodyExtra, fontSize: 12.5, maxWidth: 160 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 76,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  supportRow: {
    backgroundColor: Garden.paper,
  },
  supportEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  avatar: {
    paddingTop: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  time: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    color: Garden.soft,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 17,
    color: Garden.soft,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  preview: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  countText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    lineHeight: 15,
    color: Garden.white,
  },
  pinned: {
    marginTop: 4,
  },
  chevron: {
    alignSelf: 'center',
  },
});
