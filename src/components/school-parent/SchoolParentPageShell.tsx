"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type SchoolParentPageShellProps = {
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
};

export default function SchoolParentPageShell({
  title,
  hideTitle = false,
  children,
}: SchoolParentPageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!hideTitle ? (
        <div className="shrink-0 border-b border-gray-100 px-6 pb-4 pt-5">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
      ) : null}
      <motion.div
        key={title}
        className={`flex-1 overflow-y-auto ${hideTitle ? "p-0" : "px-6 py-5"}`}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
