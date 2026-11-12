import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserFromClaims, userFromClaims } from "./get-claims-user";

type Calls = { getClaims: Array<string | undefined>; getUser: Array<string | undefined> };

function fakeClient(options: {
  claims?: Record<string, unknown> | null;
  claimsError?: { message: string } | null;
  claimsThrows?: boolean;
  serverUser?: { id: string } | null;
}): { client: SupabaseClient; calls: Calls } {
  const calls: Calls = { getClaims: [], getUser: [] };
  const client = {
    auth: {
      getClaims: async (token?: string) => {
        calls.getClaims.push(token);
        if (options.claimsThrows) throw new Error("jwks fetch failed");
        return {
          data: options.claims ? { claims: options.claims } : null,
          error: options.claimsError ?? null,
        };
      },
      getUser: async (token?: string) => {
        calls.getUser.push(token);
        return {
          data: { user: options.serverUser ?? null },
          error: options.serverUser ? null : { message: "invalid JWT" },
        };
      },
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}

describe("userFromClaims", () => {
  it("maps the JWT claims the parent portal reads", () => {
    const user = userFromClaims({
      sub: "user-1",
      aud: "authenticated",
      email: "parent@example.test",
      role: "authenticated",
      user_metadata: { full_name: "Pat Parent" },
      app_metadata: { provider: "email" },
    });
    assert.equal(user?.id, "user-1");
    assert.equal(user?.email, "parent@example.test");
    assert.deepEqual(user?.user_metadata, { full_name: "Pat Parent" });
    assert.deepEqual(user?.app_metadata, { provider: "email" });
  });

  it("returns null without a subject", () => {
    assert.equal(userFromClaims({ email: "x@example.test" }), null);
    assert.equal(userFromClaims({ sub: "" }), null);
  });

  it("tolerates missing or malformed metadata", () => {
    const user = userFromClaims({ sub: "user-2", user_metadata: "nope", app_metadata: null });
    assert.deepEqual(user?.user_metadata, {});
    assert.deepEqual(user?.app_metadata, {});
  });
});

describe("getUserFromClaims", () => {
  it("verifies locally and never calls the auth server when claims are valid", async () => {
    const { client, calls } = fakeClient({ claims: { sub: "user-1", email: "a@example.test" } });
    const result = await getUserFromClaims(client);
    assert.equal(result.data.user?.id, "user-1");
    assert.equal(result.error, null);
    assert.deepEqual(calls.getClaims, [undefined]);
    assert.deepEqual(calls.getUser, []);
  });

  it("passes a bearer token through to getClaims", async () => {
    const { client, calls } = fakeClient({ claims: { sub: "user-1" } });
    await getUserFromClaims(client, "token-abc");
    assert.deepEqual(calls.getClaims, ["token-abc"]);
    assert.deepEqual(calls.getUser, []);
  });

  it("falls back to getUser when claims verification fails", async () => {
    const { client, calls } = fakeClient({
      claimsError: { message: "bad signature" },
      serverUser: { id: "user-9" },
    });
    const result = await getUserFromClaims(client, "token-abc");
    assert.equal(result.data.user?.id, "user-9");
    assert.deepEqual(calls.getUser, ["token-abc"]);
  });

  it("falls back to getUser when getClaims throws", async () => {
    const { client, calls } = fakeClient({ claimsThrows: true, serverUser: { id: "user-9" } });
    const result = await getUserFromClaims(client);
    assert.equal(result.data.user?.id, "user-9");
    assert.deepEqual(calls.getUser, [undefined]);
  });

  it("AUTH_VERIFY_JWT_LOCALLY=0 always asks the auth server", async () => {
    const previous = process.env.AUTH_VERIFY_JWT_LOCALLY;
    process.env.AUTH_VERIFY_JWT_LOCALLY = "0";
    try {
      const { client, calls } = fakeClient({
        claims: { sub: "user-1" },
        serverUser: { id: "user-1" },
      });
      await getUserFromClaims(client);
      assert.deepEqual(calls.getClaims, []);
      assert.deepEqual(calls.getUser, [undefined]);
    } finally {
      if (previous === undefined) delete process.env.AUTH_VERIFY_JWT_LOCALLY;
      else process.env.AUTH_VERIFY_JWT_LOCALLY = previous;
    }
  });

  it("reports the server error for a signed-out request", async () => {
    const { client } = fakeClient({ claims: null, serverUser: null });
    const result = await getUserFromClaims(client);
    assert.equal(result.data.user, null);
    assert.equal(result.error?.message, "invalid JWT");
  });
});
