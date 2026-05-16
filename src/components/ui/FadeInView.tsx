'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
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
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If the element is already in (or above) the viewport at mount time —
    // which happens on back-navigation with scroll position restoration —
    // show it immediately instead of waiting for the IO to fire.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
