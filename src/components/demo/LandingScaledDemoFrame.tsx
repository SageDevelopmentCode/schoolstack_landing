'use client'

import { InViewDemoGate } from '@/components/ui/InViewDemoGate'

export const LANDING_DEMO_VISIBLE_HEIGHT = 430
export const LANDING_DEMO_SCALE = 0.72

interface LandingScaledDemoFrameProps {
  children: React.ReactNode
  className?: string
  gate?: boolean
  preventHorizontalScroll?: boolean
}

export function LandingScaledDemoFrame({
  children,
  className = '',
  gate = true,
  preventHorizontalScroll = false,
}: LandingScaledDemoFrameProps) {
  const scrollLockClass = preventHorizontalScroll
    ? 'overflow-x-hidden overscroll-x-none touch-pan-y'
    : ''

  const scaledShell = (
    <div
      className={`absolute top-0 left-0 w-[1100px] lg:w-[calc(100%/0.72)] rounded-2xl border border-border shadow-lg overflow-y-auto overflow-x-hidden ${scrollLockClass}`}
      style={{
        height: `calc(${LANDING_DEMO_VISIBLE_HEIGHT}px / ${LANDING_DEMO_SCALE})`,
        transform: `scale(${LANDING_DEMO_SCALE})`,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
  )

  const outerClassName = `relative w-full ${scrollLockClass} ${className}`

  if (!gate) {
    return (
      <div
        className={outerClassName}
        style={{ height: `${LANDING_DEMO_VISIBLE_HEIGHT}px` }}
      >
        {scaledShell}
      </div>
    )
  }

  return (
    <InViewDemoGate
      className={outerClassName}
      style={{ height: `${LANDING_DEMO_VISIBLE_HEIGHT}px` }}
    >
      {scaledShell}
    </InViewDemoGate>
  )
}
