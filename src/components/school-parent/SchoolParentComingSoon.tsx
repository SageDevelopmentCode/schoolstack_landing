"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { getParentPortalFeatureVisual } from "@/lib/parent-portal/coming-soon-content";
import ParentPortalFeedbackModal from "@/components/school-parent/ParentPortalFeedbackModal";

type SchoolParentComingSoonProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  featureKey: string;
  featureLabel: string;
  userProfile: FamilyUserProfile;
};

export default function SchoolParentComingSoon({
  branding,
  schoolSlug,
  schoolName,
  organizationId,
  featureKey,
  featureLabel,
  userProfile,
}: SchoolParentComingSoonProps) {
  const pathname = usePathname();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const visual = useMemo(
    () => getParentPortalFeatureVisual(featureKey),
    [featureKey],
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <div
        className="relative flex min-h-full flex-col overflow-hidden"
        style={{ backgroundColor: C.bg }}
      >
        <div
          className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: C.accentGlow }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${C.accent}22` }}
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
          >
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[16/10] lg:aspect-[4/3]"
                style={{
                  boxShadow: `0 20px 50px ${C.accentGlow}, 0 0 0 1px ${C.border}`,
                }}
              >
                <Image
                  src={visual.heroImage}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}40 0%, transparent 55%, ${C.accentDark}20 100%)`,
                  }}
                  aria-hidden
                />
              </div>

              <div
                className="pointer-events-none absolute -bottom-4 -right-2 z-10 rotate-6 sm:-bottom-6 sm:-right-4"
                aria-hidden
              >
                <Image
                  src={visual.accentIllustration}
                  alt=""
                  width={120}
                  height={120}
                  className="h-24 w-24 object-contain opacity-90 drop-shadow-md sm:h-28 sm:w-28"
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: C.accentLight,
                  color: C.accent,
                  borderColor: C.secondaryBtnBorder,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Coming soon
              </span>

              <h1
                className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl"
                style={{ color: C.accentDark }}
              >
                {featureLabel}
              </h1>

              <p
                className="mt-3 max-w-sm text-base leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                {visual.tagline}
              </p>

              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: C.accent,
                  boxShadow: C.shadowMedium,
                }}
              >
                <MessageSquarePlus className="h-4 w-4" aria-hidden />
                Request a feature or give feedback
              </button>
            </div>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="relative flex shrink-0 justify-center border-t py-5"
          style={{ borderColor: C.border }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/Logo.png"
              alt="MudKitchen"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="text-xs font-medium text-clay">
              Powered by MudKitchen
            </span>
          </Link>
        </motion.footer>
      </div>

      <ParentPortalFeedbackModal
        C={C}
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        featureKey={featureKey}
        featureLabel={featureLabel}
        userProfile={userProfile}
        pagePath={pathname}
      />
    </>
  );
}
