'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { FadeInView } from '@/components/ui/FadeInView'
import { Badge } from '@/components/ui/Badge'
import { InViewDemoGate } from '@/components/ui/InViewDemoGate'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'

const SITE_URL = 'https://www.sagefield.co/'
const LOAD_TIMEOUT_MS = 8000
const DESIGN_WIDTH = 1440
const PREVIEW_HEIGHT = 720

function LiveWebsiteFrame() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.75)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!loaded) setFailed(true)
    }, LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [loaded])

  if (failed) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-5 px-6 text-center"
        style={{ height: PREVIEW_HEIGHT, backgroundColor: '#FFF9F5' }}
      >
        <Image
          src="/images/SageFieldLogo.png"
          alt="Sage Field logo"
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
        />
        <div>
          <p className="font-secondary font-semibold text-text text-[15px]">
            Preview unavailable in this frame
          </p>
          <p className="text-[13px] font-secondary text-text-muted mt-1.5 max-w-[320px]">
            Visit Sage Field&apos;s live site to explore programs, tuition, team, and enrollment.
          </p>
        </div>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-pill px-6 h-11 text-sm font-medium font-secondary hover:-translate-y-0.5 transition-all duration-200"
          style={{ backgroundColor: '#f29a8f', color: '#ffffff' }}
        >
          Visit sagefield.co
          <ExternalLink size={14} />
        </a>
      </div>
    )
  }

  return (
    <div
      ref={outerRef}
      className="relative overflow-hidden"
      style={{ height: PREVIEW_HEIGHT }}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <DemoSkeleton className="rounded-none border-0 h-full" />
        </div>
      )}
      <div
        style={{
          width: DESIGN_WIDTH,
          height: scale > 0 ? PREVIEW_HEIGHT / scale : PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <iframe
          src={SITE_URL}
          title="Sage Field website"
          loading="lazy"
          className="w-full h-full border-0"
          style={{ backgroundColor: '#FFF9F5' }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

export default function SagefieldLiveWebsite() {
  return (
    <section id="live-site" className="bg-bg py-28">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
        <div className="max-w-[640px]">
          <FadeInView>
            <Badge>See it live</Badge>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="font-display text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.07] text-text mt-5">
              The site families visit{' '}
              <em style={{ color: '#A05C45', fontStyle: 'italic' }}>
                today.
              </em>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="text-[16px] font-secondary text-text-muted leading-relaxed mt-4">
              Programs, tuition, team profiles, and enrollment pathways are all
              published on{' '}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover underline underline-offset-2 transition-colors duration-150"
              >
                sagefield.co
              </a>
              — the same public surface families used during Sage Field&apos;s launch.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.18}>
          <div className="mt-10 rounded-2xl border border-border overflow-hidden bg-surface shadow-lg">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-alt">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              </div>
              <div
                className="flex-1 min-w-0 rounded-md px-3 py-1 text-[12px] font-mono text-text-faint truncate"
                style={{ backgroundColor: '#FFF9F5' }}
              >
                sagefield.co
              </div>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-secondary font-medium text-accent hover:text-accent-hover transition-colors duration-150"
              >
                Open in new tab
                <ArrowRight size={12} />
              </a>
            </div>

            <InViewDemoGate>
              <LiveWebsiteFrame />
            </InViewDemoGate>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
