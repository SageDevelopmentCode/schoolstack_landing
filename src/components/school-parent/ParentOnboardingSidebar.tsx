"use client";

import { createElement } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardCheck, X } from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentOnboardingSidebarProps = {
  C: AdminThemeTokens;
  open: boolean;
  items: ResolvedParentOnboardingItem[];
  onClose: () => void;
};

function OnboardingProgressBar({
  C,
  completed,
  total,
}: {
  C: AdminThemeTokens;
  completed: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: `${C.accent}22` }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${percent}%`,
          backgroundColor: C.accent,
        }}
      />
    </div>
  );
}

function OnboardingItemIcon({ item }: { item: ResolvedParentOnboardingItem }) {
  const { iconBg, iconColor } = getParentFeatureIconStyle(item.icon ?? "puzzle");
  const icon = getFeatureIcon(item.icon ?? "puzzle");

  if (item.completed) {
    return (
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-4 w-4 text-emerald-600" />
      </div>
    );
  }

  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}
    >
      {createElement(icon, { className: `h-4 w-4 ${iconColor}` })}
    </div>
  );
}

export default function ParentOnboardingSidebar({
  C,
  open,
  items,
  onClose,
}: ParentOnboardingSidebarProps) {
  const trackedItems = items.filter((item) => item.autoTracked);
  const completedCount = trackedItems.filter((item) => item.completed).length;
  const totalCount = trackedItems.length;

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
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-onboarding-sidebar-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,24rem)] max-w-full flex-col overflow-hidden border-l border-gray-100"
            style={{
              backgroundColor: C.surface,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${C.accent}1a` }}
                >
                  <ClipboardCheck
                    className="h-4 w-4"
                    style={{ color: C.accent }}
                  />
                </div>
                <h2
                  id="parent-onboarding-sidebar-title"
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Onboarding checklist
                </h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" style={{ color: C.textSecondary }} />
              </button>
            </div>

            {totalCount > 0 ? (
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <p
                    className="text-xs font-medium"
                    style={{ color: C.textSecondary }}
                  >
                    Progress
                  </p>
                  <span className="text-xs" style={{ color: C.textTertiary }}>
                    {completedCount} / {totalCount}
                  </span>
                </div>
                <OnboardingProgressBar
                  C={C}
                  completed={completedCount}
                  total={totalCount}
                />
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const rowContent = (
                    <>
                      <OnboardingItemIcon item={item} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            item.completed
                              ? "text-emerald-700/80 line-through"
                              : ""
                          }`}
                          style={
                            item.completed
                              ? undefined
                              : { color: C.textPrimary }
                          }
                        >
                          {item.label}
                        </p>
                      </div>
                    </>
                  );

                  return (
                    <li key={item.id}>
                      {item.completed ? (
                        <div className="flex items-center gap-3 bg-emerald-50/50 px-5 py-3.5">
                          {rowContent}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                        >
                          {rowContent}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
