import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const PAYMENT_POLL_INTERVAL_MS = 1500;
export const PAYMENT_POLL_MAX_ATTEMPTS = 20;

const PAYMENT_POLL_STORAGE_PREFIX = "payment-return-poll:";

export function readPaymentReturnPending(
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  return (
    searchParams.get("payment") === "success" ||
    searchParams.get("combined_payment") === "success"
  );
}

export function getPaymentPollStorageKey(scope: string): string {
  return `${PAYMENT_POLL_STORAGE_PREFIX}${scope}`;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function hasPaymentPollStarted(scope: string): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;
  return storage.getItem(getPaymentPollStorageKey(scope)) === "1";
}

export function markPaymentPollStarted(scope: string): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(getPaymentPollStorageKey(scope), "1");
}

export function clearPaymentReturnQuery(
  router: Pick<AppRouterInstance, "replace">,
  pathname: string,
): void {
  router.replace(pathname);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
