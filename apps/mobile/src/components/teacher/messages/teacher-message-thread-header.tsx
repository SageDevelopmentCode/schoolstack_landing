import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MessageStudentSubtitle } from '@/components/teacher/messages/message-student-subtitle';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { MessagesDualAvatar } from '@/components/school-admin/messages/messages-dual-avatar';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Spacing } from '@/constants/theme';
import { teacherStudentDetailRoute } from '@/lib/teacher/teacher-nav';
import type { MessageThreadSummary } from '@/lib/messages/types';

type TeacherMessageThreadHeaderProps = {
  thread: Pick<
    MessageThreadSummary,
    'title' | 'subtitle' | 'subtitleStudents' | 'color' | 'photoUrl' | 'listAvatars'
  >;
  organizationSlug: string;
  backLabel?: string;
};

export function TeacherMessageThreadHeader({
  thread,
  organizationSlug,
  backLabel = 'Messages',
}: TeacherMessageThreadHeaderProps) {
  const theme = useParentTheme();
  const router = useRouter();

  const handleStudentPress = (studentId: string) => {
    router.push(teacherStudentDetailRoute(organizationSlug, studentId, { scope: 'assigned' }));
  };

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.line, backgroundColor: theme.paper },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Back to ${backLabel}`}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.primary} />
        <Text style={[styles.backLabel, { color: theme.primary }]}>{backLabel}</Text>
      </Pressable>
      <View style={styles.center}>
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
        <View style={styles.titleBlock}>
          <Text style={[styles.storyTitle, { color: theme.ink }]} numberOfLines={1}>
            {thread.title}
          </Text>
          <MessageStudentSubtitle
            students={thread.subtitleStudents}
            subtitle={thread.subtitle}
            onStudentPress={handleStudentPress}
          />
        </View>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 100,
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  titleBlock: {
    flexShrink: 1,
    maxWidth: 180,
  },
  storyTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  spacer: {
    minWidth: 100,
  },
});
