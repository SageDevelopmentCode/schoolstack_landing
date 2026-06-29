"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import DemoContactPanel from "@/components/demo/DemoContactPanel";
import DemoPreviewHint from "@/components/demo/DemoPreviewHint";
import DemoWalkthroughPanel from "@/components/demo/DemoWalkthroughPanel";
import ScaledAdminDemoPreview from "@/components/demo/ScaledAdminDemoPreview";
import ScaledParentDemoPreview from "@/components/demo/ScaledParentDemoPreview";
import ScaledTeacherDemoPreview from "@/components/demo/ScaledTeacherDemoPreview";
import ScaledApplicationDemoPreview from "@/components/demo/ScaledApplicationDemoPreview";
import ScaledObservationDemoPreview from "@/components/demo/ScaledObservationDemoPreview";
import ScaledWebsiteDemoPreview from "@/components/demo/ScaledWebsiteDemoPreview";
import ScaledMobileAppPreview from "@/components/demo/ScaledMobileAppPreview";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { DemoTuitionOverride } from "@/data/school-demos/tuition-override";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";

interface Props {
  config: SchoolWebsiteDemoConfig;
  schoolName: string;
  steps: DemoWalkthroughStep[];
}

export default function SchoolDemoShell({
  config,
  schoolName,
  steps,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [demoTuitionOverride, setDemoTuitionOverride] =
    useState<DemoTuitionOverride | null>(null);
  const [scrollRequest, setScrollRequest] = useState<{
    target: "top" | "form";
    nonce: number;
  } | null>(null);

  const activePreview = steps[activeStep]?.preview ?? "website";

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

  return (
    <div className="h-screen flex overflow-hidden">
      <DemoWalkthroughPanel
        schoolName={schoolName}
        schoolLogo={config.logo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={handleStepSelect}
      />
      <div className="relative flex-1 h-screen min-w-0">
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
          <ScaledMobileAppPreview key={steps[activeStep].id} demoSlug={config.slug} />
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
        <AnimatePresence mode="wait">
          {steps[activeStep]?.previewHint ? (
            <DemoPreviewHint
              key={steps[activeStep].id}
              message={steps[activeStep].previewHint}
              delayMs={steps[activeStep].previewHintDelayMs}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
