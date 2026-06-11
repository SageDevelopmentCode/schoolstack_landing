'use client'

import { useState, useEffect, type RefObject } from 'react'

export function useMobileDemoScale(
  ref: RefObject<HTMLDivElement | null>,
  designWidth: number,
  visibleFraction = 0.75,
) {
  const [scale, setScale] = useState(0.47)
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const onChange = () => setIsMobileLayout(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !isMobileLayout) return

    const update = () => {
      const width = el.offsetWidth
      if (width <= 0) return
      setScale(width / (designWidth * visibleFraction))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, isMobileLayout, designWidth, visibleFraction])

  return { scale, isMobileLayout }
}
