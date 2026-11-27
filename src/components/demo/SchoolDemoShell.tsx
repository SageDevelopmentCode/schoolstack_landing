"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import GardenRoot from "@/components/garden/GardenRoot";
import { demoStoryShellStyle } from "@/components/demo/shared/demo-story-theme";
import { resolveWalkthroughStepIndex } from "@/lib/demo-walkthrough";
import DemoPreviewFrame, { DEMO_PREVIEW_ROLES } from "@/components/demo/DemoPreviewFrame";
import DemoStepGuide from "@/components/demo/DemoStepGuide";
import DemoWalkthroughMobileBar from "@/components/demo/DemoWalkthroughMobileBar";
import DemoWalkthroughPanel from "@/components/demo/DemoWalkthroughPanel";
import { useSnapshotLink } from "@/components/demo/useSnapshotLink";
import { useViewBeacon } from "@/lib/outreach/view-beacon";
import { buildSchoolConceptWalkthroughTheme } from "@/lib/marketing/school-concept-walkthrough-theme";
import ScaledWebsiteDemoPreview from "@/components/demo/ScaledWebsiteDemoPreview";
import { prefetchSchoolWebsiteDemo } from "@/components/demo/shared/lazySchoolWebsiteDemo";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { getStepGuide } from "@/data/school-demos/walkthroughs/step-guides";

/**
 * Step 1 is always the school website, so only that preview ships with the page.
 * The rest load when their step opens (and are warmed once the browser is idle).
 */
const PREVIEW_LOADERS = {
  admin: () => import("@/components/demo/ScaledAdminDemoPreview"),
  teacher: () => import("@/components/demo/ScaledTeacherDemoPreview"),
  parent: () => import("@/components/demo/ScaledParentDemoPreview"),
  contact: () => import("@/components/demo/DemoContactPanel"),
  mobile: () => import("@/components/demo/ScaledMobileAppPreview"),
  application: () => import("@/components/demo/ScaledApplicationDemoPreview"),
  observation: () => import("@/components/demo/ScaledObservationDemoPreview"),
} as const;

function PreviewLoading({ variant }: { variant: keyof typeof PREVIEW_LOADERS }) {
  return (
    <DemoPreviewFrame variant={variant}>
      <div className="h-full animate-pulse bg-[var(--sf-cream)]" aria-hidden="true" />
    </DemoPreviewFrame>
  );
}

const ScaledAdminDemoPreview = dynamic(PREVIEW_LOADERS.admin, {
  loading: () => <PreviewLoading variant="admin" />,
});
const ScaledTeacherDemoPreview = dynamic(PREVIEW_LOADERS.teacher, {
  loading: () => <PreviewLoading variant="teacher" />,
});
const ScaledParentDemoPreview = dynamic(PREVIEW_LOADERS.parent, {
  loading: () => <PreviewLoading variant="parent" />,
});
const DemoContactPanel = dynamic(PREVIEW_LOADERS.contact, {
  loading: () => <PreviewLoading variant="contact" />,
});
const ScaledMobileAppPreview = dynamic(PREVIEW_LOADERS.mobile, {
  loading: () => <PreviewLoading variant="mobile" />,
});
const ScaledApplicationDemoPreview = dynamic(PREVIEW_LOADERS.application, {
  loading: () => <PreviewLoading variant="application" />,
});
const ScaledObservationDemoPreview = dynamic(PREVIEW_LOADERS.observation, {
  loading: () => <PreviewLoading variant="observation" />,
});

/** Start the website chunk as soon as this module runs, not after the preview mounts. */
const prefetchedWebsiteSlugs = new Set<string>();
function prefetchWebsiteOnce(slug: string) {
  if (typeof window === "undefined" || prefetchedWebsiteSlugs.has(slug)) return;
  prefetchedWebsiteSlugs.add(slug);
  void prefetchSchoolWebsiteDemo(slug).catch(() => prefetchedWebsiteSlugs.delete(slug));
}

/**
 * Warm the small preview wrappers so step clicks don't wait on them. Wait for the
 * page's load event plus a pause first: the school website (step 1) and its images
 * come first, and the browser goes "idle" early while it waits on that chunk.
 */
function warmPreviewWrappers() {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let idle: number | undefined;
  const run = () => {
    if (cancelled) return;
    for (const load of Object.values(PREVIEW_LOADERS)) void load().catch(() => {});
  };
  const schedule = () => {
    timer = setTimeout(() => {
      // Safari has no requestIdleCallback.
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(run, { timeout: 4000 });
      } else {
        run();
      }
    }, 2000);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (timer !== undefined) clearTimeout(timer);
    if (idle !== undefined) window.cancelIdleCallback(idle);
  };
}

interface Props {
  config: SchoolWebsiteDemoConfig;
  schoolName: string;
  steps: DemoWalkthroughStep[];
}

