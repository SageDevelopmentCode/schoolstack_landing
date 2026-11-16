"use client";

import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenOverlayScope } from "@/components/school-admin/garden/blocks";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SchoolAdminSlideOverShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  C: AdminThemeTokens;
  widthClassName?: string;
  /** Garden only: data-testid on the drawer. */
  testId?: string;
};

/** Wide story drawers (≥ 36rem) become the xl Garden drawer. */
function gardenSize(widthClassName: string): "md" | "xl" {
  const rem = /(\d+(?:\.\d+)?)rem/.exec(widthClassName);
  return rem && Number(rem[1]) >= 36 ? "xl" : "md";
}

export default function SchoolAdminSlideOverShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  C,
  widthClassName = "w-[min(100%,28rem)]",
  testId,
}: SchoolAdminSlideOverShellProps) {
  const skin = useAdminGardenSkin();
  const panelId = `slide-over-${useId().replace(/:/g, "")}`;

  // Inside a Garden admin page: the Garden drawer (portalled, skinned body).
  if (skin) {
    return (
      <GardenOverlayScope theme={skin}>
        <GSidePanel
          theme={skin}
          open={open}
          onClose={onClose}
          title={title}
          subtitle={subtitle}
          footer={footer ? <div className="flex w-full flex-wrap items-center justify-end gap-2.5">{footer}</div> : undefined}
          testId={testId ?? panelId}
          panelId={panelId}
          size={gardenSize(widthClassName)}
        >
          <div className="sf-admin-garden-skin flex flex-col gap-4">{children}</div>
        </GSidePanel>
      </GardenOverlayScope>
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
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
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={`absolute inset-y-0 right-0 z-[15] flex ${widthClassName} max-w-full flex-col overflow-hidden`}
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {title}
                </h3>
                {subtitle ? (
                  <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1"
                style={{ color: C.textSecondary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
              {children}
            </div>

            {footer ? (
              <div
                className="flex flex-shrink-0 items-center justify-end gap-2 px-4 py-3 sm:px-5"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
