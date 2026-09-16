import { StyleSheet, Text } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { MessageStudentRef } from '@/lib/messages/types';

type MessageStudentSubtitleProps = {
  students?: MessageStudentRef[];
  subtitle?: string;
  onStudentPress?: (studentId: string) => void;
  numberOfLines?: number;
};

export function MessageStudentSubtitle({
  students,
  subtitle,
  onStudentPress,
  numberOfLines = 1,
}: MessageStudentSubtitleProps) {
  const theme = useParentTheme();

  if (!students?.length) {
    if (!subtitle) return null;
    return (
      <Text
        numberOfLines={numberOfLines}
        style={[styles.subtitle, { color: theme.muted }]}>
        {subtitle}
      </Text>
    );
  }

  if (!onStudentPress) {
    return (
      <Text
        numberOfLines={numberOfLines}
        style={[styles.subtitle, { color: theme.muted }]}>
        {subtitle ?? students.map((student) => student.name).join(' · ')}
      </Text>
    );
  }

  return (
    <Text numberOfLines={numberOfLines} style={[styles.subtitle, { color: theme.muted }]}>
      {students.map((student, index) => (
        <Text key={student.id}>
          {index > 0 ? <Text style={{ color: theme.muted }}> · </Text> : null}
          <Text
            onPress={() => onStudentPress(student.id)}
            style={[styles.studentLink, { color: theme.primary }]}>
            {student.name}
          </Text>
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  studentLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
