import { ArrowRight } from 'lucide-react'
import { FadeInView } from '@/components/ui/FadeInView'

const TAKEAWAYS = [
  {
    number: '01',
    headline: 'Launch with a real public-facing school presence.',
    body: 'Not just an internal system — a website, program pages, tuition, team, and enrollment pathway that families can trust before they ever walk through the door.',
  },
  {
    number: '02',
    headline: 'Support tuition, enrollment, and communication the way families expect.',
    body: 'Parents can see their account, receive updates, and stay informed without chasing emails. Enrollment is a pathway, not a form.',
  },
  {
    number: '03',
    headline: 'Give teachers and administrators a shared operating system.',
    body: 'No more fragmented tools. Staff have one workspace. Admins have one dashboard. Everyone sees the same school.',
  },
  {
    number: '04',
    headline: 'Start lean and grow without rebuilding your stack.',
    body: 'Sage Field launched from zero and scaled to 25 students without switching platforms. The system grew with the school.',
  },
]

export default function SagefieldBuyerRelevance() {
  return (
    <section className="bg-bg-alt py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="max-w-[620px] mb-14">
          <FadeInView>
            <p className="text-[11px] font-secondary font-semibold uppercase tracking-widest text-text-faint mb-5">
              What prospects should notice
            </p>
          </FadeInView>
          <FadeInView delay={0.06}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text">
              What this means{' '}
              <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                for your school.
              </em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.12}>
            <p className="text-[16px] font-secondary text-text-muted leading-relaxed mt-4">
              Sage Field&apos;s story isn&apos;t just about one school. It&apos;s a model
              for what&apos;s possible when a microschool launches with operational
              infrastructure that actually matches how the school runs.
            </p>
          </FadeInView>
        </div>

        {/* Takeaways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {TAKEAWAYS.map(({ number, headline, body }, i) => (
            <FadeInView key={number} delay={0.06 + i * 0.08}>
              <div className="bg-surface rounded-2xl border border-border p-7 h-full">
                <span className="text-[11px] font-mono font-semibold text-text-faint">
                  {number}
                </span>
                <h3 className="font-display text-[1.05rem] text-text font-medium leading-snug mt-3 mb-3">
                  {headline}
                </h3>
                <p className="text-[14px] font-secondary text-text-muted leading-relaxed">
                  {body}
                </p>
              </div>
            </FadeInView>
          ))}
        </div>

        {/* Final CTA block */}
        <FadeInView delay={0.14}>
          <div
            id="demo"
            className="rounded-2xl bg-accent p-10 text-center"
          >
            <h2
              className="font-display text-[clamp(1.7rem,3.2vw,2.4rem)] leading-[1.06]"
              style={{ color: '#F7F1E7' }}
            >
              Ready to launch like{' '}
              <em style={{ color: '#E8D5C8', fontStyle: 'italic' }}>
                Sage Field?
              </em>
            </h2>
            <p
              className="text-[16px] font-secondary leading-relaxed mt-4 max-w-[480px] mx-auto"
              style={{ color: 'rgba(247,241,231,0.7)' }}
            >
              See how the platform can support your microschool from website
              to daily operations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-pill px-8 h-12 text-sm font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200"
                style={{ backgroundColor: '#A05C45', color: '#ffffff' }}
              >
                Book a demo
                <ArrowRight size={14} />
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium font-secondary hover:opacity-90 transition-opacity duration-200"
                style={{ color: 'rgba(247,241,231,0.65)' }}
              >
                Explore the platform
              </a>
            </div>
            <p
              className="text-[13px] font-secondary mt-5"
              style={{ color: 'rgba(247,241,231,0.4)' }}
            >
              No commitment. No sales pressure. Just a conversation.
            </p>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
