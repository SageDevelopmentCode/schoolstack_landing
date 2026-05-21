'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { useInViewOnRestore } from '@/hooks/useInViewOnRestore'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import type { Variants } from 'framer-motion'

interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  className?: string
  variants?: Variants
}

export function FadeInView({
  children,
  delay = 0,
  className,
  variants = fadeUp,
}: FadeInViewProps) {
  const pathname = usePathname()
  const { skip } = useEntranceAnimation()
  const [ref, entered] = useInViewOnRestore<HTMLDivElement>({
    threshold: 0,
    resetKey: pathname,
  })
  const visible = skip || entered

  return (
    <motion.div
      ref={ref}
      initial={skip ? false : 'hidden'}
      animate={visible ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
