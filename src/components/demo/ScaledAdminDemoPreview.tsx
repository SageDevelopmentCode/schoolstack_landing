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
import {
  LazyMonarchHillsAdminDashboardDemo,
  prefetchMonarchHillsAdminDemo,
} from "@/components/demo/monarchhills/lazyMonarchHillsDemos";
import {
  LazyZoeLearningHouseAdminDashboardDemo,
  prefetchZoeLearningHouseAdminDemo,
} from "@/components/demo/zoelearninghouse/lazyZoeLearningHouseDemos";

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
  const isZoeLearningHouse = demoSlug === "zoe-learning-house";
  const isMonarchHills = demoSlug === "monarch-hills-education";
  const isWonderHere = demoSlug === "wonderhere-lakeland";

  useEffect(() => {
    if (isZoeLearningHouse) prefetchZoeLearningHouseAdminDemo();
    else if (isMonarchHills) prefetchMonarchHillsAdminDemo();
    else if (isWonderHere) prefetchWonderHereAdminDemo();
    else prefetchAthenaAdminDemo();
  }, [isZoeLearningHouse, isMonarchHills, isWonderHere]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const DemoComponent = isZoeLearningHouse
    ? LazyZoeLearningHouseAdminDashboardDemo
    : isMonarchHills
      ? LazyMonarchHillsAdminDashboardDemo
      : isWonderHere
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
