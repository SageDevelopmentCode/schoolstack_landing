import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import SagefieldGardenPage from "@/components/customers/sagefield-garden/SagefieldGardenPage";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import StructuredData from "@/components/seo/StructuredData";
import { SAGEFIELD_SITE_URL } from "@/components/customers/sagefield-garden/sagefield-copy";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sage Field Case Study",
  description:
    "How Sage Field launched and grew from 0 to 35 students in under 3 months using MudKitchen to power their website, enrollment, tuition, and operations.",
  path: "/customers/sagefield",
});

const BREADCRUMBS = buildBreadcrumbs(
  { name: "Customer Stories", path: "/customers" },
  { name: "Sage Field Case Study", path: "/customers/sagefield" },
);

const ARTICLE_DESCRIPTION =
  "How Sage Field launched and grew from 0 to 35 students in under 3 months using MudKitchen to power their website, enrollment, tuition, and operations.";

/** The school in the story, as its own entity, linked to MudKitchen as the software it runs on. */
const SAGEFIELD_SCHOOL = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Sage Field",
  url: SAGEFIELD_SITE_URL,
  description: "An outdoor-focused private microschool for children ages 4 to 11 in Round Rock, Texas.",
  address: { "@type": "PostalAddress", addressLocality: "Round Rock", addressRegion: "TX", addressCountry: "US" },
  subjectOf: { "@type": "Article", url: `${SITE_URL}/customers/sagefield` },
};

export default function SagefieldPage() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <StructuredData data={SAGEFIELD_SCHOOL} />
      <ArticleJsonLd
        headline="Sage Field Case Study"
        description={ARTICLE_DESCRIPTION}
        path="/customers/sagefield"
        image="/images/sagefield/classroom-main.jpg"
        datePublished="2026-05-14"
        dateModified="2026-11-22"
      />
      <SagefieldGardenPage />
    </GardenRoot>
  );
}
