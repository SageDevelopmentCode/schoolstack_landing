'use client'

import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import SectionFallback from '@/components/ui/SectionFallback'

interface DeferredSectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minHeight?: string
}

export function DeferredSection({
  children,
  fallback,
  minHeight = '16rem',
}: DeferredSectionProps) {
  const { skip } = useEntranceAnimation()
  const [ref, inView] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    rootMargin: '200px 0px',
  })

  const show = skip || inView

  return (
    <div ref={ref}>
      {show ? children : (fallback ?? <SectionFallback minHeight={minHeight} />)}
    </div>
  )
}
