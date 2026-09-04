"use client";

import { useEffect, useMemo, useState } from "react";
import SchoolParentBaseline from "@/components/school-parent/SchoolParentBaseline";
import SchoolParentComingSoon from "@/components/school-parent/SchoolParentComingSoon";
import ParentBillingPageShell from "@/components/school-parent/billing/ParentBillingPageShell";
import ParentCalendarPageShell from "@/components/school-parent/calendar/ParentCalendarPageShell";
import { useParentCalendarPageContext } from "@/components/school-parent/calendar/parent-calendar-page-context";
import ParentCommitteesPageShell from "@/components/school-parent/committees/ParentCommitteesPageShell";
import ParentChildrenPage from "@/components/school-parent/ParentChildrenPage";
import ParentHomePage from "@/components/school-parent/ParentHomePage";
import ParentMessagesPageShell from "@/components/school-parent/messages/ParentMessagesPageShell";
import { useParentMessagesPageContext } from "@/components/school-parent/messages/parent-messages-page-context";
import {
  deriveProgramPortalSettingsFromEditor,
  type ProgramParentPortalEditorState,
  wouldUseIsolatedProgramPortal,
} from "@/lib/admissions/program-parent-portal";
import {
  getProgramParentPortalPreviewBillingInitialData,
  getProgramParentPortalPreviewBillingPageMeta,
  getProgramParentPortalPreviewChildProfiles,
  getProgramParentPortalPreviewChildren,
  getProgramParentPortalPreviewCommitteesInitialData,
  getProgramParentPortalPreviewEvents,
  getProgramParentPortalPreviewMessageThreads,
  getProgramParentPortalPreviewUserProfile,
  PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID,
} from "@/lib/admissions/program-parent-portal-preview-data";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import {
  buildParentNavItems,
  getParentPageLabel,
  isParentNavItemActive,
} from "@/lib/organization-settings/parent-nav";
import {
  buildMainParentPortalContext,
  buildProgramParentPortalContext,
  resolveProgramOrganizationFeatures,
} from "@/lib/organization-settings/resolve-program-parent-features";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type ProgramParentPortalPreviewFrameProps = {
  branding: OrganizationBranding;
  orgFeatures: OrganizationFeatures;
  editor: ProgramParentPortalEditorState;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  programName: string;
  portalSlug: string | null;
  isolationAllowed: boolean;
};

function PreviewMessagesHydrator() {
  const { hydrateThreads } = useParentMessagesPageContext();

  useEffect(() => {
    hydrateThreads(getProgramParentPortalPreviewMessageThreads(), "preview-guardian");
  }, [hydrateThreads]);

  return null;
}

function PreviewCalendarHydrator({
  organizationId,
}: {
  organizationId: string;
}) {
  const { hydrateEvents } = useParentCalendarPageContext();

  useEffect(() => {
    hydrateEvents(getProgramParentPortalPreviewEvents(organizationId));
  }, [hydrateEvents, organizationId]);

  return null;
}

function PreviewFeatureBody({
  activeFeature,
  branding,
  schoolSlug,
  organizationId,
  schoolName,
  resolvedFeatures,
  parentNavBasePath,
  userProfile,
}: {
  activeFeature: string;
  branding: OrganizationBranding;
  schoolSlug: string;
  organizationId: string;
  schoolName: string;
  resolvedFeatures: OrganizationFeatures;
  parentNavBasePath: string;
  userProfile: ReturnType<typeof getProgramParentPortalPreviewUserProfile>;
}) {
  if (activeFeature === "portal") {
    const quickActions = buildParentQuickActions(
      schoolSlug,
      resolvedFeatures,
      parentNavBasePath,
    );

    return (
      <ParentHomePage
        branding={branding}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        userProfile={userProfile}
        familyChildren={getProgramParentPortalPreviewChildren()}
        quickActions={quickActions}
        onboardingItems={[]}
        upcomingEvents={getProgramParentPortalPreviewEvents(organizationId)}
        previewMode
        previewBasePath={parentNavBasePath}
      />
    );
  }

  if (activeFeature === "messages") {
    return (
      <ParentMessagesPageShell
        organizationId={organizationId}
        organizationSlug={schoolSlug}
        schoolName={schoolName}
        branding={branding}
        previewMode
        readOnly
      >
        <PreviewMessagesHydrator />
      </ParentMessagesPageShell>
    );
  }

  if (activeFeature === "calendar") {
    return (
      <ParentCalendarPageShell
        organizationId={organizationId}
        organizationSlug={schoolSlug}
        branding={branding}
        previewMode
      >
        <PreviewCalendarHydrator organizationId={organizationId} />
      </ParentCalendarPageShell>
    );
  }

  if (activeFeature === "billing") {
    return (
      <ParentBillingPageShell
        organizationId={organizationId}
        familyId={PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID}
        branding={branding}
        slug={schoolSlug}
        previewMode
        initialPreviewData={getProgramParentPortalPreviewBillingInitialData(organizationId)}
        initialPreviewMeta={getProgramParentPortalPreviewBillingPageMeta()}
      />
    );
  }

  if (activeFeature === "children") {
    return (
      <ParentChildrenPage
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        familyChildren={getProgramParentPortalPreviewChildren()}
        userProfile={userProfile}
        childProfiles={getProgramParentPortalPreviewChildProfiles()}
        previewBasePath={parentNavBasePath}
        previewMode
        initialHealthProfiles={{}}
      />
    );
  }

  if (activeFeature === "committees") {
    return (
      <ParentCommitteesPageShell
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        branding={branding}
        guardianName={userProfile.displayName ?? "Parent"}
        previewMode
        initialData={getProgramParentPortalPreviewCommitteesInitialData()}
      />
    );
  }

  return (
    <SchoolParentComingSoon
      branding={branding}
      schoolSlug={schoolSlug}
      schoolName={schoolName}
      organizationId={organizationId}
      featureKey={activeFeature}
      featureLabel={getParentPageLabel(
        activeFeature,
        resolvedFeatures.feature_nav?.parent,
      )}
      userProfile={userProfile}
    />
  );
}

