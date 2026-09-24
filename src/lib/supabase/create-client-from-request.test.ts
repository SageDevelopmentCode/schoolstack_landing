import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const fixturesDir = path.join(__dirname, "test-fixtures");
const mockNextHeadersPath = path.join(fixturesDir, "mock-next-headers.cjs");
const mockSupabaseJsPath = path.join(fixturesDir, "mock-supabase-js.cjs");
const mockSupabaseSsrPath = path.join(fixturesDir, "mock-supabase-ssr.cjs");
const requestClientPath = path.join(__dirname, "request-client.ts");

const SUPABASE_URL = "https://test.supabase.co";
const SUPABASE_KEY = "publishable-key";

const originalResolveFilename = Module._resolveFilename;

function installModuleMocks() {
  Module._resolveFilename = function (
    request: string,
    parent: NodeModule,
    isMain: boolean,
    options?: { paths?: string[] },
  ) {
    if (request === "next/headers") {
      return mockNextHeadersPath;
    }
    if (request === "@supabase/supabase-js") {
      return mockSupabaseJsPath;
    }
    if (request === "@supabase/ssr") {
      return mockSupabaseSsrPath;
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  };
}

function clearSupabaseClientModuleCache() {
  for (const key of Object.keys(require.cache)) {
    if (
      key === requestClientPath ||
      key.endsWith("/request-client.ts") ||
      key.endsWith("/bearer-token.ts")
    ) {
      delete require.cache[key];
    }
  }
}

describe("createClientFromRequest", () => {
  before(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = SUPABASE_KEY;
    installModuleMocks();
    clearSupabaseClientModuleCache();

    const mockSupabase = require(mockSupabaseJsPath) as {
      __createClientCalls: unknown[][];
    };
    mockSupabase.__createClientCalls.length = 0;
  });

  after(() => {
    Module._resolveFilename = originalResolveFilename;
    clearSupabaseClientModuleCache();
  });

  it("uses bearer client when token is only available via next/headers()", async () => {
    const { createClientFromRequest } = await import("./request-client");
    const { __ACCESS_TOKEN } = require(mockNextHeadersPath) as {
      __ACCESS_TOKEN: string;
    };
    const { __createClientCalls } = require(mockSupabaseJsPath) as {
      __createClientCalls: Array<
        [string, string, { global: { headers: { Authorization: string } } }]
      >;
    };

    const request = new Request("https://example.com/api/parent-portal/home");
    await createClientFromRequest(request);

    assert.equal(__createClientCalls.length, 1);
    assert.deepEqual(__createClientCalls[0], [
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${__ACCESS_TOKEN}`,
          },
        },
      },
    ]);
  });
});
