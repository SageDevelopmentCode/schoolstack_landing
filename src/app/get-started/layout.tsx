import type { Metadata } from "next";
import MarketingFontVariables from "@/components/MarketingFontVariables";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book a Demo",
  description:
    "Schedule a personalized demo of MudKitchen — the all-in-one platform for microschool enrollment, billing, parent communication, and school operations.",
  path: "/get-started",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Book a Demo", path: "/get-started" });

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingFontVariables>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      {children}
    </MarketingFontVariables>
  );
}
