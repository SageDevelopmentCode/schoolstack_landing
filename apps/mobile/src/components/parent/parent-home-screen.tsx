import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/primary-button';
import { ParentChildCard } from '@/components/parent/parent-child-card';
import { ParentEnrollmentAmendmentBanner } from '@/components/parent/parent-enrollment-amendment-banner';
import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { ParentOnboardingSheet } from '@/components/parent/parent-onboarding-sheet';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Radius, Spacing } from '@/constants/theme';
import { resolveWebUrl, schoolApplyUrl } from '@/lib/admissions/school-apply-url';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import {
  getOnboardingItemRoute,
  getParentFeatureRoute,
  getQuickActionIconStyle,
  parentMoreRoute,
  parentTabRoute,
} from '@/lib/parent/parent-nav';
import type { ResolvedParentOnboardingItem } from '@/lib/parent/parent-portal-api';
import {
  getEventDisplayStyle,
  SCHOOL_EVENT_TYPE_LABELS,
} from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

type ParentHomeScreenProps = {
  slug: string;
};

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

function formatEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function ParentHomeScreen({ slug }: ParentHomeScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const { data, isLoading, isRefreshing, error, refresh } = useParentHome();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const openWebUrl = async (href: string) => {
    await openBrowserAsync(resolveWebUrl(href), {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const handleQuickAction = (featureKey: string) => {
    const route = getParentFeatureRoute(slug, featureKey);
    if (route) {
      router.replace(route);
    }
  };

  const handleOnboardingItem = async (item: ResolvedParentOnboardingItem) => {
    setOnboardingOpen(false);
    if (item.completed) return;

    const route = getOnboardingItemRoute(slug, item.target);
    if (route) {
      router.replace(route);
      return;
    }

    if (item.target.startsWith('url:')) {
      const customUrl = item.target.slice(4).trim();
      if (customUrl) {
        await openWebUrl(customUrl);
      }
      return;
    }

    await openWebUrl(item.href);
  };

  if (isLoading && !data) {
    return <ParentHomeSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <PrimaryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) return null;

  const name = firstName(data.userProfile.displayName);
  const trackedOnboarding = data.onboardingItems.filter((item) => item.autoTracked);
  const completedOnboarding = trackedOnboarding.filter((item) => item.completed).length;
  const onboardingSubtitle =
    trackedOnboarding.length > 0
      ? completedOnboarding === trackedOnboarding.length
        ? "You're all set"
        : `${completedOnboarding} of ${trackedOnboarding.length} complete`
      : 'Finish setting up your account';

  return (
    <>
      <ScrollView
        style={{ backgroundColor: theme.bg }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.accent}
          />
        }>
        <Animated.View entering={FadeInDown.duration(350)} style={styles.greeting}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {greetingPrefix()},
          </ThemedText>
          <ThemedText type="displayAccent" style={{ color: theme.accentDark, marginTop: Spacing.two }}>
            {name}.
          </ThemedText>
        </Animated.View>

        <ParentEnrollmentAmendmentBanner
          items={data.enrollmentAmendmentBannerItems}
          onPressItem={(item) => void openWebUrl(item.enrollmentHref)}
        />

        {data.onboardingItems.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(40).duration(350)}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setOnboardingOpen(true)}
              style={({ pressed }) => [
                styles.onboardingCard,
                {
                  backgroundColor: `${theme.accent}1a`,
                  borderColor: `${theme.accent}33`,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}>
              <View style={[styles.onboardingIcon, { backgroundColor: `${theme.accent}26` }]}>
                <Ionicons name="clipboard-outline" size={18} color={theme.accent} />
              </View>
              <View style={styles.onboardingCopy}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Complete your onboarding
                </ThemedText>
                <ThemedText type="small" style={{ color: `${theme.accent}b3`, marginTop: 2 }}>
                  {onboardingSubtitle}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={`${theme.accent}99`} />
            </Pressable>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(60).duration(350)} style={styles.section}>
          <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            My Children
          </ThemedText>

          {data.familyChildren.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                styles.emptyCardColumn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  ...adminCardShadow(theme),
                },
              ]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                We don&apos;t have any student records from your applications yet. Visit your{' '}
                <ThemedText
                  type="smallBold"
                  style={{ color: theme.accent }}
                  onPress={() => void openWebUrl(schoolApplyUrl(slug))}>
                  application dashboard
                </ThemedText>{' '}
                to get started.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.childrenList}>
              {data.familyChildren.map((child) => (
                <ParentChildCard
                  key={child.applicationId}
                  child={child}
                  onViewDetails={() => router.push(parentMoreRoute(slug, 'children'))}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {data.quickActions.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.section}>
            <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Quick Actions
            </ThemedText>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.quickActionsScroll}
              contentContainerStyle={styles.quickActionsRow}>
              {data.quickActions.map((action) => {
                const iconStyle = getQuickActionIconStyle(action.iconSlug);
                return (
                  <Pressable
                    key={action.key}
                    accessibilityRole="button"
                    onPress={() => handleQuickAction(action.key)}
                    style={({ pressed }) => [
                      styles.quickActionChip,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        opacity: action.enabled ? (pressed ? 0.9 : 1) : 0.5,
                      },
                    ]}>
                    <View style={[styles.quickActionIcon, { backgroundColor: iconStyle.iconBg }]}>
                      <Ionicons name={iconStyle.icon} size={18} color={iconStyle.iconColor} />
                    </View>
                    <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                      {action.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(180).duration(350)} style={styles.section}>
          <View style={styles.eventsHeader}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              Upcoming events
            </ThemedText>
            {data.upcomingEvents.length > 0 ? (
              <Pressable onPress={() => router.replace(parentTabRoute(slug, 'calendar'))}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  View calendar
                </ThemedText>
              </Pressable>
            ) : null}
          </View>

          {data.upcomingEvents.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                styles.emptyCardColumn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  ...adminCardShadow(theme),
                },
              ]}>
              <View style={[styles.eventsEmptyIcon, { backgroundColor: theme.accentGlow }]}>
                <Ionicons name="calendar-outline" size={22} color={theme.accent} />
              </View>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                No events for now
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 4 }}>
                School events will show up here.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {data.upcomingEvents.map((event: OrganizationEvent) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onPress={() => router.replace(parentTabRoute(slug, 'calendar'))}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <ParentOnboardingSheet
        visible={onboardingOpen}
        items={data.onboardingItems}
        onClose={() => setOnboardingOpen(false)}
        onSelectItem={(item) => void handleOnboardingItem(item)}
      />
    </>
  );
}

function EventRow({ event, onPress }: { event: OrganizationEvent; onPress: () => void }) {
  const theme = useAdminTheme();
  const colors = getEventDisplayStyle(event);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.eventRow,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...adminCardShadow(theme),
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={styles.eventCopy}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }} numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 2 }}>
          {formatEventDate(event.date)}
          {!event.isAllDay && event.time ? ` · ${event.time}` : ''}
        </ThemedText>
      </View>
      <View style={[styles.eventBadge, { backgroundColor: colors.bg }]}>
        <ThemedText type="badge" style={{ color: colors.text, fontSize: 9 }}>
          {SCHOOL_EVENT_TYPE_LABELS[event.type].toUpperCase()}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  retry: {
    minWidth: 140,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  greeting: {
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
  },
  childrenList: {
    gap: Spacing.three,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  emptyCardColumn: {
    flexDirection: 'column',
  },
  quickActionsScroll: {
    overflow: 'visible',
  },
  quickActionsRow: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  onboardingIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCopy: {
    flex: 1,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eventsEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  eventsList: {
    gap: Spacing.two,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  eventCopy: {
    flex: 1,
    minWidth: 0,
  },
  eventBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
