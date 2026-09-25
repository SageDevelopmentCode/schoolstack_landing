import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_AUTH_DIAGNOSTICS_KEY = 'mobile_pending_auth_diagnostics';
const MAX_PENDING_EVENTS = 5;

export type PendingAuthDiagnostic = {
  event: string;
  at: string;
  details?: Record<string, unknown>;
};

export async function recordPendingAuthDiagnostic(
  event: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_AUTH_DIAGNOSTICS_KEY);
    const existing: PendingAuthDiagnostic[] = raw ? (JSON.parse(raw) as PendingAuthDiagnostic[]) : [];
    const next: PendingAuthDiagnostic[] = [
      ...existing,
      { event, at: new Date().toISOString(), ...(details ? { details } : {}) },
    ].slice(-MAX_PENDING_EVENTS);
    await AsyncStorage.setItem(PENDING_AUTH_DIAGNOSTICS_KEY, JSON.stringify(next));
  } catch {
    // Best-effort only.
  }
}

export async function consumePendingAuthDiagnostics(): Promise<PendingAuthDiagnostic[] | undefined> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_AUTH_DIAGNOSTICS_KEY);
    if (!raw) {
      return undefined;
    }
    await AsyncStorage.removeItem(PENDING_AUTH_DIAGNOSTICS_KEY);
    const parsed = JSON.parse(raw) as PendingAuthDiagnostic[];
    return parsed.length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}
