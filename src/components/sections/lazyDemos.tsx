import dynamic from 'next/dynamic'
import { DemoSkeleton } from '@/components/ui/DemoSkeleton'

const demoLoading = () => <DemoSkeleton />

export const LazyAdminDashboardDemo = dynamic(
  () => import('./AdminDashboardDemo'),
  { ssr: false, loading: demoLoading }
)

export const LazyTeacherDashboardDemo = dynamic(
  () => import('./TeacherDashboardDemo'),
  { ssr: false, loading: demoLoading }
)

export const LazyParentDashboardDemo = dynamic(
  () => import('./ParentDashboardDemo'),
  { ssr: false, loading: demoLoading }
)

export const LazyWebsiteDashboardDemo = dynamic(
  () => import('./WebsiteDashboardDemo'),
  { ssr: false, loading: demoLoading }
)

export function prefetchAdminDemo() {
  void import('./AdminDashboardDemo')
}

export function prefetchTeacherDemo() {
  void import('./TeacherDashboardDemo')
}

export function prefetchParentDemo() {
  void import('./ParentDashboardDemo')
}

export function prefetchWebsiteDemo() {
  void import('./WebsiteDashboardDemo')
}
