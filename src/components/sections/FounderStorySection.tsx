import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";
import { Badge } from "@/components/ui/Badge";

const STATS = [
  { number: "25", label: "Students enrolled" },
  { number: "< 3 mo", label: "To launch" },
  { number: "1", label: "Unified platform" },
];

const SECTIONS = [
  "The challenge",
  "Timeline",
  "Outcomes — Parent / Teacher / Admin",
  "Before & After",
  "Why it worked",
];

export default function FounderStorySection() {
  return (
    <section className="bg-bg-alt py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-center">
          {/* Left — story + quote */}
          <div>
            <FadeInView>
              <Badge>Customer story</Badge>
            </FadeInView>

            <FadeInView delay={0.06}>
              <p className="font-display text-[clamp(1rem,1.8vw,1.15rem)] text-text-muted leading-snug mt-4">
                Sage Field · Round Rock, TX
              </p>
            </FadeInView>

            <FadeInView delay={0.12}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.05] text-text mt-3">
                From 0 to 25 students
                <br />
                <em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>in under 3 months.</em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="text-[16px] text-text-muted leading-relaxed mt-5">
                Sage Field is an outdoor-focused private microschool in Round
                Rock, Texas. MudKitchen powered their entire launch — website,
                enrollment, tuition, staff workflows, family communication, and
                back-office operations — all from one platform, from day one.
              </p>
            </FadeInView>

            <FadeInView delay={0.24}>
              <blockquote className="bg-surface-muted border border-border-strong rounded-lg p-6 mt-7">
                <div
                  className="w-2 h-2 rounded-full bg-accent mb-4"
                  aria-hidden="true"
                />
                <p className="font-display text-[1.05rem] italic text-text leading-relaxed">
                  &ldquo;MudKitchen handled everything from enrollment to tuition
                  so we could focus on the kids. I don&apos;t know how we would
                  have launched without it.&rdquo;
                </p>
                <footer className="text-sm text-text-faint mt-4">
                  — Sabrina Obnamia, Co-Founder of Sage Field
                </footer>
              </blockquote>
            </FadeInView>

            <FadeInView delay={0.30}>
              <a
                href="/customers/sagefield"
                className="inline-flex items-center gap-1.5 text-sm font-secondary text-accent hover:text-accent-hover transition-colors mt-6"
              >
                Read the case study
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </FadeInView>
          </div>

          {/* Right — case study preview card */}
          <FadeInView delay={0.12}>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-md">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="w-3 h-3 rounded-full bg-border-strong" />
                <div className="w-3 h-3 rounded-full bg-border-strong" />
                <div className="w-3 h-3 rounded-full bg-border-strong" />
                <span className="ml-2 text-[12px] font-mono text-text-faint">
                  mudkitchen.com/customers/sagefield
                </span>
              </div>

              {/* School identity strip */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src="/images/SageFieldLogo.png"
                    alt="Sage Field logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[13px] font-secondary font-semibold text-text leading-none">
                    Sage Field
                  </p>
                  <p className="text-[11px] font-secondary text-text-faint mt-0.5">
                    Round Rock, TX
                  </p>
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {STATS.map(({ number, label }) => (
                  <div key={label} className="px-5 py-5 text-center">
                    <div className="font-display text-[1.9rem] leading-none text-text">
                      {number}
                    </div>
                    <div className="text-[11px] font-secondary text-text-faint mt-1.5 leading-snug">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section index */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-3">
                  Inside the case study
                </p>
                <div className="space-y-0">
                  {SECTIONS.map((section) => (
                    <div
                      key={section}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="text-[13px] font-secondary text-text-muted">
                        {section}
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        aria-hidden="true"
                        className="text-text-faint shrink-0"
                      >
                        <path
                          d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
