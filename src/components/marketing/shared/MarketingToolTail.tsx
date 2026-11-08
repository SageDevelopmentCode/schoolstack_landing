import dynamic from "next/dynamic";
import ProductShowcaseSection from "@/components/get-started/ProductShowcaseSection";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import SectionFallback from "@/components/ui/SectionFallback";
import {
  BookDemoHashProvider,
  BookDemoHashScroll,
} from "@/lib/marketing/book-demo-hash-context";

const GetStartedShowcaseCarousel = dynamic(
  () => import("@/components/get-started/GetStartedShowcaseCarousel"),
  { loading: () => <SectionFallback minHeight="20rem" /> },
);
const GetStartedOurStorySection = dynamic(
  () => import("@/components/get-started/GetStartedOurStorySection"),
  { loading: () => <SectionFallback minHeight="28rem" /> },
);
const HomeBookDemoSection = dynamic(
  () => import("@/components/sections/HomeBookDemoSection"),
  { loading: () => <SectionFallback minHeight="24rem" /> },
);

export default function MarketingToolTail() {
  return (
    <BookDemoHashProvider>
      <BookDemoHashScroll />
      <div className="bg-white font-secondary text-[#1d1a16]">
        <InViewSectionGate minHeight="20rem">
          <ProductShowcaseSection>
            <GetStartedShowcaseCarousel variant="page" presentation="section" />
          </ProductShowcaseSection>
        </InViewSectionGate>
        <InViewSectionGate minHeight="28rem">
          <GetStartedOurStorySection ctaVariant="same-page" />
        </InViewSectionGate>
        <HomeBookDemoSection />
      </div>
    </BookDemoHashProvider>
  );
}
