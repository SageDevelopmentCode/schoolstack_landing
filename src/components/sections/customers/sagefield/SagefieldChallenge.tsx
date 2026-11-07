import { FadeInView } from "@/components/ui/FadeInView";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

export default function SagefieldChallenge() {
  return (
    <section className="bg-white px-3 py-8 lg:px-6">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[40px] bg-[#FFF4EC] px-6 py-16 md:px-10 lg:px-14 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[5fr_7fr]">
          <div>
            <FadeInView>
              <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
                The challenge
              </p>
            </FadeInView>

            <FadeInView delay={0.08}>
              <h2 className={`mt-5 text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
                They weren&apos;t looking for more software.{" "}
                <span className={ACCENT_HIGHLIGHT}>They needed a school to work.</span>
              </h2>
            </FadeInView>

            <FadeInView delay={0.14}>
              <div className="mt-8 space-y-4">
                {[
                  { label: "School", value: "Sage Field" },
                  { label: "Location", value: "Round Rock, Texas" },
                  { label: "Ages served", value: "4–11" },
                  { label: "Result", value: "0 → 35 students in under 3 months" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-3">
                    <span className="w-24 shrink-0 font-secondary text-[11px] uppercase tracking-widest text-[#1d1a16]/50">
                      {label}
                    </span>
                    <span className="font-secondary text-[14px] font-medium text-[#1d1a16]">{value}</span>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>

          <FadeInView delay={0.1}>
            <div className="space-y-5">
              <p className="font-secondary text-[16.5px] leading-relaxed text-[#1d1a16]/70">
                Launching a microschool means more than building a website. You need a way to present the
                school clearly, capture interest, guide families toward tours and enrollment, manage tuition,
                support teachers, and keep administrators organized once students start arriving.
              </p>
              <p className="font-secondary text-[16.5px] leading-relaxed text-[#1d1a16]/70">
                Sage Field&apos;s public site already shows many of those live operational pieces — including
                programs, tuition, team, contact details, and enrollment pathways — which makes this story
                more credible than a generic &ldquo;coming soon&rdquo; example.
              </p>
              <p className="font-secondary text-[16.5px] leading-relaxed text-[#1d1a16]/70">
                The system didn&apos;t just help them launch. It gave them the operational confidence to take
                on students, communicate with families, and grow — without rebuilding their stack as they scaled.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { number: "35", label: "Students enrolled" },
                  { number: "< 3", label: "Months to launch" },
                  { number: "1", label: "Unified platform" },
                ].map(({ number, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-black/8 bg-white px-4 py-5 text-center"
                  >
                    <div className="font-secondary text-[2rem] font-bold leading-none tracking-[-0.03em] text-[#1d1a16]">
                      {number}
                    </div>
                    <div className="mt-1.5 font-secondary text-[12px] leading-snug text-[#1d1a16]/50">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
