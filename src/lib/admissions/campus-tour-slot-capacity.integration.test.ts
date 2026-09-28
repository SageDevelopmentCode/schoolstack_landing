import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_TOUR_POST_SUBMIT_ACTION_ID } from "./public-tour-settings";
import { FAMILY_TOUR_ACTION_TYPE } from "./family-tour-booking";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

const TOUR_DATE = "2030-06-15";
const TOUR_TIME = "10:00 AM";
const DURATION_MINUTES = 60;

type SlotSeed = {
  organizationId: string;
  slotIds: string[];
  visitIds: string[];
};

async function getTestOrganizationId(admin: SupabaseClient): Promise<string> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", TEST_ORG_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Integration seed aborted: organization "${TEST_ORG_SLUG}" not found. Run supabase db reset.`,
    );
  }

  return String(data.id);
}

function campusTourVisitRow(organizationId: string, suffix: string) {
  return {
    organization_id: organizationId,
    application_id: null,
    family_id: null,
    post_submit_action_id: PUBLIC_TOUR_POST_SUBMIT_ACTION_ID,
    action_type: FAMILY_TOUR_ACTION_TYPE,
    booking_source: "public",
    scheduling_mode: "time_slot",
    scheduled_date: TOUR_DATE,
    start_time_slot: TOUR_TIME,
    duration_minutes: DURATION_MINUTES,
    status: "scheduled",
    registrant: {
      contactName: `Tour Guest ${suffix}`,
      contactEmail: `tour-${suffix}@schoolstack.test`,
    },
  };
}

async function seedSingleExclusiveStartSlot(
  admin: SupabaseClient,
  organizationId: string,
  timeSlot: string = TOUR_TIME,
): Promise<SlotSeed> {
  const { data, error } = await admin
    .from("admissions_availability_slots")
    .insert({
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: timeSlot,
      tour_booking_mode: "exclusive",
      group_capacity: null,
      group_day_key: null,
    })
    .select("id");

  if (error) throw error;

  return {
    organizationId,
    slotIds: (data ?? []).map((row) => String(row.id)),
    visitIds: [],
  };
}

async function seedExclusiveSlots(
  admin: SupabaseClient,
  organizationId: string,
): Promise<SlotSeed> {
  const dates = [TOUR_DATE];
  const times = ["10:00 AM", "10:30 AM"];

  const { data, error } = await admin
    .from("admissions_availability_slots")
    .insert(
      dates.flatMap((date) =>
        times.map((time_slot) => ({
          organization_id: organizationId,
          date,
          time_slot,
          tour_booking_mode: "exclusive",
          group_capacity: null,
          group_day_key: null,
        })),
      ),
    )
    .select("id");

  if (error) throw error;

  return {
    organizationId,
    slotIds: (data ?? []).map((row) => String(row.id)),
    visitIds: [],
  };
}

async function seedMixedGroupAndExclusiveSlots(
  admin: SupabaseClient,
  organizationId: string,
  groupCapacity: number,
): Promise<SlotSeed> {
  const rows = [
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "9:30 AM",
      tour_booking_mode: "exclusive",
      group_capacity: null,
      group_day_key: null,
    },
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "10:00 AM",
      tour_booking_mode: "group",
      group_capacity: groupCapacity,
      group_day_key: null,
    },
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "10:30 AM",
      tour_booking_mode: "group",
      group_capacity: groupCapacity,
      group_day_key: null,
    },
  ];

  const { data, error } = await admin
    .from("admissions_availability_slots")
    .insert(rows)
    .select("id");

  if (error) throw error;

  return {
    organizationId,
    slotIds: (data ?? []).map((row) => String(row.id)),
    visitIds: [],
  };
}

async function seedOverlappingPerSlotGroupSlots(
  admin: SupabaseClient,
  organizationId: string,
  groupCapacity: number,
): Promise<SlotSeed> {
  const rows = [
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "9:30 AM",
      tour_booking_mode: "group",
      group_capacity: groupCapacity,
      group_day_key: null,
    },
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "10:00 AM",
      tour_booking_mode: "group",
      group_capacity: groupCapacity,
      group_day_key: null,
    },
    {
      organization_id: organizationId,
      date: TOUR_DATE,
      time_slot: "10:30 AM",
      tour_booking_mode: "group",
      group_capacity: groupCapacity,
      group_day_key: null,
    },
  ];

  const { data, error } = await admin
    .from("admissions_availability_slots")
    .insert(rows)
    .select("id");

  if (error) throw error;

  return {
    organizationId,
    slotIds: (data ?? []).map((row) => String(row.id)),
    visitIds: [],
  };
}

async function seedGroupSlots(
  admin: SupabaseClient,
  organizationId: string,
  capacity: number,
): Promise<SlotSeed> {
  const times = ["10:00 AM", "10:30 AM"];

  const { data, error } = await admin
    .from("admissions_availability_slots")
    .insert(
      times.map((time_slot) => ({
        organization_id: organizationId,
        date: TOUR_DATE,
        time_slot,
        tour_booking_mode: "group",
        group_capacity: capacity,
        group_day_key: null,
      })),
    )
    .select("id");

  if (error) throw error;

  return {
    organizationId,
    slotIds: (data ?? []).map((row) => String(row.id)),
    visitIds: [],
  };
}

async function cleanupSeed(admin: SupabaseClient, seed: SlotSeed): Promise<void> {
  if (seed.visitIds.length > 0) {
    await admin.from("admissions_scheduled_visits").delete().in("id", seed.visitIds);
  }

  if (seed.slotIds.length > 0) {
    await admin
      .from("admissions_availability_slots")
      .delete()
      .in("id", seed.slotIds);
  }
}

function isSlotUnavailableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const message = typeof error.message === "string" ? error.message : "";
  return error.code === "P0001" && message.includes("slot_unavailable");
}

describeIntegration("campus tour slot capacity trigger", () => {
  before(() => {
    loadTestEnv();
  });

  it("rejects a 60-minute tour when only the start availability cell exists", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedSingleExclusiveStartSlot(admin, organizationId);

    try {
      const suffix = randomUUID().slice(0, 8);
      const { error } = await admin
        .from("admissions_scheduled_visits")
        .insert(campusTourVisitRow(organizationId, suffix))
        .select("id")
        .single();

      assert.ok(isSlotUnavailableError(error));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });

  it("rejects parallel exclusive bookings for the same start time", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedExclusiveSlots(admin, organizationId);

    try {
      const suffixA = randomUUID().slice(0, 8);
      const suffixB = randomUUID().slice(0, 8);

      const [firstResult, secondResult] = await Promise.all([
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixA))
          .select("id")
          .single(),
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixB))
          .select("id")
          .single(),
      ]);

      const outcomes = [firstResult, secondResult];
      const successes = outcomes.filter((result) => !result.error);
      const failures = outcomes.filter((result) => result.error);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);
      assert.ok(isSlotUnavailableError(failures[0]?.error ?? null));

      const successId = successes[0]?.data?.id;
      assert.ok(successId);
      seed.visitIds.push(String(successId));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });

  it("rejects parallel exclusive and group bookings that overlap across start times", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedMixedGroupAndExclusiveSlots(admin, organizationId, 10);

    try {
      const suffixA = randomUUID().slice(0, 8);
      const suffixB = randomUUID().slice(0, 8);

      const [exclusiveResult, groupResult] = await Promise.all([
        admin
          .from("admissions_scheduled_visits")
          .insert({
            ...campusTourVisitRow(organizationId, suffixA),
            start_time_slot: "9:30 AM",
          })
          .select("id")
          .single(),
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixB))
          .select("id")
          .single(),
      ]);

      const outcomes = [exclusiveResult, groupResult];
      const successes = outcomes.filter((result) => !result.error);
      const failures = outcomes.filter((result) => result.error);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);
      assert.ok(isSlotUnavailableError(failures[0]?.error ?? null));

      const successId = successes[0]?.data?.id;
      assert.ok(successId);
      seed.visitIds.push(String(successId));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });

  it("rejects parallel per-slot group bookings that overlap across start times", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedOverlappingPerSlotGroupSlots(admin, organizationId, 10);

    try {
      const suffixA = randomUUID().slice(0, 8);
      const suffixB = randomUUID().slice(0, 8);

      const [firstResult, secondResult] = await Promise.all([
        admin
          .from("admissions_scheduled_visits")
          .insert({
            ...campusTourVisitRow(organizationId, suffixA),
            start_time_slot: "9:30 AM",
          })
          .select("id")
          .single(),
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixB))
          .select("id")
          .single(),
      ]);

      const outcomes = [firstResult, secondResult];
      const successes = outcomes.filter((result) => !result.error);
      const failures = outcomes.filter((result) => result.error);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);
      assert.ok(isSlotUnavailableError(failures[0]?.error ?? null));

      const successId = successes[0]?.data?.id;
      assert.ok(successId);
      seed.visitIds.push(String(successId));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });

  it("rejects an exclusive booking that overlaps a partially full group tour", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedMixedGroupAndExclusiveSlots(admin, organizationId, 10);

    try {
      const existingSuffix = randomUUID().slice(0, 8);
      const { data: existing, error: existingError } = await admin
        .from("admissions_scheduled_visits")
        .insert(campusTourVisitRow(organizationId, existingSuffix))
        .select("id")
        .single();

      if (existingError) throw existingError;
      assert.ok(existing?.id);
      seed.visitIds.push(String(existing.id));

      const overlapSuffix = randomUUID().slice(0, 8);
      const { error: overlapError } = await admin
        .from("admissions_scheduled_visits")
        .insert({
          ...campusTourVisitRow(organizationId, overlapSuffix),
          start_time_slot: "9:30 AM",
        })
        .select("id")
        .single();

      assert.ok(isSlotUnavailableError(overlapError));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });

  it("rejects parallel group bookings when capacity is already full", async () => {
    const admin = createTestAdminClient();
    const organizationId = await getTestOrganizationId(admin);
    const seed = await seedGroupSlots(admin, organizationId, 1);

    try {
      const existingSuffix = randomUUID().slice(0, 8);
      const { data: existing, error: existingError } = await admin
        .from("admissions_scheduled_visits")
        .insert(campusTourVisitRow(organizationId, existingSuffix))
        .select("id")
        .single();

      if (existingError) throw existingError;
      assert.ok(existing?.id);
      seed.visitIds.push(String(existing.id));

      const suffixA = randomUUID().slice(0, 8);
      const suffixB = randomUUID().slice(0, 8);

      const [firstResult, secondResult] = await Promise.all([
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixA))
          .select("id")
          .single(),
        admin
          .from("admissions_scheduled_visits")
          .insert(campusTourVisitRow(organizationId, suffixB))
          .select("id")
          .single(),
      ]);

      const outcomes = [firstResult, secondResult];
      const successes = outcomes.filter((result) => !result.error);
      const failures = outcomes.filter((result) => result.error);

      assert.equal(successes.length, 0);
      assert.equal(failures.length, 2);
      assert.ok(isSlotUnavailableError(failures[0]?.error ?? null));
      assert.ok(isSlotUnavailableError(failures[1]?.error ?? null));
    } finally {
      await cleanupSeed(admin, seed);
    }
  });
});
