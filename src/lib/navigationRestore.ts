let navigationRestored = false

if (typeof window !== 'undefined') {
  const markRestored = () => {
    navigationRestored = true
  }

  window.addEventListener('popstate', markRestored, true)
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) {
        markRestored()
      }
    },
    true,
  )
}

export function isNavigationRestored(): boolean {
  return navigationRestored
}

export function consumeNavigationRestored(): boolean {
  const restored = navigationRestored
  navigationRestored = false
  return restored
}

function isBackForwardNavigation(): boolean {
  if (typeof window === 'undefined') return false
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return entries[0]?.type === 'back_forward'
}

export function shouldSkipEntranceAnimation(): boolean {
  return isNavigationRestored() || isBackForwardNavigation()
}
