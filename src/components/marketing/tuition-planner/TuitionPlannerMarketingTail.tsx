import dynamic from "next/dynamic";
import { InViewSectionGate } from "@/components/ui/InViewSectionGate";
import SectionFallback from "@/components/ui/SectionFallback";
import TuitionPlannerMarketingBookDemoShell from "@/components/marketing/tuition-planner/TuitionPlannerMarketingBookDemoShell";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";

const bookDemoHref = BOOK_DEMO_HASH_HREF;

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

export default function TuitionPlannerMarketingTail() {
  return (
    <TuitionPlannerMarketingBookDemoShell>
      <InViewSectionGate minHeight="28rem">
        <PainSection bookDemoHref={bookDemoHref} />
      </InViewSectionGate>
      <InViewSectionGate minHeight="24rem">
        <FamilyClaritySection bookDemoHref={bookDemoHref} />
      </InViewSectionGate>
      <InViewSectionGate minHeight="24rem">
        <AdminGrowthSection bookDemoHref={bookDemoHref} />
      </InViewSectionGate>
      <InViewSectionGate minHeight="24rem">
        <TeacherSupportSection bookDemoHref={bookDemoHref} />
      </InViewSectionGate>
      <InViewSectionGate minHeight="20rem">
        <GetStartedShowcaseCarousel variant="page" />
      </InViewSectionGate>
      <InViewSectionGate minHeight="28rem">
        <GetStartedOurStorySection ctaVariant="same-page" />
      </InViewSectionGate>
      <HomeBookDemoSection />
    </TuitionPlannerMarketingBookDemoShell>
  );
}
