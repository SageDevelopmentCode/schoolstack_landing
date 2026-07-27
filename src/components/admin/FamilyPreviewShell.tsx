"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, X } from "lucide-react";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";

type FamilyPreviewShellProps = {
  schoolSlug: string;
  familyId: string;
  schoolName: string;
  userProfile: FamilyUserProfile;
  hasEnrolledAccess: boolean;
  parentPortalEnabled: boolean;
  parentPortalHref?: string | null;
  children: React.ReactNode;
};

type PreviewTab = {
  id: "apply" | "parent";
  label: string;
  href: string;
};

export default function FamilyPreviewShell({
  schoolSlug,
  familyId,
  schoolName,
  userProfile,
  hasEnrolledAccess,
  parentPortalEnabled,
  parentPortalHref,
  children,
}: FamilyPreviewShellProps) {
  const pathname = usePathname();
  const basePath = familyPreviewBasePath(schoolSlug, familyId);
  const showParentTab = hasEnrolledAccess && parentPortalEnabled;
  const isParentRoute = pathname.startsWith(`${basePath}/parent`);
  const parentHref = parentPortalHref ?? `${basePath}/parent`;

  const tabs: PreviewTab[] = [
    { id: "apply", label: "Applications", href: basePath },
  ];
  if (showParentTab) {
    tabs.push({ id: "parent", label: "Parent portal", href: parentHref });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <div
        className="shrink-0 border-b px-4 py-3 sm:px-6"
        style={{
          backgroundColor: "#F5F0FF",
          borderColor: "#DDD6FE",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-violet-900">
                Previewing as {userProfile.displayName}
                <span className="ml-2 rounded-full bg-violet-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                  Read-only
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-violet-800/80">
                {userProfile.email || "No email on file"} · {schoolName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/organizations"
              className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-900 transition hover:bg-violet-50"
            >
              <X className="h-3 w-3" />
              Back to organizations
            </Link>
          </div>
        </div>

        {tabs.length > 1 ? (
          <div className="mx-auto mt-3 flex max-w-6xl gap-1">
            {tabs.map((tab) => {
              const active =
                tab.id === "parent" ? isParentRoute : !isParentRoute;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    backgroundColor: active ? "#FFFFFF" : "transparent",
                    color: active ? "#5B21B6" : "#6D28D9",
                    boxShadow: active ? "0 1px 2px rgba(91,33,182,0.12)" : "none",
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
