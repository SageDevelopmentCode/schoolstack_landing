"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, X } from "lucide-react";
import { Suspense, useCallback, useMemo } from "react";
import AdminPreviewDeviceFrame from "@/components/admin/AdminPreviewDeviceFrame";
import AdminPreviewEmbedRouteReporter from "@/components/admin/AdminPreviewEmbedRouteReporter";
import AdminPreviewViewportToggle from "@/components/admin/AdminPreviewViewportToggle";
import { useAdminPreviewEmbed } from "@/components/admin/useAdminPreviewEmbed";
import { useAdminPreviewViewport } from "@/components/admin/useAdminPreviewViewport";
import NavigationLink from "@/components/school/shared/NavigationLink";
import NavigationLoadingProvider from "@/components/school/shared/NavigationLoadingProvider";
import type { FamilyPreviewGuardianOption } from "@/lib/admissions/family-preview-access";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { familyPreviewBasePath } from "@/lib/admissions/preview-portal-options";

type FamilyPreviewShellProps = {
  schoolSlug: string;
  familyId: string;
  schoolName: string;
  userProfile: FamilyUserProfile;
  guardians: FamilyPreviewGuardianOption[];
  defaultGuardianId: string | null;
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

export default function FamilyPreviewShell(props: FamilyPreviewShellProps) {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <FamilyPreviewShellInner {...props} />
    </Suspense>
  );
}

function guardianDisplayName(guardian: FamilyPreviewGuardianOption): string {
  const name = [guardian.firstName, guardian.lastName].filter(Boolean).join(" ");
  return name || guardian.email || "Guardian";
}

function FamilyPreviewShellInner({
  schoolSlug,
  familyId,
  schoolName,
  userProfile,
  guardians,
  defaultGuardianId,
  hasEnrolledAccess,
  parentPortalEnabled,
  parentPortalHref,
  children,
}: FamilyPreviewShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = useAdminPreviewEmbed();
  const { viewport, setViewport } = useAdminPreviewViewport();
  const basePath = familyPreviewBasePath(schoolSlug, familyId);
  const showParentTab = hasEnrolledAccess && parentPortalEnabled;
  const isParentRoute = pathname.startsWith(`${basePath}/parent`);
  const parentHref = parentPortalHref ?? `${basePath}/parent`;

  const selectedGuardianId =
    searchParams.get("guardianId")?.trim() || defaultGuardianId || guardians[0]?.id || null;

  const previewProfile = useMemo(() => {
    const selected = guardians.find((row) => row.id === selectedGuardianId);
    if (!selected) {
      return userProfile;
    }
    const displayName = guardianDisplayName(selected);
    return {
      email: selected.email ?? userProfile.email,
      displayName,
      profilePhotoUrl: userProfile.profilePhotoUrl,
    };
  }, [guardians, selectedGuardianId, userProfile]);

  const onGuardianChange = useCallback(
    (nextGuardianId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextGuardianId && nextGuardianId !== defaultGuardianId) {
        params.set("guardianId", nextGuardianId);
      } else {
        params.delete("guardianId");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [defaultGuardianId, pathname, router, searchParams],
  );

  const tabs: PreviewTab[] = [
    { id: "apply", label: "Applications", href: basePath },
  ];
  if (showParentTab) {
    tabs.push({ id: "parent", label: "Parent portal", href: parentHref });
  }

  if (isEmbed) {
    return (
      <>
        <AdminPreviewEmbedRouteReporter />
        {children}
      </>
    );
  }

  return (
    <NavigationLoadingProvider>
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
                  Previewing as {previewProfile.displayName}
                  <span className="ml-2 rounded-full bg-violet-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                    Read-only
                  </span>
                </p>
                <p className="mt-0.5 truncate text-xs text-violet-800/80">
                  {previewProfile.email || "No email on file"} · {schoolName}
                </p>
                {guardians.length > 1 ? (
                  <label className="mt-2 flex max-w-md items-center gap-2 text-xs text-violet-900">
                    <span className="shrink-0 font-medium">Guardian</span>
                    <select
                      className="min-w-0 flex-1 rounded-md border border-violet-300 bg-white px-2 py-1 text-xs text-violet-950"
                      value={selectedGuardianId ?? ""}
                      onChange={(event) => onGuardianChange(event.target.value)}
                    >
                      {guardians.map((guardian) => (
                        <option key={guardian.id} value={guardian.id}>
                          {guardianDisplayName(guardian)}
                          {guardian.email ? ` (${guardian.email})` : ""}
                          {!guardian.userId ? " — no login" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <AdminPreviewViewportToggle
                viewport={viewport}
                onViewportChange={setViewport}
              />
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
                  <NavigationLink
                    key={tab.id}
                    href={tab.href}
                    className="rounded-md px-3 py-1.5 text-xs font-medium transition"
                    style={{
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      color: active ? "#5B21B6" : "#6D28D9",
                      boxShadow: active
                        ? "0 1px 2px rgba(91,33,182,0.12)"
                        : "none",
                    }}
                  >
                    {tab.label}
                  </NavigationLink>
                );
              })}
            </div>
          ) : null}
        </div>

        <AdminPreviewDeviceFrame viewport={viewport}>
          <div className="min-h-0 flex-1">{children}</div>
        </AdminPreviewDeviceFrame>
      </div>
    </NavigationLoadingProvider>
  );
}
