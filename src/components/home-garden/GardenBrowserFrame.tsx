import type { CSSProperties, ReactNode } from "react";
import { Tape } from "@/components/garden/ui";

/** The paper browser bar: peach, butter and mint dots plus a centred label. */
export function GardenFrameBar({ label }: { label: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] px-4 py-2.5">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-peach)]" />
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-butter)]" />
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-mint)]" />
      </div>
      <span
        className="mx-auto truncate rounded-full bg-white px-4 py-1 text-xs font-extrabold text-[var(--sf-soft)] ring-1 ring-[var(--sf-ink)]/10"
        style={{ fontFamily: "var(--font-sf-body)" }}
      >
        {label}
      </span>
      <span className="w-[54px]" aria-hidden="true" />
    </div>
  );
}

/**
 * A taped-up browser window on the classroom wall: ink border, toy shadow,
 * optional tape and tilt (straightens on hover). The body sits inside
 * `.sf-demo`, so app UI rendered in it keeps the app's own type.
 */
export default function GardenBrowserFrame({
  label,
  chrome = true,
  tilt = 0,
  tape = "var(--sf-butter)",
  tapeSide = "center",
  className = "",
  bodyClassName = "",
  style,
  overlays,
  children,
}: {
  /** Text in the browser bar. Ignored when `chrome` is false. */
  label?: ReactNode;
  /** Render the browser bar. Turn off when the child draws its own (DemoStage `header`). */
  chrome?: boolean;
  /** Degrees; the frame straightens on hover. */
  tilt?: number;
  tape?: string | null;
  tapeSide?: "center" | "left" | "right";
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  /** Overlays (sticker notes, doodles) positioned against the frame. */
  overlays?: ReactNode;
  children: ReactNode;
}) {
  const tapePos =
    tapeSide === "left" ? "-top-3 left-10 -rotate-6" : tapeSide === "right" ? "-top-3 right-10 rotate-6" : "-top-3 left-1/2 -translate-x-1/2 -rotate-2";
  return (
    <div
      className={`group/frame relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 ${className}`}
      style={{ rotate: `${tilt}deg`, ...style }}
    >
      {tape ? <Tape color={tape} className={`w-28 ${tapePos}`} /> : null}
      <div className="sf-demo overflow-hidden rounded-[22px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_10px_0_0_var(--sf-ink),0_40px_80px_-40px_rgba(43,36,29,0.6)] sm:rounded-[28px]">
        {chrome ? <GardenFrameBar label={label} /> : null}
        {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
      </div>
      {overlays}
    </div>
  );
}
