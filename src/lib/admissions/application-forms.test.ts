import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { setActivityWriteClientForTests } from "@/lib/activity-log";
import {
  applicationFormFromRow,
  defaultApplicationFormFeeConfig,
  defaultApplicationFormNotificationConfig,
  defaultApplicationFormPostSubmitConfig,
  emptyApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ApplicationFormConflictError,
  applicationFormSummaryFromRow,
  assertApplicationFormNotStale,
  canonicalApplyFormPublicPath,
  isApplicationFormSummaryStub,
  isApplyFormVersion,
  isCanonicalApplyEntrySlug,
  listProgramsWithoutApplyForm,
  suggestApplyFormPublicSlug,
  updateApplicationForm,
} from "./application-forms";
import {
  applySystemSchemaChanged,
  buildApplySystemSection,
  ensureApplySystemSchema,
} from "./apply-system-fields";

function applyForm(
  overrides: Partial<ApplicationFormVersion> = {},
): ApplicationFormVersion {
  return {
    id: "form-1",
    organization_id: "org-1",
    program_id: "program-1",
    form_kind: "apply",
    version: 1,
    status: "published",
    title: "Kindergarten Co-op Application",
    intro: null,
    public_slug: "apply-kindergarten-co-op",
    schema: emptyApplicationFormSchema(),
    fee_config: defaultApplicationFormFeeConfig(),
    post_submit_config: defaultApplicationFormPostSubmitConfig(),
    notification_config: defaultApplicationFormNotificationConfig(),
    published_at: "2026-09-01T00:00:00.000Z",
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("suggestApplyFormPublicSlug", () => {
  it("slugifies program names into apply-* paths", () => {
    assert.equal(
      suggestApplyFormPublicSlug("Kindergarten Co-op"),
      "apply-kindergarten-co-op",
    );
  });
});

describe("listProgramsWithoutApplyForm", () => {
  it("returns only programs without an active apply form", () => {
    const programs = [
      { id: "p1", name: "School Year 2026–27" },
      { id: "p2", name: "Kindergarten Co-op" },
    ];
    const forms = [
      applyForm({ program_id: "p1", public_slug: "apply" }),
    ];

    assert.deepEqual(listProgramsWithoutApplyForm(programs, forms), [
      { id: "p2", name: "Kindergarten Co-op" },
    ]);
  });

  it("ignores archived apply forms when checking coverage", () => {
    const programs = [{ id: "p2", name: "Kindergarten Co-op" }];
    const forms = [
      applyForm({
        program_id: "p2",
        status: "archived",
      }),
    ];

    assert.deepEqual(listProgramsWithoutApplyForm(programs, forms), programs);
  });
});

describe("isApplyFormVersion", () => {
  it("detects apply forms by form_kind", () => {
    assert.equal(isApplyFormVersion(applyForm()), true);
    assert.equal(
      isApplyFormVersion(applyForm({ form_kind: "custom", public_slug: "apply" })),
      false,
    );
  });
});

describe("applicationFormFromRow", () => {
  it("defaults missing form_kind to custom", () => {
    const form = applicationFormFromRow({
      id: "form-1",
      organization_id: "org-1",
      program_id: null,
      version: 1,
      status: "draft",
      title: "Custom",
      intro: null,
      public_slug: "summer",
      schema: emptyApplicationFormSchema(),
      fee_config: defaultApplicationFormFeeConfig(),
      post_submit_config: defaultApplicationFormPostSubmitConfig(),
      notification_config: defaultApplicationFormNotificationConfig(),
      published_at: null,
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    });

    assert.equal(form.form_kind, "custom");
  });
});

describe("isCanonicalApplyEntrySlug", () => {
  it("matches only the shared /forms/apply entry slug", () => {
    assert.equal(isCanonicalApplyEntrySlug("apply"), true);
    assert.equal(isCanonicalApplyEntrySlug("apply-kindergarten-co-op"), false);
  });
});

describe("canonicalApplyFormPublicPath", () => {
  it("returns the shared family apply entry path", () => {
    assert.equal(
      canonicalApplyFormPublicPath("rooted-meadows"),
      "/school/rooted-meadows/forms/apply",
    );
  });
});

describe("applicationFormSummaryFromRow", () => {
  it("returns a summary stub with an empty schema", () => {
    const summary = applicationFormSummaryFromRow({
      id: "form-1",
      organization_id: "org-1",
      program_id: "program-1",
      form_kind: "apply",
      version: 1,
      status: "published",
      title: "Rooted Meadows 2026 Application",
      intro: null,
      public_slug: "apply",
      published_at: "2026-09-01T00:00:00.000Z",
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    });

    assert.equal(isApplicationFormSummaryStub(summary), true);
  });
});

describe("summary stubs", () => {
  it("are detected even though ensureApplySystemSchema would change them", () => {
    const summary = applicationFormSummaryFromRow({
      id: "form-1",
      organization_id: "org-1",
      program_id: "program-1",
      form_kind: "apply",
      version: 1,
      status: "published",
      title: "Rooted Meadows 2026 Application",
      intro: null,
      public_slug: "apply",
      published_at: "2026-09-01T00:00:00.000Z",
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    });
    const ensured = ensureApplySystemSchema(summary.schema);

    assert.equal(applySystemSchemaChanged(summary.schema, ensured), true);
    assert.equal(isApplicationFormSummaryStub(summary), true);
  });

  it("does not treat a full apply form as a stub", () => {
    const full = applyForm({
      schema: {
        sections: [buildApplySystemSection()],
        acknowledgments: [],
      },
    });

    assert.equal(isApplicationFormSummaryStub(full), false);
  });
});

const LOADED_AT = "2026-10-20T13:30:50.152632+00:00";
const SAVED_AT = "2026-10-20T13:31:00.000001+00:00";

type FakeCall = { table: string; ops: Array<[string, unknown[]]> };

function formRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "form-1",
    organization_id: "org-1",
    program_id: "program-1",
    form_kind: "custom",
    version: 1,
    status: "draft",
    title: "Original title",
    intro: null,
    public_slug: "application",
    schema: { sections: [], acknowledgments: [] },
    fee_config: defaultApplicationFormFeeConfig(),
    post_submit_config: defaultApplicationFormPostSubmitConfig(),
    notification_config: defaultApplicationFormNotificationConfig(),
    published_at: null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: LOADED_AT,
    ...overrides,
  };
}

