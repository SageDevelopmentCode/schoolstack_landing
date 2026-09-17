import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  familyKickerLabel,
  firstName,
  greetingParts,
  todayLabel,
} from '@/lib/parent/parent-home-utils';

type ParentHomeHeaderProps = {
  displayName: string;
  bulletinEnabled?: boolean;
  bulletinPostCount?: number;
  onOpenBulletin?: () => void;
};

export function ParentHomeHeader({
  displayName,
  bulletinEnabled = false,
  bulletinPostCount = 0,
  onOpenBulletin,
}: ParentHomeHeaderProps) {
  const theme = useParentTheme();
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <StorySectionKicker style={styles.kicker}>{familyKickerLabel(displayName)}</StorySectionKicker>
          <StoryDisplayHeading size="display">
            {greetingPrefix}, {name}. {greetingEmoji}
          </StoryDisplayHeading>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Here&apos;s what your family needs for {todayLabel()}.
          </Text>
        </View>
        {bulletinEnabled && onOpenBulletin ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`School bulletin${bulletinPostCount > 0 ? `, ${bulletinPostCount} posts` : ''}`}
            onPress={onOpenBulletin}
            style={({ pressed }) => [
              styles.bulletinButton,
              {
                backgroundColor: theme.info,
                shadowColor: theme.info,
              },
              pressed && styles.bulletinButtonPressed,
            ]}>
            <Ionicons name="megaphone-outline" size={16} color={theme.white} />
            <Text style={[styles.bulletinButtonLabel, { color: theme.white }]}>
              School bulletin{bulletinPostCount > 0 ? ` (${bulletinPostCount})` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={theme.white} />
          </Pressable>
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
  bulletinButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  bulletinButtonPressed: {
    opacity: 0.9,
  },
  bulletinButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
