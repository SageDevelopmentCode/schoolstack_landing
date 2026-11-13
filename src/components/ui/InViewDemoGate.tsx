'use client'

import { useEffect, useState } from 'react'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useHydrated } from '@/hooks/useHydrated'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import { scheduleAfterFirstPaint } from '@/lib/schedule-after-first-paint'

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

  useEffect(() => {
    if (ready) return

    let cancelIdle: (() => void) | undefined
    const onLoad = () => {
      cancelIdle = scheduleAfterFirstPaint(() => setIdleReady(true))
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      window.removeEventListener('load', onLoad)
      cancelIdle?.()
    }
  }, [ready])

  const engage = ready ? undefined : () => setIdleReady(true)
  const show = hydrated && (inView || skip) && (ready || skip)

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onPointerEnter={engage}
      onTouchStart={engage}
      onFocus={engage}
    >
      {show ? children : <DemoSkeleton className="rounded-2xl border border-gray-200" />}
    </div>
  )
}
