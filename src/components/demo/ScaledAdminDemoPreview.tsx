"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaAdminDashboardDemo,
  prefetchAthenaAdminDemo,
} from "@/components/demo/athena/lazyAthenaDemos";
import {
  LazyWonderHereAdminDashboardDemo,
  prefetchWonderHereAdminDemo,
} from "@/components/demo/wonderhere/lazyWonderHereDemos";

const DESIGN_WIDTH = 1440;

export default function ScaledAdminDemoPreview({
  demoSlug = "athena-microacademy",
  initialAdmissionsTab = "submissions",
  initialSelectedLeadId,
  initialSelectedFlowId,
  animateNewSubmission,
  autoSendEnrollmentLink,
}: {
  demoSlug?: string;
  initialAdmissionsTab?: "flows" | "submissions";
  initialSelectedLeadId?: string;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);
  const isWonderHere = demoSlug === "wonderhere-lakeland";

  useEffect(() => {
    if (isWonderHere) prefetchWonderHereAdminDemo();
    else prefetchAthenaAdminDemo();
  }, [isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isWonderHere
    ? LazyWonderHereAdminDashboardDemo
    : LazyAthenaAdminDashboardDemo;

  return (
    <DemoPreviewFrame variant="admin">
      <div ref={outerRef} className="relative h-full overflow-hidden">
        <div
          style={{
            width: DESIGN_WIDTH,
            height: scale > 0 ? `${100 / scale}%` : "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <DemoComponent
            initialPage="leads"
            initialAdmissionsTab={initialAdmissionsTab}
            initialSelectedLeadId={initialSelectedLeadId}
            initialSelectedFlowId={initialSelectedFlowId}
            animateNewSubmission={animateNewSubmission}
            autoSendEnrollmentLink={autoSendEnrollmentLink}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
