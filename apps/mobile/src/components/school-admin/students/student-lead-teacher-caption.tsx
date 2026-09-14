import { StyleSheet, Text } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

type StudentLeadTeacherCaptionProps = {
  classroomNames: string[];
  leadTeacherLabel: string;
};

function hasAssignedTeacher(leadTeacherLabel: string): boolean {
  const normalized = leadTeacherLabel.trim().toLowerCase();
  return normalized.length > 0 && normalized !== 'unassigned';
}

export function StudentLeadTeacherCaption({
  classroomNames,
  leadTeacherLabel,
}: StudentLeadTeacherCaptionProps) {
  const theme = useParentTheme();

  if (classroomNames.length === 0) {
    return null;
  }

  const caption = hasAssignedTeacher(leadTeacherLabel)
    ? `Lead teacher · ${leadTeacherLabel}`
    : 'No lead teacher yet';

  return (
    <Text
      accessibilityRole="text"
      accessibilityLabel={caption}
      style={[styles.caption, { color: theme.muted }]}
      numberOfLines={1}>
      {caption}
    </Text>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
