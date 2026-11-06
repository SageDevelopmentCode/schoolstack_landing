"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import {
  LazyAdminDashboardDemo,
  LazyParentDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyWebsiteDashboardDemo,
  prefetchAdminDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
  prefetchWebsiteDemo,
} from "@/components/sections/lazyDemos";

export type DemoStageKey =
  | "parent"
  | "teacher"
  | "admin"
  | "website"
  | "enrollment"
  | "tuition"
  | "attendance"
  | "timeclock"
  | "marketing";

const PREFETCH: Record<DemoStageKey, () => void> = {
  parent: prefetchParentDemo,
  enrollment: prefetchParentDemo,
  tuition: prefetchParentDemo,
  teacher: prefetchTeacherDemo,
  attendance: prefetchTeacherDemo,
  timeclock: prefetchTeacherDemo,
  admin: prefetchAdminDemo,
  marketing: prefetchAdminDemo,
  website: prefetchWebsiteDemo,
};

export function prefetchDemoStage(key: DemoStageKey) {
  PREFETCH[key]();
}

function renderDemo(key: DemoStageKey, tour: boolean): ReactNode {
  const disableTour = !tour;
  switch (key) {
    case "parent":
      return <LazyParentDashboardDemo disableTour={disableTour} />;
    case "teacher":
      return <LazyTeacherDashboardDemo disableTour={disableTour} />;
    case "admin":
      return <LazyAdminDashboardDemo disableTour={disableTour} />;
    case "website":
      return <LazyWebsiteDashboardDemo disableTour />;
    case "enrollment":
      return (
        <LazyParentDashboardDemo initialTab="enrollment" disableTour hideNav />
      );
    case "tuition":
      return (
        <LazyParentDashboardDemo initialTab="billing" disableTour hideNav />
      );
    case "attendance":
      return (
        <LazyTeacherDashboardDemo initialTab="attendance" disableTour hideNav />
      );
    case "timeclock":
      return (
        <LazyTeacherDashboardDemo initialTab="hours" disableTour hideNav />
      );
    case "marketing":
      return (
        <LazyAdminDashboardDemo initialPage="marketing" disableTour hideNav />
      );
  }
}

type DemoStageProps = {
  active: DemoStageKey;
  /** Interactive demos accept clicks and internal scroll; otherwise they are `inert`. */
  interactive?: boolean;
  /** Let role dashboards (parent/teacher/admin) run their guided tour. */
  tour?: boolean;
  /** Layout width the demos are designed for. */
  designWidth?: number;
  /** Unscaled height of the visible window. */
  designHeight?: number;
  /** Never scale below this; narrower containers clip the right edge instead. */
  minScale?: number;
  maxScale?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Rendered above the scaled area, unscaled (e.g. browser chrome). */
  header?: ReactNode;
};

export default function DemoStage({
  active,
  interactive = false,
  tour = false,
  designWidth = 1100,
  designHeight = 680,
  minScale = 0.45,
  maxScale = 1,
  className = "",
  style,
  header,
}: DemoStageProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState<Set<DemoStageKey>>(
    () => new Set([active]),
  );

  if (!loaded.has(active)) {
    setLoaded(new Set(loaded).add(active));
  }

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale =
    width > 0
      ? Math.min(maxScale, Math.max(minScale, width / designWidth))
      : minScale;
  // Height is pure CSS (container query units) so it matches the scaled demo on first paint.
  // A JS-measured height changed after hydration and made `/#product` links land too high.
  const visibleHeight = `clamp(${designHeight * minScale}px, ${(designHeight / designWidth) * 100}cqw, ${designHeight * maxScale}px)`;

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      {header}
      <div className="w-full" style={{ containerType: "inline-size" }}>
        <div
          ref={measureRef}
          className="relative w-full overflow-hidden"
          style={{ height: visibleHeight }}
        >
          <InViewDemoGate className="absolute inset-0">
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: designWidth,
                height: designHeight,
                transform: `scale(${scale})`,
              }}
            >
              {[...loaded].map((key) => {
                const isActive = key === active;
                return (
                  <div
                    key={key}
                    inert={!interactive || !isActive}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 overflow-y-auto overflow-x-hidden bg-white transition-opacity duration-300 ${
                      isActive
                        ? "z-10 opacity-100"
                        : "pointer-events-none z-0 opacity-0"
                    }`}
                  >
                    {renderDemo(key, tour)}
                  </div>
                );
              })}
            </div>
          </InViewDemoGate>
        </div>
      </div>
    </div>
  );
}
