"use client";

import { useEffect, useRef, useState } from "react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
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
    <div
      className="rounded-2xl border border-border overflow-hidden"
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
            {role === "parent" ? (
              <LazySagefieldParentDashboardDemo
                key="parent"
                initialTab="billing"
                disableTour
                hideNav={false}
              />
            ) : role === "teacher" ? (
              <LazySagefieldTeacherDashboardDemo
                key="teacher"
                initialTab="attendance"
                disableTour
                hideNav={false}
              />
            ) : (
              <LazySagefieldAdminDashboardDemo
                key="admin"
                initialPage="leads"
                initialAdmissionsTab="submissions"
                disableTour
              />
            )}
          </div>
        </div>
      </InViewDemoGate>
    </div>
  );
}
