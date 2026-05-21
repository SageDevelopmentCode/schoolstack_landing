'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/lib/navigationRestore'

export default function NavigationRestoreInit() {
  const router = useRouter()

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh()
      }
    }

    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [router])

  return null
}
