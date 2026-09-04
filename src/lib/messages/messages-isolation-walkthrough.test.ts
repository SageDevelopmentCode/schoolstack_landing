import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mainPortalMessageAudienceScope,
  programPortalMessageAudienceScope,
  resolveThreadProgramIdForContact,
  threadMatchesPortalContext,
  threadVisibleInProgramPortalInbox,
} from "./message-audience";

const COOP_PROGRAM_ID = "0e4d91d2-9f42-41d5-9b6f-a651cb46bd78";
const JULIUS_STAFF_ID = "de361d3a-02a2-4fbb-9ed9-e102e4b1edb5";

type WalkthroughThread = {
  id: string;
  programId: string | null;
  participantSignature: string;
};

function threadVisibleInMainPortal(thread: WalkthroughThread): boolean {
  return thread.programId === null;
}

function threadVisibleInCoopPortal(thread: WalkthroughThread, programId: string): boolean {
  const participants = thread.participantSignature.includes("school_office")
    ? [{ kind: "school_office" as const }]
    : [{ kind: "staff_member" as const }];
  return threadVisibleInProgramPortalInbox({
    threadProgramId: thread.programId,
    participants,
    programId,
  });
}

function buildWalkthroughThreads(input: {
  hasCoopTeacherThread: boolean;
}): WalkthroughThread[] {
  const guardianPrefix = "guardian:e9aed79e-4376-4e51-9d17-8d9b017caade";
  const threads: WalkthroughThread[] = [
    {
      id: "office-main",
      programId: null,
      participantSignature: `${guardianPrefix}|school_office`,
    },
    {
      id: "julius-staff-main",
      programId: null,
      participantSignature: `${guardianPrefix}|staff:${JULIUS_STAFF_ID}`,
    },
  ];

  if (input.hasCoopTeacherThread) {
    threads.push({
      id: "julius-staff-coop",
      programId: COOP_PROGRAM_ID,
      participantSignature: `${guardianPrefix}|staff:${JULIUS_STAFF_ID}`,
    });
  }

  return threads;
}

describe("messages isolation walkthrough (rooted-meadows-demo Cecilia family)", () => {
  it("Step 0: co-op teacher thread gets program_id on create from co-op portal", () => {
    assert.equal(
      resolveThreadProgramIdForContact({
        contactKind: "staff_member",
        portalProgramId: COOP_PROGRAM_ID,
      }),
      COOP_PROGRAM_ID,
    );
    assert.equal(
      resolveThreadProgramIdForContact({
        contactKind: "school_office",
        portalProgramId: COOP_PROGRAM_ID,
      }),
      null,
    );
  });

  it("Step 1: main portal inbox shows only program_id null threads", () => {
    const threads = buildWalkthroughThreads({ hasCoopTeacherThread: true });
    const mainThreads = threads.filter(threadVisibleInMainPortal);

    assert.equal(mainThreads.length, 2);
    assert.ok(mainThreads.every((thread) => thread.programId === null));
    assert.ok(
      mainThreads.some((thread) => thread.participantSignature.includes("school_office")),
    );
    assert.ok(
      mainThreads.some((thread) => thread.participantSignature.includes(JULIUS_STAFF_ID)),
    );
  });

  it("Steps 2–3: co-op-only Julius Staff thread hidden on main portal", () => {
    const threads = buildWalkthroughThreads({ hasCoopTeacherThread: true });
    const coopOnly = threads.find((thread) => thread.id === "julius-staff-coop");

    assert.ok(coopOnly);
    assert.equal(threadVisibleInMainPortal(coopOnly!), false);
  });

  it("Steps 2–3: openContact matches separate main vs co-op Julius Staff threads", () => {
    const legacyMainThread = threadMatchesPortalContext({
      threadProgramId: null,
      contactKind: "staff_member",
      portalProgramId: null,
    });
    const legacyOnCoopPortal = threadMatchesPortalContext({
      threadProgramId: null,
      contactKind: "staff_member",
      portalProgramId: COOP_PROGRAM_ID,
    });
    const coopThreadOnCoopPortal = threadMatchesPortalContext({
      threadProgramId: COOP_PROGRAM_ID,
      contactKind: "staff_member",
      portalProgramId: COOP_PROGRAM_ID,
    });
    const coopThreadOnMainPortal = threadMatchesPortalContext({
      threadProgramId: COOP_PROGRAM_ID,
      contactKind: "staff_member",
      portalProgramId: null,
    });

    assert.equal(legacyMainThread, true);
    assert.equal(legacyOnCoopPortal, false);
    assert.equal(coopThreadOnCoopPortal, true);
    assert.equal(coopThreadOnMainPortal, false);
  });

  it("Steps 4–5: co-op portal includes office and co-op teacher threads only", () => {
    const threads = buildWalkthroughThreads({ hasCoopTeacherThread: true });
    const coopThreads = threads.filter((thread) =>
      threadVisibleInCoopPortal(thread, COOP_PROGRAM_ID),
    );

    assert.equal(coopThreads.length, 2);
    assert.ok(coopThreads.some((thread) => thread.id === "office-main"));
    assert.ok(coopThreads.some((thread) => thread.id === "julius-staff-coop"));
    assert.equal(
      coopThreads.some((thread) => thread.id === "julius-staff-main"),
      false,
    );
  });

  it("Step 6: preview/live scopes match main vs program portal audience", () => {
    assert.deepEqual(mainPortalMessageAudienceScope(), { mode: "main_portal" });
    assert.deepEqual(programPortalMessageAudienceScope(COOP_PROGRAM_ID), {
      mode: "program_portal",
      programId: COOP_PROGRAM_ID,
    });
  });

  it("pass/fail checklist: new co-op teacher thread absent from main, present in co-op", () => {
    const threads = buildWalkthroughThreads({ hasCoopTeacherThread: true });
    const coopOnlyTeacherThreads = threads.filter(
      (thread) =>
        thread.programId === COOP_PROGRAM_ID &&
        thread.participantSignature.includes(JULIUS_STAFF_ID),
    );

    assert.equal(coopOnlyTeacherThreads.length, 1);
    assert.equal(
      threads.filter(threadVisibleInMainPortal).some(
        (thread) => thread.programId === COOP_PROGRAM_ID,
      ),
      false,
    );
    assert.equal(
      threads
        .filter((thread) => threadVisibleInCoopPortal(thread, COOP_PROGRAM_ID))
        .some((thread) => thread.id === "julius-staff-coop"),
      true,
    );
  });
});
