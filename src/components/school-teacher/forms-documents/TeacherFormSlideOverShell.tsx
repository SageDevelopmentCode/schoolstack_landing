"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormSlideOverShellProps = {
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export default function TeacherFormSlideOverShell({
  theme,
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClassName = "w-[min(100%,28rem)]",
}: TeacherFormSlideOverShellProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const backdropTransition = { duration: reducedMotion ? 0.1 : 0.15 };
  const panelTransition = reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.18, ease: [0.32, 0.72, 0, 1] as const };
  const panelInitial = reducedMotion ? { opacity: 0 } : { x: "100%", opacity: 0 };
  const panelAnimate = reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 };
  const panelExit = reducedMotion ? { opacity: 0 } : { x: "100%", opacity: 0 };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-form-slide-over-title"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
            className={`absolute inset-y-0 right-0 z-[15] flex ${widthClassName} max-w-full flex-col overflow-hidden border-l`}
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="min-w-0">
                <h2
                  id="teacher-form-slide-over-title"
                  className="text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-0.5 text-sm" style={{ color: theme.muted }}>
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer ? (
              <div
                className="shrink-0 border-t px-5 py-4"
                style={{ borderColor: theme.line }}
              >
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
