"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import { MUDKITCHEN_LOGO } from "@/components/home-garden/assets";
import {
  getDueInvoiceActionLabel,
  getDueInvoiceBillingAriaLabel,
} from "@/lib/mudkitchen-portal/customer-invoices";
import { portalFocusRing } from "@/components/mudkitchen-portal/garden/buttons";
import { PORTAL_NAV_COPY as COPY } from "@/components/mudkitchen-portal/garden/portal-copy";

export type MudKitchenPortalSection = "overview" | "build-log" | "billing";

const NAV_ITEMS: ReadonlyArray<{
  key: MudKitchenPortalSection;
  label: string;
  href: (slug: string) => string;
}> = [
  { key: "overview", label: COPY.overview, href: (slug) => schoolMudKitchenPortalPath(slug) },
  { key: "build-log", label: COPY.buildLog, href: (slug) => schoolMudKitchenPortalPath(slug, "build-log") },
  { key: "billing", label: COPY.billing, href: (slug) => schoolMudKitchenPortalPath(slug, "billing") },
];

function getActiveSection(pathname: string, slug: string): MudKitchenPortalSection {
  const base = schoolMudKitchenPortalPath(slug);
  if (pathname.startsWith(`${base}/build-log`)) return "build-log";
  if (pathname.startsWith(`${base}/billing`)) return "billing";
  return "overview";
}

function PortalNav({
  slug,
  dueInvoiceCount,
  activeSection,
}: {
  slug: string;
  dueInvoiceCount: number;
  activeSection: MudKitchenPortalSection;
}) {
  const reduce = useReducedMotion();

  return (
    <nav aria-label={COPY.ariaLabel} className="max-w-full">
      <ul
        className="flex items-center gap-1 overflow-x-auto rounded-full border-2 border-[var(--sf-ink)]/10 bg-[var(--sf-cream)] p-1 [scrollbar-width:none]"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.key;
          const showDue = item.key === "billing" && dueInvoiceCount > 0;

          return (
            <li key={item.key} className="relative shrink-0">
              {active ? (
                <motion.span
                  layoutId="mk-portal-nav-pill"
                  className="absolute inset-0 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_3px_0_0_var(--sf-ink)]"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
              <Link
                href={item.href(slug)}
                aria-current={active ? "page" : undefined}
                aria-label={item.key === "billing" ? getDueInvoiceBillingAriaLabel(dueInvoiceCount) : undefined}
                className={`relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-extrabold transition-colors ${
                  active
                    ? "text-[var(--sf-ink)]"
                    : "text-[var(--sf-soft)] hover:bg-white/70 hover:text-[var(--sf-ink)]"
                } ${portalFocusRing} focus-visible:ring-[var(--sf-clay)]/30`}
              >
                <span>{item.label}</span>
                {showDue ? (
                  <span className="inline-flex items-center rounded-full border border-[var(--sf-ink)]/15 bg-[var(--sf-butter)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--sf-clay-deep)]">
                    {getDueInvoiceActionLabel(dueInvoiceCount)}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function BrandLockup({
  schoolName,
  branding,
}: {
  schoolName: string;
  branding: OrganizationBranding;
}) {
  const logoSrc = branding.logo.src.trim();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex shrink-0 items-center gap-2">
        <Image src={MUDKITCHEN_LOGO} alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" />
        <span className="text-[17px] font-extrabold tracking-tight text-[var(--sf-ink)]">MudKitchen</span>
      </span>
      <span className="h-7 w-[2px] shrink-0 rounded-full bg-[var(--sf-ink)]/15" aria-hidden="true" />
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={branding.logo.alt || schoolName}
          width={branding.logo.width ?? 200}
          height={branding.logo.height ?? 40}
          className="h-8 w-auto min-w-0 max-w-[110px] object-contain sm:max-w-[150px]"
        />
      ) : (
        <span className="truncate text-[15px] font-extrabold text-[var(--sf-soft)]">
          {branding.logo.alt.trim() || schoolName}
        </span>
      )}
    </div>
  );
}

export default function PortalHeader({
  slug,
  schoolName,
  branding,
  dueInvoiceCount = 0,
  activeSection,
}: {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  dueInvoiceCount?: number;
  /** Overrides the pathname-derived section (used by previews). */
  activeSection?: MudKitchenPortalSection;
}) {
  const pathname = usePathname();
  const section = activeSection ?? getActiveSection(pathname ?? "", slug);

  const backLink = (
    <Link
      href={`/school/${slug}/admin`}
      className={`inline-flex shrink-0 items-center rounded-full border-2 border-[var(--sf-ink)]/15 bg-white px-3.5 py-1.5 text-[13px] font-extrabold text-[var(--sf-soft)] transition-colors hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)] ${portalFocusRing} focus-visible:ring-[var(--sf-ink)]/20`}
    >
      {COPY.backToAdmin}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1100px] px-4 py-3 sm:px-10">
        {/* One nav: its own centred row below lg, the middle column from lg up. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-4">
          <div className="col-start-1 row-start-1 min-w-0">
            <BrandLockup schoolName={schoolName} branding={branding} />
          </div>
          <div className="col-start-2 row-start-1 justify-self-end lg:col-start-3">{backLink}</div>
          <div className="col-span-2 row-start-2 min-w-0 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <PortalNav slug={slug} dueInvoiceCount={dueInvoiceCount} activeSection={section} />
          </div>
        </div>
      </div>
    </header>
  );
}
