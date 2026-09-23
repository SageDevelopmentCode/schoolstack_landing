import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { TERMS_OF_USE } from "@/content/legal/terms-of-use";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "Read the terms governing use of MudKitchen's website, mobile app, and school management platform.",
  path: "/terms",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Terms of Use", path: "/terms" });

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <LegalPageShell document={TERMS_OF_USE} />
    </>
  );
}
