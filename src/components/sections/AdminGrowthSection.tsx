"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { LazyAdminDashboardDemo } from "@/components/sections/lazyDemos";

export default function AdminGrowthSection() {
  return (
    <section className="bg-surface py-24 overflow-hidden">
      <div className="max-w-[1200px] mx-auto pr-6 lg:pr-12 pl-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">

          {/* Left — AdminDashboardDemo, scaled down with fixed height + internal scroll */}
          {/* Visible height = 430px → inner unscaled height = 430 / 0.72 ≈ 597px */}
          <FadeInView delay={0.1}>
            <InViewDemoGate className="relative w-full" style={{ height: "430px" }}>
              <div
                className="absolute top-0 left-0 rounded-2xl border border-border shadow-lg overflow-y-auto overflow-x-hidden"
                style={{
                  width: "calc(100% / 0.72)",
                  height: "calc(430px / 0.72)",
                  transform: "scale(0.72)",
                  transformOrigin: "top left",
                }}
              >
                <LazyAdminDashboardDemo disableTour={true} />
              </div>
            </InViewDemoGate>
          </FadeInView>

          {/* Right — text content */}
          <div className="pl-4 lg:pl-6">
            <FadeInView>
              <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted mb-4">
                Growing operations
              </p>
            </FadeInView>

            <FadeInView delay={0.06}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text">
                As enrollment grows, the{" "}
                <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                  admin grows faster.
                </em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.12}>
              <p className="text-[17px] text-text-muted leading-relaxed mt-6">
                The real challenge is not just adding students. It is keeping
                track of forms, reminders, onboarding, records, follow-ups, and
                the daily details that multiply as your school grows. Mud Kitchen
                helps small teams turn that repeating work into clearer
                workflows, so growth feels manageable instead of messy.
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

        </div>
      </div>
    </section>
  );
}
