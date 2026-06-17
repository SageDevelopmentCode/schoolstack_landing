import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

export default function SagefieldChallenge() {
  return (
    <section className="bg-bg-alt py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-center">
          {/* Left — heading block */}
          <div>
            <FadeInView>
              <Badge>The challenge</Badge>
            </FadeInView>

            <FadeInView delay={0.08}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text mt-5">
                They weren&apos;t looking for more software.{' '}
                <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                  They needed a school to work.
                </em>
              </h2>
            </FadeInView>

            <FadeInView delay={0.14}>
              <div className="mt-8 space-y-4">
                {[
                  {
                    label: 'School',
                    value: 'Sage Field',
                  },
                  {
                    label: 'Location',
                    value: 'Round Rock, Texas',
                  },
                  {
                    label: 'Ages served',
                    value: '4–11',
                  },
                  {
                    label: 'Result',
                    value: '0 → 35 students in under 3 months',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-3">
                    <span className="text-[11px] font-secondary uppercase tracking-widest text-text-faint w-24 shrink-0">
                      {label}
                    </span>
                    <span className="text-[14px] font-secondary text-text font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>

          {/* Right — copy */}
          <FadeInView delay={0.1}>
            <div className="space-y-5">
              <p className="text-[16.5px] font-secondary text-text-muted leading-relaxed">
                Launching a microschool means more than building a website. You
                need a way to present the school clearly, capture interest,
                guide families toward tours and enrollment, manage tuition,
                support teachers, and keep administrators organized once
                students start arriving.
              </p>
              <p className="text-[16.5px] font-secondary text-text-muted leading-relaxed">
                Sage Field&apos;s public site already shows many of those live
                operational pieces — including programs, tuition, team, contact
                details, and enrollment pathways — which makes this story more
                credible than a generic &ldquo;coming soon&rdquo; example.
              </p>
              <p className="text-[16.5px] font-secondary text-text-muted leading-relaxed">
                The system didn&apos;t just help them launch. It gave them the
                operational confidence to take on students, communicate with
                families, and grow — without rebuilding their stack as they
                scaled.
              </p>

              {/* Inline stat callout */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { number: '35', label: 'Students enrolled' },
                  { number: '< 3', label: 'Months to launch' },
                  { number: '1', label: 'Unified platform' },
                ].map(({ number, label }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-surface border border-border px-4 py-5 text-center"
                  >
                    <div className="font-display text-[2rem] leading-none text-text">
                      {number}
                    </div>
                    <div className="text-[12px] font-secondary text-text-faint mt-1.5 leading-snug">
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
  )
}
