import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import StructuredData from "@/components/seo/StructuredData";
import GardenRoot from "@/components/garden/GardenRoot";
import AboutGardenPage from "@/components/about-garden/AboutGardenPage";
import { pageMetadata } from "@/lib/metadata";
import { aboutPageJsonLd, buildBreadcrumbs } from "@/lib/seo";

const DESCRIPTION =
  "Meet MudKitchen founders Julius Cecilia and Sabrina Obnamia, who built microschool software while opening Sage Field in Round Rock, Texas.";

export const metadata: Metadata = pageMetadata({
  title: "About us: built by microschool founders",
  description: DESCRIPTION,
  path: "/about",
});

const BREADCRUMBS = buildBreadcrumbs({ name: "About", path: "/about" });

export default function AboutRoute() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <StructuredData data={aboutPageJsonLd({ path: "/about", description: DESCRIPTION })} />
      <AboutGardenPage />
    </GardenRoot>
  );
}
