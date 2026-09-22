"use client";

import { useMemo, useState } from "react";
import DemoParentEnrollmentPage from "@/components/demo/shared/DemoParentEnrollmentPage";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { PARENT_DEMO_STORY_THEME } from "@/components/demo/shared/parent-demo-runtime";
import type { DemoParentChildId, DemoParentModalId } from "@/components/demo/shared/demo-parent-types";
import {
  DEMO_PARENT_CHECKLIST_ITEMS,
  DEMO_PARENT_CHILD_NAV,
  DEMO_PARENT_ENROLLMENT_COMPLETIONS,
  DEMO_PARENT_ENROLLMENT_DETAIL_COPY,
} from "@/data/school-demos/demo-parent-portal-fixtures";

function EnrollmentDetailPanel({ modalId }: { modalId: DemoParentModalId }) {
  const theme = PARENT_DEMO_STORY_THEME;
  const copy = DEMO_PARENT_ENROLLMENT_DETAIL_COPY[modalId];

  if (!copy) return null;

  return (
    <ParentCard theme={theme}>
      <ParentSectionKicker theme={theme}>Enrollment step</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
        {copy.title}
      </ParentDisplayHeading>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: theme.muted }}>
        {copy.body}
      </p>
      <p className="mt-4 text-xs" style={{ color: theme.muted }}>
        Preview mode — forms and signatures are read-only in this demo.
      </p>
    </ParentCard>
  );
}

export default function DemoParentEnrollmentTab() {
  const [activeChildId, setActiveChildId] = useState<DemoParentChildId>("emma");
  const completions = useMemo(
    () => DEMO_PARENT_ENROLLMENT_COMPLETIONS[activeChildId],
    [activeChildId],
  );
  const isJakePending = activeChildId === "jake";
  const enrolled = activeChildId === "liam";

  return (
    <DemoParentEnrollmentPage
      activeChildId={activeChildId}
      setActiveChildId={setActiveChildId}
      childrenNav={DEMO_PARENT_CHILD_NAV}
      checklistItems={DEMO_PARENT_CHECKLIST_ITEMS}
      completions={completions}
      enrolled={enrolled}
      isJakePending={isJakePending}
      renderDetailPanel={(modalId) => <EnrollmentDetailPanel modalId={modalId} />}
    />
  );
}
