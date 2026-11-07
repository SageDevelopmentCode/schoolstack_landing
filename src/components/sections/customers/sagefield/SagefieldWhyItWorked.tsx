import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

const REASONS = [
  {
    number: "01",
    title: "High-trust, relationship-driven model",
    body: "Sage Field is built on small groups, family partnership, and a clear educational philosophy. The platform had to support that — not fight it. Communication tools, parent visibility, and operational transparency reinforced the trust the school already prioritized.",
  },
  {
    number: "02",
    title: "Real operational complexity from day one",
    body: "This wasn't a hobby project or a waitlist. Sage Field launched with live programs, published tuition, and enrolled families. The system had to handle real complexity: billing cycles, staff coordination, enrollment agreements, and ongoing family communication.",
  },
  {
    number: "03",
    title: "Outdoors and philosophy-led learning",
    body: "Blending Montessori, Waldorf, Reggio Emilia influences, and TEKS-aligned academics meant the school had a distinct approach. The platform supported — but never overshadowed — that approach, giving teachers and administrators the infrastructure to focus on pedagogy, not paperwork.",
  },
];

export default function SagefieldWhyItWorked() {
  return (
    <section className="bg-white px-3 py-8 lg:px-6">
      <div className="mx-auto max-w-[1400px] rounded-[40px] bg-[#EAF1FD] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[5fr_7fr]">
          <div>
            <FadeInView>
              <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
                Why it worked
              </p>
            </FadeInView>
            <FadeInView delay={0.08}>
              <h2 className={`mt-5 text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
                Software that mirrors <span className={ACCENT_HIGHLIGHT}>the school&apos;s values.</span>
              </h2>
            </FadeInView>
            <FadeInView delay={0.14}>
              <p className="mt-5 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
                Sage Field&apos;s model is intentionally high-trust and relationship-driven. The software story
                mirrors that — not by offering more features, but by supporting a real school with real
                operational complexity from the very first day.
              </p>
            </FadeInView>

            <FadeInView delay={0.2}>
              <blockquote className="mt-8 rounded-[24px] border border-black/8 bg-white p-6">
                <div className="mb-4 h-2 w-2 rounded-full bg-clay" aria-hidden />
                <p className="text-[1.05rem] font-semibold leading-relaxed tracking-[-0.02em] text-[#1d1a16]">
                  &ldquo;We didn&apos;t need disconnected tools. We needed one system that could help us launch
                  confidently, stay organized, and support families well from the start.&rdquo;
                </p>
                <footer className="mt-4 font-secondary text-sm text-[#1d1a16]/50">
                  — Sabrina, Co-Founder, Sage Field
                </footer>
              </blockquote>
            </FadeInView>

            <FadeInView delay={0.26}>
              <div className="mt-8 h-[220px] overflow-hidden rounded-[24px] border border-black/8">
                <Image
                  src="/images/sagefield/mud-kitchen.jpg"
                  alt="Students at the Sage Field outdoor mud kitchen"
                  width={700}
                  height={440}
                  className="h-full w-full object-cover"
                />
              </div>
            </FadeInView>
          </div>

          <div className="space-y-8">
            {REASONS.map(({ number, title, body }, i) => (
              <FadeInView key={number} delay={0.1 + i * 0.08}>
                <div className="flex gap-5">
                  <span className="mt-1 w-7 shrink-0 font-mono text-[11px] font-semibold text-[#1d1a16]/40">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-secondary! text-[1.05rem] font-bold! leading-snug tracking-[-0.02em]! text-[#1d1a16]">
                      {title}
                    </h3>
                    <p className="mt-2 font-secondary text-[14.5px] leading-relaxed text-[#1d1a16]/70">
                      {body}
                    </p>
                  </div>
                </div>
              </FadeInView>
            ))}

            <FadeInView delay={0.38}>
              <div className="border-t border-black/10 pt-6">
                <p className="mb-3 font-secondary text-[11px] font-semibold uppercase tracking-widest text-[#1d1a16]/50">
                  Educational approach
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Montessori",
                    "Waldorf",
                    "Reggio Emilia",
                    "TEKS-aligned",
                    "Outdoor learning",
                    "Small groups",
                    "Family partnership",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-pill border border-black/8 bg-white px-3 py-1 font-secondary text-[12px] text-[#1d1a16]/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
