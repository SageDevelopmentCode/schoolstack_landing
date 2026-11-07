"use client";

import AboutOurStorySection, {
  type AboutOurStoryCtaVariant,
} from "@/components/about/AboutOurStorySection";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import { ACCENT_HIGHLIGHT } from "@/components/home/bright-styles";

const OUR_STORY_SUBTITLE =
  "MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool founders who needed one connected system to open and run Sage Field in Round Rock, Texas.";

type GetStartedOurStorySectionProps = {
  ctaVariant?: AboutOurStoryCtaVariant;
};

export default function GetStartedOurStorySection({
  ctaVariant = "get-started",
}: GetStartedOurStorySectionProps) {
  return (
    <section className="bg-white px-3 py-12 lg:px-6" aria-labelledby="get-started-our-story-heading">
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#E9F2E4] px-6 py-14 md:px-10 lg:px-14">
        <GetStartedStoryHeader
          kicker="Our story"
          title={
            <>
              We didn&apos;t start with a software company.{" "}
              <span className={ACCENT_HIGHLIGHT}>We started with a school.</span>
            </>
          }
          subtitle={OUR_STORY_SUBTITLE}
          className="mb-10 sm:mb-12 max-w-[720px]"
          headingAs="h2"
          titleId="get-started-our-story-heading"
        />
        <AboutOurStorySection ctaVariant={ctaVariant} showSrHeading={false} />
      </div>
    </section>
  );
}
