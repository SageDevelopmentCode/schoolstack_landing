import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { resolveParentPortalHomeBulletinLimit } from "./load-parent-portal-home-api-payload";

describe("load-parent-portal-home-api-payload", () => {
  it("caps bulletin posts on parent portal home", () => {
    assert.equal(resolveParentPortalHomeBulletinLimit(true), 3);
    assert.equal(resolveParentPortalHomeBulletinLimit(false), 3);
  });

  it("uses program-scoped event audience for program portal home", () => {
    const programId = "prog-123";
    assert.notDeepEqual(
      programPortalAudienceScope(programId),
      mainPortalAudienceScope(),
    );
    assert.deepEqual(programPortalAudienceScope(programId), {
      mode: "program_portal",
      programId,
    });
  });
});
