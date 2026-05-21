'use client'

import { shouldSkipEntranceAnimation } from '@/lib/navigationRestore'

export function useEntranceAnimation() {
  const skip = shouldSkipEntranceAnimation()
  return { skip }
}
