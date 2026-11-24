"use client";

import HomeGardenShell from "@/components/garden/HomeGardenShell";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenFaq from "@/components/home-garden/GardenFaq";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { getFeature } from "@/lib/marketing/features";
import { FEATURE_PAGE_LABELS as L } from "@/lib/marketing/features/features-copy";
import type { FeatureSlug } from "@/lib/marketing/features/types";
import FeatureCapabilities from "./FeatureCapabilities";
import { FeatureCompare, FeatureEvidence, FeatureHero, FeatureRelated, FeatureUseCases } from "./FeatureSections";

/**
 * One feature's page: hero with real screens → what each role can do (the
 * forest panel) → use cases → cited numbers → comparison → FAQ → related →
 * book a demo. Takes the slug (not the object) so the content, which holds
 * lucide icon components, stays on the client side of the boundary.
 */
export default function FeatureDetailPage({ slug }: { slug: FeatureSlug }) {
  const feature = getFeature(slug);
  if (!feature) return null;
  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HASH_HREF}>
      <FeatureHero feature={feature} />
      <FeatureCapabilities feature={feature} />
      <FeatureUseCases feature={feature} />
      <FeatureEvidence feature={feature} />
      <FeatureCompare feature={feature} />
      {feature.faq.length ? (
        <GardenFaq
          items={feature.faq}
          copy={{ eyebrow: L.faqEyebrow, heading: `${feature.name} questions`, sub: feature.seo.description }}
          idPrefix={`${feature.slug}-faq`}
          className="bg-[var(--sf-lav)]/30"
        />
      ) : null}
      <FeatureRelated feature={feature} />
      <GardenBookDemo />
    </HomeGardenShell>
  );
}
