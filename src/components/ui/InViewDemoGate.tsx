'use client'

import { startTransition, useEffect, useState } from 'react'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useHydrated } from '@/hooks/useHydrated'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import { scheduleAfterFirstPaint } from '@/lib/schedule-after-first-paint'

/**
 * Deferred demos wait at least this long after `load`, so their mount does not land inside
 * above-the-fold intro animations (the home hero's runs for about 1.9 s).
 */
const DEFER_MIN_MS = 2000

interface InViewDemoGateProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /**
   * Keep the skeleton until the page has loaded and the browser is idle (or the visitor
   * points at / focuses the demo). Use for above-the-fold demos so their large chunks do
   * not compete with first paint.
   */
  deferUntilIdle?: boolean
}

export function InViewDemoGate({
  children,
  className = '',
  style,
  deferUntilIdle = false,
}: InViewDemoGateProps) {
  const hydrated = useHydrated()
  const { skip } = useEntranceAnimation()
  const [ref, inView] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    rootMargin: '200px 0px 200px 0px',
  })
  const [idleReady, setIdleReady] = useState(!deferUntilIdle)
  const ready = idleReady || !deferUntilIdle
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (ready) return

    let delayId: number | undefined
    let cancelIdle: (() => void) | undefined
    const onLoad = () => {
      delayId = window.setTimeout(() => {
        cancelIdle = scheduleAfterFirstPaint(() => setIdleReady(true))
      }, DEFER_MIN_MS)
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      window.removeEventListener('load', onLoad)
      window.clearTimeout(delayId)
      cancelIdle?.()
    }
  }, [ready])

  const wantShow = hydrated && (inView || skip) && (ready || skip)

  useEffect(() => {
    if (!wantShow || mounted) return
    // Demos are large React trees. As a transition, React renders them in interruptible slices
    // (keeping the skeleton until ready), so GSAP reveals and Lenis scrolling keep their frames.
    startTransition(() => setMounted(true))
  }, [wantShow, mounted])

  const engage = ready ? undefined : () => setIdleReady(true)

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onPointerEnter={engage}
      onTouchStart={engage}
      onFocus={engage}
    >
      {mounted ? children :<DemoSkeleton className="rounded-2xl border border-gray-200" />}
    </div>
  )
}
