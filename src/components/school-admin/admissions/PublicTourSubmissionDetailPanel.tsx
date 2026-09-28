"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import {
  labelFromPublicRegistrant,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";
import type {
  PublicTourChildEntry,
  PublicTourRegistrant,
} from "@/lib/admissions/public-tour-settings";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type PublicTourSubmissionDetailPanelProps = {
  visit: AdminScheduledVisit | null;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  onClose: () => void;
};

export function registrantFromVisit(visit: AdminScheduledVisit): PublicTourRegistrant | null {
  const raw = visit.registrant;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const contactEmail =
    typeof raw.contactEmail === "string" ? raw.contactEmail.trim() : "";
  const answers =
    raw.answers && typeof raw.answers === "object" && !Array.isArray(raw.answers)
      ? (raw.answers as Record<string, unknown>)
      : {};
  if (!contactEmail) return null;
  return { contactEmail, answers };
}

function formatAnswerValue(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (typeof value === "string") return value.trim() || "—";
  if (Array.isArray(value)) {
    const children = value as PublicTourChildEntry[];
    if (children.length === 0) return "—";
    return children
      .map((child) => {
        const name = child.name?.trim() || "Child";
        const grade = child.gradeAttending?.trim();
        return grade ? `${name} (${grade})` : name;
      })
      .join(", ");
  }
  return "—";
}

function humanizeFieldId(id: string): string {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shouldSkipAnswerField(
  key: string,
  value: unknown,
  contactEmail: string,
): boolean {
  if (key !== "email" && key !== "contact_email") {
    return false;
  }
  const normalized =
    typeof value === "string" ? value.trim().toLowerCase() : "";
  return normalized === contactEmail.toLowerCase();
}

function timingChipTone(
  timing: AdminScheduledVisit["timing"],
): "info" | "success" | "purple" {
  if (timing === "past") return "purple";
  if (timing === "happening") return "success";
  return "info";
}

function timingLabel(timing: AdminScheduledVisit["timing"]): string {
  if (timing === "upcoming") return "Upcoming";
  if (timing === "happening") return "Happening";
  return "Past";
}

export default function PublicTourSubmissionDetailPanel({
  visit,
  C,
  theme,
  onClose,
}: PublicTourSubmissionDetailPanelProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && visit) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visit, onClose]);

  const registrant = visit ? registrantFromVisit(visit) : null;
  const contactName = visit ? labelFromPublicRegistrant(visit.registrant) : null;

  return (
    <AnimatePresence>
      {visit && registrant ? (
        <>
          <motion.div
            key="public-tour-submission-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onClose}
          />
          <motion.div
            key="public-tour-submission-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden border-l shadow-xl sm:w-[min(100%,24rem)] md:w-[400px] lg:w-[480px]"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-6 py-5"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div className="min-w-0">
                <p
                  className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: C.textTertiary }}
                >
                  Tour submission
                </p>
                <h2
                  className="mt-1 pr-2 text-base font-semibold leading-tight"
                  style={{ color: C.textPrimary }}
                >
                  {contactName ?? visit.whenLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 cursor-pointer rounded-md p-1.5 transition-colors"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <AdminChip theme={theme} tone={timingChipTone(visit.timing)}>
                {timingLabel(visit.timing)}
              </AdminChip>

              <div>
                <p className="mb-0.5 text-xs" style={{ color: C.textTertiary }}>
                  When
                </p>
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {visit.whenLabel}
                </p>
              </div>

              <dl className="space-y-4">
                <DetailRow label="Email" value={registrant.contactEmail} C={C} />
                {Object.entries(registrant.answers)
                  .filter(
                    ([key, value]) =>
                      !shouldSkipAnswerField(key, value, registrant.contactEmail),
                  )
                  .map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={humanizeFieldId(key)}
                      value={formatAnswerValue(value)}
                      C={C}
                    />
                  ))}
              </dl>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  C,
}: {
  label: string;
  value: string;
  C: AdminThemeTokens;
}) {
  return (
    <div>
      <dt
        className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: C.textTertiary }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 text-sm whitespace-pre-wrap" style={{ color: C.textPrimary }}>
        {value}
      </dd>
    </div>
  );
}
