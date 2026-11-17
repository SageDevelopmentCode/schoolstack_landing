import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import SagefieldGardenPage from "@/components/customers/sagefield-garden/SagefieldGardenPage";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sage Field Case Study",
  description:
    "How Sage Field launched and grew from 0 to 35 students in under 3 months using MudKitchen to power their website, enrollment, tuition, and operations.",
  path: "/customers/sagefield",
  ogImageAlt: "Sage Field Case Study — MudKitchen",
  ogImagePath: "/customers/sagefield/opengraph-image",
});

const BREADCRUMBS = buildBreadcrumbs(
  { name: "Customer Stories", path: "/customers" },
  { name: "Sage Field Case Study", path: "/customers/sagefield" },
);

const ARTICLE_DESCRIPTION =
  "How Sage Field launched and grew from 0 to 35 students in under 3 months using MudKitchen to power their website, enrollment, tuition, and operations.";

export default function SagefieldPage() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <ArticleJsonLd
        headline="Sage Field Case Study"
        description={ARTICLE_DESCRIPTION}
        path="/customers/sagefield"
        image="/images/sagefield/classroom-main.jpg"
      />
      <SagefieldGardenPage />
    </GardenRoot>
  );
}
