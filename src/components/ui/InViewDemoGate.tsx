'use client'

import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useHydrated } from '@/hooks/useHydrated'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'

interface InViewDemoGateProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function InViewDemoGate({ children, className = '', style }: InViewDemoGateProps) {
  const hydrated = useHydrated()
  const { skip } = useEntranceAnimation()
  const [ref, inView] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    rootMargin: '200px 0px 200px 0px',
  })

  const show = hydrated && (inView || skip)

  return (
    <div ref={ref} className={className} style={style}>
      {show ? children : <DemoSkeleton className="rounded-2xl border border-gray-200" />}
    </div>
  )
}
