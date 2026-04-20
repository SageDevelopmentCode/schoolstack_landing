import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'

export default function ProofSection() {
  return (
    <section className="bg-bg-alt py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-center">

          {/* Left — story + quote */}
          <div>
            <FadeInView>
              <Badge>Built at a real school</Badge>
            </FadeInView>

            <FadeInView delay={0.08}>
              <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.05] text-text mt-5">
                The founder story
                <br />is the product story.
              </h2>
            </FadeInView>

            <FadeInView delay={0.16}>
              <p className="text-[16px] text-text-muted leading-relaxed mt-5">
                SchoolLayer was not imagined in a coworking space or assembled from
                generic SaaS ideas. It was built to run Sage Field, a real microschool
                in Texas, because the existing software options did not fit the way a
                microschool actually operates. Every major module exists because it
                solved an actual operational bottleneck inside the school.
              </p>
            </FadeInView>

            {/* Pull quote — refined, no left border rail */}
            <FadeInView delay={0.22}>
              <blockquote className="bg-surface-muted border border-border-strong rounded-lg p-6 mt-7">
                <div className="w-2 h-2 rounded-full bg-accent mb-4" aria-hidden="true" />
                <p className="font-display text-[1.05rem] italic text-text leading-relaxed">
                  &ldquo;We were running a real school through too many disconnected tools,
                  so we built the system we wished existed. Once it worked for us,
                  it became obvious other founders needed it too.&rdquo;
                </p>
                <footer className="text-sm text-text-faint mt-4">
                  — Julius Cecilia, Founder, SchoolLayer &amp; Sage Field
                </footer>
              </blockquote>
            </FadeInView>

            <FadeInView delay={0.28}>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors mt-6"
              >
                See the school
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2 6.5H11M11 6.5L7 2.5M11 6.5L7 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </FadeInView>
          </div>

          {/* Right — casually stacked screenshot collage */}
          <FadeInView delay={0.12}>
            <div className="relative h-[440px] lg:h-[500px]">

              {/* Card 1 — back */}
              <div className="absolute top-0 right-8 left-0 h-[300px] rounded-xl bg-surface border border-border shadow-xs overflow-hidden"
                style={{ transform: 'rotate(-1.5deg)', transformOrigin: 'center center' }}>
                <ProofSnippetPayments />
              </div>

              {/* Card 2 — mid */}
              <div className="absolute top-8 right-4 left-4 h-[300px] rounded-xl bg-surface border border-border shadow-md overflow-hidden"
                style={{ transform: 'rotate(1deg)', transformOrigin: 'center center' }}>
                <ProofSnippetAdmin />
              </div>

              {/* Card 3 — front */}
              <div className="absolute top-16 right-0 left-8 h-[300px] rounded-xl bg-surface border border-border-strong shadow-lg overflow-hidden">
                <ProofSnippetParents />
              </div>

            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  )
}

function ProofSnippetPayments() {
  return (
    <div className="p-4 h-full text-[10px]">
      <div className="text-[11px] font-semibold text-text font-body mb-2">Transactions</div>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {[
          ['Emma Johnson', 'Fall Tuition', '$650', 'Paid'],
          ['Liam Torres', 'Reg. Fee', '$150', 'Paid'],
          ['Sofia Chen', 'Aftercare', '$280', 'Paid'],
          ['Noah Park', 'Fall Tuition', '$650', 'Pending'],
        ].map(([name, type, amt, status]) => (
          <div key={name} className="flex items-center px-3 py-2 border-b border-border last:border-0 gap-2">
            <div className="flex-1 font-medium text-text">{name}</div>
            <div className="text-text-faint hidden sm:block">{type}</div>
            <div className="font-medium text-text w-12 text-right">{amt}</div>
            <span className={`text-[9px] rounded-pill px-1.5 py-0.5 ${status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProofSnippetAdmin() {
  return (
    <div className="p-4 h-full text-[10px]">
      <div className="text-[11px] font-semibold text-text font-body mb-2">Applications Pipeline</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { title: 'New', count: 4, color: 'bg-blue-50 text-blue-600' },
          { title: 'Reviewing', count: 5, color: 'bg-yellow-50 text-yellow-700' },
          { title: 'Enrolled', count: 3, color: 'bg-green-50 text-green-700' },
        ].map((col) => (
          <div key={col.title} className="bg-surface-soft rounded-md p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-text-faint">{col.title}</span>
              <span className={`text-[9px] rounded-pill px-1 py-0.5 ${col.color}`}>{col.count}</span>
            </div>
            {Array.from({ length: Math.min(col.count, 2) }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded p-1.5 mb-1 text-[9px] text-text-muted">
                <div className="font-medium text-text">Student {i + 1}</div>
                <span className="bg-accent-soft text-accent rounded-pill px-1 py-0.5">Elementary</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProofSnippetParents() {
  return (
    <div className="p-4 h-full text-[10px]">
      <div className="text-[11px] font-semibold text-text font-body mb-2">Parent Portal — Enrollment Checklist</div>
      <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
        {[
          { label: 'Application submitted', done: true },
          { label: 'Health form completed', done: true },
          { label: 'Emergency contacts added', done: true },
          { label: 'Contract signed', done: false },
          { label: 'First tuition payment', done: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[8px] ${item.done ? 'bg-accent text-white' : 'border border-border'}`}>
              {item.done && '✓'}
            </div>
            <span className={item.done ? 'text-text' : 'text-text-muted'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
