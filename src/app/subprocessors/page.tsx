import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import LegalPageShell from "@/components/legal/LegalPageShell";
import { SUBPROCESSORS } from "@/content/legal/subprocessors";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Subprocessors",
  description:
    "View the subprocessors MudKitchen uses to host, operate, and support the platform.",
  path: "/subprocessors",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Subprocessors", path: "/subprocessors" });

export default function SubprocessorsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <LegalPageShell document={SUBPROCESSORS} />
    </>
  );
}
