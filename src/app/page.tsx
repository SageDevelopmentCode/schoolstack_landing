import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import GardenRoot from "@/components/garden/GardenRoot";
import HomeGardenPage from "@/components/home-garden/HomeGardenPage";
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
    <GardenRoot>
      <JsonLd />
      <FaqJsonLd faqs={HOME_FAQ} />
      <HomeGardenPage />
    </GardenRoot>
  );
}
