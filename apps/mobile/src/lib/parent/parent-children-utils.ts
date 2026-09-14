import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import type { LoadedEnrollmentChecklist } from '@/lib/admissions/enrollment-checklist';
import type { EnrollmentChecklistItemInstance } from '@/lib/admissions/enrollment-checklist';
import type {
  FamilyChildOverview,
  ParentAssignedTeacher,
} from '@/lib/parent/parent-portal-api';

export type ParentChildRecordSection = 'application' | 'checklist' | 'teachers' | 'health';

export type ChildProfileData = {
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
  assignedTeachers: ParentAssignedTeacher[];
};

export function isParentChildRecordSection(
  value: string | null | undefined,
): value is ParentChildRecordSection {
  return (
    value === 'application' ||
    value === 'checklist' ||
    value === 'teachers' ||
    value === 'health'
  );
}

export function childFirstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? fullName;
}

export function formatChildrenPageDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function familyChildrenSubtitle(children: FamilyChildOverview[]): string {
  if (children.length === 0) return '';
  const enrolledCount = children.filter((child) => child.isEnrolled).length;
  const learnerLabel = children.length === 1 ? 'learner' : 'learners';
  if (enrolledCount === children.length) {
    return `${children.length} ${learnerLabel} · All enrolled`;
  }
  if (enrolledCount > 0) {
    return `${children.length} ${learnerLabel} · ${enrolledCount} enrolled`;
  }
  return `${children.length} ${learnerLabel} on file`;
}

export function childGradeLine(child: FamilyChildOverview): string {
  return child.grade ? `Grade ${child.grade}` : 'Grade not listed';
}

export function childLearnerSubtitleLine(child: FamilyChildOverview): string {
  const parts = [childGradeLine(child)];
  if (child.isEnrolled) {
    parts.push('Enrolled');
  } else {
    parts.push(child.statusLabel);
  }
  return parts.join(' · ');
}

export function childStatusChipTone(child: FamilyChildOverview): 'success' | 'info' | 'warning' {
  if (child.isEnrolled) return 'success';
  if (child.status === 'enrolling') return 'warning';
  return 'info';
}

export function incompleteChecklistItems(
  profile: ChildProfileData | null,
): Array<{ label: string; status: string }> {
  if (!profile?.checklist) return [];

  const instanceByTemplateId = new Map<string, EnrollmentChecklistItemInstance>();
  for (const instance of profile.checklist.instances) {
    instanceByTemplateId.set(instance.templateItemId, instance);
  }

  return profile.checklist.items
    .filter((item) => {
      if (!item.required) return false;
      const status = instanceByTemplateId.get(item.id)?.status ?? 'not_started';
      return status === 'not_started' || status === 'in_progress';
    })
    .map((item) => ({
      label: item.label,
      status: instanceByTemplateId.get(item.id)?.status ?? 'not_started',
    }));
}
