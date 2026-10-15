import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import FreeToolsHubPage from "@/components/marketing/free-tools/FreeToolsHubPage";
import { FREE_TOOLS_HUB_PATH } from "@/lib/marketing/free-tools";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const DESCRIPTION =
  "Free calculators and checklists for microschool founders: enrollment math, tuition revenue scenarios, and the Microschool Monday Check.";

export const metadata: Metadata = pageMetadata({
  title: "Free tools for microschool founders",
  description: DESCRIPTION,
  path: FREE_TOOLS_HUB_PATH,
  keywords: [
    "microschool tools",
    "microschool calculator",
    "tuition planner",
    "microschool operations",
  ],
  ogImageAlt: "Free tools for microschool founders — MudKitchen",
});

const BREADCRUMBS = buildBreadcrumbs({
  name: "Free tools",
  path: FREE_TOOLS_HUB_PATH,
});

export default function ToolsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <FreeToolsHubPage />
      <Footer />
    </>
  );
}
