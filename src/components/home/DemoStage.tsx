"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import {
  LazyDemoTeacherGardenHours,
  prefetchDemoTeacherGardenHours,
} from "@/components/demo/shared/lazyDemoTeacherGardenHours";
import {
  LazyGardenAdminDashboardDemo,
  LazyGardenAdminMarketingDemo,
  LazyGardenEnrollmentDemo,
  LazyParentDashboardDemo,
  LazyTeacherDashboardDemo,
  LazyWebsiteDashboardDemo,
  prefetchGardenAdminDashboardDemo,
  prefetchGardenAdminMarketingDemo,
  prefetchGardenEnrollmentDemo,
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
  | "marketing"
  | "messages";

const PREFETCH: Record<DemoStageKey, () => void> = {
  parent: prefetchParentDemo,
  enrollment: prefetchGardenEnrollmentDemo,
  tuition: prefetchParentDemo,
  messages: prefetchTeacherDemo,
  teacher: prefetchTeacherDemo,
  attendance: prefetchTeacherDemo,
  timeclock: prefetchDemoTeacherGardenHours,
  admin: prefetchGardenAdminDashboardDemo,
  marketing: prefetchGardenAdminMarketingDemo,
  website: prefetchWebsiteDemo,
};

/** Containers narrower than this (and, for portals, a viewport below `md`) use phone mode. */
const PHONE_MAX_WIDTH = 640;
const PHONE_CANVAS_WIDTH = 375;
const PHONE_VIEWPORT_QUERY = "(max-width: 767px)";

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
      return <LazyGardenAdminDashboardDemo />;
    case "website":
      return <LazyWebsiteDashboardDemo disableTour />;
    case "enrollment":
      return <LazyGardenEnrollmentDemo />;
    case "tuition":
      return (
        <LazyParentDashboardDemo initialTab="billing" disableTour hideNav />
      );
    case "attendance":
      return (
        <LazyTeacherDashboardDemo initialTab="attendance" disableTour hideNav />
      );
    case "timeclock":
      return <LazyDemoTeacherGardenHours />;
    case "marketing":
      return <LazyGardenAdminMarketingDemo />;
    case "messages":
      // The teacher inbox is a working demo; the parent Messages tab is still "Coming soon".
      return (
        <LazyTeacherDashboardDemo initialTab="messages" disableTour hideNav />
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
  /**
   * Above-the-fold demos: wait for page load + idle (or pointer/focus) before mounting the
   * initial demo. Switching `active` mounts the new demo immediately.
   */
  deferUntilIdle?: boolean;
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
  deferUntilIdle = false,
}: DemoStageProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [loaded, setLoaded] = useState<Set<DemoStageKey>>(
    () => new Set([active]),
  );

  if (!loaded.has(active)) {
    setLoaded(new Set(loaded).add(active));
  }

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.clientWidth);
      setHeight(el.clientHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const query = window.matchMedia(PHONE_VIEWPORT_QUERY);
    const updateViewport = () => setNarrowViewport(query.matches);
    updateViewport();
    query.addEventListener("change", updateViewport);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", updateViewport);
    };
  }, []);

  // Phone mode: render the demo on a phone-width canvas at near 1:1, the way a phone shows it.
  // The website is container-responsive, so container width alone decides. The portals follow
  // viewport breakpoints, so they also need a phone viewport, or a narrow tile on a desktop
  // screen would draw the desktop layout on a phone-width canvas.
  const narrowContainer = width > 0 && width < PHONE_MAX_WIDTH;
  const phone = narrowContainer && (active === "website" || narrowViewport);
  const canvasWidth = phone ? Math.max(PHONE_CANVAS_WIDTH, width) : designWidth;
  const scale = phone
    ? width / canvasWidth
    : width > 0
      ? Math.min(maxScale, Math.max(minScale, width / designWidth))
      : minScale;
  const canvasHeight = phone && height > 0 ? height / scale : designHeight;
  // Height is pure CSS (container query units) so it matches the scaled demo on first paint.
  // A JS-measured height changed after hydration and made `/#product` links land too high.
  // On a phone (viewport < md, container < 40rem) the window grows to phone proportions.
  const heightVars = {
    "--demo-h": `clamp(${designHeight * minScale}px, ${(designHeight / designWidth) * 100}cqw, ${designHeight * maxScale}px)`,
    "--demo-phone-h": "clamp(380px, 165cqw, 75svh)",
  } as React.CSSProperties;

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      {header}
      <div className="w-full" style={{ containerType: "inline-size" }}>
        <div
          ref={measureRef}
          className="relative h-[var(--demo-h)] w-full overflow-hidden max-md:@max-[40rem]:h-[var(--demo-phone-h)]"
          style={heightVars}
        >
          <InViewDemoGate
            className="absolute inset-0"
            // Once the visitor picks another view, stop deferring so it shows at once.
            deferUntilIdle={deferUntilIdle && loaded.size === 1}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: canvasWidth,
                height: canvasHeight,
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
