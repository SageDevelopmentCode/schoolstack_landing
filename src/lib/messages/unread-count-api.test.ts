import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getParentMessagesUnreadCount } from "./unread-count-api";
import {
  resetUnreadRpcFailureThrottle,
  shouldNotifyUnreadRpcFailure,
} from "./threads";

function rpcClient(result: { data: unknown; error: unknown }) {
  const calls: Array<{ fn: string; args: unknown }> = [];
  const client = {
    rpc: async (fn: string, args: unknown) => {
      calls.push({ fn, args });
      return result;
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}

describe("getParentMessagesUnreadCount", () => {
  it("answers with one parent_unread_message_count call on the request client", async () => {
    const { client, calls } = rpcClient({ data: 4, error: null });
    const admin = {
      from() {
        throw new Error("admin client must not be queried when the RPC works");
      },
    } as unknown as SupabaseClient;

    const count = await getParentMessagesUnreadCount(
      admin,
      client,
      "org-1",
      "user-1",
      "School",
    );

    assert.equal(count, 4);
    assert.deepEqual(calls, [
      {
        fn: "parent_unread_message_count",
        args: { p_organization_id: "org-1", p_program_id: null },
      },
    ]);
  });

  it("returns 0 when the RPC reports no access", async () => {
    const { client } = rpcClient({ data: 0, error: null });
    const count = await getParentMessagesUnreadCount(
      {} as SupabaseClient,
      client,
      "org-1",
      "user-1",
      "School",
    );
    assert.equal(count, 0);
  });
});

describe("shouldNotifyUnreadRpcFailure", () => {
  it("notifies once per window", () => {
    resetUnreadRpcFailureThrottle();
    const start = 1_000_000;
    assert.equal(shouldNotifyUnreadRpcFailure(start), true);
    assert.equal(shouldNotifyUnreadRpcFailure(start + 1000), false);
    assert.equal(shouldNotifyUnreadRpcFailure(start + 11 * 60 * 1000), true);
    resetUnreadRpcFailureThrottle();
  });
});
