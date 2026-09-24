const DEBUG_INGEST_URL =
  'http://127.0.0.1:7667/ingest/3cb8dff8-e332-4ae8-b1e5-8d6e920d55ef';
const DEBUG_SESSION_ID = '4090ee';

type AgentLogPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId?: string;
  runId?: string;
};

/** Best-effort debug logging for local simulator sessions (folded in source). */
export function agentLog(payload: AgentLogPayload): void {
  if (process.env.NODE_ENV === 'test' || typeof fetch !== 'function') {
    return;
  }

  // #region agent log
  void fetch(DEBUG_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}
