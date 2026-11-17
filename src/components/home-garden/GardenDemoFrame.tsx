"use client";

import type { CSSProperties, ReactNode } from "react";
import DemoStage, { type DemoStageKey } from "@/components/home/DemoStage";
import GardenBrowserFrame, { GardenFrameBar } from "./GardenBrowserFrame";

export const DEMO_LABELS: Record<DemoStageKey, string> = {
  parent: "Parent View",
  teacher: "Teacher View",
  admin: "Admin View",
  website: "School Website",
  enrollment: "Enrollment System",
  tuition: "Tuition & Billing",
  attendance: "Attendance",
  timeclock: "Timeclock",
  marketing: "Marketing",
  messages: "Messages",
};

/**
 * The live, interactive MudKitchen demo, framed like a taped-up browser
 * window on the classroom wall. Tilt straightens on hover.
 */
export default function GardenDemoFrame({
  active,
  interactive = true,
  tilt = 0,
  tape = "var(--sf-butter)",
  tapeSide = "center",
  className = "",
  style,
  designHeight = 680,
  minScale = 0.3,
  deferUntilIdle = false,
  children,
}: {
  active: DemoStageKey;
  interactive?: boolean;
  /** Degrees; the frame straightens on hover. */
  tilt?: number;
  tape?: string | null;
  tapeSide?: "center" | "left" | "right";
  className?: string;
  style?: CSSProperties;
  designHeight?: number;
  minScale?: number;
  /** Above-the-fold frames: mount the live demo after page load + idle, or on first pointer/focus. */
  deferUntilIdle?: boolean;
  /** Extra overlays (sticker notes, doodles) positioned against the frame. */
  children?: ReactNode;
}) {
  return (
    <GardenBrowserFrame chrome={false} tilt={tilt} tape={tape} tapeSide={tapeSide} className={className} style={style} overlays={children}>
      <DemoStage
        active={active}
        interactive={interactive}
        designHeight={designHeight}
        minScale={minScale}
        deferUntilIdle={deferUntilIdle}
        header={<GardenFrameBar label={<>MudKitchen · {DEMO_LABELS[active]}</>} />}
      />
    </GardenBrowserFrame>
  );
}
