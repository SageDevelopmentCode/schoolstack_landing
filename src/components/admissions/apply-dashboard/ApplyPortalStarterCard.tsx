"use client";

import { motion } from "framer-motion";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { applyDashboardFadeUp } from "./apply-dashboard-motion";

type ApplyPortalStarterCardProps = {
  theme: ParentThemeTokens;
  parentPortalHref: string;
};

export default function ApplyPortalStarterCard({
  theme,
  parentPortalHref,
}: ApplyPortalStarterCardProps) {
  return (
    <motion.section
      custom={8}
      initial="hidden"
      animate="visible"
      variants={applyDashboardFadeUp}
    >
      <ParentCard
        theme={theme}
        className="!flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:!p-5"
        style={{ backgroundColor: theme.cream }}
      >
        <div className="min-w-0">
          <h3
            className="m-0 text-lg font-semibold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            Looking for your children&apos;s school updates?
          </h3>
          <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
            The parent portal is now your home for daily school life, messages,
            tuition, and family events.
          </p>
        </div>
        <ParentButtonLink
          theme={theme}
          href={parentPortalHref}
          variant="soft"
          className="w-full shrink-0 sm:w-auto"
        >
          Open parent portal
        </ParentButtonLink>
      </ParentCard>
    </motion.section>
  );
}
