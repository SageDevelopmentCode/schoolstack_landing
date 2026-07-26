"use client";

import { type ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import AdminSupportRequestModal from "@/components/school-admin/AdminSupportRequestModal";
import SchoolParentHeader from "@/components/school-parent/SchoolParentHeader";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type SchoolParentBaselineProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  children: ReactNode;
};

function isParentHelpPage(pathname: string, slug: string): boolean {
  return pathname.startsWith(`/school/${slug}/parent/`);
}

export default function SchoolParentBaseline({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  children,
}: SchoolParentBaselineProps) {
  const pathname = usePathname();
  const [supportOpen, setSupportOpen] = useState(false);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const bodyFont =
    branding.typography.bodyFont?.trim() || "Inter, system-ui, sans-serif";
  const showHelpButton = isParentHelpPage(pathname, slug);

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
        <AnimatePresence initial={false}>
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

      {showHelpButton ? (
        <button
          type="button"
          title="Need help?"
          onClick={() => setSupportOpen(true)}
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-xs font-medium shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm"
          style={{
            backgroundColor: C.clayBg,
            border: `1px solid ${C.clayBorder}`,
            color: C.textSecondary,
          }}
        >
          <Image
            src="/images/Logo.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 w-auto object-contain"
            aria-hidden
          />
          Need help?
        </button>
      ) : null}

      <AdminSupportRequestModal
        C={C}
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        organizationId={organizationId}
        userEmail={userProfile.email}
        currentPath={pathname}
        submitEndpoint="/api/parent-portal/support-requests"
      />
    </div>
  );
}
