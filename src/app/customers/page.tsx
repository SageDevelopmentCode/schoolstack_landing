import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import CustomersGardenPage from "@/components/customers/CustomersGardenPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Microschool customer stories",
  description:
    "See how real microschools launched and grew using MudKitchen to power their website, enrollment, tuition, and daily operations.",
  path: "/customers",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Customer Stories", path: "/customers" });

export default function CustomersPage() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <CustomersGardenPage />
    </GardenRoot>
  );
}
