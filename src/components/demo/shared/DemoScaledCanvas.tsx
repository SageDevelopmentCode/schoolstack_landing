"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Narrow frames (phones) render the real phone layout near 1:1 instead of
 * shrinking a desktop canvas into unreadable text; wider frames scale a tablet
 * or desktop canvas to fit.
 */
export function designWidthFor(frameWidth: number) {
  if (frameWidth < 640) return Math.max(375, frameWidth);
  if (frameWidth < 1100) return 1024;
  return 1440;
}

/** Draws children on a canvas sized by `designWidthFor` and scaled to the frame. */
export default function DemoScaledCanvas({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [designWidth, setDesignWidth] = useState(1440);
  const [scale, setScale] = useState(0.81);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const width = designWidthFor(el.offsetWidth);
      setDesignWidth(width);
      setScale(el.offsetWidth / width);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // `overflow-clip`, not hidden: the canvas is laid out wider than the frame before scaling,
    // and a hidden box can still be scrolled sideways by scrollIntoView (cutting off the left edge).
    <div ref={outerRef} className="relative h-full overflow-clip">
      <div
        style={{
          width: designWidth,
          height: scale > 0 ? `${100 / scale}%` : "100%",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
