"use client";

import { useEffect, useRef, useState } from "react";
import { LazyWebsiteDashboardDemo } from "@/components/sections/lazyDemos";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";

const DESIGN_WIDTH = 1440;

interface Props {
  config: SchoolWebsiteDemoConfig;
}

export default function ScaledWebsiteDemoPreview({ config }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.81);

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
    <div className="flex-1 h-full overflow-hidden p-4 lg:p-8 bg-gray-50">
      <div className="h-full rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
        <div ref={outerRef} className="relative h-full overflow-hidden">
          <div
            style={{
              width: DESIGN_WIDTH,
              height: scale > 0 ? `${100 / scale}%` : "100%",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <LazyWebsiteDashboardDemo config={config} disableTour />
          </div>
        </div>
      </div>
    </div>
  );
}
