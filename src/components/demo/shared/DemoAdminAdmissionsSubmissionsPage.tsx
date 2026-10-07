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
  initialSelectedLeadId?: string;
};

export default function DemoAdminAdmissionsSubmissionsPage({
  initialSelectedLeadId,
}: DemoAdminAdmissionsSubmissionsPageProps) {
  const leads = useMemo(() => DEMO_ADMIN_SUBMISSION_LEADS, []);
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
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none relative h-full min-h-0 select-none overflow-hidden">
        <DemoApplicationSubmissionsTab
          leads={leads}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          selectedLeadId={selectedLeadId}
        />
        <AnimatePresence>
          {selectedLead ? (
            <DemoApplicationSubmissionDetailPanel
              key={selectedLead.id}
              lead={selectedLead}
              submission={mapDemoLeadToSubmission(selectedLead)}
              flow={getDemoSubmissionFlow(selectedLead.flowId)}
              onClose={() => setSelectedLeadId(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
