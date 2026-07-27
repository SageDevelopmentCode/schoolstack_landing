import Link from "next/link";
import { ArrowRight, ClipboardList, Hammer, Receipt } from "lucide-react";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";
import {
  OrganizationProgressLogPreview,
} from "@/components/mudkitchen-portal/OrganizationProgressLogList";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

type MudKitchenPortalOverviewProps = {
  slug: string;
  schoolName: string;
  latestProgressEntry: OrganizationProgressEntry | null;
};

const SECTION_CARDS = [
  {
    key: "build-log",
    title: "Build log",
    description:
      "See what the MudKitchen team has shipped for your school — daily progress updates as we build your setup.",
    icon: Hammer,
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "build-log"),
  },
  {
    key: "requests",
    title: "Requests",
    description:
      "View your support history and send new requests to the MudKitchen team.",
    icon: ClipboardList,
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "requests"),
  },
  {
    key: "billing",
    title: "Billing",
    description:
      "MudKitchen subscription and invoicing — coming soon.",
    icon: Receipt,
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "billing"),
  },
] as const;

export default function MudKitchenPortalOverview({
  slug,
  schoolName,
  latestProgressEntry,
}: MudKitchenPortalOverviewProps) {
  const T = MUDKITCHEN_PORTAL_THEME;

  return (
    <div className="space-y-10">
      <div>
        <p
          className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: T.textSecondary }}
        >
          Your MudKitchen account
        </p>
        <h1
          className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight"
          style={{ color: T.textPrimary }}
        >
          Welcome, {schoolName}
        </h1>
        <p
          className="font-secondary mt-3 max-w-[640px] text-[15px] leading-relaxed"
          style={{ color: T.textSecondary }}
        >
          Everything related to your MudKitchen partnership lives here — build
          progress, support requests, and billing (soon).
        </p>
      </div>

      {latestProgressEntry ? (
        <OrganizationProgressLogPreview
          entry={latestProgressEntry}
          schoolName={schoolName}
          viewAllHref={schoolMudKitchenPortalPath(slug, "build-log")}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href(slug)}
              className="group flex flex-col rounded-2xl border p-6 transition-shadow"
              style={{
                backgroundColor: T.surface,
                borderColor: T.border,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: T.accentSoft,
                  color: T.accent,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2
                className="font-heading text-lg font-medium"
                style={{ color: T.textPrimary }}
              >
                {card.title}
              </h2>
              <p
                className="font-secondary mt-2 flex-1 text-sm leading-relaxed"
                style={{ color: T.textSecondary }}
              >
                {card.description}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: T.accent }}
              >
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
