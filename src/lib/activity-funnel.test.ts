import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  APPLICATION_FUNNEL_STAGES,
  buildFunnelStages,
  computeFunnelFromEvents,
  ENROLLMENT_FUNNEL_STAGES,
  getStageMembershipIds,
  mergeStageDetailRows,
  type FunnelEventRow,
  type FunnelStageApplicationEnrichment,
  type FunnelStageDefinition,
  type FunnelStageEventRow,
} from "@/lib/activity-funnel";

const APPLICATION_STAGES: FunnelStageDefinition[] = [
  {
    key: "started",
    label: "Application started",
    action: ACTIVITY_ACTIONS.APPLICATION_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "submitted",
    label: "Application submitted",
    action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
    matchOn: "entity_id",
  },
  {
    key: "payment_started",
    label: "Payment started",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "payment_completed",
    label: "Payment completed",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    matchOn: "entity_id",
  },
];

const ENROLLMENT_STAGES: FunnelStageDefinition[] = [
  {
    key: "started",
    label: "Enrollment started",
    action: ACTIVITY_ACTIONS.ENROLLMENT_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "completed",
    label: "Enrollment completed",
    action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
    matchOn: "metadata.applicationId",
  },
];

describe("computeFunnelFromEvents", () => {
  it("returns zero counts for an empty cohort", () => {
    const counts = computeFunnelFromEvents(
      new Set(),
      [],
      APPLICATION_STAGES,
    );

    assert.deepEqual(counts, {
      started: 0,
      submitted: 0,
      payment_started: 0,
      payment_completed: 0,
    });
  });

  it("counts milestones for submit-first and pay-first application paths", () => {
    const cohort = new Set(["app-1", "app-2", "app-3"]);
    const events: FunnelEventRow[] = [
      {
        action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
        entity_id: "app-1",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
        entity_id: "app-1",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        entity_id: "app-1",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
        entity_id: "app-2",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        entity_id: "app-2",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
        entity_id: "app-2",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
        entity_id: "app-3",
        metadata: {},
      },
    ];

    const counts = computeFunnelFromEvents(cohort, events, APPLICATION_STAGES);

    assert.deepEqual(counts, {
      started: 3,
      submitted: 3,
      payment_started: 2,
      payment_completed: 2,
    });
  });

  it("matches enrollment completion via metadata.applicationId", () => {
    const cohort = new Set(["app-1", "app-2"]);
    const events: FunnelEventRow[] = [
      {
        action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
        entity_id: "enrollment-1",
        metadata: { applicationId: "app-1" },
      },
      {
        action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
        entity_id: "enrollment-2",
        metadata: { applicationId: "app-3" },
      },
    ];

    const counts = computeFunnelFromEvents(cohort, events, ENROLLMENT_STAGES);

    assert.deepEqual(counts, {
      started: 2,
      completed: 1,
    });
  });

  it("ignores events outside the cohort", () => {
    const cohort = new Set(["app-1"]);
    const events: FunnelEventRow[] = [
      {
        action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
        entity_id: "app-2",
        metadata: {},
      },
    ];

    const counts = computeFunnelFromEvents(cohort, events, APPLICATION_STAGES);

    assert.equal(counts.started, 1);
    assert.equal(counts.submitted, 0);
  });
});

describe("buildFunnelStages", () => {
  it("computes conversion and drop-off between stages", () => {
    const stages = buildFunnelStages(
      APPLICATION_STAGES,
      {
        started: 4,
        submitted: 3,
        payment_started: 2,
        payment_completed: 1,
      },
      4,
    );

    assert.equal(stages[0].count, 4);
    assert.equal(stages[0].percentOfCohort, 100);
    assert.equal(stages[0].conversionFromPrevious, null);

    assert.equal(stages[1].count, 3);
    assert.equal(stages[1].percentOfCohort, 75);
    assert.equal(stages[1].conversionFromPrevious, 75);
    assert.equal(stages[1].dropOffFromPrevious, 25);

    assert.equal(stages[2].count, 2);
    assert.equal(stages[2].conversionFromPrevious, 66.66666666666666);
    assert.equal(stages[2].dropOffFromPrevious, 33.33333333333334);

    assert.equal(stages[3].count, 1);
    assert.equal(stages[3].conversionFromPrevious, 50);
    assert.equal(stages[3].dropOffFromPrevious, 50);
  });

  it("handles a zero cohort without divide-by-zero errors", () => {
    const stages = buildFunnelStages(
      APPLICATION_STAGES,
      {
        started: 0,
        submitted: 0,
        payment_started: 0,
        payment_completed: 0,
      },
      0,
    );

    assert.equal(stages[0].percentOfCohort, 0);
    assert.equal(stages[1].conversionFromPrevious, null);
    assert.equal(stages[1].dropOffFromPrevious, null);
  });

  it("reports 100 percent conversion when every cohort member reaches the next stage", () => {
    const stages = buildFunnelStages(
      ENROLLMENT_STAGES,
      {
        started: 2,
        completed: 2,
      },
      2,
    );

    assert.equal(stages[1].conversionFromPrevious, 100);
    assert.equal(stages[1].dropOffFromPrevious, 0);
  });
});

