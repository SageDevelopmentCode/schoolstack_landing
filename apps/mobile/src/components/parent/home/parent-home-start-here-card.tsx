import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  buildAttentionItems,
  type ParentHomeAttentionItem,
} from '@/components/parent/home/parent-home-attention';
import { StoryAttentionItem } from '@/components/story/story-attention-item';
import { StoryCard } from '@/components/story/story-card';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { getQuickActionIconStyle } from '@/lib/parent/parent-nav';
import type {
  EnrollmentAgreementAmendmentBannerItem,
  EnrollmentAgreementIncompleteBannerItem,
  ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';

type ParentHomeStartHereCardProps = {
  onboardingItems: ResolvedParentOnboardingItem[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  onPressAttentionItem: (item: ParentHomeAttentionItem) => void;
  onOpenOnboarding: () => void;
};

function AttentionIcon({ item }: { item: ParentHomeAttentionItem }) {
  const theme = useParentTheme();
  const iconStyle = getQuickActionIconStyle(item.iconSlug);

  if (item.urgent) {
    return <Ionicons name="alert-circle-outline" size={18} color={theme.alert} />;
  }

  return <Ionicons name={iconStyle.icon} size={18} color={iconStyle.iconColor} />;
}

export function ParentHomeStartHereCard({
  onboardingItems,
  enrollmentAmendmentBannerItems,
  enrollmentIncompleteBannerItems,
  onPressAttentionItem,
  onOpenOnboarding,
}: ParentHomeStartHereCardProps) {
  const theme = useParentTheme();
  const attentionItems = buildAttentionItems({
    onboardingItems,
    enrollmentAmendmentBannerItems,
    enrollmentIncompleteBannerItems,
  });

  const headline =
    attentionItems.length > 0
      ? `${attentionItems.length} thing${attentionItems.length === 1 ? '' : 's'} need your attention`
      : onboardingItems.length > 0
        ? 'Finish setting up your account'
        : "You're all caught up";

  return (
    <StoryCard variant="today" style={styles.card}>
      <StorySectionKicker>Start here</StorySectionKicker>
      <Text style={[styles.headline, { color: theme.ink }]}>{headline}</Text>

      {attentionItems.length > 0 ? (
        <View style={styles.attentionList}>
          {attentionItems.slice(0, 4).map((item, index) => {
            const iconStyle = getQuickActionIconStyle(item.iconSlug);
            const row = (
              <StoryAttentionItem
                icon={<AttentionIcon item={item} />}
                title={item.title}
                subtitle={item.subtitle}
                iconBg={item.urgent ? undefined : iconStyle.iconBg}
                urgent={item.urgent}
                isFirst={index === 0}
              />
            );

            if (item.href) {
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => onPressAttentionItem(item)}
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  {row}
                </Pressable>
              );
            }

            return <View key={item.key}>{row}</View>;
          })}
        </View>
      ) : onboardingItems.length > 0 ? (
        <StoryAttentionItem
          icon={<Ionicons name="clipboard-outline" size={18} color={theme.primary} />}
          title="Complete your onboarding"
          subtitle="A few quick steps to get the most from your portal"
          iconBg={theme.primarySoft}
          isFirst
        />
      ) : (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No urgent tasks right now. Check back for updates from school.
        </Text>
      )}

      {onboardingItems.length > 0 ? (
        <StoryTextLink
          label="Review today's to-dos"
          onPress={onOpenOnboarding}
          style={styles.onboardingLink}
        />
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.five,
  },
  headline: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.three,
  },
  attentionList: {
    gap: 0,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  onboardingLink: {
    marginTop: Spacing.two,
    paddingVertical: 0,
  },
  pressed: {
    opacity: 0.9,
  },
});
