import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  firstName,
  greetingParts,
  portalRoleLabel,
  staffKickerLabel,
  todayLabel,
} from '@/lib/teacher/teacher-home-utils';
import type { StaffPortalRole } from '@/lib/teacher/teacher-portal-api';

type TeacherHomeHeaderProps = {
  schoolName: string;
  displayName: string;
  roleTitle: string | null;
  portalRole: StaffPortalRole | null;
  bulletinEnabled: boolean;
  bulletinPostCount: number;
  onOpenBulletin?: () => void;
};

export function TeacherHomeHeader({
  schoolName,
  displayName,
  roleTitle,
  portalRole,
  bulletinEnabled,
  bulletinPostCount,
  onOpenBulletin,
}: TeacherHomeHeaderProps) {
  const theme = useParentTheme();
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <StorySectionKicker style={styles.kicker}>{staffKickerLabel(schoolName)}</StorySectionKicker>
          <StoryDisplayHeading size="display">
            {greetingPrefix}, {name}. {greetingEmoji}
          </StoryDisplayHeading>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Here&apos;s your classroom picture for {todayLabel()}.
          </Text>
          <Text style={[styles.roleLine, { color: theme.muted }]}>
            {roleTitle || 'Staff'} · {portalRoleLabel(portalRole)}
          </Text>
        </View>
        {bulletinEnabled && onOpenBulletin ? (
          <View style={styles.bulletinAction}>
            <Text
              accessibilityRole="button"
              onPress={onOpenBulletin}
              style={[styles.bulletinButton, { color: theme.primary }]}>
              School bulletin{bulletinPostCount > 0 ? ` (${bulletinPostCount})` : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  topRow: {
    gap: Spacing.three,
  },
  copy: {
    gap: Spacing.two,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
  },
  roleLine: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  bulletinAction: {
    alignSelf: 'flex-start',
  },
  bulletinButton: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
});
