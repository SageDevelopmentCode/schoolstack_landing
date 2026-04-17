'use client'

import { motion } from 'framer-motion'
import { fadeUp, inViewProps } from '@/lib/motion'
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
  return (
    <motion.div
      {...inViewProps}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
