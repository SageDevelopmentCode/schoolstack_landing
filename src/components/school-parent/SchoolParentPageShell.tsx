"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type SchoolParentPageShellProps = {
  title: string;
  children: ReactNode;
};

export default function SchoolParentPageShell({
  title,
  children,
}: SchoolParentPageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <motion.div
        key={title}
        className="flex-1 overflow-y-auto p-0"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
