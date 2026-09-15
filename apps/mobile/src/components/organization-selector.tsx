import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { OrganizationLogo } from '@/components/organization-logo';
import { StoryCard } from '@/components/story/story-card';
import { StoryTextField } from '@/components/story/story-text-field';
import type { LiveOrganization } from '@/lib/organizations';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { isMobileE2e } from '@/lib/e2e';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OrganizationSelectorProps = {
  organizations: LiveOrganization[];
  onSelect: (organization: LiveOrganization) => void;
  accessibleSlugs?: string[] | null;
  disabled?: boolean;
};

function OrganizationRow({
  item,
  disabled,
  onSelect,
}: {
  item: LiveOrganization;
  disabled: boolean;
  onSelect: (organization: LiveOrganization) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const content = (
    <StoryCard compact style={styles.rowCard}>
      <View style={styles.rowInner}>
        <OrganizationLogo
          logoSrc={item.branding.logoSrc}
          logoAlt={item.branding.logoAlt}
          name={item.name}
          style={styles.logo}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={18} color={Story.muted} />
      </View>
    </StoryCard>
  );

  if (isMobileE2e) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onSelect(item)}
        style={({ pressed }) => [pressed && !disabled && styles.rowPressed, disabled && styles.rowDisabled]}>
        {content}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => onSelect(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, disabled && styles.rowDisabled]}>
      {content}
    </AnimatedPressable>
  );
}

export function OrganizationSelector({
  organizations,
  onSelect,
  accessibleSlugs = null,
  disabled = false,
}: OrganizationSelectorProps) {
  const [query, setQuery] = useState('');

  const visibleOrganizations = useMemo(() => {
    if (!accessibleSlugs) {
      return organizations;
    }

    const allowed = new Set(accessibleSlugs);
    return organizations.filter((organization) => allowed.has(organization.slug));
  }, [accessibleSlugs, organizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return visibleOrganizations;

    return visibleOrganizations.filter(
      (organization) =>
        organization.name.toLowerCase().includes(normalizedQuery) ||
        organization.slug.toLowerCase().includes(normalizedQuery),
    );
  }, [query, visibleOrganizations]);

  const showSearch = visibleOrganizations.length > 4;

  if (visibleOrganizations.length === 0) {
    return (
      <StoryCard compact style={styles.emptyState}>
        <Text style={styles.emptyText}>
          {accessibleSlugs
            ? 'You do not have access to any schools for this account. Try signing in with a different account.'
            : 'No schools are available for sign-in right now. Please check back later.'}
        </Text>
      </StoryCard>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showSearch ? (
        <StoryTextField
          accessibilityLabel="Search schools"
          placeholder="Search schools…"
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
        />
      ) : null}

      <FlatList
        data={filteredOrganizations}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No schools match your search.</Text>
        }
        renderItem={({ item }) => (
          <OrganizationRow item={item} disabled={disabled} onSelect={onSelect} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
  },
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
  rowDisabled: {
    opacity: 0.6,
  },
  logo: {
    width: 36,
    height: 36,
  },
  name: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: Story.ink,
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    padding: Spacing.four,
  },
  emptyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Story.muted,
    textAlign: 'center',
  },
});
