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
    case 'program_signups':
      return 'warning';
    case 'messages':
      return 'info';
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
    case 'program_signups':
      return 'Program sign-ups';
    case 'messages':
      return 'Messages';
    default:
      return 'School';
  }
}
