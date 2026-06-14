"use client";

import { useEffect, useRef, useState } from "react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { LandingScaledDemoFrame } from "@/components/demo/LandingScaledDemoFrame";
import {
  LazySagefieldAdminDashboardDemo,
  LazySagefieldParentDashboardDemo,
  LazySagefieldTeacherDashboardDemo,
  prefetchSagefieldAdminDemo,
  prefetchSagefieldParentDemo,
  prefetchSagefieldTeacherDemo,
} from "@/components/demo/sagefield/lazySagefieldDemos";

const DESIGN_WIDTH = 1440;
const PREVIEW_HEIGHT = 400;

type Role = "parent" | "teacher" | "admin";

const PREFETCH_BY_ROLE: Record<Role, () => void> = {
  parent: prefetchSagefieldParentDemo,
  teacher: prefetchSagefieldTeacherDemo,
  admin: prefetchSagefieldAdminDemo,
};

interface Props {
  role: Role;
}

function SagefieldOutcomeDemo({ role }: { role: Role }) {
  if (role === "parent") {
    return (
      <LazySagefieldParentDashboardDemo
        key="parent"
        initialTab="billing"
        disableTour
        hideNav={false}
      />
    );
  }

  if (role === "teacher") {
    return (
      <LazySagefieldTeacherDashboardDemo
        key="teacher"
        initialTab="attendance"
        disableTour
        hideNav={false}
      />
    );
  }

  return (
    <LazySagefieldAdminDashboardDemo
      key="admin"
      initialPage="leads"
      initialAdmissionsTab="submissions"
      disableTour
    />
  );
}

export default function SagefieldOutcomeDemoPreview({ role }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    PREFETCH_BY_ROLE[role]();
  }, [role]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="lg:hidden max-lg:-ml-6 max-lg:overflow-x-hidden max-lg:overscroll-x-none">
        <LandingScaledDemoFrame preventHorizontalScroll>
          <SagefieldOutcomeDemo role={role} />
        </LandingScaledDemoFrame>
      </div>

      <div
        className="hidden lg:block rounded-2xl border border-border overflow-hidden"
        style={{ backgroundColor: "#FFF9F5" }}
      >
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface">
          <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
          <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
          <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
        </div>
        <InViewDemoGate
          className="relative overflow-hidden"
          style={{ height: PREVIEW_HEIGHT }}
        >
          <div ref={outerRef} className="absolute inset-0 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: DESIGN_WIDTH,
                height: scale > 0 ? `${100 / scale}%` : "100%",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <SagefieldOutcomeDemo role={role} />
            </div>
          </div>
        </InViewDemoGate>
      </div>
    </>
  );
}
