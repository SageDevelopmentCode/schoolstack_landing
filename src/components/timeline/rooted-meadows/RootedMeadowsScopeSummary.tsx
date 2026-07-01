"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import {
  ROOTED_MEADOWS_OUT_OF_SCOPE,
  ROOTED_MEADOWS_POST_V1_FEATURES,
  ROOTED_MEADOWS_TIMELINE_PHASES,
  ROOTED_MEADOWS_TIMELINE_THEME,
} from "@/data/school-demos/rooted-meadows-timeline";

const V1_FEATURE_COUNT = ROOTED_MEADOWS_TIMELINE_PHASES.reduce(
  (sum, phase) => sum + phase.features.length,
  0,
);

export default function RootedMeadowsScopeSummary() {
  return (
    <section className="px-6 pb-10 lg:px-16">
      <div className="mx-auto max-w-[1100px]">
        <FadeInView>
          <div className="grid gap-4 md:grid-cols-3">
            <div
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: "white",
                borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
              }}
            >
              <p
                className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accent }}
              >
                In v1
              </p>
              <p
                className="font-heading mt-2 text-2xl font-medium"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
              >
                {V1_FEATURE_COUNT} capabilities
              </p>
              <p
                className="font-secondary mt-2 text-sm leading-relaxed"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
              >
                Admin, admissions, tuition, committees, teacher portal, parent
                experience, and mobile — ready by August 15.
              </p>
            </div>

            <div
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepBg,
                borderColor: ROOTED_MEADOWS_TIMELINE_THEME.clayBorder,
              }}
            >
              <p
                className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepTitle }}
              >
                After v1
              </p>
              <ul className="font-secondary mt-3 space-y-2 text-sm leading-relaxed">
                {ROOTED_MEADOWS_POST_V1_FEATURES.map((item) => (
                  <li
                    key={item}
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl border border-dashed p-6"
              style={{
                backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.pageBg,
                borderColor: ROOTED_MEADOWS_TIMELINE_THEME.borderStrong,
              }}
            >
              <p
                className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
              >
                Out of scope
              </p>
              <ul className="font-secondary mt-3 space-y-2 text-sm leading-relaxed">
                {ROOTED_MEADOWS_OUT_OF_SCOPE.map((item) => (
                  <li
                    key={item}
                    style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                  >
                    {item} — you keep your existing site
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
