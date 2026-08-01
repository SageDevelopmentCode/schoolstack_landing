"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { committeeTransition, modalBackdrop, modalPanel } from "./committee-motion";

type CommitteeModalShellProps = {
  C: AdminThemeTokens;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
};

const MAX_WIDTH_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export default function CommitteeModalShell({
  C,
  title,
  onClose,
  children,
  footer,
  maxWidth = "md",
  showCloseButton = false,
}: CommitteeModalShellProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      variants={modalBackdrop}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={committeeTransition}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalPanel(reducedMotion)}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={committeeTransition}
        className={`rounded-2xl shadow-xl w-full ${MAX_WIDTH_CLASS[maxWidth]} overflow-hidden`}
        style={{ backgroundColor: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: C.border }}
        >
          <h2 className="text-lg font-semibold pr-4" style={{ color: C.textPrimary }}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-black/5"
              aria-label="Close"
            >
              <X className="w-5 h-5" style={{ color: C.textTertiary }} />
            </button>
          )}
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderColor: C.border }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
