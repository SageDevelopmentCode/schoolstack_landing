import { StyleSheet, Text, View } from 'react-native';

import { ScalePressable } from '@/components/scale-pressable';
import {
  MESSAGES_ROW_PADDING_HORIZONTAL,
  MESSAGES_ROW_PADDING_VERTICAL,
} from '@/components/parent/messages/messages-layout';
import { MessageStudentSubtitle } from '@/components/teacher/messages/message-student-subtitle';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import { StoryFonts } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { teacherStudentDetailRoute } from '@/lib/teacher/teacher-nav';
import type { MessageThreadSummary } from '@/lib/messages/types';
import { useRouter } from 'expo-router';

type TeacherMessageThreadRowProps = {
  thread: MessageThreadSummary;
  organizationSlug: string;
  onPress: () => void;
};

function shouldShowPlainSubtitle(thread: MessageThreadSummary): boolean {
  if (thread.listAvatars?.length) return false;
  if (thread.subtitleStudents?.length) return false;
  return Boolean(thread.subtitle);
}

export function TeacherMessageThreadRow({
  thread,
  organizationSlug,
  onPress,
}: TeacherMessageThreadRowProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const hasUnread = thread.unreadCount > 0;
  const showPlainSubtitle = shouldShowPlainSubtitle(thread);

  const handleStudentPress = (studentId: string) => {
    router.push(teacherStudentDetailRoute(organizationSlug, studentId, { scope: 'assigned' }));
  };

  return (
    <ScalePressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.rowPressable,
        {
          backgroundColor: theme.white,
          borderBottomColor: theme.line,
        },
      ]}>
      <View style={styles.row}>
        {thread.listAvatars?.length === 2 ? (
          <MessagesDualAvatar avatars={thread.listAvatars} size="sm" />
        ) : (
          <MessagesAvatar
            name={thread.title}
            color={thread.color}
            photoUrl={thread.photoUrl}
            size="sm"
          />
        )}
        <View style={styles.content}>
          <View style={styles.topLine}>
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: theme.ink,
                  fontWeight: hasUnread ? '700' : '600',
                },
              ]}>
              {thread.title}
            </Text>
            {thread.lastMessageTimeLabel ? (
              <View style={styles.timeWrap}>
                {hasUnread ? (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                ) : null}
                <Text style={[styles.timeLabel, { color: theme.muted }]}>
                  {thread.lastMessageTimeLabel}
                </Text>
              </View>
            ) : null}
          </View>
          {thread.subtitleStudents?.length ? (
            <MessageStudentSubtitle
              students={thread.subtitleStudents}
              subtitle={thread.subtitle}
              onStudentPress={handleStudentPress}
            />
          ) : null}
          {showPlainSubtitle ? (
            <Text numberOfLines={1} style={[styles.subtitle, { color: theme.muted }]}>
              {thread.subtitle}
            </Text>
          ) : null}
          {thread.lastMessagePreview ? (
            <Text
              numberOfLines={1}
              style={[
                styles.preview,
                {
                  color: theme.muted,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}>
              {thread.lastMessagePreview}
            </Text>
          ) : null}
        </View>
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  rowPressable: {
    paddingHorizontal: MESSAGES_ROW_PADDING_HORIZONTAL,
    paddingVertical: MESSAGES_ROW_PADDING_VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  preview: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
