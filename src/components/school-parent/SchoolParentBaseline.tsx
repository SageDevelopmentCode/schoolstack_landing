"use client";

import { type ReactNode, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type SchoolParentBaselineProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  children: ReactNode;
};

export default function SchoolParentBaseline({
  slug,
  schoolName,
  branding,
  features,
  userProfile,
  children,
}: SchoolParentBaselineProps) {
  const pathname = usePathname();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-white"
      style={{ fontFamily: bodyFont, color: C.textPrimary }}
    >
      <SchoolParentHeader
        slug={slug}
        schoolName={schoolName}
        branding={branding}
        features={features}
        userProfile={userProfile}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