function createFormsFakeSupabase(options: {
  row: Record<string, unknown>;
  updateMatches: boolean;
}): { supabase: SupabaseClient; calls: FakeCall[] } {
  const calls: FakeCall[] = [];

  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: "admin-1", email: "admin@test.com" } },
        error: null,
      }),
    },
    from(table: string) {
      const call: FakeCall = { table, ops: [] };
      calls.push(call);
      const opArgs = (name: string) => call.ops.find(([op]) => op === name)?.[1];

      const resolve = () => {
        if (table === "application_form_versions") {
          const patch = opArgs("update")?.[0] as Record<string, unknown> | undefined;
          if (patch) {
            return {
              data: options.updateMatches
                ? { ...options.row, ...patch, updated_at: SAVED_AT }
                : null,
              error: null,
            };
          }
          return { data: options.row, error: null };
        }
        if (table === "application_form_version_revisions") {
          if (opArgs("insert")) return { data: { id: "revision-1" }, error: null };
          if (opArgs("update")) return { data: null, error: null };
          return { data: [], error: null };
        }
        if (table === "activity_events") {
          return { data: { id: "event-1" }, error: null };
        }
        return { data: null, error: null };
      };

      const builder: Record<string, unknown> = {};
      for (const op of ["select", "eq", "neq", "in", "is", "order", "limit", "update", "insert"]) {
        builder[op] = (...args: unknown[]) => {
          call.ops.push([op, args]);
          return builder;
        };
      }
      builder.maybeSingle = async () => resolve();
      builder.single = async () => resolve();
      builder.then = (
        onFulfilled: (value: unknown) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) => Promise.resolve(resolve()).then(onFulfilled, onRejected);
      return builder;
    },
  } as unknown as SupabaseClient;

  return { supabase, calls };
}

function formUpdates(calls: FakeCall[]): FakeCall[] {
  return calls.filter(
    (call) =>
      call.table === "application_form_versions" &&
      call.ops.some(([op]) => op === "update"),
  );
}

