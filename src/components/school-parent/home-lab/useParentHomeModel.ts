"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import type ParentHomePage from "@/components/school-parent/ParentHomePage";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import {
  isParentFeatureEnabled,
  parentDocumentationPath,
  schoolParentPath,
} from "@/lib/organization-settings/parent-routes";
import { isParentHomeFridayBranchEnabled } from "@/lib/organization-settings/parent-home-features";
import {
  buildParentDocumentationGuides,
  groupParentDocumentationByCategory,
  type ParentDocGuide,
} from "@/lib/parent-portal/parent-documentation";
import {
  buildPortalAttentionItems,
  buildStartHereAttentionItems,
} from "@/lib/parent-portal/parent-home-attention";
import { formatChildProgramLine } from "@/components/school-parent/children/parent-children-utils";

/**
 * Home-lab variants take exactly the same props as the live `ParentHomePage`,
 * so `ParentHomePageShell` can swap them in without touching data loading.
 */
export type ParentHomeVariantProps = ComponentProps<typeof ParentHomePage>;

export function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

export function familyKickerLabel(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `The ${parts[parts.length - 1]} family`;
  if (parts.length === 1) return `The ${parts[0]} family`;
  return "Your family";
}

export function greetingParts(): { prefix: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { prefix: "Good morning", emoji: "☀️" };
  if (hour < 17) return { prefix: "Good afternoon", emoji: "🌤️" };
  return { prefix: "Good evening", emoji: "🌙" };
}

/** Grade + programs only (the checklist is shown separately as a bar). */
export function childMetaLine(child: FamilyChildOverview): string {
  const gradePart = child.grade ? `Grade ${child.grade}` : "Grade not listed";
  const programs = formatChildProgramLine(child);
  return programs ? `${gradePart} · ${programs}` : gradePart;
}

export function childApplicationHref(
  schoolSlug: string,
  child: FamilyChildOverview,
  previewBasePath?: string,
): string {
  const enrollment = child.isEnrolled || child.status === "enrolling";
  if (previewBasePath) {
    return enrollment
      ? `${previewBasePath}/apply/${child.applicationId}/enrollment`
      : `${previewBasePath}/apply/${child.applicationId}`;
  }
  return enrollment
    ? `/school/${schoolSlug}/apply/${child.applicationId}/enrollment`
    : `/school/${schoolSlug}/apply/${child.applicationId}`;
}

export function childDetailsHref(
  schoolSlug: string,
  applicationId: string,
  previewBasePath?: string,
): string {
  const base = previewBasePath
    ? `${previewBasePath}/parent/children`
    : schoolParentPath(schoolSlug, "children");
  return `${base}?applicationId=${encodeURIComponent(applicationId)}`;
}

/**
 * All the derived state of the parent home, lifted out of `ParentHomePage`
 * (same rules, same links, same drawers) so every variant behaves identically.
 */
export function useParentHomeModel(props: ParentHomeVariantProps) {
  const {
    branding,
    schoolSlug,
    organizationId,
    familyId,
    userProfile,
    quickActions,
    onboardingItems = [],
    upcomingEvents = [],
    enrollmentAmendmentBannerItems = [],
    enrollmentIncompleteBannerItems = [],
    formAttentionItems = [],
    classroomSignupAttentionItems: initialSignupAttentionItems = [],
    deferSignupAttentionLoad = false,
    previewBasePath,
    coopModeEnabled = false,
    bulletinEnabled = false,
    features,
    programSlug,
    parentNavBasePath,
    fridayBranchSettings,
  } = props;

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<ParentDocGuide | null>(null);
  const [classroomSignupAttentionItems, setClassroomSignupAttentionItems] =
    useState(initialSignupAttentionItems);

  useEffect(() => {
    if (!deferSignupAttentionLoad || !organizationId || !familyId) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ organizationId, familyId });
        const res = await fetch(`/api/parent-portal/signups/attention?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        setClassroomSignupAttentionItems(data.items ?? []);
      } catch {
        // Signup attention is non-blocking.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deferSignupAttentionLoad, familyId, organizationId]);

  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const adminCompat = useMemo(() => parentThemeToAdminCompat(theme), [theme]);

  const formsFeatureEnabled = features
    ? isParentFeatureEnabled(features, "forms_documents")
    : false;
  const fridayBranchHomeEnabled = features
    ? isParentHomeFridayBranchEnabled(features, fridayBranchSettings)
    : false;

  const howToGuides = useMemo(() => {
    if (!features) return [];
    return buildParentDocumentationGuides({
      slug: schoolSlug,
      features,
      coopModeEnabled,
      bulletinEnabled,
      programSlug,
      parentNavBasePath,
      previewBasePath,
    });
  }, [
    features,
    schoolSlug,
    coopModeEnabled,
    bulletinEnabled,
    programSlug,
    parentNavBasePath,
    previewBasePath,
  ]);
  const groupedHowToGuides = useMemo(
    () => groupParentDocumentationByCategory(howToGuides),
    [howToGuides],
  );
  const documentationHref = useMemo(
    () =>
      parentDocumentationPath(schoolSlug, {
        programSlug,
        previewBasePath,
        parentNavBasePath,
      }),
    [schoolSlug, programSlug, previewBasePath, parentNavBasePath],
  );

  const openGuide = useCallback((guide: ParentDocGuide) => setActiveGuide(guide), []);
  const closeGuide = useCallback(() => setActiveGuide(null), []);
  const openTodos = useCallback(() => setOnboardingOpen(true), []);
  const closeTodos = useCallback(() => setOnboardingOpen(false), []);

  const portalAttentionInput = useMemo(
    () => ({
      enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems,
      formAttentionItems,
      classroomSignupAttentionItems,
      schoolSlug,
      previewBasePath,
    }),
    [
      enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems,
      formAttentionItems,
      classroomSignupAttentionItems,
      schoolSlug,
      previewBasePath,
    ],
  );
  const portalAttentionItems = useMemo(
    () => buildPortalAttentionItems(portalAttentionInput),
    [portalAttentionInput],
  );
  const attentionItems = useMemo(
    () => buildStartHereAttentionItems({ ...portalAttentionInput, onboardingItems }),
    [portalAttentionInput, onboardingItems],
  );

  const onboardingTotal = onboardingItems.length;
  const onboardingDone = onboardingItems.filter((item) => item.completed).length;

  const calendarHref = previewBasePath
    ? `${previewBasePath}/parent/calendar`
    : schoolParentPath(schoolSlug, "calendar");
  const applyDashboardHref = previewBasePath ?? `/school/${schoolSlug}/apply`;
  const messagesHref = quickActions.find((a) => a.key === "messages")?.href;

  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return {
    theme,
    adminCompat,
    name: firstName(userProfile.displayName),
    familyLabel: familyKickerLabel(userProfile.displayName),
    greetingPrefix,
    greetingEmoji,
    todayLabel,
    attentionItems,
    portalAttentionItems,
    showTodosLink: portalAttentionItems.length > 0 || onboardingItems.length > 0,
    onboardingTotal,
    onboardingDone,
    nextEvent: upcomingEvents[0] ?? null,
    calendarHref,
    applyDashboardHref,
    messagesHref,
    messagesEnabled: Boolean(messagesHref),
    formsFeatureEnabled,
    fridayBranchHomeEnabled,
    howToGuides,
    groupedHowToGuides,
    documentationHref,
    onboardingOpen,
    openTodos,
    closeTodos,
    activeGuide,
    openGuide,
    closeGuide,
  };
}

export type ParentHomeModel = ReturnType<typeof useParentHomeModel>;
