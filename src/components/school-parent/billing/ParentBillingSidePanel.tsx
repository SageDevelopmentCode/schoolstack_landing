"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingSidePanelProps = {
  theme: ParentThemeTokens;
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  testId: string;
  panelId: string;
};

export default function ParentBillingSidePanel({
  theme,
  open,
  title,
  subtitle,
  onClose,
  children,
  testId,
  panelId,
}: ParentBillingSidePanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-full flex-col overflow-hidden sm:w-[min(100%,28rem)]"
            style={{
              backgroundColor: theme.paper,
              borderLeft: `1px solid ${theme.line}`,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
            data-testid={testId}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6"
              style={{ borderColor: theme.line, backgroundColor: theme.white }}
            >
              <div className="min-w-0">
                <ParentDisplayHeading
                  theme={theme}
                  as="h2"
                  size="section"
                  id={`${panelId}-title`}
                  className="!text-[1.25rem]"
                >
                  {title}
                </ParentDisplayHeading>
                {subtitle ? (
                  <div className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {subtitle}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg border p-1.5 transition-colors"
                style={{ borderColor: theme.line, color: theme.muted }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6"
              style={{ backgroundColor: theme.paper }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
