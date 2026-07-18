import Image from 'next/image'
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

const MOBILE_TAG_ROWS = [TAGS.slice(0, 6), TAGS.slice(6, 12)]

const tagPillClassName =
  'inline-flex shrink-0 items-center whitespace-nowrap px-4 py-2 rounded-pill border border-border bg-surface text-sm text-text-muted cursor-default hover:bg-accent-soft hover:text-accent hover:border-accent/30 transition-all duration-200'

function TagMarqueeRow({
  tags,
  direction,
  duration,
}: {
  tags: string[]
  direction: 'left' | 'right'
  duration: string
}) {
  const animationName =
    direction === 'left' ? 'custom-tag-marquee-left' : 'custom-tag-marquee-right'

  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max gap-2.5"
        style={{
          animation: `${animationName} ${duration} linear infinite`,
        }}
      >
        {[...tags, ...tags].map((tag, index) => (
          <span key={`${tag}-${index}`} className={tagPillClassName} aria-hidden={index >= tags.length}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CustomSection() {
  return (
    <section id="custom" className="py-24 max-lg:overflow-x-visible overflow-hidden" style={{ backgroundColor: '#F4F7F2' }}>
      <div className="relative max-w-[1280px] mx-auto px-6">

        {/* Decorative illustration — left */}
        <div className="absolute top-1/2 -translate-y-1/2 left-[-60px] xl:left-[-30px] z-0 pointer-events-none select-none hidden lg:block">
          <Image
            src="/images/illustrations/Plant.webp"
            alt=""
            aria-hidden="true"
            width={260}
            height={320}
            style={{ opacity: 0.75 }}
          />
        </div>

        {/* Decorative illustration — right */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[-60px] xl:right-[-30px] z-0 pointer-events-none select-none hidden lg:block">
          <Image
            src="/images/illustrations/Drawing2.webp"
            alt=""
            aria-hidden="true"
            width={260}
            height={320}
            style={{ opacity: 0.75 }}
          />
        </div>

      <div className="max-w-[860px] mx-auto px-6 text-center relative z-10">

        <FadeInView>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.05] text-text">
            Need something specific?
            <br /><em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>We build custom, too.</em>
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
          <style>{`
            @keyframes custom-tag-marquee-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes custom-tag-marquee-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `}</style>
          <div className="mt-10 flex flex-col gap-2.5 w-screen relative left-1/2 -translate-x-1/2 lg:hidden">
            <TagMarqueeRow tags={MOBILE_TAG_ROWS[0]} direction="left" duration="42s" />
            <TagMarqueeRow tags={MOBILE_TAG_ROWS[1]} direction="right" duration="48s" />
          </div>
          <div className="mt-10 hidden lg:flex flex-wrap justify-center gap-2.5">
            {TAGS.map((tag) => (
              <span key={tag} className={tagPillClassName}>
                {tag}
              </span>
            ))}
          </div>
        </FadeInView>

        <FadeInView delay={0.26}>
          <div className="mt-10">
            <a
              href="/get-started"
              className="inline-flex items-center gap-2 bg-accent text-white rounded-pill px-7 h-12 text-sm font-medium font-secondary hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            >
              Tell us what you need
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </FadeInView>

      </div>

      </div>
    </section>
  )
}
