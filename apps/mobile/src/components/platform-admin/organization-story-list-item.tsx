import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { OrganizationLogo } from '@/components/organization-logo';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import {
  organizationStatusChipTone,
  organizationStatusLabel,
} from '@/lib/admissions/application-status-ui';
import type { AdminOrganization } from '@/lib/organizations';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OrganizationStoryListItemProps = {
  organization: AdminOrganization;
  onPress: (organization: AdminOrganization) => void;
};

export function OrganizationStoryListItem({
  organization,
  onPress,
}: OrganizationStoryListItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const content = (
    <StoryCard compact style={styles.rowCard}>
      <View style={styles.rowInner}>
        <OrganizationLogo
          logoSrc={organization.branding.logoSrc}
          logoAlt={organization.branding.logoAlt}
          name={organization.name}
          style={styles.logo}
        />
        <View style={styles.mainCopy}>
          <Text style={styles.name} numberOfLines={1}>
            {organization.name}
          </Text>
          <Text style={styles.slug} numberOfLines={1}>
            {organization.slug}
          </Text>
          <StoryChip
            tone={organizationStatusChipTone(organization.status)}
            label={organizationStatusLabel(organization.status)}
          />
        </View>
        <Ionicons name="chevron-forward" size={18} color={Story.muted} />
      </View>
    </StoryCard>
  );

  if (isMobileE2e) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={organization.name}
        onPress={() => onPress(organization)}
        style={({ pressed }) => [pressed && styles.rowPressed]}>
        {content}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={organization.name}
      onPress={() => onPress(organization)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}>
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    padding: 0,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowPressed: {
    opacity: 0.85,
  },
  logo: {
    width: 36,
    height: 36,
  },
  mainCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: Story.ink,
  },
  slug: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: Story.muted,
  },
});
