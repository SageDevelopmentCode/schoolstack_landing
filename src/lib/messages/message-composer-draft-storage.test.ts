import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearComposerDraft,
  composerDraftStorageKey,
  readComposerDraft,
  writeComposerDraft,
} from "./message-composer-draft-storage";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("message-composer-draft-storage", () => {
  it("builds stable storage keys", () => {
    assert.equal(
      composerDraftStorageKey("org-1", "teacher", "thread-a"),
      "mk:message-draft:org-1:teacher:thread-a",
    );
  });

  it("writes, reads, and clears drafts", () => {
    const storage = createMemoryStorage();
    writeComposerDraft("org-1", "parent", "thread-1", "Hello", storage);
    assert.equal(readComposerDraft("org-1", "parent", "thread-1", storage), "Hello");

    clearComposerDraft("org-1", "parent", "thread-1", storage);
    assert.equal(readComposerDraft("org-1", "parent", "thread-1", storage), "");
  });

  it("removes storage entry when text is empty", () => {
    const storage = createMemoryStorage();
    writeComposerDraft("org-1", "admin", "thread-2", "Draft", storage);
    writeComposerDraft("org-1", "admin", "thread-2", "   ", storage);
    assert.equal(readComposerDraft("org-1", "admin", "thread-2", storage), "");
    assert.equal(
      storage.getItem(composerDraftStorageKey("org-1", "admin", "thread-2")),
      null,
    );
  });
});
