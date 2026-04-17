import { FadeInView } from '@/components/ui/FadeInView'

interface StackFeature {
  text: string
}

interface Stack {
  name: string
  tagline: string
  scale: string
  features: StackFeature[]
  cta: string
  featured?: boolean
}

const STACKS: Stack[] = [
  {
    name: 'Starter Stack',
    tagline: 'For solo founders launching their first school.',
    scale: 'Up to 20 students · 1–2 teachers',
    features: [
      { text: 'Full branded school website' },
      { text: 'Multi-step enrollment application' },
      { text: 'Health info, emergency contacts, digital signatures' },
      { text: 'Basic admin portal' },
      { text: 'Parent portal — dashboard, forms, billing' },
      { text: 'Stripe payments — registration, tuition, fees' },
      { text: 'Enrollment confirmation emails' },
    ],
    cta: 'Book a Demo',
  },
  {
    name: 'Growth Stack',
    tagline: 'For schools gaining real traction.',
    scale: '20–60 students · 3–5 teachers',
    features: [
      { text: 'Everything in Starter' },
      { text: 'Teacher portal — notes, hours, staff feed, messages' },
      { text: 'Leads CRM — pipeline, tags, call notes, CSV export' },
      { text: 'Digital contracts with version history + signatures' },
      { text: 'School calendar with RSVP and reminders' },
      { text: 'Tour booking + info session pages' },
      { text: 'Admin messaging + full email audit log' },
    ],
    cta: 'Book a Demo',
    featured: true,
  },
  {
    name: 'Academy Stack',
    tagline: 'For established schools with a full team.',
    scale: '60–100+ students · Full team',
    features: [
      { text: 'Everything in Growth' },
      { text: 'Budget & finance module with receipt uploads' },
      { text: 'Mercury bank sync' },
      { text: 'Pending payment requests by student' },
      { text: 'Advanced enrollment + roster reporting' },
      { text: 'Real-time Discord admin notifications' },
      { text: 'Parent portal impersonation for troubleshooting' },
    ],
    cta: 'Book a Demo',
  },
]

export default function StacksSection() {
  return (
    <section id="pricing" className="bg-bg py-24">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">

        {/* Heading */}
        <div className="text-center max-w-[560px] mx-auto mb-12">
          <FadeInView>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05] text-text">
              Start lean.
              <br />Grow as your school grows.
            </h2>
          </FadeInView>
          <FadeInView delay={0.08}>
            <p className="text-[16px] text-text-muted mt-4 leading-relaxed">
              Every stack ships with setup, your branded domain,
              and ongoing support. Add custom workflows anytime.
            </p>
          </FadeInView>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {STACKS.map((stack, i) => (
            <FadeInView key={stack.name} delay={i * 0.08}>
              <div
                className={`relative rounded-xl p-8 h-full flex flex-col ${
                  stack.featured
                    ? 'bg-surface border-2 border-accent shadow-md md:-mt-4'
                    : 'bg-surface border border-border shadow-xs'
                }`}
              >
                {stack.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-medium rounded-pill px-4 py-1 whitespace-nowrap">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-medium text-text-faint uppercase tracking-widest">
                    {stack.name}
                  </div>
                  <p className="text-[14px] text-text-muted mt-2 leading-snug">{stack.tagline}</p>
                  <div className="text-[12px] text-text-faint mt-1">{stack.scale}</div>
                </div>

                <div className="border-t border-border my-6" />

                <ul className="space-y-3 flex-1">
                  {stack.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-[6px] shrink-0 ${
                          f.text === 'Everything in Starter' || f.text === 'Everything in Growth'
                            ? 'bg-text-faint'
                            : 'bg-accent'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          f.text === 'Everything in Starter' || f.text === 'Everything in Growth'
                            ? 'text-text-faint italic'
                            : 'text-text-muted'
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <a
                    href="#demo"
                    className={`flex items-center justify-center gap-2 rounded-pill h-11 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      stack.featured
                        ? 'bg-accent text-white hover:bg-accent-hover shadow-xs'
                        : 'border border-border text-text hover:bg-surface-muted hover:border-border-strong'
                    }`}
                  >
                    {stack.cta}
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <path d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>

        {/* Custom footer */}
        <FadeInView delay={0.2}>
          <p className="text-center text-[15px] text-text-muted mt-10">
            Need something custom? Every stack can be extended.{' '}
            <a href="#custom" className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors">
              See Custom Stack →
            </a>
          </p>
        </FadeInView>

      </div>
    </section>
  )
}
