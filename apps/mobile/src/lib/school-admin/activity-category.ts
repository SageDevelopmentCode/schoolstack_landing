import type { ActivityNotificationCategory } from '@/lib/school-admin/dashboard-summary-types';

export type ActivityCategoryTone = 'success' | 'warning' | 'info' | 'purple';

export function activityCategoryChipTone(category: ActivityNotificationCategory): ActivityCategoryTone {
  switch (category) {
    case 'payments':
      return 'success';
    case 'applications':
      return 'warning';
    case 'enrollment':
      return 'info';
    case 'committees':
      return 'purple';
    default:
      return 'info';
  }
}

export function activityCategoryLabel(category: ActivityNotificationCategory): string {
  switch (category) {
    case 'payments':
      return 'Payments';
    case 'applications':
      return 'Admissions';
    case 'enrollment':
      return 'Enrollment';
    case 'committees':
      return 'Community';
    default:
      return 'School';
  }
}
