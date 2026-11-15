function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today" / "Yesterday" / "Earlier this week" / "Earlier" — matches the web drawer. */
export function notificationGroupLabel(createdAt: string, now = new Date()): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 'Earlier';
  const days = Math.round((startOfDay(now) - startOfDay(created)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'Earlier this week';
  return 'Earlier';
}
