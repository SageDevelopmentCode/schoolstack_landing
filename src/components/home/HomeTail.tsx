import dynamic from "next/dynamic";
import HomeBookDemoSection from "@/components/sections/HomeBookDemoSection";
import SectionFallback from "@/components/ui/SectionFallback";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import BrightFaqSection from "./BrightFaqSection";

const HomeFreeToolsSection = dynamic(() => import("@/components/sections/HomeFreeToolsSection"), {
  loading: () => <SectionFallback minHeight="28rem" />,
});
const GetStartedShowcaseCarousel = dynamic(
  () => import("@/components/get-started/GetStartedShowcaseCarousel"),
  { loading: () => <SectionFallback minHeight="20rem" /> },
);

/** Free tools, showcase carousel, FAQ, and the Book a Demo flow. */
export default function HomeTail() {
  return (
    <>
      <InViewSectionGate minHeight="28rem">
        <HomeFreeToolsSection />
      </InViewSectionGate>
      <InViewSectionGate minHeight="20rem">
        <GetStartedShowcaseCarousel variant="page" />
      </InViewSectionGate>
      <BrightFaqSection />
      <HomeBookDemoSection />
    </>
  );
}
