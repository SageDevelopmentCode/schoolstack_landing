import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import CustomersBrightPage from "@/components/customers/CustomersBrightPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Customer Stories",
  description:
    "See how real microschools launched and grew using MudKitchen to power their website, enrollment, tuition, and daily operations.",
  path: "/customers",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Customer Stories", path: "/customers" });

export default function CustomersPage() {
  return (
    <HomeShell className="bg-white">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <CustomersBrightPage />
    </HomeShell>
  );
}
