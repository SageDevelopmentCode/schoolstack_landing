'use client'

import { InViewDemoGate } from '@/components/ui/InViewDemoGate'

export const LANDING_DEMO_VISIBLE_HEIGHT = 430
export const LANDING_DEMO_SCALE = 0.72

interface LandingScaledDemoFrameProps {
  children: React.ReactNode
  className?: string
  gate?: boolean
  preventHorizontalScroll?: boolean
  /** Below `lg`, anchor the scaled demo to the right instead of the left. */
  mobileAlign?: 'left' | 'right'
  visibleHeight?: number
  scale?: number
}

export function LandingScaledDemoFrame({
  children,
  className = '',
  gate = true,
  preventHorizontalScroll = false,
  mobileAlign = 'left',
  visibleHeight = LANDING_DEMO_VISIBLE_HEIGHT,
  scale = LANDING_DEMO_SCALE,
}: LandingScaledDemoFrameProps) {
  const scrollLockClass = preventHorizontalScroll
    ? 'overflow-x-hidden overscroll-x-none touch-pan-y'
    : ''

  const horizontalAnchorClass =
    mobileAlign === 'right'
      ? 'right-0 left-auto origin-top-right lg:left-0 lg:right-auto lg:origin-top-left'
      : 'left-0 origin-top-left'

  const scaledShell = (
    <div
      className={`absolute top-0 w-[1100px] lg:w-[calc(100%/0.72)] rounded-2xl border border-border shadow-lg overflow-y-auto overflow-x-hidden ${horizontalAnchorClass} ${scrollLockClass}`}
      style={{
        height: `calc(${visibleHeight}px / ${scale})`,
        transform: `scale(${scale})`,
        ...(scale !== LANDING_DEMO_SCALE
          ? { width: `calc(1100px / ${scale})`, maxWidth: "100%" }
          : {}),
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
        style={{ height: `${visibleHeight}px` }}
      >
        {scaledShell}
      </div>
    )
  }

  return (
    <InViewDemoGate
      className={outerClassName}
      style={{ height: `${visibleHeight}px` }}
    >
      {scaledShell}
    </InViewDemoGate>
  )
}
