"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { ADMIN_RADIUS_CARD } from "@/components/school-admin/ui/story/AdminCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { committeeTransition, modalBackdrop, modalPanel } from "./committee-motion";

type CommitteeModalShellProps = {
  theme: ParentThemeTokens;
  title: string;
  kicker?: string;
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
  theme,
  title,
  kicker = "Committee",
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
        className={`w-full ${MAX_WIDTH_CLASS[maxWidth]} overflow-hidden shadow-xl`}
        style={{
          backgroundColor: "#F8FAF8",
          borderRadius: ADMIN_RADIUS_CARD,
          border: "1px solid #DCE4DC",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 border-b px-6 py-4"
          style={{ borderColor: "#DCE4DC" }}
        >
          <div className="min-w-0 pr-4">
            <AdminSectionKicker theme={theme}>{kicker}</AdminSectionKicker>
            <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
              {title}
            </AdminDisplayHeading>
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-5 w-5" style={{ color: theme.muted }} />
            </button>
          )}
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div
            className="border-t px-6 py-4"
            style={{ borderColor: "#DCE4DC" }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
