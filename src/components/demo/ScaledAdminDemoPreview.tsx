"use client";

import { useEffect, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import DemoScaledCanvas from "@/components/demo/shared/DemoScaledCanvas";
import type {
  DemoWalkthroughMySchoolTab,
  DemoWalkthroughAdminPage,
  DemoWalkthroughCommitteeSection,
} from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";

const ROOTED_MEADOWS_SLUG = "rooted-meadows";

type AdminDemoComponent = ComponentType<Record<string, unknown>>;

type LoadedAdminDemo =
  | { kind: "shared"; slug: string }
  | { kind: "garden-admissions"; slug: string }
  | { kind: "rooted-meadows" }
  | { kind: "custom"; slug: string; Component: AdminDemoComponent };

function loadAdminDemo(
  slug: string,
  gardenAdmissions: boolean,
): Promise<LoadedAdminDemo> {
  if (gardenAdmissions) {
    return import("@/components/demo/shared/DemoAdminGardenAdmissions").then(() => ({
      kind: "garden-admissions" as const,
      slug,
    }));
  }
  if (slug === ROOTED_MEADOWS_SLUG) {
    return import("@/components/demo/rootedmeadows/lazyRootedMeadowsDemos").then(
      (m) => ({
        kind: "custom" as const,
        slug,
        Component: m.LazyRootedMeadowsAdminDashboardDemo as AdminDemoComponent,
      }),
    );
  }

  return import("@/components/demo/shared/lazySchoolAdminDemo").then(() => ({
    kind: "shared" as const,
    slug,
  }));
}

export default function ScaledAdminDemoPreview({
  demoSlug = "athena-microacademy",
  initialAdmissionsTab = "submissions",
  initialSelectedLeadId,
  initialSelectedLeadStatus,
  initialSelectedLeadApplicationSectionIndex,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
  autoSendEnrollmentLinkDelayMs,
  openInitialLeadDetail,
  hideLeadDetailEnrollmentAction,
  highlightSendEnrollmentLeadId,
  initialAdminPage,
  initialMySchoolTab,
  initialSelectedTuitionFamilyId,
  openInitialTuitionAdjustModal,
  openInitialTuitionAdjustModalDelayMs,
  tuitionOverride,
  onTuitionOverrideApplied,
  initialCommitteeId,
  initialCommitteeAdminView,
  initialCommitteeSection,
  openCreateCommitteeModal,
  openCreateCommitteeModalDelayMs,
  highlightCreateWorkspace,
  openSendAugustSignupModal,
  openSendAugustSignupModalDelayMs,
  openArchiveCommitteeModal,
}: {
  demoSlug?: string;
  initialAdmissionsTab?: "flows" | "submissions";
  initialSelectedLeadId?: string;
  initialSelectedLeadStatus?: string;
  initialSelectedLeadApplicationSectionIndex?: number;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
  autoSendEnrollmentLinkDelayMs?: number;
  openInitialLeadDetail?: boolean;
  hideLeadDetailEnrollmentAction?: boolean;
  highlightSendEnrollmentLeadId?: string;
  initialAdminPage?: DemoWalkthroughAdminPage;
  initialMySchoolTab?: DemoWalkthroughMySchoolTab;
  initialSelectedTuitionFamilyId?: string;
  openInitialTuitionAdjustModal?: boolean;
  openInitialTuitionAdjustModalDelayMs?: number;
  tuitionOverride?: DemoTuitionOverride | null;
  onTuitionOverrideApplied?: (override: DemoTuitionOverride | null) => void;
  initialCommitteeId?: string;
  initialCommitteeAdminView?: "list" | "detail" | "signup" | "archive";
  initialCommitteeSection?: DemoWalkthroughCommitteeSection;
  openCreateCommitteeModal?: boolean;
  openCreateCommitteeModalDelayMs?: number;
  highlightCreateWorkspace?: boolean;
  openSendAugustSignupModal?: boolean;
  openSendAugustSignupModalDelayMs?: number;
  openArchiveCommitteeModal?: boolean;
}) {
  const [loadedDemo, setLoadedDemo] = useState<LoadedAdminDemo | null>(null);
  const [SharedAdmin, setSharedAdmin] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const [GardenAdmissions, setGardenAdmissions] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const isRootedMeadows = demoSlug === ROOTED_MEADOWS_SLUG;
  // Admissions steps of the shared schools show the real Garden admin portal.
  const useGardenAdmissions =
    !isRootedMeadows &&
    (initialAdminPage ?? "leads") === "leads" &&
    (initialAdmissionsTab === "submissions" || initialSelectedLeadId != null);

  useEffect(() => {
    let cancelled = false;
    void loadAdminDemo(demoSlug, useGardenAdmissions).then(async (loaded) => {
      if (cancelled) return;
      if (loaded.kind === "garden-admissions") {
        const mod = await import("@/components/demo/shared/DemoAdminGardenAdmissions");
        if (!cancelled) {
          setGardenAdmissions(() => mod.default as ComponentType<Record<string, unknown>>);
          setLoadedDemo(loaded);
        }
        return;
      }
      if (loaded.kind === "shared") {
        const mod = await import("@/components/demo/shared/lazySchoolAdminDemo");
        if (!cancelled) {
          setSharedAdmin(
            () =>
              mod.LazySchoolAdminDashboardDemo as ComponentType<
                Record<string, unknown>
              >,
          );
          setLoadedDemo(loaded);
        }
        return;
      }
      if (!cancelled) setLoadedDemo(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [demoSlug, useGardenAdmissions]);


  const demoProps = {
    initialPage: (initialAdminPage ?? "leads") as
      | "dashboard"
      | "leads"
      | "myschool"
      | "budget"
      | "marketing"
      | "impersonate",
    initialAdmissionsTab,
    initialSelectedLeadId,
    initialSelectedLeadStatus,
    initialSelectedLeadApplicationSectionIndex,
    initialSelectedFlowId,
    animateNewSubmission,
    autoSendEnrollmentLink,
    autoSendEnrollmentLinkDelayMs,
    openInitialLeadDetail,
    hideLeadDetailEnrollmentAction,
    highlightSendEnrollmentLeadId,
    ...(isRootedMeadows
      ? {
          initialMySchoolTab,
          initialSelectedTuitionFamilyId,
          openInitialTuitionAdjustModal,
          openInitialTuitionAdjustModalDelayMs,
          tuitionOverride,
          onTuitionOverrideApplied,
          initialCommitteeId,
          initialCommitteeAdminView,
          initialCommitteeSection,
          openCreateCommitteeModal,
          openCreateCommitteeModalDelayMs,
          highlightCreateWorkspace,
          openSendAugustSignupModal,
          openSendAugustSignupModalDelayMs,
          openArchiveCommitteeModal,
        }
      : {}),
  };

  return (
    <DemoPreviewFrame variant="admin">
      <DemoScaledCanvas>
        {loadedDemo?.kind === "garden-admissions" &&
        useGardenAdmissions &&
        GardenAdmissions ? (
          <GardenAdmissions
            key={`${demoSlug}-${initialSelectedLeadId ?? "list"}-${autoSendEnrollmentLink ? "send" : "view"}`}
            demoSlug={demoSlug}
            animateNewSubmission={animateNewSubmission}
            initialSelectedLeadId={initialSelectedLeadId}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
            autoSendEnrollmentLinkDelayMs={autoSendEnrollmentLinkDelayMs}
            scrollable
          />
        ) : null}
        {loadedDemo?.kind === "shared" && !useGardenAdmissions && SharedAdmin ? (
          <SharedAdmin demoSlug={demoSlug} {...demoProps} />
        ) : null}
        {loadedDemo?.kind === "custom" ? (
          <loadedDemo.Component {...demoProps} />
        ) : null}
      </DemoScaledCanvas>
    </DemoPreviewFrame>
  );
}
