import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { DATA_PROCESSING_ADDENDUM } from "@/content/legal/dpa";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Data Processing Addendum",
  description:
    "Read the MudKitchen Data Processing Addendum governing how school customer data is processed on the platform.",
  path: "/dpa",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Data Processing Addendum",
  path: "/dpa",
});

export default function DpaPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <LegalPageShell document={DATA_PROCESSING_ADDENDUM} />
    </>
  );
}
