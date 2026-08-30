"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileWarning } from "lucide-react";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import { ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentAgreementAmendmentBannerProps = {
  C: AdminThemeTokens;
  items: EnrollmentAgreementAmendmentBannerItem[];
  incompleteItems?: EnrollmentAgreementIncompleteBannerItem[];
};

export default function EnrollmentAgreementAmendmentBanner({
  C,
  items,
  incompleteItems = [],
}: EnrollmentAgreementAmendmentBannerProps) {
  if (items.length === 0 && incompleteItems.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {items.map((item) => (
        <div
          key={`amendment:${item.applicationId}:${item.checklistItemLabel}`}
          className="rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: `${C.accent}12`,
            borderColor: `${C.accent}40`,
            boxShadow: C.shadowCard,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${C.accent}22` }}
            >
              <FileWarning className="h-4 w-4" style={{ color: C.accent }} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                Enrollment agreement update for {item.studentName}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {item.amendmentNotice}
              </p>
              <p className="text-xs" style={{ color: C.textTertiary }}>
                {item.checklistItemLabel}
              </p>
              <Link
                href={item.enrollmentHref}
                className="text-sm font-medium underline underline-offset-2"
                style={{ color: C.accent }}
              >
                Review and re-sign
              </Link>
            </div>
          </div>
        </div>
      ))}
      {incompleteItems.map((item) => (
        <div
          key={`incomplete:${item.applicationId}:${item.checklistItemLabel}`}
          className="rounded-2xl border px-4 py-4"
          style={{
            backgroundColor: `${C.accent}12`,
            borderColor: `${C.accent}40`,
            boxShadow: C.shadowCard,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${C.accent}22` }}
            >
              <FileWarning className="h-4 w-4" style={{ color: C.accent }} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                Enrollment agreement incomplete for {item.studentName}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE}
              </p>
              <p className="text-xs" style={{ color: C.textTertiary }}>
                {item.checklistItemLabel}
              </p>
              <Link
                href={item.enrollmentHref}
                className="text-sm font-medium underline underline-offset-2"
                style={{ color: C.accent }}
              >
                Continue signing
              </Link>
            </div>
          </div>
        </div>
      ))}
    </motion.section>
  );
}
