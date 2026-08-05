"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  adminModalTransition,
  modalBackdropVariants,
  modalPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";

type SchoolAdminModalShellProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "2xl" | "3xl";
  zIndex?: number;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  testId?: string;
  closeOnBackdrop?: boolean;
  panelClassName?: string;
  panelStyle?: CSSProperties;
};

const MAX_WIDTH_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
} as const;

export default function SchoolAdminModalShell({
  open,
  onClose,
  children,
  maxWidth = "md",
  zIndex = 50,
  ariaLabel,
  ariaLabelledBy,
  testId,
  closeOnBackdrop = true,
  panelClassName = "",
  panelStyle,
}: SchoolAdminModalShellProps) {
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex }}
          onClick={closeOnBackdrop ? onClose : undefined}
          role="presentation"
        >
          <motion.div
            variants={modalPanelVariants(reducedMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={adminModalTransition}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabelledBy ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledBy}
            data-testid={testId}
            className={`w-full overflow-hidden rounded-xl ${MAX_WIDTH_CLASS[maxWidth]} ${panelClassName}`.trim()}
            style={panelStyle}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
