'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const importSagefieldAdmin = () =>
  import('@/components/demo/sagefield/SagefieldAdminDashboardDemo')
const importSagefieldParent = () =>
  import('@/components/demo/sagefield/SagefieldParentDashboardDemo')
const importSagefieldTeacher = () =>
  import('@/components/demo/sagefield/SagefieldTeacherDashboardDemo')

type SagefieldAdminModule = Awaited<ReturnType<typeof importSagefieldAdmin>>
type SagefieldParentModule = Awaited<ReturnType<typeof importSagefieldParent>>
type SagefieldTeacherModule = Awaited<ReturnType<typeof importSagefieldTeacher>>

let sagefieldAdminPromise: Promise<SagefieldAdminModule> | null = null
let sagefieldParentPromise: Promise<SagefieldParentModule> | null = null
let sagefieldTeacherPromise: Promise<SagefieldTeacherModule> | null = null

function loadSagefieldAdminCached() {
  if (!sagefieldAdminPromise) {
    sagefieldAdminPromise = importSagefieldAdmin().catch((error) => {
      sagefieldAdminPromise = null
      console.error('Failed to load demo "sagefield-admin":', error)
      throw error
    })
  }
  return sagefieldAdminPromise
}

function loadSagefieldParentCached() {
  if (!sagefieldParentPromise) {
    sagefieldParentPromise = importSagefieldParent().catch((error) => {
      sagefieldParentPromise = null
      console.error('Failed to load demo "sagefield-parent":', error)
      throw error
    })
  }
  return sagefieldParentPromise
}

function loadSagefieldTeacherCached() {
  if (!sagefieldTeacherPromise) {
    sagefieldTeacherPromise = importSagefieldTeacher().catch((error) => {
      sagefieldTeacherPromise = null
      console.error('Failed to load demo "sagefield-teacher":', error)
      throw error
    })
  }
  return sagefieldTeacherPromise
}

const SagefieldAdminDashboardDemo = dynamic(() => loadSagefieldAdminCached(), {
  ssr: false,
})
const SagefieldParentDashboardDemo = dynamic(() => loadSagefieldParentCached(), {
  ssr: false,
})
const SagefieldTeacherDashboardDemo = dynamic(() => loadSagefieldTeacherCached(), {
  ssr: false,
})

export function LazySagefieldAdminDashboardDemo(
  props: ComponentProps<typeof SagefieldAdminDashboardDemo>,
) {
  return <SagefieldAdminDashboardDemo {...props} />
}

export function LazySagefieldParentDashboardDemo(
  props: ComponentProps<typeof SagefieldParentDashboardDemo>,
) {
  return <SagefieldParentDashboardDemo {...props} />
}

export function LazySagefieldTeacherDashboardDemo(
  props: ComponentProps<typeof SagefieldTeacherDashboardDemo>,
) {
  return <SagefieldTeacherDashboardDemo {...props} />
}

export function prefetchSagefieldAdminDemo() {
  void loadSagefieldAdminCached()
}

export function prefetchSagefieldParentDemo() {
  void loadSagefieldParentCached()
}

export function prefetchSagefieldTeacherDemo() {
  void loadSagefieldTeacherCached()
}
