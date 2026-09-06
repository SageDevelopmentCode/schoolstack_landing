import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeParentPortalMessagesScope,
  mainPortalMessageAudienceScope,
  programPortalMessageAudienceScope,
  resolveThreadProgramIdForContact,
  threadMatchesPortalContext,
  threadVisibleInProgramPortalInbox,
} from "./message-audience";

describe("message audience helpers", () => {
  it("builds audience scopes", () => {
    assert.deepEqual(mainPortalMessageAudienceScope(), { mode: "main_portal" });
    assert.deepEqual(programPortalMessageAudienceScope("program-1"), {
      mode: "program_portal",
      programId: "program-1",
    });
  });

  it("resolves thread program id for contacts", () => {
    assert.equal(
      resolveThreadProgramIdForContact({
        contactKind: "school_office",
        portalProgramId: "program-1",
      }),
      null,
    );
    assert.equal(
      resolveThreadProgramIdForContact({
        contactKind: "staff_member",
        portalProgramId: "program-1",
      }),
      "program-1",
    );
    assert.equal(
      resolveThreadProgramIdForContact({
        contactKind: "staff_member",
        portalProgramId: null,
      }),
      null,
    );
  });

  it("matches threads to portal context", () => {
    assert.equal(
      threadMatchesPortalContext({
        threadProgramId: null,
        contactKind: "staff_member",
        portalProgramId: null,
      }),
      true,
    );
    assert.equal(
      threadMatchesPortalContext({
        threadProgramId: "program-1",
        contactKind: "staff_member",
        portalProgramId: null,
      }),
      false,
    );
    assert.equal(
      threadMatchesPortalContext({
        threadProgramId: null,
        contactKind: "school_office",
        portalProgramId: "program-1",
      }),
      true,
    );
    assert.equal(
      threadMatchesPortalContext({
        threadProgramId: "program-1",
        contactKind: "staff_member",
        portalProgramId: "program-1",
      }),
      true,
    );
  });

  it("describes messages scope copy", () => {
    assert.match(describeParentPortalMessagesScope(false), /school-wide threads only/i);
    assert.match(describeParentPortalMessagesScope(true), /school office/i);
    assert.match(describeParentPortalMessagesScope(true), /main parent portal/i);
  });

  it("filters program portal inbox to program threads and school office", () => {
    assert.equal(
      threadVisibleInProgramPortalInbox({
        threadProgramId: "program-1",
        participants: [{ kind: "staff_member" }],
        programId: "program-1",
      }),
      true,
    );
    assert.equal(
      threadVisibleInProgramPortalInbox({
        threadProgramId: null,
        participants: [{ kind: "school_office" }],
        programId: "program-1",
      }),
      true,
    );
    assert.equal(
      threadVisibleInProgramPortalInbox({
        threadProgramId: null,
        participants: [{ kind: "staff_member" }],
        programId: "program-1",
      }),
      false,
    );
    assert.equal(
      threadVisibleInProgramPortalInbox({
        threadProgramId: "program-2",
        participants: [{ kind: "staff_member" }],
        programId: "program-1",
      }),
      false,
    );
  });
});
