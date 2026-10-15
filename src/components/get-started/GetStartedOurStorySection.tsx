"use client";

import AboutOurStorySection, {
  type AboutOurStoryCtaVariant,
} from "@/components/about/AboutOurStorySection";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

const OUR_STORY_SUBTITLE =
  "MudKitchen is built by Julius Cecilia and Sabrina Obnamia — microschool founders who needed one connected system to open and run Sage Field in Round Rock, Texas.";

type GetStartedOurStorySectionProps = {
  ctaVariant?: AboutOurStoryCtaVariant;
};

export default function GetStartedOurStorySection({
  ctaVariant = "get-started",
}: GetStartedOurStorySectionProps) {
  return (
    <section
      className="border-t border-border py-16 sm:py-20 font-secondary text-text"
      style={{ backgroundColor: theme.cream }}
      aria-labelledby="get-started-our-story-heading"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16">
        <GetStartedStoryHeader
          theme={theme}
          kicker="Our story"
          title={
            <>
              We didn&apos;t start with a software company.{" "}
              <em style={{ color: theme.coral, fontStyle: "italic" }}>
                We started with a school.
              </em>
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
