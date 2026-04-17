import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

const BULLETS = [
  'Built inside Sage Field microschool in Texas',
  'Used in live school operations from day one',
  'Designed around founder workflows, not district bureaucracy',
  'Expanded into a product because the gap is shared across microschools',
]

export default function FounderStoryBridgeSection() {
  return (
    <section id="about" className="bg-bg py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left — story */}
          <div>
            <FadeInView>
              <Badge>Why this exists</Badge>
            </FadeInView>

            <FadeInView delay={0.08}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.05] text-text mt-5">
                Running a microschool exposed
                <br />everything regular software misses.
              </h2>
            </FadeInView>

            <FadeInView delay={0.16}>
              <p className="text-[16px] text-text-muted leading-relaxed mt-5 max-w-[52ch]">
                Sage Field had a real school to run, but no single system that fit the
                way a microschool actually operates. Enrollment, contracts, parent
                communication, payments, and internal workflows were all spread across
                disconnected tools. School Stack started as the internal solution to
                that problem, then became the product other founders needed too.
              </p>
            </FadeInView>

            <FadeInView delay={0.24}>
              <ul className="mt-7 space-y-3.5">
                {BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-[7px] shrink-0" aria-hidden="true" />
                    <span className="text-sm text-text-muted leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </FadeInView>
          </div>

          {/* Right — editorial collage */}
          <FadeInView delay={0.12}>
            <div className="relative h-[440px] lg:h-[480px]">

              {/* Product frame (background) */}
              <div className="absolute inset-0 right-10 bottom-20 rounded-xl bg-surface border border-border shadow-md overflow-hidden">
                <CollageProductSnippet />
              </div>

              {/* Founder note card */}
              <div className="absolute bottom-14 right-0 w-[200px] bg-surface border border-border rounded-lg p-4 shadow-md">
                <div className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <p className="font-display text-[14px] text-text italic leading-snug">
                  &ldquo;Built because we needed it every single day.&rdquo;
                </p>
                <p className="font-handwritten text-[13px] text-text-faint mt-2">
                  — Julius Cecilia, Founder
                </p>
              </div>

              {/* School facts card */}
              <div className="absolute bottom-0 left-3 w-[186px] bg-accent-soft border border-accent/20 rounded-lg p-4">
                <p className="text-[11px] font-medium text-accent uppercase tracking-widest mb-2">Sage Field</p>
                <div className="space-y-1">
                  {['Real school.', 'Real families.', 'Real operations.'].map((fact) => (
                    <p key={fact} className="text-[12px] text-accent/80">{fact}</p>
                  ))}
                </div>
              </div>
            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  )
}

function CollageProductSnippet() {
  return (
    <div className="p-5 h-full text-[10px]">
      <div className="text-[11px] font-semibold text-text font-body mb-3">Enrollment Pipeline</div>
      <div className="space-y-2">
        {[
          { step: '1', label: 'Child Information', status: 'done' },
          { step: '2', label: 'Parent / Guardian', status: 'done' },
          { step: '3', label: 'Health & Medical', status: 'active' },
          { step: '4', label: 'Emergency Contacts', status: 'pending' },
          { step: '5', label: 'Signatures & Agreements', status: 'pending' },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-2.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                s.status === 'done'
                  ? 'bg-accent text-white'
                  : s.status === 'active'
                  ? 'bg-accent-soft text-accent border border-accent'
                  : 'bg-surface-muted text-text-faint border border-border'
              }`}
            >
              {s.status === 'done' ? '✓' : s.step}
            </div>
            <span className={`text-[11px] ${s.status === 'pending' ? 'text-text-faint' : 'text-text'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 p-3 bg-surface-muted rounded-lg border border-border">
        <div className="text-[10px] text-text-faint mb-2">Current step: Health Information</div>
        <div className="space-y-2">
          <div className="h-7 bg-surface border border-border rounded-md" />
          <div className="h-7 bg-surface border border-border rounded-md" />
          <div className="h-7 bg-surface border border-border rounded-md w-2/3" />
        </div>
      </div>
    </div>
  )
}
