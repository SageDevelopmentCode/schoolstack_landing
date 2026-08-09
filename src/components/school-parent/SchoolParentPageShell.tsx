"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type SchoolParentPageShellProps = {
  title: string;
  children: ReactNode;
  layout?: "default" | "embedded";
};

export default function SchoolParentPageShell({
  title,
  children,
  layout = "default",
}: SchoolParentPageShellProps) {
  const embedded = layout === "embedded";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <motion.div
        key={title}
        className={
          embedded
            ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            : "flex-1 overflow-y-auto p-0"
        }
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
