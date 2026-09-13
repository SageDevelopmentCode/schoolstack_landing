import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

export function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

export function familyKickerLabel(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `The ${parts[parts.length - 1]} family`;
  }
  if (parts.length === 1) {
    return `The ${parts[0]} family`;
  }
  return 'Your family';
}

export function greetingParts(): { prefix: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { prefix: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { prefix: 'Good afternoon', emoji: '🌤️' };
  return { prefix: 'Good evening', emoji: '🌙' };
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function childSubtitleLine(child: FamilyChildOverview): string {
  const gradePart = child.grade ? `Grade ${child.grade}` : 'Grade not listed';
  if (child.checklistProgress && child.checklistProgress.total > 0) {
    const checklistPart = `Enrollment checklist: ${child.checklistProgress.completed} of ${child.checklistProgress.total} complete`;
    return `${gradePart} · ${checklistPart}`;
  }
  return gradePart;
}
