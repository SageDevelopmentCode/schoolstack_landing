"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { ADMIN_RADIUS_CARD } from "@/components/school-admin/ui/story/AdminCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GKicker, G_FOCUS } from "@/components/school-parent/garden/ui";
import { useIsGardenCommittee } from "./committee-surface";
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
  const garden = useIsGardenCommittee();

  if (garden) {
    return (
      <motion.div
        variants={modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={committeeTransition}
        className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(43,36,29,0.42)] p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          variants={modalPanel(reducedMotion)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={committeeTransition}
          className={`w-full ${MAX_WIDTH_CLASS[maxWidth]} max-h-[90dvh] overflow-y-auto rounded-t-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)] shadow-[0_24px_60px_-24px_rgba(43,36,29,0.55)] sm:rounded-[24px]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-6 py-5">
            <div className="min-w-0 pr-4">
              <GKicker>{kicker}</GKicker>
              <h2 className="sf-display m-0 mt-1 text-[1.45rem] leading-[1.05] text-[var(--sf-ink)]">{title}</h2>
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={`-mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--sf-ink)]/70 hover:bg-[var(--sf-ink)]/[0.06] ${G_FOCUS} focus-visible:ring-offset-0`}
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
          <div className="p-6">{children}</div>
          {footer && <div className="border-t-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-6 py-4">{footer}</div>}
        </motion.div>
      </motion.div>
    );
  }

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
