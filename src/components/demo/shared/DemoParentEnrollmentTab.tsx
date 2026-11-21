"use client";

import { useMemo, useState } from "react";
import DemoParentEnrollmentPage from "@/components/demo/shared/DemoParentEnrollmentPage";
import { GKicker } from "@/components/school-parent/garden/ui";
import type { DemoParentChildId, DemoParentModalId } from "@/components/demo/shared/demo-parent-types";
import {
  DEMO_PARENT_CHECKLIST_ITEMS,
  DEMO_PARENT_CHILD_NAV,
  DEMO_PARENT_ENROLLMENT_COMPLETIONS,
  DEMO_PARENT_ENROLLMENT_DETAIL_COPY,
} from "@/data/school-demos/demo-parent-portal-fixtures";

/** Body of the Garden detail card (the card itself comes from `DemoParentEnrollmentPage`). */
function EnrollmentDetailPanel({ modalId }: { modalId: DemoParentModalId }) {
  const copy = DEMO_PARENT_ENROLLMENT_DETAIL_COPY[modalId];

  if (!copy) return null;

  return (
    <div className="max-w-3xl">
      <GKicker>Enrollment step</GKicker>
      <h2 className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.1] text-[var(--sf-ink)]">
        {copy.title}
      </h2>
      <p className="m-0 mt-3 text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        {copy.body}
      </p>
      <p className="m-0 mt-5 inline-block rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--sf-soft)]">
        Preview mode — forms and signatures are read-only in this demo.
      </p>
    </div>
  );
}

export default function DemoParentEnrollmentTab({
  initialActiveItem,
  fillHeight = false,
}: {
  initialActiveItem?: DemoParentModalId;
  fillHeight?: boolean;
} = {}) {
  const [activeChildId, setActiveChildId] = useState<DemoParentChildId>("emma");
  const completions = useMemo(
    () => DEMO_PARENT_ENROLLMENT_COMPLETIONS[activeChildId],
    [activeChildId],
  );
  const isJakePending = activeChildId === "jake";
  const enrolled = activeChildId === "liam";

  return (
    <div className={fillHeight ? "flex h-full min-h-0 flex-col" : undefined}>
      <DemoParentEnrollmentPage
        activeChildId={activeChildId}
        setActiveChildId={setActiveChildId}
        childrenNav={DEMO_PARENT_CHILD_NAV}
        checklistItems={DEMO_PARENT_CHECKLIST_ITEMS}
        completions={completions}
        enrolled={enrolled}
        isJakePending={isJakePending}
        renderDetailPanel={(modalId) => <EnrollmentDetailPanel modalId={modalId} />}
        initialActiveItem={initialActiveItem}
        fillHeight={fillHeight}
      />
    </div>
  );
}
