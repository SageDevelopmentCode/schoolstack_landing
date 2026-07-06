"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { EnrolledStudent } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentDashboardPlaceholderProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  enrolledStudents: EnrolledStudent[];
};

export default function ParentDashboardPlaceholder({
  branding,
  schoolName,
  schoolSlug,
  enrolledStudents,
}: ParentDashboardPlaceholderProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;

  return (
    <div
      className="min-h-dvh px-4 py-8 sm:px-6 sm:py-10"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/school/${schoolSlug}/apply`}
          className="mb-6 inline-flex items-center gap-2 text-sm underline-offset-2 hover:underline"
          style={{ color: C.textSecondary }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        <SchoolDemoWordmark
          logo={{
            src: branding.logo.src,
            alt: branding.logo.alt || schoolName,
            width: branding.logo.width,
            height: branding.logo.height,
            text: branding.logo.src ? undefined : schoolName,
          }}
          className="mb-8 h-8 w-auto max-w-[200px] object-contain"
        />

        <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
          Parent portal
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          Welcome to {schoolName}. Your full parent portal is coming soon — tuition, messages,
          and student updates will live here.
        </p>

        {enrolledStudents.length > 0 ? (
          <div
            className="mt-8 rounded-lg border px-5 py-5"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <h2 className="text-base font-semibold" style={{ color: C.accentDark }}>
              Enrolled students
            </h2>
            <ul className="mt-4 space-y-3">
              {enrolledStudents.map((student) => (
                <li
                  key={student.enrollmentId}
                  className="rounded-md border px-4 py-3"
                  style={{ borderColor: C.border, backgroundColor: pageBg }}
                >
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                    {student.studentName}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                    {student.programName}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
