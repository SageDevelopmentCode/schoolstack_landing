import type { Metadata } from "next";
import dynamic from "next/dynamic";
import MarketingFontVariables from "@/components/MarketingFontVariables";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import SectionFallback from "@/components/ui/SectionFallback";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import JsonLd from "@/components/seo/JsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import HomeFaqSection from "@/components/seo/HomeFaqSection";
import { pageMetadata } from "@/lib/metadata";
import { HOME_FAQ } from "@/lib/faq";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: HOME_TITLE,
  },
};


const ProductPreviewSection = dynamic(
  () => import("@/components/sections/ProductPreviewSection"),
  { loading: () => <SectionFallback minHeight="32rem" /> },
);
const PainSection = dynamic(
  () => import("@/components/sections/PainSection"),
  { loading: () => <SectionFallback minHeight="28rem" /> },
);
const FamilyClaritySection = dynamic(
  () => import("@/components/sections/FamilyClaritySection"),
  { loading: () => <SectionFallback minHeight="24rem" /> },
);
const AdminGrowthSection = dynamic(
  () => import("@/components/sections/AdminGrowthSection"),
  { loading: () => <SectionFallback minHeight="24rem" /> },
);
const TeacherSupportSection = dynamic(
  () => import("@/components/sections/TeacherSupportSection"),
  { loading: () => <SectionFallback minHeight="24rem" /> },
);
const WorkflowSection = dynamic(
  () => import("@/components/sections/WorkflowSection"),
  { loading: () => <SectionFallback minHeight="32rem" /> },
);
const StacksSection = dynamic(
  () => import("@/components/sections/StacksSection"),
  { loading: () => <SectionFallback minHeight="20rem" /> },
);
const FounderStorySection = dynamic(
  () => import("@/components/sections/FounderStorySection"),
  { loading: () => <SectionFallback minHeight="28rem" /> },
);
const CustomSection = dynamic(
  () => import("@/components/sections/CustomSection"),
  { loading: () => <SectionFallback minHeight="20rem" /> },
);
const FinalCTASection = dynamic(
  () => import("@/components/sections/FinalCTASection"),
  { loading: () => <SectionFallback minHeight="16rem" /> },
);
const Footer = dynamic(
  () => import("@/components/sections/Footer"),
  { loading: () => <SectionFallback minHeight="12rem" /> },
);
const FloatingQuestionButton = dynamic(
  () => import("@/components/sections/FloatingQuestionButton"),
  { loading: () => null },
);

export default function Home() {
  return (
    <MarketingFontVariables>
      <link
        rel="preload"
        as="image"
        href="/images/Logo.webp"
        fetchPriority="high"
      />
      <JsonLd />
      <FaqJsonLd faqs={HOME_FAQ} />
      <Navbar />
      <main>
        <HeroSection />
        <ProductPreviewSection />
        <InViewSectionGate minHeight="28rem">
          <PainSection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="24rem">
          <FamilyClaritySection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="24rem">
          <AdminGrowthSection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="24rem">
          <TeacherSupportSection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="32rem">
          <WorkflowSection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="20rem">
          <StacksSection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="28rem">
          <FounderStorySection />
        </InViewSectionGate>
        <InViewSectionGate minHeight="20rem">
          <CustomSection />
        </InViewSectionGate>
        <HomeFaqSection />
        <InViewSectionGate minHeight="16rem">
          <FinalCTASection />
        </InViewSectionGate>
      </main>
      <InViewSectionGate minHeight="12rem">
        <Footer />
      </InViewSectionGate>
      <FloatingQuestionButton />
    </MarketingFontVariables>
  );
}
