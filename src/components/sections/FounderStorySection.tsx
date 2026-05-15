import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";

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
    <section className="py-24" style={{ backgroundColor: '#1a3327' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-center">
          {/* Left — story + quote */}
          <div>
            <FadeInView>
              <span className="inline-flex items-center gap-1.5 rounded-pill text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 bg-white/10 text-white/75">
                Customer story
              </span>
            </FadeInView>

            <FadeInView delay={0.06}>
              <p className="font-display text-[clamp(1rem,1.8vw,1.15rem)] leading-snug mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Sage Field · Round Rock, TX
              </p>
            </FadeInView>

            <FadeInView delay={0.12}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.05] text-white mt-3">
                From 0 to 25 students
                <br />
                <em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>in under 3 months.</em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.18}>
              <p className="text-[16px] leading-relaxed mt-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Sage Field is an outdoor-focused private microschool in Round
                Rock, Texas. MudKitchen powered their entire launch — website,
                enrollment, tuition, staff workflows, family communication, and
                back-office operations — all from one platform, from day one.
              </p>
            </FadeInView>

            <FadeInView delay={0.24}>
              <blockquote className="rounded-lg p-6 mt-7" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div
                  className="w-2 h-2 rounded-full mb-4"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  aria-hidden="true"
                />
                <p className="font-display text-[1.05rem] italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  &ldquo;MudKitchen handled everything from enrollment to tuition
                  so we could focus on the kids. I don&apos;t know how we would
                  have launched without it.&rdquo;
                </p>
                <footer className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  — Sabrina Obnamia, Co-Founder of Sage Field
                </footer>
              </blockquote>
            </FadeInView>

            <FadeInView delay={0.30}>
              <a
                href="/customers/sagefield"
                className="inline-flex items-center gap-1.5 text-sm font-secondary transition-opacity mt-6 hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
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
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: '#243d30', border: '1px solid rgba(255,255,255,0.10)' }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: '#1e3a2b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <span className="ml-2 text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  mudkitchen.com/customers/sagefield
                </span>
              </div>

              {/* School identity strip */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  <p className="text-[13px] font-secondary font-semibold leading-none text-white">
                    Sage Field
                  </p>
                  <p className="text-[11px] font-secondary mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Round Rock, TX
                  </p>
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {STATS.map(({ number, label }, i) => (
                  <div
                    key={label}
                    className="px-5 py-5 text-center"
                    style={i < STATS.length - 1 ? { borderRight: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    <div className="font-display text-[1.9rem] leading-none text-white">
                      {number}
                    </div>
                    <div className="text-[11px] font-secondary mt-1.5 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section index */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-secondary font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Inside the case study
                </p>
                <div className="space-y-0">
                  {SECTIONS.map((section, i) => (
                    <div
                      key={section}
                      className="flex items-center justify-between py-3"
                      style={i < SECTIONS.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.07)' } : undefined}
                    >
                      <span className="text-[13px] font-secondary" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {section}
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        aria-hidden="true"
                        style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}
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
