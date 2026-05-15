"use client";

import { FadeInView } from "@/components/ui/FadeInView";

const SCHOOL_CHIPS = ["Microschools", "Hybrid programs", "Small private schools"];

const DIFFERENTIATORS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2.5C10 2.5 4 5.5 4 10.5V14.5L10 17L16 14.5V10.5C16 5.5 10 2.5 10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 10.5L9.5 12.5L13 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Structure without rigidity",
    body: "Build your own workflows, schedules, and forms. Mud Kitchen adapts to how you actually run your school — not the other way around.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 17C4 14.2386 6.68629 12 10 12C13.3137 12 16 14.2386 16 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="15.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M17.5 13C17.5 11.6193 16.6046 10.5 15.5 10.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Close family relationships, kept close",
    body: "When you know every family by name, communication tools should match that warmth. No cold bulk-email blasts — just clear, personal updates.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 12H10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
    title: "Schedules that actually shift",
    body: "Small programs change. Students move between groups, sessions get reshuffled, and plans evolve. Mud Kitchen makes updating schedules easy, not painful.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 3V10L14 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Move fast without losing clarity",
    body: "Lean teams can't afford slow tools. Get a clear view of what's happening — enrollments, payments, communications — without digging through spreadsheets.",
  },
];

export default function RightSizedSection() {
  return (
    <section className="bg-bg-alt py-24 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="max-w-[640px] mx-auto text-center">
          <FadeInView>
            <p className="text-[13px] font-medium uppercase tracking-widest text-text-muted mb-5">
              Built for your kind of school
            </p>
          </FadeInView>

          <FadeInView delay={0.06}>
            <h2 className="font-display text-[clamp(2rem,3.8vw,3rem)] leading-[1.05] text-text">
              Right-sized for microschools{" "}
              <em style={{ color: "var(--color-clay)", fontStyle: "italic" }}>
                and small private programs.
              </em>
            </h2>
          </FadeInView>

          <FadeInView delay={0.12}>
            <p className="text-[17px] text-text-muted leading-relaxed mt-5">
              Mud Kitchen is designed for schools that want structure without
              losing flexibility. It supports the realities of small programs —
              close family relationships, evolving schedules, lean teams, and
              the need to move quickly without sacrificing clarity.
            </p>
          </FadeInView>

          {/* School type chips */}
          <FadeInView delay={0.18}>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-7">
              {SCHOOL_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-pill text-[12px] font-medium font-secondary px-4 h-8"
                  style={{
                    backgroundColor: "rgba(160,92,69,0.10)",
                    border: "1px solid rgba(160,92,69,0.25)",
                    color: "var(--color-clay)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "var(--color-clay)" }}
                    aria-hidden="true"
                  />
                  {chip}
                </span>
              ))}
            </div>
          </FadeInView>
        </div>

        {/* Differentiator grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIFFERENTIATORS.map((item, i) => (
            <FadeInView key={item.title} delay={0.08 + i * 0.06}>
              <div
                className="rounded-xl p-6 flex flex-col gap-4"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(160,92,69,0.10)",
                    color: "var(--color-clay)",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3
                    className="font-display text-[1.05rem] leading-snug text-text"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-text-muted leading-relaxed mt-1.5">
                    {item.body}
                  </p>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>

        {/* CTA */}
        <FadeInView delay={0.36}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/get-started"
              className="inline-flex items-center gap-2 bg-clay text-white text-sm font-medium font-secondary rounded-pill px-7 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              See it in action
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span className="text-[13px] text-text-faint font-secondary">
              30-min demo · no pressure
            </span>
          </div>
        </FadeInView>

      </div>
    </section>
  );
}
