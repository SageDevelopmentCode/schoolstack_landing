"use client";

import { useEffect, useState } from "react";

export function useLiveElapsed(startedAt: Date | null): number {
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

  return Math.max(0, Math.floor((now - startedAt.getTime()) / 1000));
}
