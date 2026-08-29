"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import type {
  DemoWalkthroughMySchoolTab,
  DemoWalkthroughAdminPage,
  DemoWalkthroughCommitteeSection,
} from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";

const DESIGN_WIDTH = 1440;
const ROOTED_MEADOWS_SLUG = "rooted-meadows";

type AdminDemoComponent = ComponentType<Record<string, unknown>>;

type LoadedAdminDemo =
  | { kind: "shared"; slug: string }
  | { kind: "rooted-meadows" }
  | { kind: "custom"; slug: string; Component: AdminDemoComponent };

function loadAdminDemo(slug: string): Promise<LoadedAdminDemo> {
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
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const [loadedDemo, setLoadedDemo] = useState<LoadedAdminDemo | null>(null);
  const [SharedAdmin, setSharedAdmin] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const isRootedMeadows = demoSlug === ROOTED_MEADOWS_SLUG;

  useEffect(() => {
    let cancelled = false;
    void loadAdminDemo(demoSlug).then(async (loaded) => {
      if (cancelled) return;
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
  }, [demoSlug]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {loadedDemo?.kind === "shared" && SharedAdmin ? (
            <SharedAdmin demoSlug={demoSlug} {...demoProps} />
          ) : null}
          {loadedDemo?.kind === "custom" ? (
            <loadedDemo.Component {...demoProps} />
          ) : null}
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
