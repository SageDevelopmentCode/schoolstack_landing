"use client";

import { useEffect, useRef, useState } from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import {
  LazyAthenaAdminDashboardDemo,
  prefetchAthenaAdminDemo,
} from "@/components/demo/athena/lazyAthenaDemos";

const DESIGN_WIDTH = 1440;

export default function ScaledAdminDemoPreview({
  initialAdmissionsTab = "submissions",
  initialSelectedLeadId,
  initialSelectedFlowId,
  animateNewSubmission,
}: {
  initialAdmissionsTab?: "flows" | "submissions";
  initialSelectedLeadId?: string;
  initialSelectedFlowId?: string;
  animateNewSubmission?: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);

  useEffect(() => {
    prefetchAthenaAdminDemo();
  }, []);

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
          <LazyAthenaAdminDashboardDemo
            initialPage="leads"
            initialAdmissionsTab={initialAdmissionsTab}
            initialSelectedLeadId={initialSelectedLeadId}
            initialSelectedFlowId={initialSelectedFlowId}
            animateNewSubmission={animateNewSubmission}
          />
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
