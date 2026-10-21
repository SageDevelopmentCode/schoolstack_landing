export type MessageComposerViewer = "parent" | "teacher" | "admin";

export function composerDraftStorageKey(
  organizationId: string,
  viewer: MessageComposerViewer,
  threadKey: string,
): string {
  return `mk:message-draft:${organizationId}:${viewer}:${threadKey}`;
}

function getSessionStorage(storage?: Storage | null): Storage | null {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readComposerDraft(
  organizationId: string,
  viewer: MessageComposerViewer,
  threadKey: string,
  storage?: Storage | null,
): string {
  const store = getSessionStorage(storage);
  if (!store || !threadKey) return "";
  try {
    const value = store.getItem(composerDraftStorageKey(organizationId, viewer, threadKey));
    return value ?? "";
  } catch {
    return "";
  }
}

export function writeComposerDraft(
  organizationId: string,
  viewer: MessageComposerViewer,
  threadKey: string,
  text: string,
  storage?: Storage | null,
): void {
  const store = getSessionStorage(storage);
  if (!store || !threadKey) return;
  const key = composerDraftStorageKey(organizationId, viewer, threadKey);
  try {
    if (!text.trim()) {
      store.removeItem(key);
      return;
    }
    store.setItem(key, text);
  } catch {
    // Private mode or quota — ignore.
  }
}

export function clearComposerDraft(
  organizationId: string,
  viewer: MessageComposerViewer,
  threadKey: string,
  storage?: Storage | null,
): void {
  const store = getSessionStorage(storage);
  if (!store || !threadKey) return;
  try {
    store.removeItem(composerDraftStorageKey(organizationId, viewer, threadKey));
  } catch {
    // ignore
  }
}
