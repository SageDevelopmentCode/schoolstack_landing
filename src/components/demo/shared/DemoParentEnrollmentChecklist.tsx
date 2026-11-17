"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import { applyParentDemoRuntime } from "@/components/demo/shared/parent-demo-runtime";
import type { SchoolParentDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  buildDemoChildEnrollmentChecklistInstances,
  buildDemoEnrollmentChecklistInstances,
  buildDemoEnrollmentChecklistItems,
  buildDemoEnrollmentChecklistTickFrames,
  DEMO_ENROLLMENT_CHECKLIST_ID,
  type DemoEnrollmentChecklistChildId,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import {
  buildDemoParentBranding,
  DEMO_PARENT_USER_PROFILE,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
  resolveDemoParentSchoolName,
} from "@/data/school-demos/demo-portal-shared";

const FIRST_TICK_DELAY_MS = 1100;
const TICK_INTERVAL_MS = 1500;

/** Live pages title the checklist with its template name (see the demo admin template). */
const DEMO_CHECKLIST_TITLE = "Primary Program enrollment checklist";

/**
 * Walkthrough step "Parents complete enrollment": the REAL apply-portal
 * enrollment checklist (`ApplyPortalPageShell` + its navbar +
 * `EnrollmentChecklistExperience mode="preview"`), fed by demo fixtures.
 * It skips `PublicEnrollmentChecklistClient` (router, Supabase, polling), so
 * there is no network and no auth. A timer ticks the child's items off one at
 * a time through the `instances` prop; under reduced motion it shows the
 * child's fixture state without ticking.
 */
export default function DemoParentEnrollmentChecklist({
  config,
  childId = "emma",
}: {
  config: SchoolParentDemoConfig;
  childId?: DemoEnrollmentChecklistChildId;
}) {
  applyParentDemoRuntime(config);
  const reduce = useReducedMotion() === true;
  const branding = useMemo(() => buildDemoParentBranding(), []);
  const schoolName = resolveDemoParentSchoolName();
  const items = useMemo(() => buildDemoEnrollmentChecklistItems(schoolName), [schoolName]);
  const frames = useMemo(
    () => buildDemoEnrollmentChecklistTickFrames(childId, items),
    [childId, items],
  );
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (reduce || frames.length <= 1) return undefined;
    let timer = window.setTimeout(function tick() {
      setFrameIndex((index) => {
        const next = Math.min(index + 1, frames.length - 1);
        if (next < frames.length - 1) {
          timer = window.setTimeout(tick, TICK_INTERVAL_MS);
        }
        return next;
      });
    }, FIRST_TICK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [frames, reduce]);

  const checklistId = `${DEMO_ENROLLMENT_CHECKLIST_ID}-${childId}`;
  const instances = useMemo(
    () =>
      reduce
        ? buildDemoChildEnrollmentChecklistInstances(childId, items)
        : buildDemoEnrollmentChecklistInstances(items, frames[frameIndex], checklistId),
    [checklistId, childId, frameIndex, frames, items, reduce],
  );

  /** The item about to tick is the open one; at the end, the last item ticked. */
  const activeItemId = useMemo(() => {
    if (reduce) return undefined;
    const current = frames[frameIndex];
    const next = frames[frameIndex + 1];
    if (next) {
      const changing = next.findIndex((done, index) => done && !current[index]);
      return items[changing]?.id;
    }
    const previous = frames[frameIndex - 1];
    if (!previous) return undefined;
    const changed = current.findIndex((done, index) => done && !previous[index]);
    return items[changed]?.id;
  }, [frameIndex, frames, items, reduce]);

  return (
    <div className="pointer-events-none flex h-full min-h-0 select-none flex-col overflow-hidden [&_[data-apply-portal]]:!min-h-0 [&_[data-apply-portal]]:h-full">
      <ApplyPortalPageShell
        branding={branding}
        schoolName={schoolName}
        schoolSlug={DEMO_PORTAL_SLUG}
        organizationId={DEMO_PORTAL_ORG_ID}
        userEmail={DEMO_PARENT_USER_PROFILE.email}
        userDisplayName={DEMO_PARENT_USER_PROFILE.displayName}
        profilePhotoUrl={DEMO_PARENT_USER_PROFILE.profilePhotoUrl}
        previewMode
        previewHomeHref="#"
        fullBleed
        fillHeight
        toasterAppearance="garden"
        helpFabClassName="max-sm:hidden"
      >
        <EnrollmentChecklistExperience
          branding={branding}
          schoolName={schoolName}
          title={DEMO_CHECKLIST_TITLE}
          items={items}
          instances={instances}
          mode="preview"
          organizationId={DEMO_PORTAL_ORG_ID}
          checklistId={checklistId}
          initialItemId={activeItemId}
          backLink={{ href: "#", label: "Back to applications" }}
        />
      </ApplyPortalPageShell>
    </div>
  );
}
