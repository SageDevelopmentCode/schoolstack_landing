import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { PRIVACY_POLICY } from "@/content/legal/privacy-policy";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how MudKitchen collects, uses, and protects information across our website, mobile app, and school portals.",
  path: "/privacy",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Privacy Policy", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <LegalPageShell document={PRIVACY_POLICY} />
    </>
  );
}
