import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { organizationSettingsTag } from "./cache-tags";
import {
  revalidateOrganizationSettings,
  revalidateOrganizationSettingsById,
} from "./revalidate";

describe("organization settings revalidation", () => {
  it("tags are scoped to the school slug", () => {
    assert.equal(organizationSettingsTag("rooted-meadows"), "org-settings:rooted-meadows");
  });

  it("never throws outside a Next request", () => {
    assert.doesNotThrow(() => revalidateOrganizationSettings("rooted-meadows"));
    assert.doesNotThrow(() => revalidateOrganizationSettings(""));
    assert.doesNotThrow(() => revalidateOrganizationSettings(null));
  });

  it("a failed slug lookup never fails the save", async () => {
    const supabase = {
      from() {
        throw new Error("db down");
      },
    } as unknown as SupabaseClient;
    await assert.doesNotReject(() =>
      revalidateOrganizationSettingsById(supabase, "org-1"),
    );
  });
});
