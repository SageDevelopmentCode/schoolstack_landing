const visitedThisSession = new Set<string>();

export function mobileFeatureVisitSessionKey(
  surface: string,
  featureKey: string,
): string {
  return `${surface}:${featureKey}`;
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
