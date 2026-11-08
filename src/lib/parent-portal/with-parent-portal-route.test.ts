import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import {
  parseParentPortalAccess,
  parentPortalAccessAllowsOptionalProgramScope,
  type ParentPortalAccess,
} from "@/lib/parent-portal/parent-portal-access-rpc";
import {
  createWithParentPortalRoute,
  type ParentPortalRouteDeps,
} from "@/lib/parent-portal/with-parent-portal-route";

const USER = { id: "user-1" } as User;
const ORG = "org-1";
const PROGRAM = "prog-1";

function access(overrides: Partial<ParentPortalAccess> = {}): ParentPortalAccess {
  return {
    link: { groupId: null, primaryUserId: USER.id, memberUserIds: [USER.id], isPrimaryLogin: true },
    guardianIds: ["g1"],
    familyIds: ["fam-1", "fam-2"],
    studentIds: ["s1"],
    enrolledPrograms: [
      {
        id: PROGRAM,
        name: "Main",
        portal_slug: "main",
        parent_portal_settings: { mode: "main" } as never,
      },
    ],
    hasEnrolledAccess: true,
    ...overrides,
  };
}

function makeDeps(input: {
  user?: User | null;
  access?: ParentPortalAccess;
  features?: OrganizationFeatures;
  calls?: string[];
}): ParentPortalRouteDeps {
  const calls = input.calls ?? [];
  return {
    createClient: async () => ({}) as SupabaseClient,
    getUser: async () => {
      calls.push("getUser");
      return {
        data: { user: input.user === undefined ? USER : input.user },
        error: null,
      };
    },
    signedInError: async () => "Sign in required.",
    fetchAccess: async () => {
      calls.push("fetchAccess");
      return input.access ?? access();
    },
    loadOrganizationFeatures: async () => {
      calls.push("loadFeatures");
      return input.features ?? (structuredClone(DEFAULT_FEATURES) as OrganizationFeatures);
    },
  };
}

function get(query: string): Request {
  return new Request(`https://example.com/api/parent-portal/x${query}`);
}

