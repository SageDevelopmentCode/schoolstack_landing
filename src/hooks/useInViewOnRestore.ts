'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { isNavigationRestored, shouldSkipEntranceAnimation } from '@/lib/navigationRestore'

interface UseInViewOnRestoreOptions {
  threshold?: number
  rootMargin?: string
  resetKey?: string
}

function hasViewportOverlap(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

export function useInViewOnRestore<T extends Element = HTMLElement>(
  options: UseInViewOnRestoreOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = '0px', resetKey } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(
    () => isNavigationRestored() || shouldSkipEntranceAnimation(),
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let observer: IntersectionObserver | null = null
    let scrollListenerActive = false
    const timeoutIds: number[] = []

    const cleanupScroll = () => {
      if (scrollListenerActive) {
        window.removeEventListener('scroll', onScroll, true)
        scrollListenerActive = false
      }
    }

    const markInView = () => {
      setInView(true)
      observer?.disconnect()
      observer = null
      cleanupScroll()
      timeoutIds.forEach((id) => clearTimeout(id))
      timeoutIds.length = 0
    }

    const checkInView = () => {
      const current = ref.current
      if (!current) return false
      if (hasViewportOverlap(current)) {
        markInView()
        return true
      }
      return false
    }

    const onScroll = () => {
      checkInView()
    }

    const scheduleChecks = () => {
      checkInView()
      for (const delay of [0, 50, 100, 250, 500, 1000]) {
        timeoutIds.push(
          window.setTimeout(() => {
            checkInView()
          }, delay),
        )
      }
    }

    const onRestore = () => {
      scheduleChecks()
    }

    if (checkInView()) {
      return () => {
        timeoutIds.forEach((id) => clearTimeout(id))
      }
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markInView()
      },
      { threshold, rootMargin },
    )
    observer.observe(el)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkInView()
      })
    })

    scheduleChecks()

    window.addEventListener('pageshow', onRestore)
    window.addEventListener('popstate', onRestore)
    window.addEventListener('hashchange', onRestore)
    window.addEventListener('scroll', onScroll, true)
    scrollListenerActive = true

    return () => {
      observer?.disconnect()
      timeoutIds.forEach((id) => clearTimeout(id))
      window.removeEventListener('pageshow', onRestore)
      window.removeEventListener('popstate', onRestore)
      window.removeEventListener('hashchange', onRestore)
      cleanupScroll()
    }
  }, [threshold, rootMargin, resetKey])

  return [ref, inView]
}
