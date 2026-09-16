import type { OrganizationFeatures } from '@/lib/teacher/teacher-portal-api';

export function isTeacherFeatureEnabled(
  features: OrganizationFeatures | undefined,
  featureKey: string,
): boolean {
  const teacherFeatures = features?.teacher;
  if (!teacherFeatures || typeof teacherFeatures !== 'object') {
    return false;
  }

  return Boolean(teacherFeatures[featureKey]);
}
