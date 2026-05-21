'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'
import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useHydrated } from '@/hooks/useHydrated'

interface InViewDemoGateProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function InViewDemoGate({ children, className = '', style }: InViewDemoGateProps) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const [forceShow, setForceShow] = useState(false)
  const [ref, inView] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    rootMargin: '200px 0px 200px 0px',
    resetKey: pathname,
  })

  useEffect(() => {
    if (!hydrated) return

    const timeoutId = window.setTimeout(() => {
      setForceShow(true)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [pathname, hydrated])

  const show = hydrated && (inView || forceShow)

  return (
    <div ref={ref} className={className} style={style}>
      {show ? children : <DemoSkeleton className="rounded-2xl border border-gray-200" />}
    </div>
  )
}
