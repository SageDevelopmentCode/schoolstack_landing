import { ROOTED_MEADOWS_TIMELINE_THEME } from "@/data/school-demos/rooted-meadows-timeline";

export default function RootedMeadowsTimelinePhasesSkeleton() {
  return (
    <section className="px-6 py-10 lg:px-16 lg:py-14" aria-busy="true" aria-label="Loading timeline phases">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 text-center lg:text-left">
          <div
            className="mx-auto h-3 w-24 rounded-full lg:mx-0"
            style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}
          />
          <div
            className="mx-auto mt-4 h-8 w-64 max-w-full rounded-lg lg:mx-0"
            style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.border }}
          />
        </div>
        <div
          className="h-[420px] rounded-2xl border"
          style={{
            backgroundColor: "white",
            borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
          }}
        />
      </div>
    </section>
  );
}
