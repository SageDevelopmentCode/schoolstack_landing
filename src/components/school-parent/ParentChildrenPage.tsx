"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, Loader2 } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import type {
  ChildProfileData,
  FamilyChildOverview,
} from "@/lib/admissions/parent-portal-access";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { applicationStatusBadgeStyle } from "@/lib/admissions/application-status-ui";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

const ChildProfileSidePanel = dynamic(
  () => import("@/components/school-parent/ChildProfileSidePanel"),
  { ssr: false },
);

type ParentChildrenPageProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  familyChildren: FamilyChildOverview[];
  /** Optional preloaded profiles (e.g. family preview). Live loads on demand. */
  childProfiles?: Record<string, ChildProfileData>;
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
          <StudentPhoto
            name={child.studentName}
            photoUrl={child.profilePhotoUrl}
            size="xl"
            shape="square"
            theme={C}
            className="transition-transform duration-200 group-hover:scale-105"
          />
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
  organizationId,
  familyChildren,
  childProfiles: initialProfiles,
  previewBasePath,
}: ParentChildrenPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const [children, setChildren] = useState(familyChildren);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, ChildProfileData>>(
    initialProfiles ?? {},
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const applyDashboardHref = previewBasePath ?? `/school/${schoolSlug}/apply`;
  const readOnly = Boolean(previewBasePath);

  const handlePhotoUpdated = useCallback(
    (applicationId: string, profilePhotoUrl: string) => {
      setChildren((prev) =>
        prev.map((child) =>
          child.applicationId === applicationId
            ? { ...child, profilePhotoUrl }
            : child,
        ),
      );
      setProfiles((prev) => {
        const existing = prev[applicationId];
        if (!existing) return prev;
        return {
          ...prev,
          [applicationId]: {
            ...existing,
            application: { ...existing.application, profilePhotoUrl },
          },
        };
      });
    },
    [],
  );

  const loadProfile = useCallback(
    async (applicationId: string) => {
      if (profiles[applicationId]) return;
      setProfileLoading(true);
      setProfileError(null);
      try {
        const [application, checklist] = await Promise.all([
          loadApplicationDetail(supabase, applicationId, organizationId),
          loadEnrollmentChecklistForApplication(
            supabase,
            applicationId,
            organizationId,
          ),
        ]);
        if (!application) {
          setProfileError("Could not load this student profile.");
          return;
        }
        setProfiles((prev) => ({
          ...prev,
          [applicationId]: { application, checklist },
        }));
      } catch (err) {
        setProfileError(
          err instanceof Error ? err.message : "Failed to load student profile.",
        );
      } finally {
        setProfileLoading(false);
      }
    },
    [organizationId, profiles, supabase],
  );

  const selectChild = useCallback(
    (applicationId: string) => {
      setSelectedApplicationId(applicationId);
      void loadProfile(applicationId);
    },
    [loadProfile],
  );

  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current) return;
    const applicationId = searchParams.get("applicationId");
    if (!applicationId) return;
    if (!children.some((child) => child.applicationId === applicationId)) {
      return;
    }
    deepLinkHandled.current = true;
    queueMicrotask(() => {
      selectChild(applicationId);
    });
  }, [children, searchParams, selectChild]);

  const selectedProfile = selectedApplicationId
    ? profiles[selectedApplicationId] ?? null
    : null;

  if (children.length === 0) {
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
        {children.map((child, index) => (
          <ChildCard
            key={child.applicationId}
            child={child}
            C={C}
            index={index}
            onSelect={() => selectChild(child.applicationId)}
          />
        ))}
      </div>

      {selectedApplicationId !== null ? (
        profileLoading && !selectedProfile ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg"
              style={{ backgroundColor: C.surface, color: C.textSecondary }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading profile…
            </div>
          </div>
        ) : (
          <ChildProfileSidePanel
            open={selectedApplicationId !== null}
            onClose={() => {
              setSelectedApplicationId(null);
              setProfileError(null);
            }}
            branding={branding}
            schoolName={schoolName}
            schoolSlug={schoolSlug}
            organizationId={organizationId}
            application={selectedProfile?.application ?? null}
            checklist={selectedProfile?.checklist ?? null}
            readOnly={readOnly}
            onPhotoUpdated={handlePhotoUpdated}
          />
        )
      ) : null}

      {profileError ? (
        <p className="mt-4 text-center text-sm" style={{ color: C.error }}>
          {profileError}
        </p>
      ) : null}
    </div>
  );
}
