const BENIGN_CLIENT_NETWORK_ERROR_MESSAGES = new Set([
  "Load failed",
  "Failed to fetch",
  "Network request failed",
]);

export function isBenignClientNetworkError(err: unknown): boolean {
  if (err instanceof Error) {
    return BENIGN_CLIENT_NETWORK_ERROR_MESSAGES.has(err.message.trim());
  }

  if (typeof err === "string") {
    return BENIGN_CLIENT_NETWORK_ERROR_MESSAGES.has(err.trim());
  }

  return false;
}
