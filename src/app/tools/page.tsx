import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FreeToolsGardenPage from "@/components/marketing/free-tools/FreeToolsGardenPage";
import { FREE_TOOLS_HUB_PATH } from "@/lib/marketing/free-tools";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const DESCRIPTION =
  "Three practical tools for microschool founders: enrollment math, tuition planning, and an operations check.";

export const metadata: Metadata = pageMetadata({
  title: "Free tools for your school",
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
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FreeToolsGardenPage />
    </GardenRoot>
  );
}
