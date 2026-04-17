import { FadeInView } from '@/components/ui/FadeInView'

export default function FinalCTASection() {
  return (
    <section id="demo" className="bg-accent py-32">
      <div className="max-w-[720px] mx-auto px-6 text-center">

        <FadeInView>
          <h2
            className="font-display text-[clamp(2.2rem,4.5vw,3.5rem)] leading-[1.02]"
            style={{ color: '#f8f7f4' }}
          >
            Software built by someone
            <br />who gets it.
          </h2>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p
            className="text-[17px] leading-relaxed mt-6 max-w-[50ch] mx-auto"
            style={{ color: 'rgba(248,247,244,0.72)' }}
          >
            Book a free 30-minute demo and walk through your school with the
            founder who built School Stack to run a real microschool first.
          </p>
        </FadeInView>

        <FadeInView delay={0.18}>
          <div className="mt-10">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-pill px-8 h-12 text-sm font-medium hover:-translate-y-0.5 transition-all duration-200"
              style={{
                backgroundColor: '#f8f7f4',
                color: '#244b46',
              }}
            >
              Book a Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          <p
            className="text-sm mt-5"
            style={{ color: 'rgba(248,247,244,0.45)' }}
          >
            No commitment. No sales pressure. Just a conversation.
          </p>
        </FadeInView>

      </div>
    </section>
  )
}
