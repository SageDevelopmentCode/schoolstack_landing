"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";
import MudKitchenDualBranding from "@/components/mudkitchen-portal/MudKitchenDualBranding";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", href: (slug: string) => schoolMudKitchenPortalPath(slug) },
  {
    key: "build-log",
    label: "Build log",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "build-log"),
  },
  {
    key: "requests",
    label: "Requests",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "requests"),
  },
  {
    key: "billing",
    label: "Billing",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "billing"),
  },
] as const;

type MudKitchenPortalShellProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  children: ReactNode;
};

function getActiveSection(pathname: string, slug: string): string {
  const base = schoolMudKitchenPortalPath(slug);
  if (pathname === base) return "overview";
  if (pathname.startsWith(`${base}/build-log`)) return "build-log";
  if (pathname.startsWith(`${base}/requests`)) return "requests";
  if (pathname.startsWith(`${base}/billing`)) return "billing";
  return "overview";
}

export default function MudKitchenPortalShell({
  slug,
  schoolName,
  branding,
  children,
}: MudKitchenPortalShellProps) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname, slug);
  const T = MUDKITCHEN_PORTAL_THEME;

  return (
    <div
      className="min-h-screen font-body"
      style={{ backgroundColor: T.pageBg, color: T.textPrimary }}
    >
      <MudKitchenDualBranding schoolName={schoolName} branding={branding} />

      <div
        className="border-b"
        style={{
          borderColor: T.border,
          backgroundColor: T.surface,
        }}
      >
        <nav
          className="mx-auto flex max-w-[1100px] gap-1 overflow-x-auto px-6 py-2 lg:px-16"
          aria-label="MudKitchen portal"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.key;
            return (
              <Link
                key={item.key}
                href={item.href(slug)}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? T.accentSoft : "transparent",
                  color: active ? T.accent : T.textSecondary,
                  border: active
                    ? `1px solid ${T.border}`
                    : "1px solid transparent",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-[1100px] px-6 py-8 lg:px-16 lg:py-10">
        {children}
      </main>

      <footer
        className="border-t px-6 py-6 text-center lg:px-16"
        style={{ borderColor: T.border }}
      >
        <Link
          href={`/school/${slug}/admin`}
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: T.textSecondary }}
        >
          Back to school admin
        </Link>
      </footer>
    </div>
  );
}