export default function ProgramParentPortalPreviewFrame({
  branding,
  orgFeatures,
  editor,
  schoolSlug,
  schoolName,
  organizationId,
  programName,
  portalSlug,
  isolationAllowed,
}: ProgramParentPortalPreviewFrameProps) {
  const userProfile = useMemo(
    () => getProgramParentPortalPreviewUserProfile(),
    [],
  );

  const portalGovernance = useMemo(
    () => ({ isolationAllowed }),
    [isolationAllowed],
  );

  const resolvedFeatures = useMemo(() => {
    const derived = deriveProgramPortalSettingsFromEditor(
      editor,
      orgFeatures,
      portalGovernance,
    );
    return resolveProgramOrganizationFeatures(orgFeatures, derived);
  }, [editor, orgFeatures, portalGovernance]);

  const usesSeparatePortal = wouldUseIsolatedProgramPortal(
    editor,
    orgFeatures,
    portalGovernance,
  );

  const parentNavBasePath = useMemo(() => {
    if (usesSeparatePortal && portalSlug) {
      return `/school/${schoolSlug}/parent/p/${portalSlug}`;
    }
    return `/school/${schoolSlug}/parent`;
  }, [portalSlug, schoolSlug, usesSeparatePortal]);

  const portalContextLabel = editor.label?.trim() || programName;

  const parentPortalContexts = useMemo(() => {
    if (!usesSeparatePortal || !portalSlug) {
      return [buildMainParentPortalContext(schoolName)];
    }

    return [
      buildMainParentPortalContext(schoolName),
      buildProgramParentPortalContext({
        programId: "preview-program",
        portalSlug,
        label: portalContextLabel,
      }),
    ];
  }, [portalContextLabel, portalSlug, schoolName, usesSeparatePortal]);

  const [previewPathname, setPreviewPathname] = useState(
    `${parentNavBasePath}/portal`,
  );

  useEffect(() => {
    setPreviewPathname(`${parentNavBasePath}/portal`);
  }, [parentNavBasePath]);

  const navItems = useMemo(
    () =>
      buildParentNavItems(
        schoolSlug,
        resolvedFeatures.parent,
        resolvedFeatures.feature_nav?.parent,
        parentNavBasePath,
      ),
    [parentNavBasePath, resolvedFeatures, schoolSlug],
  );

  const activeFeature = useMemo(() => {
    const match = navItems.find((item) =>
      isParentNavItemActive(previewPathname, item),
    );
    return match?.key ?? "portal";
  }, [navItems, previewPathname]);

  const embeddedPreview = useMemo(
    () => ({
      pathname: previewPathname,
      onNavigate: (href: string) => setPreviewPathname(href),
    }),
    [previewPathname],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#D9E0DA] bg-white">
      <SchoolParentBaseline
        slug={schoolSlug}
        organizationId={organizationId}
        schoolName={schoolName}
        branding={branding}
        features={resolvedFeatures}
        userProfile={userProfile}
        parentNavBasePath={parentNavBasePath}
        parentPortalContexts={parentPortalContexts}
        previewMode
        previewParentBasePath={`/school/${schoolSlug}/parent`}
        embeddedPreview={embeddedPreview}
      >
        <PreviewFeatureBody
          activeFeature={activeFeature}
          branding={branding}
          schoolSlug={schoolSlug}
          organizationId={organizationId}
          schoolName={schoolName}
          resolvedFeatures={resolvedFeatures}
          parentNavBasePath={parentNavBasePath}
          userProfile={userProfile}
        />
      </SchoolParentBaseline>
    </div>
  );
}
