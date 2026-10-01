import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPublicFormHoneypotTripped,
  readPublicFormHoneypot,
  PUBLIC_FORM_HONEYPOT_FIELD,
} from "@/lib/public-forms/honeypot";

describe("public form honeypot", () => {
  it("reads honeypot field from body", () => {
    assert.equal(
      readPublicFormHoneypot({ [PUBLIC_FORM_HONEYPOT_FIELD]: "filled" }),
      "filled",
    );
    assert.equal(readPublicFormHoneypot({}), null);
  });

  it("detects tripped honeypot", () => {
    assert.equal(isPublicFormHoneypotTripped("bot"), true);
    assert.equal(isPublicFormHoneypotTripped(null), false);
  });
});
