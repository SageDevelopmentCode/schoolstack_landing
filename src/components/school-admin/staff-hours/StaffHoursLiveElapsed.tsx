"use client";

import { useMemo } from "react";
import { formatLiveElapsed } from "@/lib/school-teacher/my-hours/format-duration";
import { useLiveElapsed } from "@/lib/school-teacher/my-hours/use-live-elapsed";

export function StaffHoursLiveElapsed({ clockInAt }: { clockInAt: string }) {
  const startedAt = useMemo(() => new Date(clockInAt), [clockInAt]);
  const elapsedSeconds = useLiveElapsed(startedAt);
  return (
    <span className="font-semibold tabular-nums">
      {formatLiveElapsed(elapsedSeconds)}
    </span>
  );
}
