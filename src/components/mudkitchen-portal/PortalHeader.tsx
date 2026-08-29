"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import PortalBrandingLogos from "@/components/mudkitchen-portal/PortalBrandingLogos";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";
import {
  getDueInvoiceActionLabel,
  getDueInvoiceBillingAriaLabel,
} from "@/lib/mudkitchen-portal/customer-invoices";

const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    href: (slug: string) => schoolMudKitchenPortalPath(slug),
  },
  {
    key: "build-log",
    label: "Build log",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "build-log"),
  },
  {
    key: "billing",
    label: "Billing",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "billing"),
  },
] as const;

function getActiveSection(pathname: string, slug: string): string {
  const base = schoolMudKitchenPortalPath(slug);
  if (pathname === base) return "overview";
  if (pathname.startsWith(`${base}/build-log`)) return "build-log";
  if (pathname.startsWith(`${base}/billing`)) return "billing";
  return "overview";
}

type PortalHeaderProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  dueInvoiceCount?: number;
};

function PortalNavLinks({
  slug,
  dueInvoiceCount = 0,
}: {
  slug: string;
  dueInvoiceCount?: number;
}) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname, slug);
  const T = usePortalTheme();

  return (
    <nav
      className="flex max-w-full items-center gap-1 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
      aria-label="MudKitchen portal"
    >
      {NAV_ITEMS.map((item) => {
        const active = activeSection === item.key;
        const showDueBadge = item.key === "billing" && dueInvoiceCount > 0;
        const dueBadgeLabel = getDueInvoiceActionLabel(dueInvoiceCount);
        const ariaLabel =
          item.key === "billing"
            ? getDueInvoiceBillingAriaLabel(dueInvoiceCount)
            : item.label;

        return (
          <Link
            key={item.key}
            href={item.href(slug)}
            className="font-secondary inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: active ? T.stepBg : "transparent",
              border: active
                ? `1px solid ${T.secondaryBtnBorder}`
                : "1px solid transparent",
              color: active ? T.accentDark : T.textSecondary,
              textDecoration: "none",
            }}
            aria-label={ariaLabel}
            onMouseEnter={(event) => {
              if (!active) {
                event.currentTarget.style.backgroundColor = `${T.stepBg}`;
              }
            }}
            onMouseLeave={(event) => {
              if (!active) {
                event.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span>{item.label}</span>
            {showDueBadge ? (
              <span
                className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
                style={{
                  color: T.clay,
                  backgroundColor: T.clayBg,
                  border: `1px solid ${T.clayBorder}`,
                }}
              >
                {dueBadgeLabel}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PortalHeader({
  slug,
  schoolName,
  branding,
  dueInvoiceCount = 0,
}: PortalHeaderProps) {
  const T = usePortalTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: T.headerBackdrop,
        borderColor: T.border,
      }}
    >
      <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-3 lg:gap-4 lg:px-16">
        <div className="min-w-0 justify-self-start">
          <PortalBrandingLogos
            schoolName={schoolName}
            branding={branding}
            theme={T}
            align="start"
            compact
          />
        </div>

        <div className="justify-self-center">
          <PortalNavLinks slug={slug} dueInvoiceCount={dueInvoiceCount} />
        </div>

        <div className="justify-self-end">
          <Link
            href={`/school/${slug}/admin`}
            className="font-secondary inline-flex shrink-0 items-center rounded-full px-3 py-2 text-[13px] font-medium transition-colors hover:opacity-80"
            style={{
              color: T.textSecondary,
              textDecoration: "none",
              border: `1px solid transparent`,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = T.stepBg;
              event.currentTarget.style.borderColor = T.secondaryBtnBorder;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "transparent";
              event.currentTarget.style.borderColor = "transparent";
            }}
          >
            ← School admin
          </Link>
        </div>
      </div>
    </header>
  );
}
