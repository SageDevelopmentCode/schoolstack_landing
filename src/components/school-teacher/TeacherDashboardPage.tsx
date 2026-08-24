"use client";

import Link from "next/link";
import { useMemo } from "react";
import CopyableUrlRow from "@/components/ui/CopyableUrlRow";
import {
  buildTeacherNavItems,
  type TeacherNavItem,
} from "@/lib/organization-settings/teacher-nav";
import { schoolTeacherLoginPath } from "@/lib/organization-settings/teacher-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding, OrganizationFeatures } from "@/lib/organization-settings/types";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type { StaffPortalRole } from "@/lib/staff/staff-members";
import { SITE_URL } from "@/lib/site";

type TeacherDashboardPageProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  roleTitle: string | null;
  portalRole: StaffPortalRole | null;
  previewMode?: boolean;
  teacherBasePath?: string;
};

function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === "teacher") return "Teacher";
  if (role === "staff") return "Staff";
  return "Staff member";
}

function QuickLinkCard({
  item,
  C,
}: {
  item: TeacherNavItem;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md"
        style={{ backgroundColor: C.accentLight, color: C.accent }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {item.name}
        </p>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Coming soon
        </p>
      </div>
    </Link>
  );
}

export default function TeacherDashboardPage({
  slug,
  schoolName,
  branding,
  features,
  userProfile,
  roleTitle,
  portalRole,
  previewMode = false,
  teacherBasePath,
}: TeacherDashboardPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const loginUrl = `${SITE_URL}${schoolTeacherLoginPath(slug)}`;

  const quickLinks = useMemo(
    () =>
      buildTeacherNavItems(
        slug,
        features.teacher,
        features.feature_nav?.teacher,
        teacherBasePath,
      ).filter((item) => item.key !== "dashboard"),
    [slug, features.teacher, features.feature_nav?.teacher, teacherBasePath],
  );

  const firstName = userProfile.displayName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-sm" style={{ color: C.textTertiary }}>
          {schoolName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold" style={{ color: C.textPrimary }}>
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          {roleTitle || "Staff"} · {portalRoleLabel(portalRole)}
        </p>
      </div>

      <section
        className="mb-8 rounded-lg border p-5"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Your staff portal
        </h2>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          {previewMode
            ? `Previewing ${schoolName}'s staff portal as ${userProfile.displayName}.`
            : `You're signed in to ${schoolName}'s staff portal. More classroom tools are on the way — for now, bookmark this page for quick access.`}
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt style={{ color: C.textTertiary }}>Sign-in email</dt>
            <dd style={{ color: C.textPrimary }}>{userProfile.email || "—"}</dd>
          </div>
          <div>
            <dt style={{ color: C.textTertiary }}>Staff sign-in link</dt>
            <dd>
              <CopyableUrlRow url={loginUrl} C={C} />
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs" style={{ color: C.textTertiary }}>
          Need access changes? Contact your school administrator.
        </p>
      </section>

      {quickLinks.length > 0 ? (
        <section>
          <h2
            className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: C.textTertiary }}
          >
            Coming soon
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <QuickLinkCard key={item.key} item={item} C={C} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
