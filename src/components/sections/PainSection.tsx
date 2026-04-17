'use client'

import { motion } from 'framer-motion'
import { FadeInView } from '@/components/ui/FadeInView'

// SVG coordinate space: 1000 × 520, center at (500, 260)
const W = 1000
const H = 520

// Center card bounds in SVG space (centered at 500, 260)
const CARD = { l: 338, t: 146, w: 324, h: 228 }

// 10 pairs — outer = third-party tool, inner = School Stack feature at same angle
// Outer ring: rx=382, ry=186 | Inner ring: rx=105, ry=75 (inside the card)
const PAIRS = [
  { tool: 'Google Forms', feature: 'Enrollment',  outer: { x: 500, y: 74  }, inner: { x: 500, y: 185 }, delay: 0    },
  { tool: 'Venmo',        feature: 'Payments',    outer: { x: 725, y: 110 }, inner: { x: 562, y: 199 }, delay: 0.2  },
  { tool: 'Stripe',       feature: 'Billing',     outer: { x: 863, y: 203 }, inner: { x: 600, y: 237 }, delay: 0.4  },
  { tool: 'Gmail',        feature: 'Messaging',   outer: { x: 863, y: 317 }, inner: { x: 600, y: 283 }, delay: 0.6  },
  { tool: 'SignNow',      feature: 'Contracts',   outer: { x: 725, y: 410 }, inner: { x: 562, y: 321 }, delay: 0.8  },
  { tool: 'Calendly',     feature: 'Calendar',    outer: { x: 500, y: 446 }, inner: { x: 500, y: 335 }, delay: 1.0  },
  { tool: 'Dropbox',      feature: 'Files',       outer: { x: 275, y: 410 }, inner: { x: 438, y: 321 }, delay: 0.8  },
  { tool: 'Google Docs',  feature: 'Staff',       outer: { x: 137, y: 317 }, inner: { x: 400, y: 283 }, delay: 0.6  },
  { tool: 'Excel',        feature: 'Reports',     outer: { x: 137, y: 203 }, inner: { x: 400, y: 237 }, delay: 0.4  },
  { tool: 'Wix',          feature: 'Website',     outer: { x: 275, y: 110 }, inner: { x: 438, y: 199 }, delay: 0.2  },
]

export default function PainSection() {
  return (
    <section className="bg-bg-alt py-24 overflow-hidden">

      {/* Heading */}
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <FadeInView>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-text">
            Too big for spreadsheets.
            <br />Too small for enterprise.
          </h2>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p className="text-[17px] text-text-muted leading-relaxed mt-6 max-w-[58ch] mx-auto">
            That&apos;s where founders end up stitching together Google Forms,
            Venmo, Stripe, Gmail, PDFs, and notes just to keep the school moving.
            You built something special. The infrastructure should not be the part
            that holds it back.
          </p>
        </FadeInView>
      </div>

      {/* Hub visual — wider than the text */}
      <FadeInView delay={0.15}>
        <div className="mt-14 w-full max-w-[1200px] mx-auto px-4 md:px-8 select-none">
          <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>

            {/* SVG — connector lines only */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {PAIRS.map((p) => (
                <g key={p.tool}>
                  {/* Faint static line */}
                  <line
                    x1={p.outer.x} y1={p.outer.y}
                    x2={p.inner.x} y2={p.inner.y}
                    stroke="#244b46" strokeOpacity={0.1} strokeWidth={1}
                  />
                  {/* Flowing animated dots: tool → feature */}
                  <motion.line
                    x1={p.outer.x} y1={p.outer.y}
                    x2={p.inner.x} y2={p.inner.y}
                    stroke="#244b46"
                    strokeOpacity={0.45}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeDasharray="4 20"
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: p.delay }}
                  />
                </g>
              ))}
            </svg>

            {/* Outer tool pills */}
            {PAIRS.map((p) => (
              <div
                key={p.tool}
                className="absolute z-10"
                style={{
                  left: `${(p.outer.x / W) * 100}%`,
                  top: `${(p.outer.y / H) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.span
                  className="block rounded-pill bg-surface border border-border text-[9px] md:text-[11px] text-text-faint px-2 md:px-3 py-0.5 md:py-1.5 whitespace-nowrap shadow-xs"
                  animate={{ opacity: [0.55, 0.95, 0.55] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                >
                  {p.tool}
                </motion.span>
              </div>
            ))}

            {/* Center card: School Stack + surrounding feature labels */}
            <div
              className="absolute z-20"
              style={{
                left:   `${(CARD.l / W) * 100}%`,
                top:    `${(CARD.t / H) * 100}%`,
                width:  `${(CARD.w / W) * 100}%`,
                height: `${(CARD.h / H) * 100}%`,
              }}
            >
              {/* Card — transparent, layout only */}
              <div
                className="relative w-full h-full"
                style={{ overflow: 'visible' }}
              >
                {/* "School Stack" — absolute center of card */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="font-display text-[clamp(9px,1.3vw,16px)] text-accent whitespace-nowrap tracking-tight">
                      School Stack
                    </span>
                  </div>
                </div>

                {/* Feature labels arranged around "School Stack" inside the card */}
                {PAIRS.map((p) => {
                  const relX = ((p.inner.x - CARD.l) / CARD.w) * 100
                  const relY = ((p.inner.y - CARD.t) / CARD.h) * 100
                  return (
                    <div
                      key={p.feature}
                      className="absolute"
                      style={{
                        left: `${relX}%`,
                        top: `${relY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <motion.span
                        className="block rounded-pill bg-accent-soft border border-accent/30 text-[8px] md:text-[10px] lg:text-[11px] text-accent font-medium px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 whitespace-nowrap"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: p.delay + 0.7 }}
                      >
                        {p.feature}
                      </motion.span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </FadeInView>

    </section>
  )
}
