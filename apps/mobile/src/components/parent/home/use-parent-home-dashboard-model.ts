import { useEffect, useMemo, useState } from 'react';

import {
  buildAttentionItems,
  buildPortalAttentionItems,
} from '@/components/parent/home/parent-home-attention';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-dashboard';
import { buildParentActivityNotificationContext } from '@/lib/parent/fetch-activity-notifications';
import {
  isParentFeatureEnabled,
  isParentHomeFridayBranchEnabled,
  resolveFridayBranchSettingsFromHome,
} from '@/lib/parent/parent-features';
import type { ResolvedParentOnboardingItem } from '@/lib/parent/parent-portal-api';

export type ParentHomeGreeting = {
  prefix: 'Good morning' | 'Good afternoon' | 'Good evening';
  emoji: string;
  firstName: string;
  familyLabel: string;
  todayLabel: string;
};

/** Mirrors the web `useParentHomeModel` greeting (hour-based prefix + emoji, family label, long date). */
export function buildParentHomeGreeting(displayName: string, now = new Date()): ParentHomeGreeting {
  const hour = now.getHours();
  const prefix = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  return {
    prefix,
    emoji,
    firstName,
    familyLabel: lastName ? `The ${lastName} family` : 'Your family',
    todayLabel: now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

/**
 * View-model for the parent Home dashboard: sheet state plus the derived data
 * every Home layout needs. Shared by `ParentHomeDashboard` and the Home lab.
 */
export function useParentHomeDashboardModel(props: ParentHomeDashboardProps) {
  const {
    slug,
    programSlug,
    programId,
    coopModeEnabled = false,
    parentNavBasePath,
    data,
    signupAttentionItems,
    onOnboardingItem,
  } = props;

  const activityNotificationContext = useMemo(
    () =>
      buildParentActivityNotificationContext({
        slug,
        programSlug,
        programId,
        coopModeEnabled,
        parentNavBasePath,
      }),
    [coopModeEnabled, parentNavBasePath, programId, programSlug, slug],
  );

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [heroProfilePhotoUrl, setHeroProfilePhotoUrl] = useState<string | null>(
    data.userProfile.profilePhotoUrl,
  );

  useEffect(() => {
    setHeroProfilePhotoUrl(data.userProfile.profilePhotoUrl);
  }, [data.userProfile.profilePhotoUrl]);

  const nextEvent = data.upcomingEvents[0] ?? null;
  const enrollmentIncompleteBannerItems = useMemo(
    () => data.enrollmentIncompleteBannerItems ?? [],
    [data.enrollmentIncompleteBannerItems],
  );
  const formAttentionItems = useMemo(
    () => data.formAttentionItems ?? [],
    [data.formAttentionItems],
  );
  const bulletinEnabled = data.bulletinEnabled ?? false;
  const bulletinPosts = useMemo(() => data.bulletinPosts ?? [], [data.bulletinPosts]);
  const messagesEnabled = isParentFeatureEnabled(data.features, 'messages');
  const showCoopSchoolUpdates = coopModeEnabled && !bulletinEnabled && messagesEnabled;
  const fridayBranchEnabled =
    isParentHomeFridayBranchEnabled(data.features, resolveFridayBranchSettingsFromHome(data)) &&
    Boolean(data.fridayBranchHome);
  const firstChildApplicationId =
    data.familyChildren.find((child) => Boolean(child.studentId))?.applicationId ?? null;

  const portalAttentionItems = useMemo(
    () =>
      buildPortalAttentionItems({
        slug,
        programSlug,
        enrollmentAmendmentBannerItems: data.enrollmentAmendmentBannerItems,
        enrollmentIncompleteBannerItems,
        formAttentionItems,
        signupAttentionItems,
      }),
    [
      slug,
      programSlug,
      data.enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems,
      formAttentionItems,
      signupAttentionItems,
    ],
  );

  const attentionItems = useMemo(
    () =>
      buildAttentionItems({
        slug,
        programSlug,
        onboardingItems: data.onboardingItems,
        enrollmentAmendmentBannerItems: data.enrollmentAmendmentBannerItems,
        enrollmentIncompleteBannerItems,
        formAttentionItems,
        signupAttentionItems,
        familyChildren: data.familyChildren,
      }),
    [
      slug,
      programSlug,
      data.onboardingItems,
      data.enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems,
      formAttentionItems,
      signupAttentionItems,
      data.familyChildren,
    ],
  );

  const onboardingTotal = data.onboardingItems.length;
  const onboardingDone = data.onboardingItems.filter((item) => item.completed).length;
  const showTodosLink = portalAttentionItems.length > 0 || onboardingTotal > 0;
  const isCaughtUp = attentionItems.length === 0 && onboardingDone >= onboardingTotal;

  const greeting = useMemo(
    () => buildParentHomeGreeting(data.userProfile.displayName),
    [data.userProfile.displayName],
  );

  const handleOnboardingItem = async (item: ResolvedParentOnboardingItem) => {
    setOnboardingOpen(false);
    if (item.completed) return;
    onOnboardingItem(item);
  };

  return {
    activityNotificationContext,
    onboardingOpen,
    setOnboardingOpen,
    supportSheetOpen,
    setSupportSheetOpen,
    accountSheetOpen,
    setAccountSheetOpen,
    bulletinOpen,
    setBulletinOpen,
    notificationsOpen,
    setNotificationsOpen,
    heroProfilePhotoUrl,
    setHeroProfilePhotoUrl,
    nextEvent,
    enrollmentIncompleteBannerItems,
    formAttentionItems,
    bulletinEnabled,
    bulletinPosts,
    messagesEnabled,
    showCoopSchoolUpdates,
    fridayBranchEnabled,
    firstChildApplicationId,
    portalAttentionItems,
    attentionItems,
    onboardingTotal,
    onboardingDone,
    showTodosLink,
    isCaughtUp,
    greeting,
    handleOnboardingItem,
  };
}

export type ParentHomeDashboardModel = ReturnType<typeof useParentHomeDashboardModel>;
