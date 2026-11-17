"use client";

import { useEffect, useState } from "react";

/**
 * Seconds since `startedAt`, ticking every second.
 *
 * `anchorNow` (marketing demos only) pins "now" to a fixed instant when the
 * component mounts and keeps ticking from there, so a fixture clocked in at
 * 7:44 AM reads like a morning session whatever the visitor's clock says.
 */
export function useLiveElapsed(startedAt: Date | null, anchorNow?: Date | null): number {
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  if (!startedAt) {
    return 0;
  }

  const effectiveNow = anchorNow ? anchorNow.getTime() + (now - mountedAt) : now;
  return Math.max(0, Math.floor((effectiveNow - startedAt.getTime()) / 1000));
}
