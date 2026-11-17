"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { DemoSkeleton } from "@/components/ui/DemoSkeleton";

type DemoTeacherHoursModule = typeof import("@/components/demo/shared/DemoTeacherHoursPage");

let hoursPromise: Promise<DemoTeacherHoursModule> | null = null;

function loadDemoTeacherHours() {
  if (!hoursPromise) {
    hoursPromise = import("@/components/demo/shared/DemoTeacherHoursPage").catch((error) => {
      hoursPromise = null;
      console.error('Failed to load demo "teacher hours":', error);
      throw error;
    });
  }
  return hoursPromise;
}

const DemoTeacherHoursPage = dynamic(() => loadDemoTeacherHours(), {
  ssr: false,
  loading: () => <DemoSkeleton className="rounded-2xl border border-gray-200" />,
});

/** Starts loading the Garden My Hours demo chunk (hover / near-viewport prefetch). */
export function prefetchDemoTeacherGardenHours() {
  void loadDemoTeacherHours().catch(() => {});
}

/**
 * DemoStage "timeclock": just the real Garden staff My Hours page (preview
 * mode, demo fixtures), without the story shell or portal nav.
 */
export function LazyDemoTeacherGardenHours(props: ComponentProps<DemoTeacherHoursModule["default"]>) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[var(--sf-cream,#f7f1e7)]" data-testid="demo-stage-teacher-hours">
      <DemoTeacherHoursPage {...props} />
    </div>
  );
}
