import { FadeInView } from '@/components/ui/FadeInView'

const TAGS = [
  'Custom enrollment flows',
  'Multi-location support',
  'SMS integrations',
  'Attendance tracking',
  'Custom reporting',
  'Google Calendar sync',
  'Custom tuition structures',
  'White-label branding',
  'CRM integrations',
  'Volunteer management',
  'Learning plan tools',
  'Any workflow you need',
]

export default function CustomSection() {
  return (
    <section id="custom" className="bg-surface-muted py-24">
      <div className="max-w-[860px] mx-auto px-6 text-center">

        <FadeInView>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.05] text-text">
            Need something specific?
            <br />We build custom, too.
          </h2>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p className="text-[16px] text-text-muted max-w-[56ch] mx-auto mt-5 leading-relaxed">
            Microschools don&apos;t all run the same way. Some need a simple launch setup.
            Others need tour booking, custom tuition logic, complex forms, parent
            workflows, or internal operations tailored to their model. Start with a
            proven stack, then extend from there.
          </p>
        </FadeInView>

        <FadeInView delay={0.18}>
          <div className="flex flex-wrap justify-center gap-2.5 mt-10">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-4 py-2 rounded-pill border border-border bg-surface text-sm text-text-muted cursor-default hover:bg-accent-soft hover:text-accent hover:border-accent/30 transition-all duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeInView>

        <FadeInView delay={0.26}>
          <div className="mt-10">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-accent text-white rounded-pill px-7 h-12 text-sm font-medium hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            >
              Tell us what you need
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </FadeInView>

      </div>
    </section>
  )
}
