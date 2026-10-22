export function buildPortalCalendarNotificationHref(
  portalBase: string,
  options?: { eventId?: string | null; eventDate?: string | null },
): string {
  const href = `${portalBase}/calendar`;
  const eventId = options?.eventId?.trim();
  if (!eventId) return href;

  const params = new URLSearchParams({ eventId });
  const eventDate = options?.eventDate?.trim();
  if (eventDate) {
    params.set("date", eventDate);
  }
  return `${href}?${params.toString()}`;
}
