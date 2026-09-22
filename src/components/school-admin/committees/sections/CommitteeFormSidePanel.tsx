"use client";

import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeFormSidePanelProps = {
  open: boolean;
  theme: ParentThemeTokens;
  kicker: string;
  title: string;
  icon?: ReactNode;
  onRequestClose: () => void;
  saving?: boolean;
  formId?: string;
  onSubmit?: (event: FormEvent) => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function CommitteeFormSection({
  theme,
  title,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="space-y-3 rounded-lg border p-4"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <h3
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: theme.muted }}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function CommitteeFormSidePanel({
  open,
  theme,
  kicker,
  title,
  icon,
  onRequestClose,
  saving = false,
  formId,
  onSubmit,
  children,
  footer,
}: CommitteeFormSidePanelProps) {
  const body = (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
      {footer ? (
        <div
          className="shrink-0 border-t px-6 py-4"
          style={{ borderColor: theme.line, backgroundColor: theme.paper }}
        >
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onRequestClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(100%,24rem)] flex-col overflow-hidden border-l shadow-xl sm:w-[400px]"
            style={{ backgroundColor: theme.white, borderColor: theme.line }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-6 py-5"
              style={{ borderColor: theme.line, backgroundColor: theme.white }}
            >
              <div className="flex min-w-0 items-start gap-3 pr-2">
                {icon ? (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: theme.primarySoft }}
                  >
                    {icon}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <AdminSectionKicker theme={theme}>{kicker}</AdminSectionKicker>
                  <AdminDisplayHeading
                    theme={theme}
                    as="h2"
                    size="section"
                    className="mt-1 truncate"
                  >
                    {title}
                  </AdminDisplayHeading>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequestClose}
                disabled={saving}
                className="shrink-0 rounded-md p-1.5 transition-colors disabled:opacity-50"
                style={{ color: theme.muted }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formId && onSubmit ? (
              <form
                id={formId}
                onSubmit={onSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                {body}
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">{body}</div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
