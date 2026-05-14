import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import { Badge } from '@/components/ui/Badge'
import { FadeInView } from '@/components/ui/FadeInView'
import { MapPin, TrendingUp, Users, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Customer Stories — MudKitchen',
  description:
    'See how real microschools launched and grew using MudKitchen to power their website, enrollment, tuition, and daily operations.',
}

const STORIES = [
  {
    name: 'Sage Field',
    location: 'Round Rock, TX',
    tagline: 'Outdoor-focused private microschool',
    ages: 'Ages 4–11',
    result: '0 → 25 students in < 3 months',
    description:
      'Sage Field launched with a full public-facing school presence, enrollment pathways, tuition setup, staff workflows, and parent communication — all from one platform before the first student enrolled.',
    tags: ['Website', 'Enrollment', 'Tuition', 'Operations', 'Parent portal'],
    href: '/customers/sagefield',
  },
]

export default function CustomersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Hero */}
        <section className="pt-[140px] pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <FadeInView>
              <Badge>Customer stories</Badge>
            </FadeInView>
            <FadeInView delay={0.08}>
              <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[640px]">
                Real microschools.{' '}
                <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                  Real results.
                </em>
              </h1>
            </FadeInView>
            <FadeInView delay={0.14}>
              <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-5 max-w-[520px]">
                These aren&apos;t case studies about pilots or prototypes. Every
                story here is a school that launched, enrolled students, and
                runs daily operations on MudKitchen.
              </p>
            </FadeInView>
          </div>
        </section>

        {/* Stories grid */}
        <section className="pb-32">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STORIES.map((story, i) => (
                <FadeInView key={story.href} delay={i * 0.06}>
                  <a
                    href={story.href}
                    className="group flex flex-col h-full rounded-2xl border border-border bg-surface hover:-translate-y-1 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Placeholder image area */}
                    <div
                      className="flex items-center justify-center h-[180px] border-b border-border"
                      style={{ backgroundColor: '#EDE0CE' }}
                    >
                      <div className="text-center px-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-2">
                          <Users size={18} className="text-accent" />
                        </div>
                        <p className="text-[11px] font-secondary text-text-faint">
                          [School photo placeholder]
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-6">
                      {/* School name + location */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="font-display text-[1.2rem] text-text font-medium leading-snug">
                          {story.name}
                        </h2>
                        <span className="flex items-center gap-1 text-[11px] font-secondary text-text-faint shrink-0 mt-1">
                          <MapPin size={10} />
                          {story.location}
                        </span>
                      </div>

                      <p className="text-[13px] font-secondary text-text-faint mb-1">
                        {story.tagline} · {story.ages}
                      </p>

                      <p className="text-[14px] font-secondary text-text-muted leading-relaxed mt-3 flex-1">
                        {story.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {story.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-secondary bg-bg-alt border border-border text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Result + CTA */}
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[12px] font-secondary font-medium text-accent">
                          <TrendingUp size={12} />
                          {story.result}
                        </span>
                        <span className="text-[12px] font-secondary text-text-faint group-hover:text-accent transition-colors duration-150 flex items-center gap-1">
                          Read the story
                          <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </a>
                </FadeInView>
              ))}

              {/* Coming soon placeholder card */}
              <FadeInView delay={0.06}>
                <div className="flex flex-col h-full rounded-2xl border border-dashed border-border bg-bg-alt items-center justify-center p-8 text-center min-h-[340px]">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                    <Users size={18} className="text-text-faint" />
                  </div>
                  <p className="text-[14px] font-secondary font-medium text-text-muted">
                    More stories coming soon
                  </p>
                  <p className="text-[12px] font-secondary text-text-faint mt-1.5 max-w-[180px] leading-relaxed">
                    New customer stories added as schools go live.
                  </p>
                </div>
              </FadeInView>
            </div>

            {/* Bottom CTA */}
            <FadeInView delay={0.12}>
              <div className="mt-20 rounded-2xl bg-accent p-10 text-center">
                <h2
                  className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.06]"
                  style={{ color: '#F7F1E7' }}
                >
                  Want your school to be next?
                </h2>
                <p
                  className="text-[16px] font-secondary leading-relaxed mt-3 max-w-[440px] mx-auto"
                  style={{ color: 'rgba(247,241,231,0.7)' }}
                >
                  Book a demo and see how MudKitchen can support your launch
                  from website to daily operations.
                </p>
                <a
                  href="/#demo"
                  className="inline-flex items-center gap-2 rounded-pill px-8 h-12 text-sm font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200 mt-7"
                  style={{ backgroundColor: '#A05C45', color: '#ffffff' }}
                >
                  Book a demo
                  <ArrowRight size={14} />
                </a>
              </div>
            </FadeInView>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
