"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { LandingScaledDemoFrame } from "@/components/demo/LandingScaledDemoFrame";
import { LazyParentDashboardDemo } from "@/components/sections/lazyDemos";

export default function FamilyClaritySection() {
  return (
    <section className="bg-surface py-24 overflow-x-hidden overflow-y-hidden lg:overflow-hidden">
      <div className="max-w-[1200px] mx-auto pl-6 lg:pl-12 pr-0 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-center">

          {/* Left — text content */}
          <div className="pr-4 lg:pr-6">
            <FadeInView>
              <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted mb-4">
                Family clarity
              </p>
            </FadeInView>

            <FadeInView delay={0.06}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text">
                Give families one clear place{" "}
                <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                  to stay in the loop.
                </em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.12}>
              <p className="text-[17px] text-text-muted leading-relaxed mt-6">
                Parents should not have to search through old emails, group
                chats, and scattered links just to understand what is happening
                this week. Mud Kitchen gives families a simpler experience for
                updates, forms, schedules, and the information they actually
                need — without adding more noise.
              </p>
            </FadeInView>

            <FadeInView delay={0.18}>
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

          {/* Right — ParentDashboardDemo, scaled down with fixed height + internal scroll */}
          <FadeInView delay={0.1}>
            <div className="max-lg:-ml-6 max-lg:overflow-x-hidden max-lg:overscroll-x-none">
              <LandingScaledDemoFrame preventHorizontalScroll>
                <LazyParentDashboardDemo disableTour={true} />
              </LandingScaledDemoFrame>
            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  );
}
