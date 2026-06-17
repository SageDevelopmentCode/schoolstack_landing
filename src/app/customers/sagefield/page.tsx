import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
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
  { src: '/images/sagefield/classroom-main.jpg', alt: 'Sage Field main classroom' },
  { src: '/images/sagefield/classroom-primary.jpg', alt: 'Sage Field primary classroom' },
  { src: '/images/sagefield/garden.jpg', alt: 'Sage Field outdoor garden' },
  { src: '/images/sagefield/mud-kitchen.jpg', alt: 'Sage Field mud kitchen' },
]

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
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <ArticleJsonLd
        headline="Sage Field Case Study"
        description={ARTICLE_DESCRIPTION}
        path="/customers/sagefield"
        image="/images/sagefield/classroom-main.jpg"
      />
      <Navbar />
      <main>
        <SagefieldHero />
        <SagefieldChallenge />
        <SagefieldTimeline />
        <SagefieldLiveWebsite />
        <SagefieldOutcomes />
        <SagefieldBeforeAfter />
        <SagefieldWhyItWorked />

        {/* Campus photo gallery */}
        <section className="bg-bg pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <p className="text-[11px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-5">
              Campus photos
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {GALLERY.map(({ src, alt }) => (
                <div key={src} className="rounded-xl overflow-hidden h-[180px] lg:h-[220px]">
                  <Image
                    src={src}
                    alt={alt}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                <Image
                  src="/images/SageFieldLogo.png"
                  alt="Sage Field logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
              <a
                href="https://www.sagefield.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-secondary text-accent hover:text-accent-hover transition-colors duration-150 underline underline-offset-2"
              >
                sagefield.co
              </a>
              <span className="text-[12px] font-secondary text-text-faint">· Round Rock, TX</span>
            </div>
          </div>
        </section>

        <SagefieldBuyerRelevance />
      </main>
      <Footer />
      <SagefieldStickyRail />
    </>
  )
}
