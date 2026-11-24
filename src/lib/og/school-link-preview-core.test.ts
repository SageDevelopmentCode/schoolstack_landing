import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contrastRatio,
  headlineSize,
  parseSchoolPreviewPage,
  PREVIEW_INK,
  resolveSchoolLogoSource,
  schoolInitials,
  schoolPreviewImagePath,
  schoolPreviewPalette,
  schoolPreviewVersion,
  truncateText,
} from "@/lib/og/school-link-preview-core";

const SUPABASE = "https://abcd.supabase.co";
const BUCKET = `${SUPABASE}/storage/v1/object/public/organization-branding/org-1/logo.webp`;

describe("resolveSchoolLogoSource", () => {
  it("allows our public images and the school's branding upload", () => {
    assert.deepEqual(resolveSchoolLogoSource("/images/demo/rootedmeadows/Main+Logo.webp", SUPABASE), {
      kind: "public",
      path: "/images/demo/rootedmeadows/Main+Logo.webp",
    });
    assert.deepEqual(resolveSchoolLogoSource(BUCKET, SUPABASE), { kind: "remote", url: BUCKET });
  });

  it("refuses other hosts, other buckets, traversal and protocol-relative URLs", () => {
    for (const src of [
      "https://evil.example.com/logo.png",
      "http://abcd.supabase.co/storage/v1/object/public/organization-branding/x.png",
      `${SUPABASE}/storage/v1/object/public/other-bucket/x.png`,
      `${SUPABASE}/storage/v1/object/public/organization-branding/../secret/x.png`,
      "/images/../../.env",
      "/images/%2e%2e/%2e%2e/.env",
      "/etc/passwd",
      "//evil.example.com/logo.png",
      "",
      "   ",
    ]) {
      assert.equal(resolveSchoolLogoSource(src, SUPABASE), null, src);
    }
  });

  it("allows a local Supabase over http in development", () => {
    const local = "http://127.0.0.1:54321";
    const url = `${local}/storage/v1/object/public/organization-branding/a.png`;
    assert.deepEqual(resolveSchoolLogoSource(url, local), { kind: "remote", url });
  });
});

describe("schoolPreviewPalette", () => {
  it("keeps the school name readable on the paper", () => {
    for (const accent of ["#827096", "#FFE58A", "#1F3329", "#E0F0FF", "not-a-colour"]) {
      const p = schoolPreviewPalette({ accent });
      assert.ok(contrastRatio(p.name, p.paper) >= 4.5, `${accent}: name ${p.name} on ${p.paper}`);
      assert.ok(contrastRatio(PREVIEW_INK, p.paper) >= 7, `${accent}: headline on ${p.paper}`);
      assert.ok(contrastRatio(p.onAccent, p.accent) >= 3, `${accent}: initials`);
    }
  });
});

describe("copy helpers", () => {
  it("truncates on a word boundary with an ellipsis", () => {
    assert.equal(truncateText("short", 20), "short");
    const out = truncateText("Pick a time that works for you. We will send a confirmation to the email you provide.", 40);
    assert.ok(out.length <= 40 && out.endsWith("…"), out);
  });

  it("shrinks long headlines", () => {
    assert.ok(headlineSize("Apply") > headlineSize("Schedule a campus tour at Rooted Meadows Waldorf School today"));
  });

  it("makes initials from the main words", () => {
    assert.equal(schoolInitials("The Woodlands Microschool"), "WM");
    assert.equal(schoolInitials("Sage Field"), "SF");
    assert.equal(schoolInitials("Kineo"), "K");
  });

  it("defaults unknown pages to the portal card", () => {
    assert.equal(parseSchoolPreviewPage("tour"), "tour");
    assert.equal(parseSchoolPreviewPage("../admin"), "portal");
    assert.equal(parseSchoolPreviewPage(null), "portal");
  });
});

describe("image URL", () => {
  it("changes version when branding or copy changes", () => {
    const a = schoolPreviewVersion(["Sage Field", "/logo.png", "#2E4A3C", "Schedule a tour"]);
    assert.equal(a, schoolPreviewVersion(["Sage Field", "/logo.png", "#2E4A3C", "Schedule a tour"]));
    assert.notEqual(a, schoolPreviewVersion(["Sage Field", "/logo.png", "#A05C45", "Schedule a tour"]));
  });

  it("builds a site-relative, path-only URL", () => {
    assert.equal(
      schoolPreviewImagePath("sage-field", { page: "form", form: "apply 2026", version: "abc" }),
      "/school/sage-field/link-preview/form/abc/apply%202026",
    );
    assert.equal(schoolPreviewImagePath("sage-field", { page: "tour", version: "x1" }), "/school/sage-field/link-preview/tour/x1");
  });
});
