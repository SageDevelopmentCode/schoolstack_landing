import dynamic from "next/dynamic";
import { PortalThemeProvider } from "@/components/mudkitchen-portal/PortalThemeProvider";
import RootedMeadowsDualBranding from "@/components/timeline/rooted-meadows/RootedMeadowsDualBranding";
import RootedMeadowsTimelineHero from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineHero";
import RootedMeadowsTimelinePhasesSkeleton from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePhasesSkeleton";
import RootedMeadowsTimelineProgressLog from "@/components/timeline/rooted-meadows/RootedMeadowsTimelineProgressLog";
import { ROOTED_MEADOWS_PORTAL_BRANDING } from "@/data/school-demos/rooted-meadows-portal-branding";
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
    <PortalThemeProvider branding={ROOTED_MEADOWS_PORTAL_BRANDING}>
      <RootedMeadowsDualBranding />
      <main>
        <RootedMeadowsTimelineHero />
        <RootedMeadowsTimelinePhasesSection />
        <RootedMeadowsTimelineProgressLog entries={progressEntries} />
      </main>
    </PortalThemeProvider>
  );
}
