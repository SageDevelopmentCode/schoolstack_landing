"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { ROOTED_MEADOWS_TIMELINE_THEME } from "@/data/school-demos/rooted-meadows-timeline";

export default function RootedMeadowsTimelineHero() {
  return (
    <section className="px-6 pb-10 pt-14 lg:px-16 lg:pb-14 lg:pt-20">
      <div className="mx-auto max-w-[760px] text-center">
        <FadeInView>
          <span
            className="font-secondary inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark,
              backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepBg,
              borderColor: ROOTED_MEADOWS_TIMELINE_THEME.secondaryBtnBorder,
            }}
          >
            Platform rollout plan
          </span>
        </FadeInView>

        <FadeInView delay={0.06}>
          <h1
            className="font-heading mt-6 text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.08]"
            style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
          >
            Your path to a working school platform.
          </h1>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p
            className="font-secondary mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed"
            style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
          >
            Full MudKitchen platform, admissions, tuition, committees, admin,
            parent and teacher portals, built for Rooted Meadows Waldorf
            School.
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
