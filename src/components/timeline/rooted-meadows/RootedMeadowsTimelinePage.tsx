import dynamic from "next/dynamic";
import RootedMeadowsDualBranding from "@/components/timeline/rooted-meadows/RootedMeadowsDualBranding";
import RootedMeadowsTimelineHero from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineHero";
import RootedMeadowsTimelinePhasesSkeleton from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhasesSkeleton";
import RootedMeadowsTimelineProgressLog from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineProgressLog";
import type { OrganizationProgressEntry } from "@/lib/organization-progress";

const RootedMeadowsTimelinePhasesSection = dynamic(
  () =>
    import("@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhasesSection"),
  { loading: () => <RootedMeadowsTimelinePhasesSkeleton /> },
);

interface Props {
  progressEntries: OrganizationProgressEntry[];
}

export default function RootedMeadowsTimelinePage({ progressEntries }: Props) {
  return (
    <>
      <RootedMeadowsDualBranding />
      <main>
        <RootedMeadowsTimelineHero />
        <RootedMeadowsTimelinePhasesSection />
        <RootedMeadowsTimelineProgressLog entries={progressEntries} />
      </main>
    </>
  );
}
