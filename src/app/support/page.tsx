import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import GardenRoot from "@/components/garden/GardenRoot";
import SupportGardenPage from "@/components/support/SupportGardenPage";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "Contact the MudKitchen team for product help, billing questions, or general support.",
  path: "/support",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Support", path: "/support" });

export default function SupportPage() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <SupportGardenPage />
    </GardenRoot>
  );
}
