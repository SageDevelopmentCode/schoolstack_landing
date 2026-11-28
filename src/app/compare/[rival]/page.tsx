import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import StructuredData from "@/components/seo/StructuredData";
import GardenRoot from "@/components/garden/GardenRoot";
import CompareRivalPage from "@/components/compare-garden/CompareRivalPage";
import { pageMetadata } from "@/lib/metadata";
import { COMPARE_PATH, COMPARE_RIVAL_IDS, compareFaq, comparePath, getRival, rivalComparison } from "@/lib/marketing/compare";
import { FEATURES_CONTENT_UPDATED } from "@/lib/marketing/features/rivals";
import { buildBreadcrumbs, webPageJsonLd } from "@/lib/seo";
import type { RivalId } from "@/lib/marketing/features/types";

type Params = Promise<{ rival: string }>;

function rivalMeta(id: RivalId) {
  const { rival, tally } = rivalComparison(id);
  return {
    title: `MudKitchen vs ${rival.name} for microschools`,
    description: `How MudKitchen compares with ${rival.name} (built for ${rival.builtFor.toLowerCase()}) for running a microschool: ${tally.total} capabilities side by side, every claim sourced.`,
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARE_RIVAL_IDS.map((rival) => ({ rival }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const rival = getRival((await params).rival);
  if (!rival) return {};
  const { title, description } = rivalMeta(rival.id);
  return {
    ...pageMetadata({
      title,
      description,
      path: comparePath(rival.id),
    }),
    title: { absolute: title },
  };
}

export default async function CompareRivalRoute({ params }: { params: Params }) {
  const rival = getRival((await params).rival);
  if (!rival) notFound();
  const breadcrumbs = buildBreadcrumbs(
    { name: "Compare", path: COMPARE_PATH },
    { name: `MudKitchen vs ${rival.name}`, path: comparePath(rival.id) },
  );
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <StructuredData
        data={webPageJsonLd({ name: rivalMeta(rival.id).title, path: comparePath(rival.id), description: rivalMeta(rival.id).description, dateModified: FEATURES_CONTENT_UPDATED })}
      />
      <FaqJsonLd faqs={compareFaq(rivalComparison(rival.id))} />
      <CompareRivalPage key={rival.id} rivalId={rival.id} />
    </GardenRoot>
  );
}
