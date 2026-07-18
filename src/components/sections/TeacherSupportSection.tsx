"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { LandingScaledDemoFrame } from "@/components/demo/LandingScaledDemoFrame";
import { LazyTeacherDashboardDemo } from "@/components/sections/lazyDemos";

export default function TeacherSupportSection() {
  return (
    <section className="bg-surface py-24 overflow-x-hidden overflow-y-hidden lg:overflow-hidden">
      <div className="max-w-[1200px] mx-auto pl-6 lg:pl-12 pr-0 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-center">

          {/* Left — text content */}
          <div className="pr-4 lg:pr-6">
            <FadeInView>
              <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted mb-4">
                For teachers
              </p>
            </FadeInView>

            <FadeInView delay={0.06}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text">
                Support teachers with a calmer,{" "}
                <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                  more connected school day.
                </em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.12}>
              <p className="text-[17px] text-text-muted leading-relaxed mt-6">
                When teachers can easily see what is happening, what has
                changed, and what students or families need, the whole day runs
                more smoothly. Mud Kitchen gives them a simple place to stay
                organized, communicate clearly, and spend more energy on
                teaching instead of tracking down details.
              </p>
            </FadeInView>

            <FadeInView delay={0.18}>
              <ul className="mt-6 space-y-3">
                {[
                  "Keep schedules, notes, and student details in one place.",
                  "Reduce back-and-forth with clearer team communication.",
                  "Help teachers stay focused on students, not scattered admin.",
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span
                      className="mt-[5px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-clay)" }}
                      aria-hidden="true"
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                      >
                        <path
                          d="M1.5 4L3.2 5.8L6.5 2"
                          stroke="white"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[15px] text-text-muted leading-snug">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeInView>

            <FadeInView delay={0.24}>
              <div className="mt-8">
                <a
                  href="/get-started"
                  className="inline-flex items-center gap-2 bg-clay text-white text-sm font-medium font-secondary rounded-pill px-7 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Book a Demo
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </FadeInView>
          </div>

          {/* Right — TeacherDashboardDemo, scaled down with fixed height + internal scroll */}
          <FadeInView delay={0.1}>
            <div className="max-lg:-ml-6 max-lg:overflow-x-hidden max-lg:overscroll-x-none">
              <LandingScaledDemoFrame preventHorizontalScroll>
                <InViewDemoGate>
                  <LazyTeacherDashboardDemo disableTour={true} />
                </InViewDemoGate>
              </LandingScaledDemoFrame>
            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  );
}
