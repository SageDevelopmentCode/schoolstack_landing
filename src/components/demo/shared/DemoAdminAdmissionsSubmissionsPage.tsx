"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedLead, setSelectedLead] = useState<DemoSubmissionLead | null>(() => {
    if (!initialSelectedLeadId) return null;
    return leads.find((lead) => lead.id === initialSelectedLeadId) ?? null;
  });

  useEffect(() => {
    if (!initialSelectedLeadId) return;
    const lead = leads.find((item) => item.id === initialSelectedLeadId) ?? null;
    setSelectedLead(lead);
  }, [initialSelectedLeadId, leads]);

  return (
    <DemoSchoolAdminStoryProvider className="h-full">
      <div className="pointer-events-none relative h-full min-h-0 select-none overflow-hidden">
        <DemoApplicationSubmissionsTab
          leads={leads}
          onSelectLead={setSelectedLead}
          selectedLeadId={selectedLead?.id ?? null}
        />
        <AnimatePresence>
          {selectedLead ? (
            <DemoApplicationSubmissionDetailPanel
              key={selectedLead.id}
              lead={selectedLead}
              submission={mapDemoLeadToSubmission(selectedLead)}
              flow={getDemoSubmissionFlow(selectedLead.flowId)}
              onClose={() => setSelectedLead(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </DemoSchoolAdminStoryProvider>
  );
}
