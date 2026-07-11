"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PartyPopper } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrolledFamilyBannerProps = {
  C: AdminThemeTokens;
  schoolName: string;
  schoolSlug: string;
};

export default function EnrolledFamilyBanner({
  C,
  schoolName,
  schoolSlug,
}: EnrolledFamilyBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-6 rounded-xl border p-5 sm:p-6"
      style={{
        borderColor: C.successBorder,
        background: `linear-gradient(135deg, ${C.successBg} 0%, ${C.accentLight} 100%)`,
        boxShadow: C.shadowCard,
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            <PartyPopper className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2
              className="text-lg font-semibold sm:text-xl"
              style={{ color: C.accentDark }}
            >
              Your family is enrolled!
            </h2>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              Welcome to {schoolName}. Manage tuition, messages, and student
              updates in the parent portal.
            </p>
          </div>
        </div>
        <Link
          href={`/school/${schoolSlug}/parent`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:self-center"
          style={{ backgroundColor: C.accent }}
        >
          Go to parent portal
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
