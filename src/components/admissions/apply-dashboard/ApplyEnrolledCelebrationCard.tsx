"use client";

import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { applyDashboardFadeUp } from "./apply-dashboard-motion";

type ApplyEnrolledCelebrationCardProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  parentPortalHref: string;
};

export default function ApplyEnrolledCelebrationCard({
  theme,
  schoolName,
  parentPortalHref,
}: ApplyEnrolledCelebrationCardProps) {
  return (
    <motion.section
      custom={0}
      initial="hidden"
      animate="visible"
      variants={applyDashboardFadeUp}
      className="grid grid-cols-1 items-center gap-4 rounded-[20px] border p-5 sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:p-6"
      style={{
        borderColor: "#C7DFCB",
        background: "linear-gradient(135deg, #EDF7EF, #F8FBF7)",
        boxShadow: theme.shadowCard,
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] text-2xl"
        style={{ backgroundColor: "#DFF1E1" }}
        aria-hidden="true"
      >
        <PartyPopper className="h-6 w-6" style={{ color: theme.success }} />
      </div>
      <div className="min-w-0">
        <h2
          className="m-0 text-[23px] font-semibold leading-tight"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Your family is enrolled!
        </h2>
        <p className="m-0 mt-1 text-[13px] leading-relaxed" style={{ color: theme.muted }}>
          Welcome to {schoolName}. Tuition, messages, your children&apos;s school-day
          updates, and family events now live in your parent portal.
        </p>
      </div>
      <ParentButtonLink
        theme={theme}
        href={parentPortalHref}
        variant="primary"
        showArrow
        className="w-full sm:w-auto"
      >
        Go to parent portal
      </ParentButtonLink>
    </motion.section>
  );
}