describe("PRODUCT_FUNNELS exports", () => {
  it("includes application and enrollment stage definitions", () => {
    assert.equal(APPLICATION_FUNNEL_STAGES.length, 4);
    assert.equal(ENROLLMENT_FUNNEL_STAGES.length, 2);
  });
});

describe("getStageMembershipIds", () => {
  it("returns the full cohort for the first stage", () => {
    const cohort = new Set(["app-1", "app-2"]);
    const membership = getStageMembershipIds(
      cohort,
      [],
      APPLICATION_STAGES,
      "started",
    );

    assert.deepEqual(membership, cohort);
  });

  it("returns milestone members for later stages", () => {
    const cohort = new Set(["app-1", "app-2", "app-3"]);
    const events: FunnelEventRow[] = [
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        entity_id: "app-1",
        metadata: {},
      },
      {
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
        entity_id: "app-2",
        metadata: {},
      },
    ];

    const membership = getStageMembershipIds(
      cohort,
      events,
      APPLICATION_STAGES,
      "payment_completed",
    );

    assert.deepEqual(membership, new Set(["app-1", "app-2"]));
  });

  it("matches enrollment completion via metadata.applicationId", () => {
    const cohort = new Set(["app-1", "app-2"]);
    const events: FunnelEventRow[] = [
      {
        action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
        entity_id: "enrollment-1",
        metadata: { applicationId: "app-1" },
      },
    ];

    const membership = getStageMembershipIds(
      cohort,
      events,
      ENROLLMENT_STAGES,
      "completed",
    );

    assert.deepEqual(membership, new Set(["app-1"]));
  });
});

describe("mergeStageDetailRows", () => {
  const applications: FunnelStageApplicationEnrichment[] = [
    {
      id: "app-1",
      status: "submitted",
      familyId: "family-1",
      studentLabel: "Ava Smith",
      guardianEmail: "parent@example.com",
      familyEmail: null,
      organizationId: "org-1",
      organizationName: "Rooted Meadows",
      organizationSlug: "rooted-meadows",
      formTitle: "Fall Application",
    },
    {
      id: "app-2",
      status: "draft",
      familyId: null,
      studentLabel: "Ben Lee",
      guardianEmail: null,
      familyEmail: "family2@example.com",
      organizationId: "org-1",
      organizationName: "Rooted Meadows",
      organizationSlug: "rooted-meadows",
      formTitle: "Fall Application",
    },
  ];

  it("keeps the earliest event per application and sorts by reachedAt desc", () => {
    const events: FunnelStageEventRow[] = [
      {
        applicationId: "app-1",
        actorEmail: "event@example.com",
        reachedAt: "2026-07-10T12:00:00.000Z",
        organizationId: "org-1",
        organizationName: "Rooted Meadows",
        organizationSlug: "rooted-meadows",
        formTitle: null,
      },
      {
        applicationId: "app-1",
        actorEmail: "later@example.com",
        reachedAt: "2026-07-11T12:00:00.000Z",
        organizationId: "org-1",
        organizationName: "Rooted Meadows",
        organizationSlug: "rooted-meadows",
        formTitle: null,
      },
      {
        applicationId: "app-2",
        actorEmail: null,
        reachedAt: "2026-07-12T12:00:00.000Z",
        organizationId: "org-1",
        organizationName: "Rooted Meadows",
        organizationSlug: "rooted-meadows",
        formTitle: null,
      },
    ];

    const rows = mergeStageDetailRows(events, applications);

    assert.equal(rows.length, 2);
    assert.equal(rows[0].applicationId, "app-2");
    assert.equal(rows[1].applicationId, "app-1");
    assert.equal(rows[1].actorEmail, "event@example.com");
    assert.equal(rows[1].reachedAt, "2026-07-10T12:00:00.000Z");
  });

  it("builds preview href and email fallbacks from application data", () => {
    const rows = mergeStageDetailRows(
      [
        {
          applicationId: "app-1",
          actorEmail: null,
          reachedAt: "2026-07-10T12:00:00.000Z",
          organizationId: "org-1",
          organizationName: "Rooted Meadows",
          organizationSlug: "rooted-meadows",
          formTitle: null,
        },
        {
          applicationId: "app-2",
          actorEmail: null,
          reachedAt: "2026-07-09T12:00:00.000Z",
          organizationId: "org-1",
          organizationName: "Rooted Meadows",
          organizationSlug: "rooted-meadows",
          formTitle: null,
        },
      ],
      applications,
    );

    assert.equal(
      rows.find((row) => row.applicationId === "app-1")?.previewHref,
      "/admin/preview/rooted-meadows/family/family-1/apply/app-1",
    );
    assert.equal(
      rows.find((row) => row.applicationId === "app-1")?.actorEmail,
      "parent@example.com",
    );
    assert.equal(
      rows.find((row) => row.applicationId === "app-2")?.actorEmail,
      "family2@example.com",
    );
    assert.equal(
      rows.find((row) => row.applicationId === "app-2")?.previewHref,
      null,
    );
  });
});
