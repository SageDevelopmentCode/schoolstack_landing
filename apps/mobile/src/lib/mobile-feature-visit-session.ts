const visitedThisSession = new Set<string>();

export function mobileFeatureVisitSessionKey(
  organizationId: string,
  surface: string,
  featureKey: string,
): string {
  return `${organizationId}:${surface}:${featureKey}`;
}

export function hasRecordedMobileFeatureVisit(sessionKey: string): boolean {
  return visitedThisSession.has(sessionKey);
}

export function markMobileFeatureVisitRecorded(sessionKey: string): void {
  visitedThisSession.add(sessionKey);
}

export function resetMobileFeatureVisitSession(): void {
  visitedThisSession.clear();
}
