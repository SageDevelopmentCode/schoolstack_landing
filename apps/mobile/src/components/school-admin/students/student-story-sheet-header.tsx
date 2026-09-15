import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type StudentStorySheetHeaderProps = {
  studentName: string;
  photoUrl?: string | null;
  statusLabel: string;
  subtitle: string;
  showHealthIndicator?: boolean;
  onClose: () => void;
};

export function StudentStorySheetHeader({
  studentName,
  photoUrl,
  statusLabel,
  subtitle,
  showHealthIndicator = false,
  onClose,
}: StudentStorySheetHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close student profile"
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}>
        <Text style={[styles.closeLabel, { color: theme.primary }]}>Close</Text>
      </Pressable>

      <View style={styles.hero}>
        <StudentPhoto
          name={studentName}
          photoUrl={photoUrl}
          size="lg"
          showHealthIndicator={showHealthIndicator}
        />
        <View style={styles.heroCopy}>
          <StorySectionKicker style={styles.kicker}>Student record</StorySectionKicker>
          <View style={styles.titleRow}>
            <StoryDisplayHeading size="section" style={styles.title}>
              {studentName}
            </StoryDisplayHeading>
            <StoryChip tone="success" label={statusLabel} />
          </View>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  closeLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
