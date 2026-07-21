"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SchoolAdminDetailPanelSkeleton } from "@/components/school-admin/skeletons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ScheduleVisitLoadingPanelProps = {
  C: AdminThemeTokens;
  onClose: () => void;
};

export default function ScheduleVisitLoadingPanel({
  C,
  onClose,
}: ScheduleVisitLoadingPanelProps) {
  return (
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
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
        style={{
          backgroundColor: C.surface,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: C.shadowMedium,
        }}
        onClick={(event) => event.stopPropagation()}
        aria-busy="true"
        aria-label="Loading application"
      >
        <div
          className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Loading application
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded p-1"
            style={{ color: C.textTertiary }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <SchoolAdminDetailPanelSkeleton C={C} label="Loading application" />
        </div>
      </motion.div>
    </motion.div>
  );
}
