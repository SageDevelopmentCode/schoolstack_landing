import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import PortalPageHero from "@/components/mudkitchen-portal/ui/PortalPageHero";
import PortalSectionLink from "@/components/mudkitchen-portal/ui/PortalSectionLink";
import PortalSectionHeader from "@/components/mudkitchen-portal/ui/PortalSectionHeader";
import ProgressLogEntryCard from "@/components/mudkitchen-portal/ProgressLogEntryCard";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

type MudKitchenPortalOverviewProps = {
  slug: string;
  schoolName: string;
  latestProgressEntry: OrganizationProgressEntry | null;
};

const SECTION_LINKS = [
  {
    key: "build-log",
    title: "Build log",
    description:
      "Daily progress updates as we build your school's MudKitchen setup.",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "build-log"),
  },
  {
    key: "requests",
    title: "Requests",
    description:
      "Your support history and a place to reach the MudKitchen team.",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "requests"),
  },
  {
    key: "billing",
    title: "Billing",
    description: "Subscription and invoicing for your MudKitchen account.",
    href: (slug: string) => schoolMudKitchenPortalPath(slug, "billing"),
  },
] as const;

export default function MudKitchenPortalOverview({
  slug,
  schoolName,
  latestProgressEntry,
}: MudKitchenPortalOverviewProps) {
  return (
    <>
      <PortalPageHero
        eyebrow="Your MudKitchen account"
        title={`Everything we're building for ${schoolName}.`}
        subtitle="Build progress, support, and billing for your partnership with MudKitchen — all in one place."
      />

      {latestProgressEntry ? (
        <section className="px-6 pb-10 lg:px-16">
          <div className="mx-auto max-w-[1100px]">
            <PortalSectionHeader
              eyebrow="Latest update"
              title={latestProgressEntry.title}
            />
            <ProgressLogEntryCard
              entry={latestProgressEntry}
              showConnector={false}
            />
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-[1100px] space-y-3">
          {SECTION_LINKS.map((link, index) => (
            <PortalSectionLink
              key={link.key}
              href={link.href(slug)}
              title={link.title}
              description={link.description}
              delay={0.08 + index * 0.06}
            />
          ))}
        </div>
      </section>
    </>
  );
}
