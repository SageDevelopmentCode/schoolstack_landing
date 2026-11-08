import type { Metadata } from "next";
import Image from "next/image";
import HomeShell from "@/components/home/HomeShell";
import HomeBookDemoSection from "@/components/sections/HomeBookDemoSection";
import SagefieldHero from "@/components/sections/customers/sagefield/SagefieldHero";
import SagefieldChallenge from "@/components/sections/customers/sagefield/SagefieldChallenge";
import SagefieldTimeline from "@/components/sections/customers/sagefield/SagefieldTimeline";
import SagefieldLiveWebsite from "@/components/sections/customers/sagefield/SagefieldLiveWebsite";
import SagefieldOutcomes from "@/components/sections/customers/sagefield/SagefieldOutcomes";
import SagefieldBeforeAfter from "@/components/sections/customers/sagefield/SagefieldBeforeAfter";
import SagefieldWhyItWorked from "@/components/sections/customers/sagefield/SagefieldWhyItWorked";
import SagefieldBuyerRelevance from "@/components/sections/customers/sagefield/SagefieldBuyerRelevance";
import SagefieldStickyRail from "@/components/sections/customers/sagefield/SagefieldStickyRail";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

const GALLERY = [
  { src: "/images/sagefield/classroom-main.jpg", alt: "Sage Field main classroom" },
  { src: "/images/sagefield/classroom-primary.jpg", alt: "Sage Field primary classroom" },
  { src: "/images/sagefield/garden.jpg", alt: "Sage Field outdoor garden" },
  { src: "/images/sagefield/mud-kitchen.jpg", alt: "Sage Field mud kitchen" },
];

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
    <HomeShell className="bg-white">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <ArticleJsonLd
        headline="Sage Field Case Study"
        description={ARTICLE_DESCRIPTION}
        path="/customers/sagefield"
        image="/images/sagefield/classroom-main.jpg"
      />
      <SagefieldHero />
      <SagefieldChallenge />
      <SagefieldTimeline />
      <SagefieldLiveWebsite />
      <SagefieldOutcomes />
      <SagefieldBeforeAfter />
      <SagefieldWhyItWorked />

      <section className="bg-white px-3 pb-16 lg:px-6">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
          <p className="mb-5 font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
            Campus photos
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {GALLERY.map(({ src, alt }) => (
              <div key={src} className="h-[180px] overflow-hidden rounded-[24px] lg:h-[220px]">
                <Image
                  src={src}
                  alt={alt}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <Image
                src="/images/SageFieldLogo.png"
                alt="Sage Field logo"
                width={20}
                height={20}
                className="h-full w-full object-contain"
              />
            </div>
            <a
              href="https://www.sagefield.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-secondary text-[12px] text-clay underline underline-offset-2 transition-colors hover:underline"
            >
              sagefield.co
            </a>
            <span className="font-secondary text-[12px] text-[#1d1a16]/50">· Round Rock, TX</span>
          </div>
        </div>
      </section>

      <SagefieldBuyerRelevance />
      <HomeBookDemoSection />
      <SagefieldStickyRail />
    </HomeShell>
  );
}
