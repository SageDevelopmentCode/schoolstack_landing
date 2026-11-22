"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Hammer, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";
import {
  getDueInvoiceActionLabel,
  type OrganizationCustomerInvoice,
} from "@/lib/mudkitchen-portal/customer-invoices";
import PortalGardenHeader from "@/components/mudkitchen-portal/garden/PortalGardenHeader";
import PortalReveal from "@/components/mudkitchen-portal/garden/PortalReveal";
import ProgressEntryCard from "@/components/mudkitchen-portal/garden/ProgressEntryCard";
import { btnSmPop, portalFocusRing, textLink } from "@/components/mudkitchen-portal/garden/buttons";
import { OVERVIEW_COPY as COPY } from "@/components/mudkitchen-portal/garden/portal-copy";

type MudKitchenPortalOverviewProps = {
  slug: string;
  schoolName: string;
  latestProgressEntry: OrganizationProgressEntry | null;
  dueInvoices: OrganizationCustomerInvoice[];
};

/** Literal tint classes per card state (no dynamic Tailwind). */
const CARD_TINT = {
  mint: "bg-[var(--sf-mint)]/60",
  peach: "bg-[var(--sf-peach)]/55",
  butter: "bg-[var(--sf-butter)]/55",
} as const;

function SectionCard({
  href,
  title,
  description,
  icon: Icon,
  tint,
  badgeLabel,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tint: keyof typeof CARD_TINT;
  badgeLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-[26px] border-2 border-[var(--sf-ink)] p-6 shadow-[0_4px_0_0_var(--sf-ink)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:shadow-[0_8px_0_0_var(--sf-ink)] focus-visible:-translate-y-1 focus-visible:shadow-[0_8px_0_0_var(--sf-ink)] sm:p-7 ${CARD_TINT[tint]} ${portalFocusRing} focus-visible:ring-[var(--sf-clay)]/30`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]">
          <Icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white text-[var(--sf-ink)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <h3 className="sf-display text-[1.75rem] leading-none text-[var(--sf-ink)]">{title}</h3>
        {badgeLabel ? (
          <span className="inline-flex items-center rounded-full border border-[var(--sf-ink)]/15 bg-[var(--sf-butter)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--sf-clay-deep)]">
            {badgeLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--sf-ink)]/80">{description}</p>
    </Link>
  );
}

export default function MudKitchenPortalOverview({
  slug,
  schoolName,
  latestProgressEntry,
  dueInvoices,
}: MudKitchenPortalOverviewProps) {
  const hasDue = dueInvoices.length > 0;
  const billingHref = schoolMudKitchenPortalPath(slug, "billing");
  const buildLogHref = schoolMudKitchenPortalPath(slug, "build-log");

  const billingDescription =
    dueInvoices.length === 1
      ? COPY.billing.oneDue(dueInvoices[0].billing_period_label)
      : dueInvoices.length > 1
        ? COPY.billing.manyDue(dueInvoices.length)
        : COPY.billing.description;

  return (
    <>
      <PortalGardenHeader
        pill={COPY.pill}
        tint="forest"
        title={COPY.titleLead}
        accent={`${schoolName}.`}
        subtitle={<p>{COPY.subtitle}</p>}
        hand={COPY.hand}
        actions={
          hasDue ? (
            <Link href={billingHref} className={btnSmPop}>
              {COPY.goToBilling}
              <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
            </Link>
          ) : null
        }
      />

      <div className="mx-auto max-w-[1100px] space-y-14 px-6 pb-20 pt-12 sm:px-10 lg:pb-28 lg:pt-14">
        <section aria-labelledby="mk-overview-sections">
          <h2 id="mk-overview-sections" className="sr-only">
            {COPY.buildLog.title} &amp; {COPY.billing.title}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <PortalReveal delay={0.05}>
              <SectionCard
                href={buildLogHref}
                title={COPY.buildLog.title}
                description={COPY.buildLog.description}
                icon={Hammer}
                tint="mint"
              />
            </PortalReveal>
            <PortalReveal delay={0.1}>
              <SectionCard
                href={billingHref}
                title={COPY.billing.title}
                description={billingDescription}
                icon={Receipt}
                tint={hasDue ? "butter" : "peach"}
                badgeLabel={hasDue ? getDueInvoiceActionLabel(dueInvoices.length) : undefined}
              />
            </PortalReveal>
          </div>
        </section>

        {latestProgressEntry ? (
          <PortalReveal as="section" delay={0.15} className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="sf-display text-4xl leading-none text-[var(--sf-ink)] md:text-5xl">
                {COPY.latestUpdate}
              </h2>
              <Link href={buildLogHref} className={`${textLink} text-[15px]`}>
                {COPY.seeFullLog}
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              </Link>
            </div>
            <ProgressEntryCard entry={latestProgressEntry} headingAs="h3" />
          </PortalReveal>
        ) : null}
      </div>
    </>
  );
}
