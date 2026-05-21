'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'

interface InViewDemoGateProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function InViewDemoGate({ children, className = '', style }: InViewDemoGateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '200px 0px' })

  return (
    <div ref={ref} className={className} style={style}>
      {inView ? children : <DemoSkeleton className="rounded-2xl border border-border" />}
    </div>
  )
}
