import Image from 'next/image'
import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

const REASONS = [
  {
    number: '01',
    title: 'High-trust, relationship-driven model',
    body: 'Sage Field is built on small groups, family partnership, and a clear educational philosophy. The platform had to support that — not fight it. Communication tools, parent visibility, and operational transparency reinforced the trust the school already prioritized.',
  },
  {
    number: '02',
    title: 'Real operational complexity from day one',
    body: 'This wasn\'t a hobby project or a waitlist. Sage Field launched with live programs, published tuition, and enrolled families. The system had to handle real complexity: billing cycles, staff coordination, enrollment agreements, and ongoing family communication.',
  },
  {
    number: '03',
    title: 'Outdoors and philosophy-led learning',
    body: 'Blending Montessori, Waldorf, Reggio Emilia influences, and TEKS-aligned academics meant the school had a distinct approach. The platform supported — but never overshadowed — that approach, giving teachers and administrators the infrastructure to focus on pedagogy, not paperwork.',
  },
]

export default function SagefieldWhyItWorked() {
  return (
    <section className="bg-bg py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-start">
          {/* Left — heading + quote */}
          <div>
            <FadeInView>
              <Badge>Why it worked</Badge>
            </FadeInView>
            <FadeInView delay={0.08}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text mt-5">
                Software that mirrors{' '}
                <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                  the school&apos;s values.
                </em>
              </h2>
            </FadeInView>
            <FadeInView delay={0.14}>
              <p className="text-[16px] font-secondary text-text-muted leading-relaxed mt-5">
                Sage Field&apos;s model is intentionally high-trust and
                relationship-driven. The software story mirrors that — not
                by offering more features, but by supporting a real school
                with real operational complexity from the very first day.
              </p>
            </FadeInView>

            {/* Quote — placeholder, to be replaced with Sabrina's voice */}
            <FadeInView delay={0.2}>
              <blockquote className="bg-surface-muted border border-border-strong rounded-lg p-6 mt-8">
                <div
                  className="w-2 h-2 rounded-full bg-accent mb-4"
                  aria-hidden="true"
                />
                <p className="font-display text-[1.05rem] italic text-text leading-relaxed">
                  &ldquo;We didn&apos;t need disconnected tools. We needed one
                  system that could help us launch confidently, stay organized,
                  and support families well from the start.&rdquo;
                </p>
                <footer className="text-sm text-text-faint mt-4 font-secondary">
                  — Sabrina, Co-Founder, Sage Field{' '}
                  <span className="text-[11px] text-text-faint italic">
                    [placeholder — replace with Sabrina&apos;s actual voice before publishing]
                  </span>
                </footer>
              </blockquote>
            </FadeInView>

            {/* School photo */}
            <FadeInView delay={0.26}>
              <div className="mt-8 rounded-2xl border border-border overflow-hidden h-[220px]">
                <Image
                  src="/images/sagefield/mud-kitchen.jpg"
                  alt="Students at the Sage Field outdoor mud kitchen"
                  width={700}
                  height={440}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInView>
          </div>

          {/* Right — reasons */}
          <div className="space-y-8">
            {REASONS.map(({ number, title, body }, i) => (
              <FadeInView key={number} delay={0.1 + i * 0.08}>
                <div className="flex gap-5">
                  <span
                    className="font-mono text-[11px] font-semibold text-text-faint shrink-0 mt-1 w-7"
                  >
                    {number}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.05rem] text-text font-medium leading-snug">
                      {title}
                    </h3>
                    <p className="text-[14.5px] font-secondary text-text-muted leading-relaxed mt-2">
                      {body}
                    </p>
                  </div>
                </div>
              </FadeInView>
            ))}

            {/* Philosophy tags */}
            <FadeInView delay={0.38}>
              <div className="pt-6 border-t border-border">
                <p className="text-[11px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-3">
                  Educational approach
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Montessori',
                    'Waldorf',
                    'Reggio Emilia',
                    'TEKS-aligned',
                    'Outdoor learning',
                    'Small groups',
                    'Family partnership',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-secondary bg-surface border border-border text-text-muted"
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
  )
}
