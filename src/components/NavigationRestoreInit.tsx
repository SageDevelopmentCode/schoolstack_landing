'use client'

import { useEffect } from 'react'
import { shouldSkipEntranceAnimation } from '@/lib/navigationRestore'
import '@/lib/navigationRestore'

export default function NavigationRestoreInit() {
  useEffect(() => {
    if (shouldSkipEntranceAnimation()) {
      document.documentElement.dataset.skipEntrance = 'true'
    }
  }, [])

  return null
}
