import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProductPreviewSection from "@/components/sections/ProductPreviewSection";
import SectionFallback from "@/components/ui/SectionFallback";
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
    <>
      <link
        rel="preload"
        as="image"
        href="/images/stock/ImageOne.webp"
        fetchPriority="high"
      />
      <JsonLd />
      <FaqJsonLd faqs={HOME_FAQ} />
      <Navbar />
      <main>
        <HeroSection />
        <ProductPreviewSection />
        <PainSection />
        <FamilyClaritySection />
        <AdminGrowthSection />
        <TeacherSupportSection />
        <WorkflowSection />
        <StacksSection />
        <FounderStorySection />
        <CustomSection />
        <HomeFaqSection />
        <FinalCTASection />
      </main>
      <Footer />
      <FloatingQuestionButton />
    </>
  );
}
