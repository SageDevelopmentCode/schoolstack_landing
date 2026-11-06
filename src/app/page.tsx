import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import BrightHero from "@/components/home/BrightHero";
import BrightStats from "@/components/home/BrightStats";
import BrightBento from "@/components/home/BrightBento";
import BrightPain from "@/components/home/BrightPain";
import BrightPersonas from "@/components/home/BrightPersonas";
import BrightStory from "@/components/home/BrightStory";
import BrightSetup from "@/components/home/BrightSetup";
import BrightPricing from "@/components/home/BrightPricing";
import HomeShell from "@/components/home/HomeShell";
import HomeTail from "@/components/home/HomeTail";
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

export default function Home() {
  return (
    <HomeShell className="bg-white">
      <JsonLd />
      <FaqJsonLd faqs={HOME_FAQ} />
      <BrightHero />
      <BrightStats />
      <BrightBento />
      <BrightPain />
      <BrightPersonas />
      <BrightStory />
      <BrightSetup />
      <BrightPricing />
      <HomeTail />
    </HomeShell>
  );
}
