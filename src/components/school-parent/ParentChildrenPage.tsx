"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import type {
  ChildProfileData,
  FamilyChildOverview,
} from "@/lib/admissions/parent-portal-access";
import { applicationStatusBadgeStyle } from "@/lib/admissions/application-status-ui";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

const ChildProfileSidePanel = dynamic(
  () => import("@/components/school-parent/ChildProfileSidePanel"),
  { ssr: false },
);

type ParentChildrenPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  familyChildren: FamilyChildOverview[];
  childProfiles: Record<string, ChildProfileData>;
  previewBasePath?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

function ChildCard({
  child,
  C,
  index,
  onSelect,
}: {
  child: FamilyChildOverview;
  C: AdminThemeTokens;
  index: number;
  onSelect: () => void;
}) {
  const badgeStyle = applicationStatusBadgeStyle(child.status, C);
  const progress = child.checklistProgress;
  const showProgress =
    !child.isEnrolled && progress !== null && progress.total > 0;

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}>
      <button
        type="button"
        onClick={onSelect}
        className="group flex h-full w-full flex-col gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
        style={{
          borderColor: C.border,
          boxShadow: C.shadowCard,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${C.accent}55`;
          e.currentTarget.style.boxShadow = C.shadowMedium;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = C.shadowCard;
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-semibold transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: C.accentGlow,
              color: C.accentDark,
            }}
          >
            {studentInitials(child.studentName)}
          </div>
          <span
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: badgeStyle.backgroundColor,
              color: badgeStyle.color,
            }}
          >
            {child.isEnrolled ? (
              <CheckCircle className="h-2.5 w-2.5" />
            ) : (
              <Clock className="h-2.5 w-2.5" />
            )}
            {child.statusLabel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold text-gray-800">
            {child.studentName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            {child.grade ? `Grade ${child.grade}` : "Grade not listed"}
          </p>
        </div>

        {showProgress ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: C.textTertiary }}>Enrollment checklist</span>
              <span className="font-medium" style={{ color: C.textSecondary }}>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: C.elevated }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  backgroundColor: C.accent,
                  width: `${progress.total > 0 ? Math.min(100, (progress.completed / progress.total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <p
          className="mt-auto flex items-center gap-1 text-xs font-medium"
          style={{ color: C.accent }}
        >
          View profile
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </p>
      </button>
    </motion.div>
  );
}

export default function ParentChildrenPage({
  branding,
  schoolName,
  schoolSlug,
  familyChildren,
  childProfiles,
  previewBasePath,
}: ParentChildrenPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const applyDashboardHref = previewBasePath ?? `/school/${schoolSlug}/apply`;
  const selectedProfile = selectedApplicationId
    ? childProfiles[selectedApplicationId] ?? null
    : null;

  if (familyChildren.length === 0) {
    return (
      <div className="px-6 py-8">
        <div
          className="rounded-2xl border px-6 py-10 text-center"
          style={{
            borderColor: C.border,
            backgroundColor: C.surface,
            boxShadow: C.shadowCard,
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            We don&apos;t have any student records from your applications yet. Visit
            your{" "}
            <Link
              href={applyDashboardHref}
              className="font-medium underline underline-offset-2"
              style={{ color: C.accent }}
            >
              application dashboard
            </Link>{" "}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {familyChildren.map((child, index) => (
          <ChildCard
            key={child.applicationId}
            child={child}
            C={C}
            index={index}
            onSelect={() => setSelectedApplicationId(child.applicationId)}
          />
        ))}
      </div>

      {selectedApplicationId !== null ? (
        <ChildProfileSidePanel
          open={selectedApplicationId !== null}
          onClose={() => setSelectedApplicationId(null)}
          branding={branding}
          schoolName={schoolName}
          schoolSlug={schoolSlug}
          application={selectedProfile?.application ?? null}
          checklist={selectedProfile?.checklist ?? null}
        />
      ) : null}
    </div>
  );
}