/**
 * Reads `?step=` and jumps there. It sits in its own Suspense boundary so the
 * rest of the walkthrough is in the server HTML (useSearchParams would
 * otherwise turn the whole shell into a client-only render).
 */
function StepParamSync({
  steps,
  onStep,
}: {
  steps: DemoWalkthroughStep[];
  onStep: (index: number) => void;
}) {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  useEffect(() => {
    const resolved = resolveWalkthroughStepIndex(steps, stepParam);
    if (resolved !== null) onStep(resolved);
  }, [stepParam, steps, onStep]);
  return null;
}

const noSubscribe = () => () => {};

/** `snapshot` or `letter` when their snapshot linked them here; read after mount (static page). */
function useOpenedVia(): "snapshot" | "letter" | undefined {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const via = new URLSearchParams(window.location.search).get("via");
      return via === "snapshot" || via === "letter" ? via : undefined;
    },
    () => undefined,
  );
}

export default function SchoolDemoShell(props: Props) {
  return (
    <GardenRoot>
      <SchoolDemoShellInner {...props} />
    </GardenRoot>
  );
}

function SchoolDemoShellInner({
  config,
  schoolName,
  steps,
}: Props) {
  prefetchWebsiteOnce(config.slug);
  const [activeStep, setActiveStep] = useState(0);
  const [demoTuitionOverride, setDemoTuitionOverride] =
    useState<DemoTuitionOverride | null>(null);
  const [scrollRequest, setScrollRequest] = useState<{
    target: "top" | "form";
    nonce: number;
  } | null>(null);

  const activePreview = steps[activeStep]?.preview ?? "website";
  const stepGuide = getStepGuide(steps[activeStep], {
    navCta: config.hero.navCta,
    submitLabel: config.form.submitLabel,
  });
  // Set once they've opened their snapshot on this device. `from=demo` stops the
  // snapshot sending a second Discord alert for the same visit.
  const snapshotPath = useSnapshotLink(config.slug);
  const snapshotHref = snapshotPath ? `${snapshotPath}?from=demo` : null;
  // Tells Julius (Discord) the school opened its demo, and where from (`?via=` from the snapshot).
  const openedVia = useOpenedVia();
  useViewBeacon({
    endpoint: "/api/demo/view",
    storageKey: `demo-viewed:${config.slug}`,
    body: { slug: config.slug, via: openedVia },
  });

  const handleStepSelect = useCallback(
    (index: number) => {
      setActiveStep(index);
      const step = steps[index];
      if ((step?.preview ?? "website") !== "website") return;

      const target = step?.scrollTarget ?? (index === 0 ? "top" : "form");
      setScrollRequest({ target, nonce: Date.now() });
    },
    [steps],
  );

  const handleDiscoveryCallClick = useCallback(() => {
    setActiveStep(1);
    setScrollRequest({ target: "form", nonce: Date.now() });
  }, []);

  const handlePayApplicationFeeClick = useCallback(() => {
    handleStepSelect(activeStep + 1);
  }, [activeStep, handleStepSelect]);

  useEffect(() => warmPreviewWrappers(), []);

  const walkthroughTheme = useMemo(
    () => buildSchoolConceptWalkthroughTheme(config.theme),
    [config.theme],
  );

  const storyStyle = demoStoryShellStyle(walkthroughTheme);
  // Walkthrough chrome takes Garden type/colour from .sf-garden; the previews
  // keep the story theme's font and ink (DemoPreviewFrame inherits them).
  const shellStyle = {
    ...storyStyle,
    backgroundColor: undefined,
    color: undefined,
    fontFamily: undefined,
  };
  const previewStyle = {
    color: storyStyle.color,
    fontFamily: storyStyle.fontFamily,
  };

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-[var(--sf-cream)] lg:flex-row"
      style={shellStyle}
    >
      <Suspense fallback={null}>
        <StepParamSync steps={steps} onStep={handleStepSelect} />
      </Suspense>
      <DemoWalkthroughMobileBar
        schoolName={schoolName}
        schoolLogo={config.logo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={handleStepSelect}
        snapshotHref={snapshotHref}
        preview={activePreview}
      />
      <DemoWalkthroughPanel
        schoolName={schoolName}
        schoolLogo={config.logo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={handleStepSelect}
        snapshotHref={snapshotHref}
      />
      <div className="relative h-full min-h-0 min-w-0 flex-1" style={previewStyle}>
        {activePreview === "admin" ? (
          <ScaledAdminDemoPreview
            key={steps[activeStep].id}
            demoSlug={config.slug}
            initialAdmissionsTab={steps[activeStep].initialAdmissionsTab ?? "submissions"}
            initialSelectedLeadId={steps[activeStep].initialSelectedLeadId}
            initialSelectedLeadStatus={steps[activeStep].initialSelectedLeadStatus}
            initialSelectedLeadApplicationSectionIndex={
              steps[activeStep].initialSelectedLeadApplicationSectionIndex
            }
            initialSelectedFlowId={steps[activeStep].initialSelectedFlowId}
            animateNewSubmission={steps[activeStep].animateNewSubmission}
            autoSendEnrollmentLink={steps[activeStep].autoSendEnrollmentLink}
            autoSendEnrollmentLinkDelayMs={steps[activeStep].autoSendEnrollmentLinkDelayMs}
            openInitialLeadDetail={steps[activeStep].openInitialLeadDetail}
            hideLeadDetailEnrollmentAction={steps[activeStep].hideLeadDetailEnrollmentAction}
            highlightSendEnrollmentLeadId={
              steps[activeStep].highlightSendEnrollmentLeadId
            }
            initialAdminPage={steps[activeStep].initialAdminPage}
            initialMySchoolTab={steps[activeStep].initialMySchoolTab}
            initialSelectedTuitionFamilyId={
              steps[activeStep].initialSelectedTuitionFamilyId
            }
            openInitialTuitionAdjustModal={
              steps[activeStep].openInitialTuitionAdjustModal
            }
            openInitialTuitionAdjustModalDelayMs={
              steps[activeStep].openInitialTuitionAdjustModalDelayMs
            }
            initialCommitteeId={steps[activeStep].initialCommitteeId}
            initialCommitteeAdminView={steps[activeStep].initialCommitteeAdminView}
            initialCommitteeSection={steps[activeStep].initialCommitteeSection}
            openCreateCommitteeModal={steps[activeStep].openCreateCommitteeModal}
            openCreateCommitteeModalDelayMs={
              steps[activeStep].openCreateCommitteeModalDelayMs
            }
            highlightCreateWorkspace={steps[activeStep].highlightCreateWorkspace}
            openSendAugustSignupModal={steps[activeStep].openSendAugustSignupModal}
            openSendAugustSignupModalDelayMs={
              steps[activeStep].openSendAugustSignupModalDelayMs
            }
            openArchiveCommitteeModal={steps[activeStep].openArchiveCommitteeModal}
            tuitionOverride={demoTuitionOverride}
            onTuitionOverrideApplied={setDemoTuitionOverride}
          />
        ) : activePreview === "teacher" ? (
          <ScaledTeacherDemoPreview
            key={steps[activeStep].id}
            demoSlug={config.slug}
            initialTeacherTab={steps[activeStep].initialTeacherTab ?? "attendance"}
            initialSelectedTeacherStudentId={
              steps[activeStep].initialSelectedTeacherStudentId
            }
            openInitialTeacherStudentDetailDelayMs={
              steps[activeStep].openInitialTeacherStudentDetailDelayMs
            }
          />
        ) : activePreview === "parent" ? (
          <ScaledParentDemoPreview
            key={steps[activeStep].id}
            demoSlug={config.slug}
            initialParentTab={steps[activeStep].initialParentTab ?? "enrollment"}
            parentEnrollmentVariant={steps[activeStep].parentEnrollmentVariant}
            billingChildIds={steps[activeStep].billingChildIds}
            initialCommitteeId={steps[activeStep].initialCommitteeId}
            initialCommitteeSection={steps[activeStep].initialCommitteeSection}
            tuitionOverride={demoTuitionOverride}
          />
        ) : activePreview === "contact" ? (
          <DemoContactPanel
            schoolSlug={config.slug}
            schoolName={schoolName}
            logo={config.logo}
            variant={steps[activeStep].contactPanelVariant ?? "schedule"}
          />
        ) : activePreview === "mobile" ? (
          <ScaledMobileAppPreview key={steps[activeStep].id} />
        ) : activePreview === "application" ? (
          <ScaledApplicationDemoPreview
            demoSlug={config.slug}
            onPayApplicationFee={handlePayApplicationFeeClick}
          />
        ) : activePreview === "observation" ? (
          <ScaledObservationDemoPreview demoSlug={config.slug} />
        ) : (
          <ScaledWebsiteDemoPreview
            demoSlug={config.slug}
            scrollRequest={scrollRequest}
            onDiscoveryCallClick={handleDiscoveryCallClick}
          />
        )}
        {/* Back to their snapshot (phones; the side panel has it on desktop). */}
        {snapshotHref ? (
          <Link
            href={snapshotHref}
            className="absolute bottom-8 left-5 z-10 inline-flex h-9 items-center gap-1 rounded-full border-2 border-[var(--sf-ink)] bg-white px-3 font-[family-name:var(--font-sf-body)] text-[12px] font-extrabold text-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)] transition active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:bottom-10 sm:left-8 lg:hidden"
            data-testid="demo-snapshot-link-mobile"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
            Snapshot
          </Link>
        ) : null}
        {stepGuide ? (
          <DemoStepGuide
            key={`guide-${steps[activeStep].id}`}
            guide={stepGuide}
            stepLabel={`Step ${activeStep + 1} of ${steps.length} · ${DEMO_PREVIEW_ROLES[activePreview].label}`}
            title={steps[activeStep].title}
          />
        ) : null}
      </div>
    </div>
  );
}
