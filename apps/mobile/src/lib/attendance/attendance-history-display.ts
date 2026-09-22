import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';

export type AttendanceHistoryActor = {
  name: string;
  photoUrl: string | null;
};

export type AttendanceHistorySummary = {
  primary: string;
  secondary: string;
};

export function formatAttendanceHistoryDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatAttendanceHistoryFullDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatAttendanceHistoryTime(iso: string | null): string | null {
  if (!iso) return null;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function resolveAttendanceHistoryActor(
  entry: AttendanceHistoryEntry,
): AttendanceHistoryActor {
  if (entry.status === 'picked_up' && entry.pickedUpByName) {
    return {
      name: entry.pickedUpByName,
      photoUrl: null,
    };
  }

  if (entry.recordedByName) {
    return {
      name: entry.recordedByName,
      photoUrl: entry.recordedByPhotoUrl,
    };
  }

  return {
    name: 'School staff',
    photoUrl: null,
  };
}

export function buildAttendanceHistorySummary(
  entry: AttendanceHistoryEntry,
): AttendanceHistorySummary {
  const actor = resolveAttendanceHistoryActor(entry);
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);

  if (entry.status === 'present') {
    const time = formatAttendanceHistoryTime(entry.presentAt);
    return {
      primary: time ? `Marked present · ${time}` : 'Marked present',
      secondary: `${dateLabel} · ${actor.name}`,
    };
  }

  if (entry.status === 'absent') {
    const time = formatAttendanceHistoryTime(entry.absentAt);
    return {
      primary: time ? `Marked absent · ${time}` : 'Marked absent',
      secondary: `${dateLabel} · ${actor.name}`,
    };
  }

  const time = formatAttendanceHistoryTime(entry.pickedUpAt);
  return {
    primary: time ? `Picked up · ${time}` : 'Picked up',
    secondary: `${dateLabel} · ${actor.name}`,
  };
}
