import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySubmissionListFilters,
  listOrgApplicationSubmissionsPage,
} from "./application-submissions";

type QueryCall = {
  method: string;
  args: unknown[];
};

function createFilterQueryRecorder() {
  const calls: QueryCall[] = [];
  const query = {
    eq(column: string, value: string) {
      calls.push({ method: "eq", args: [column, value] });
      return query;
    },
    neq(column: string, value: string) {
      calls.push({ method: "neq", args: [column, value] });
      return query;
    },
    or(filters: string) {
      calls.push({ method: "or", args: [filters] });
      return query;
    },
  };

  return { query, calls };
}

describe("applySubmissionListFilters", () => {
  it("excludes withdrawn when status filter is all", () => {
    const { query, calls } = createFilterQueryRecorder();

    applySubmissionListFilters(query, { statusFilter: "all", formKey: "all" });

    assert.deepEqual(calls, [{ method: "neq", args: ["status", "withdrawn"] }]);
  });

  it("filters by explicit status", () => {
    const { query, calls } = createFilterQueryRecorder();

    applySubmissionListFilters(query, {
      statusFilter: "submitted",
      formKey: "all",
    });

    assert.deepEqual(calls, [{ method: "eq", args: ["status", "submitted"] }]);
  });

  it("filters by form slug or title", () => {
    const { query, calls } = createFilterQueryRecorder();

    applySubmissionListFilters(query, {
      statusFilter: "all",
      formKey: "apply-2026",
    });

    assert.deepEqual(calls, [
      { method: "neq", args: ["status", "withdrawn"] },
      {
        method: "or",
        args: [
          "application_form_versions.public_slug.eq.apply-2026,application_form_versions.title.eq.apply-2026",
        ],
      },
    ]);
  });
});

describe("listOrgApplicationSubmissionsPage", () => {
  it("passes offset, limit, and filters to the list query", async () => {
    const listCalls: QueryCall[] = [];
    const countCalls: QueryCall[] = [];

    const submittedRow = {
      id: "app-submitted",
      status: "submitted",
      fee_status: "paid",
      primary_guardian_id: "guardian-1",
      created_at: "2026-01-01T00:00:00.000Z",
      submitted_at: "2026-01-02T00:00:00.000Z",
      updated_at: "2026-01-03T00:00:00.000Z",
      application_form_versions: {
        title: "Apply",
        public_slug: "apply",
        fee_config: { enabled: false },
        post_submit_config: null,
      },
      guardians: {
        id: "guardian-1",
        first_name: "Jamie",
        last_name: "Lee",
        email: "jamie@example.com",
      },
      families: null,
      programs: null,
      students: { first_name: "Alex", last_name: "Lee" },
    };

    const draftSummaryRow = {
      id: "app-draft",
      status: "draft",
      fee_status: "not_required",
      primary_guardian_id: "guardian-2",
      created_at: "2026-01-04T00:00:00.000Z",
      submitted_at: null,
      updated_at: "2026-01-05T00:00:00.000Z",
      application_form_versions: {
        title: "Apply",
        public_slug: "apply",
        fee_config: { enabled: false },
        post_submit_config: null,
      },
      guardians: {
        id: "guardian-2",
        first_name: "Taylor",
        last_name: "Ng",
        email: "taylor@example.com",
      },
      families: null,
      programs: null,
      students: null,
    };

    const draftProgressRow = {
      id: "app-draft",
      responses: {
        student_first_name: "Sam",
        __progress: { stepIndex: 1 },
      },
      fee_status: "not_required",
      application_form_versions: {
        schema: {
          version: 1,
          sections: [
            { id: "student", title: "Student", fields: [] },
            { id: "family", title: "Family", fields: [] },
          ],
          acknowledgments: [],
        },
        fee_config: { enabled: false },
      },
    };

    function createApplicationsQuery(calls: QueryCall[], mode: "list" | "count" | "draft") {
      const query = {
        select() {
          calls.push({ method: "select", args: [...arguments] });
          return query;
        },
        eq(column: string, value: string) {
          calls.push({ method: "eq", args: [column, value] });
          return query;
        },
        neq(column: string, value: string) {
          calls.push({ method: "neq", args: [column, value] });
          return query;
        },
        or(filters: string) {
          calls.push({ method: "or", args: [filters] });
          return query;
        },
        order(column: string, options: { ascending: boolean }) {
          calls.push({ method: "order", args: [column, options] });
          return query;
        },
        range(from: number, to: number) {
          calls.push({ method: "range", args: [from, to] });
          return query;
        },
        in(column: string, values: string[]) {
          calls.push({ method: "in", args: [column, values] });
          if (mode === "draft") {
            return {
              then(
                resolve: (value: { data: unknown[]; error: null }) => void,
                reject?: (reason: unknown) => void,
              ) {
                return Promise.resolve({
                  data: [draftProgressRow],
                  error: null,
                }).then(resolve, reject);
              },
            };
          }
          return query;
        },
        then(
          resolve: (value: unknown) => void,
          reject?: (reason: unknown) => void,
        ) {
          if (mode === "count") {
            return Promise.resolve({ count: 2, error: null }).then(resolve, reject);
          }
          return Promise.resolve({
            data: [submittedRow, draftSummaryRow],
            error: null,
          }).then(resolve, reject);
        },
      };

      return query;
    }

    function emptyQuery() {
      const query = {
        select: () => query,
        eq: () => query,
        neq: () => query,
        or: () => query,
        in: () => query,
        order: () => query,
        limit: () => query,
        maybeSingle: async () => ({ data: null, error: null }),
        then(
          resolve: (value: { data: unknown[]; error: null }) => void,
          reject?: (reason: unknown) => void,
        ) {
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };
      return query;
    }

    let applicationsFromCall = 0;
    const supabase = {
      from(table: string) {
        if (table !== "applications") {
          return emptyQuery();
        }

        applicationsFromCall += 1;
        if (applicationsFromCall === 1) {
          return createApplicationsQuery(listCalls, "list");
        }
        if (applicationsFromCall === 2) {
          return createApplicationsQuery(countCalls, "count");
        }
        return createApplicationsQuery([], "draft");
      },
    };

    const page = await listOrgApplicationSubmissionsPage(supabase as never, "org-1", {
      limit: 50,
      offset: 100,
      statusFilter: "all",
      formKey: "apply",
    });

    assert.deepEqual(listCalls.filter((call) => call.method === "range"), [
      { method: "range", args: [100, 149] },
    ]);
    assert.deepEqual(
      listCalls.filter((call) => call.method === "or"),
      [
        {
          method: "or",
          args: [
            "application_form_versions.public_slug.eq.apply,application_form_versions.title.eq.apply",
          ],
        },
      ],
    );
    assert.equal(page.totalCount, 2);
    assert.equal(page.submissions.length, 2);

    const submitted = page.submissions.find((row) => row.id === "app-submitted");
    assert.ok(submitted);
    assert.equal(submitted.applicationProgressSummary, null);
    assert.equal(submitted.stepIndex, 0);
    assert.equal(submitted.totalSteps, 0);
    assert.equal(submitted.studentLabel, "Alex Lee");

    const draft = page.submissions.find((row) => row.id === "app-draft");
    assert.ok(draft);
    assert.equal(draft.studentLabel, "Sam");
    assert.ok(draft.applicationProgressSummary);
    assert.equal(draft.applicationProgressSummary?.completed, 1);
    assert.equal(draft.totalSteps, 2);
  });
});