function post(body: unknown): Request {
  return new Request("https://example.com/api/parent-portal/x", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function json(response: Response) {
  return (await response.json()) as { error?: string; code?: string; ok?: boolean };
}

describe("withParentPortalRoute", () => {
  it("answers 401 before looking at the organization", async () => {
    const calls: string[] = [];
    const wrap = createWithParentPortalRoute(makeDeps({ user: null, calls }));
    const route = wrap({ route: "/x" }, async () => Response.json({ ok: true }));

    const response = await route(get(""));
    assert.equal(response.status, 401);
    assert.equal((await json(response)).code, "unauthorized");
    assert.deepEqual(calls, ["getUser"]);
  });

  it("answers 400 when organizationId is missing", async () => {
    const calls: string[] = [];
    const wrap = createWithParentPortalRoute(makeDeps({ calls }));
    const route = wrap({ route: "/x" }, async () => Response.json({ ok: true }));

    const response = await route(get(""));
    assert.equal(response.status, 400);
    assert.equal((await json(response)).code, "missing_fields");
    assert.ok(!calls.includes("fetchAccess"));
  });

  it("answers 403 with the route's message when the parent has no enrolled access", async () => {
    const wrap = createWithParentPortalRoute(
      makeDeps({ access: access({ hasEnrolledAccess: false, enrolledPrograms: [] }) }),
    );
    const route = wrap(
      { route: "/x", forbiddenMessage: "You do not have access to messages." },
      async () => Response.json({ ok: true }),
    );

    const response = await route(get(`?organizationId=${ORG}`));
    assert.equal(response.status, 403);
    const body = await json(response);
    assert.equal(body.error, "You do not have access to messages.");
    assert.equal(body.code, "forbidden");
  });

  it("runs the handler once with the access snapshot", async () => {
    const calls: string[] = [];
    const wrap = createWithParentPortalRoute(makeDeps({ calls }));
    let seen: unknown;
    const route = wrap({ route: "/x" }, async (ctx) => {
      seen = { org: ctx.organizationId, family: ctx.familyId, families: ctx.familyIds };
      return Response.json({ ok: true });
    });

    const response = await route(get(`?organizationId=${ORG}`));
    assert.equal(response.status, 200);
    assert.deepEqual(seen, { org: ORG, family: "fam-1", families: ["fam-1", "fam-2"] });
    assert.deepEqual(calls, ["getUser", "fetchAccess"]);
  });

  it("validates familyId against the linked families", async () => {
    const wrap = createWithParentPortalRoute(makeDeps({}));
    const route = wrap({ route: "/x", requireFamily: true }, async (ctx) =>
      Response.json({ ok: ctx.familyId === "fam-2" }),
    );

    const ok = await route(get(`?organizationId=${ORG}&familyId=fam-2`));
    assert.equal(ok.status, 200);
    assert.equal((await json(ok)).ok, true);

    const denied = await route(get(`?organizationId=${ORG}&familyId=other`));
    assert.equal(denied.status, 403);

    const missing = await route(get(`?organizationId=${ORG}`));
    assert.equal(missing.status, 400);
  });

  it("requires enrollment in the program for programScope required", async () => {
    const wrap = createWithParentPortalRoute(makeDeps({}));
    const route = wrap({ route: "/x", programScope: "required" }, async () =>
      Response.json({ ok: true }),
    );

    assert.equal((await route(get(`?organizationId=${ORG}`))).status, 400);
    assert.equal((await route(get(`?organizationId=${ORG}&programId=nope`))).status, 403);
    assert.equal((await route(get(`?organizationId=${ORG}&programId=${PROGRAM}`))).status, 200);
  });

  it("optional program scope uses the main-portal rule without a program id", async () => {
    const isolatedOnly = access({
      enrolledPrograms: [
        {
          id: PROGRAM,
          name: "Iso",
          portal_slug: "iso",
          parent_portal_settings: { mode: "isolated" } as never,
        },
      ],
    });
    assert.equal(parentPortalAccessAllowsOptionalProgramScope(isolatedOnly, null), false);
    assert.equal(parentPortalAccessAllowsOptionalProgramScope(isolatedOnly, PROGRAM), true);
    assert.equal(parentPortalAccessAllowsOptionalProgramScope(access(), ""), true);
  });

  it("reads organizationId and the validated body from JSON for body routes", async () => {
    const wrap = createWithParentPortalRoute(makeDeps({}));
    const route = wrap<{ text: string }>(
      {
        route: "/x",
        organizationFrom: "body",
        parseBody: (raw) => {
          const text = (raw as { text?: unknown }).text;
          return typeof text === "string" ? { text } : null;
        },
      },
      async (ctx) => Response.json({ ok: ctx.body.text === "hi" }),
    );

    const ok = await route(post({ organizationId: ORG, text: "hi" }));
    assert.equal(ok.status, 200);
    assert.equal((await json(ok)).ok, true);

    assert.equal((await route(post({ organizationId: ORG }))).status, 400);
    assert.equal((await route(post({ text: "hi" }))).status, 400);
    assert.equal((await route(post("not json"))).status, 400);
  });

  it("blocks a disabled feature with feature_disabled and allows an enabled one", async () => {
    const features = structuredClone(DEFAULT_FEATURES) as OrganizationFeatures;
    features.parent.newsletters = false;
    features.parent.calendar = true;

    const wrap = createWithParentPortalRoute(makeDeps({ features }));

    const off = await wrap({ route: "/x", feature: "newsletters" }, async () =>
      Response.json({ ok: true }),
    )(get(`?organizationId=${ORG}`));
    assert.equal(off.status, 403);
    assert.equal((await json(off)).code, "feature_disabled");

    const on = await wrap({ route: "/x", feature: "calendar" }, async () =>
      Response.json({ ok: true }),
    )(get(`?organizationId=${ORG}`));
    assert.equal(on.status, 200);
  });

  it("passes dynamic route params to the handler", async () => {
    const wrap = createWithParentPortalRoute(makeDeps({}));
    const route = wrap<undefined, { threadId: string }>({ route: "/x" }, async (ctx) =>
      Response.json({ ok: ctx.params.threadId === "t1" }),
    );

    const response = await route(get(`?organizationId=${ORG}`), {
      params: Promise.resolve({ threadId: "t1" }),
    });
    assert.equal((await json(response)).ok, true);
  });
});

describe("parseParentPortalAccess", () => {
  it("maps the RPC payload and fills safe defaults", () => {
    const parsed = parseParentPortalAccess(
      {
        link: {
          group_id: "grp",
          primary_user_id: "p",
          member_user_ids: ["p", "m"],
          is_primary_login: false,
        },
        guardian_ids: ["g"],
        family_ids: ["f"],
        student_ids: ["s"],
        enrolled_programs: [
          { id: "b", name: "B", portal_slug: "b", parent_portal_settings: {} },
          { id: "a", name: "A", portal_slug: "a", parent_portal_settings: {} },
        ],
        has_enrolled_access: true,
      },
      "me",
    );
    assert.equal(parsed.link.groupId, "grp");
    assert.equal(parsed.link.isPrimaryLogin, false);
    assert.deepEqual(parsed.link.memberUserIds, ["p", "m"]);
    assert.deepEqual(
      parsed.enrolledPrograms.map((program) => program.id),
      ["a", "b"],
    );
    assert.equal(parsed.hasEnrolledAccess, true);

    const empty = parseParentPortalAccess(null, "me");
    assert.deepEqual(empty.familyIds, []);
    assert.equal(empty.hasEnrolledAccess, false);
    assert.deepEqual(empty.link.memberUserIds, ["me"]);
    assert.equal(empty.link.primaryUserId, "me");
    assert.equal(empty.link.isPrimaryLogin, true);
  });
});
