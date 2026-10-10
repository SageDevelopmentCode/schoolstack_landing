"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import DemoSchoolAdminStoryProvider from "@/components/demo/shared/DemoSchoolAdminStoryProvider";
import DemoApplicationSubmissionsTab from "@/components/demo/shared/DemoApplicationSubmissionsTab";
import DemoApplicationSubmissionDetailPanel from "@/components/demo/shared/DemoApplicationSubmissionDetailPanel";
import {
  mapDemoLeadToSubmission,
  type DemoSubmissionLead,
} from "@/components/demo/shared/demo-submissions-mapper";
import {
  DEMO_ADMIN_SUBMISSION_LEADS,
  getDemoSubmissionFlow,
} from "@/data/school-demos/demo-admin-admissions-fixtures";

type DemoAdminAdmissionsSubmissionsPageProps = {
  leads?: DemoSubmissionLead[];
  initialSelectedLeadId?: string;
  initialDetailTab?: "overview" | "application" | "history" | "payments";
  compactForMarketing?: boolean;
  showcaseDense?: boolean;
  animateNewSubmission?: boolean;
  newSubmissionLeadId?: string;
  revealNewSubmissionImmediately?: boolean;
  highlightLeadId?: string | null;
};

export default function DemoAdminAdmissionsSubmissionsPage({
  leads: leadsOverride,
  initialSelectedLeadId,
  initialDetailTab = "overview",
  compactForMarketing = false,
  showcaseDense = false,
  animateNewSubmission = false,
  newSubmissionLeadId,
  revealNewSubmissionImmediately = false,
  highlightLeadId = null,
}: DemoAdminAdmissionsSubmissionsPageProps) {
  const leads = useMemo(
    () => leadsOverride ?? DEMO_ADMIN_SUBMISSION_LEADS,
    [leadsOverride],
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    () => initialSelectedLeadId ?? null,
  );
  const [prevInitialSelectedLeadId, setPrevInitialSelectedLeadId] = useState(
    initialSelectedLeadId,
  );
  if (initialSelectedLeadId !== prevInitialSelectedLeadId) {
    setPrevInitialSelectedLeadId(initialSelectedLeadId);
    setSelectedLeadId(initialSelectedLeadId ?? null);
  }

  const selectedLead = useMemo((): DemoSubmissionLead | null => {
    if (!selectedLeadId) return null;
    return leads.find((lead) => lead.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  return (
    <DemoSchoolAdminStoryProvider
      className={showcaseDense ? "h-auto" : "h-full"}
    >
      <div
        className={`pointer-events-none relative select-none ${showcaseDense ? "overflow-visible" : "h-full min-h-0 overflow-hidden"}`}
      >
        <DemoApplicationSubmissionsTab
          leads={leads}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          selectedLeadId={selectedLeadId}
          compactForMarketing={compactForMarketing}
          showcaseDense={showcaseDense}
          animateNewSubmission={animateNewSubmission}
          newSubmissionLeadId={newSubmissionLeadId}
          revealNewSubmissionImmediately={revealNewSubmissionImmediately}
          highlightLeadId={highlightLeadId}
        />
        <AnimatePresence>
          {selectedLead ? (
            <DemoApplicationSubmissionDetailPanel
              key={selectedLead.id}
              lead={selectedLead}
              submission={mapDemoLeadToSubmission(selectedLead)}
              flow={getDemoSubmissionFlow(selectedLead.flowId)}
              onClose={() => setSelectedLeadId(null)}
              initialTab={initialDetailTab}
              appearImmediately
            />
          ) : null}
        </AnimatePresence>
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
