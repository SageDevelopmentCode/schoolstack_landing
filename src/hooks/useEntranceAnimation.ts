'use client'

import { useState } from 'react'
import { shouldSkipEntranceAnimation } from '@/lib/navigationRestore'

export function useEntranceAnimation() {
  const [skip] = useState(() => shouldSkipEntranceAnimation())
  return { skip }
}
