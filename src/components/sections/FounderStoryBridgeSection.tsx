import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'
import { FileText, Users, Heart, Camera, AlertTriangle, CreditCard, Check, ChevronRight, ShieldCheck, Pill } from 'lucide-react'

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
                disconnected tools. SchoolLayer started as the internal solution to
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
                <EnrollmentProgressSnippet />
              </div>

              {/* Founder quote card */}
              <div className="absolute bottom-14 right-0 w-[212px] bg-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(5,36,21,0.11)] border border-black/[0.05]">
                <p className="font-display text-[13.5px] text-[#0f1f18] leading-[1.45] mb-4">
                  &ldquo;Built because we needed it every single day.&rdquo;
                </p>
                <div className="flex items-center gap-2.5 pt-3.5 border-t border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-[#284a3d] flex items-center justify-center text-white text-[10px] font-semibold shrink-0 tracking-tight">
                    SO
                  </div>
                  <div>
                    <p className="text-[11.5px] font-semibold text-gray-800 leading-tight">Sabrina Obnamia</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Co-Founder, Sage Field</p>
                  </div>
                </div>
              </div>

              {/* School identity card */}
              <div className="absolute bottom-0 left-3 w-[186px] bg-[#1c3829] rounded-2xl p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white/80 text-[9px] font-bold tracking-tight">SF</span>
                  </div>
                  <span className="text-white/90 text-[12px] font-semibold tracking-tight">Sage Field</span>
                </div>
                <div className="space-y-2">
                  {['Real school.', 'Real families.', 'Real operations.'].map((fact) => (
                    <div key={fact} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                      <p className="text-white/70 text-[12px] leading-tight">{fact}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <p className="text-white/35 text-[10px]">Austin, Texas · Est. 2022</p>
                </div>
              </div>
            </div>
          </FadeInView>

        </div>
      </div>
    </section>
  )
}

const SNIPPET_ITEMS = [
  { label: 'Program Description & Key Policies', Icon: FileText, done: true, optional: false },
  { label: 'Community Agreement', Icon: Users, done: true, optional: false },
  { label: 'Emergency Contact, Health & Immunization Form', Icon: Heart, done: false, optional: false },
  { label: 'Emergency Medication Plan', Icon: Pill, done: false, optional: true },
  { label: 'Proof of Immunizations', Icon: ShieldCheck, done: true, optional: false },
  { label: 'Photo Release Form', Icon: Camera, done: false, optional: false },
  { label: 'Assumption of Risk', Icon: AlertTriangle, done: true, optional: false },
  { label: 'Pay Registration Fee', Icon: CreditCard, done: false, optional: false },
]

function EnrollmentProgressSnippet() {
  const required = SNIPPET_ITEMS.filter((i) => !i.optional)
  const doneCount = required.filter((i) => i.done).length
  const pct = Math.round((doneCount / required.length) * 100)

  return (
    <div className="p-3 h-full flex flex-col gap-2.5 overflow-hidden">
      {/* Progress card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold text-gray-700">Enrollment Progress</p>
          <span className="text-[12px] text-gray-400">{doneCount} / {required.length} required</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#4a7c59] rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Checklist card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
        {SNIPPET_ITEMS.map(({ label, Icon, done, optional }, idx) => (
          <div
            key={label}
            className={`flex items-center gap-3.5 px-5 py-3.5 ${idx < SNIPPET_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              {done
                ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                : <Icon className="w-4 h-4 text-gray-400" strokeWidth={2} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-medium truncate ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {label}
              </p>
              {optional && <span className="text-[10.5px] text-gray-400">Optional</span>}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
