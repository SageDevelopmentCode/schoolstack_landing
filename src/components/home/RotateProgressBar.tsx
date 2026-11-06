"use client";

import { motion } from "framer-motion";

type RotateProgressBarProps = {
  /** Changing this restarts the fill. */
  cycleKey: number | string;
  running: boolean;
  durationMs: number;
  className?: string;
  color?: string;
};

export default function RotateProgressBar({
  cycleKey,
  running,
  durationMs,
  className = "",
  color = "currentColor",
}: RotateProgressBarProps) {
  return (
    <span className={`block h-[3px] w-full overflow-hidden rounded-full bg-current/15 ${className}`} aria-hidden="true">
      <motion.span
        key={running ? cycleKey : "static"}
        className="block h-full origin-left rounded-full"
        style={{ backgroundColor: color }}
        initial={{ scaleX: running ? 0 : 1 }}
        animate={{ scaleX: 1 }}
        transition={running ? { duration: durationMs / 1000, ease: "linear" } : { duration: 0 }}
      />
    </span>
  );
}