describe("assertApplicationFormNotStale", () => {
  it("allows matching or omitted timestamps", () => {
    assert.doesNotThrow(() => assertApplicationFormNotStale(LOADED_AT, LOADED_AT));
    assert.doesNotThrow(() => assertApplicationFormNotStale(LOADED_AT, undefined));
  });

  it("rejects a timestamp that has moved on", () => {
    assert.throws(
      () => assertApplicationFormNotStale(SAVED_AT, LOADED_AT),
      ApplicationFormConflictError,
    );
  });
});

describe("updateApplicationForm stale-save guard", () => {
  afterEach(() => {
    setActivityWriteClientForTests(null);
  });

  it("rejects a stale tab before writing", async () => {
    const { supabase, calls } = createFormsFakeSupabase({
      row: formRow({ updated_at: SAVED_AT }),
      updateMatches: true,
    });

    await assert.rejects(
      updateApplicationForm(
        supabase,
        "form-1",
        { title: "Stale title" },
        { expectedUpdatedAt: LOADED_AT },
      ),
      ApplicationFormConflictError,
    );
    assert.equal(formUpdates(calls).length, 0);
  });

  it("rejects when another save lands between the read and the write", async () => {
    const { supabase, calls } = createFormsFakeSupabase({
      row: formRow(),
      updateMatches: false,
    });

    await assert.rejects(
      updateApplicationForm(
        supabase,
        "form-1",
        { title: "Racing title" },
        { expectedUpdatedAt: LOADED_AT },
      ),
      ApplicationFormConflictError,
    );
    assert.equal(formUpdates(calls).length, 1);
    assert.equal(
      calls.some((call) => call.table === "application_form_version_revisions"),
      false,
    );
  });

  it("filters the write on updated_at and always records a revision", async () => {
    const { supabase, calls } = createFormsFakeSupabase({
      row: formRow(),
      updateMatches: true,
    });
    setActivityWriteClientForTests(supabase);

    const saved = await updateApplicationForm(
      supabase,
      "form-1",
      { title: "New title" },
      { expectedUpdatedAt: LOADED_AT },
    );

    assert.equal(saved.title, "New title");
    assert.equal(saved.updated_at, SAVED_AT);

    const [update] = formUpdates(calls);
    assert.ok(
      update?.ops.some(
        ([op, args]) => op === "eq" && args[0] === "updated_at" && args[1] === LOADED_AT,
      ),
    );
    assert.ok(
      calls.some(
        (call) =>
          call.table === "application_form_version_revisions" &&
          call.ops.some(([op]) => op === "insert"),
      ),
    );
    assert.ok(
      calls.some(
        (call) =>
          call.table === "activity_events" &&
          call.ops.some(([op]) => op === "insert"),
      ),
    );
  });

  it("records form.saved via the school-admin API in the browser", async () => {
    const originalWindow = globalThis.window;
    const originalFetch = globalThis.fetch;

    globalThis.window = originalWindow ?? ({} as Window & typeof globalThis);

    const fetchCalls: Array<{ url: string; body: string }> = [];
    globalThis.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      fetchCalls.push({
        url,
        body: typeof init?.body === "string" ? init.body : "",
      });
      return new Response(
        JSON.stringify({ ok: true, activityEventId: "event-from-api" }),
        { status: 200 },
      );
    };

    const { supabase, calls } = createFormsFakeSupabase({
      row: formRow(),
      updateMatches: true,
    });

    try {
      await updateApplicationForm(
        supabase,
        "form-1",
        { title: "Browser title" },
        { expectedUpdatedAt: LOADED_AT },
      );

      assert.equal(fetchCalls.length, 1);
      assert.equal(
        fetchCalls[0]?.url,
        "/api/school-admin/application-forms/record-save-activity",
      );
      assert.ok(
        !calls.some(
          (call) =>
            call.table === "activity_events" &&
            call.ops.some(([op]) => op === "insert"),
        ),
      );
      assert.ok(
        calls.some(
          (call) =>
            call.table === "application_form_version_revisions" &&
            call.ops.some(([op]) => op === "update"),
        ),
      );
    } finally {
      globalThis.fetch = originalFetch;
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        globalThis.window = originalWindow;
      }
    }
  });
});
