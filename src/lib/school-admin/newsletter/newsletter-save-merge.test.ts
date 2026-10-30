import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import {
  applyNewsletterSaveResultToLiveWorkspace,
  buildSavedBaselineAfterNewsletterSave,
  workspaceStatesEqual,
} from "./newsletter-save-merge";
import type {
  NewsletterEdition,
  NewsletterSchoolTemplate,
  NewsletterWorkspaceState,
} from "./newsletter-types";

function workspaceWithEdition(
  edition: NewsletterEdition,
  template: NewsletterSchoolTemplate = defaultSchoolTemplate(),
): NewsletterWorkspaceState {
  return {
    school: { name: "Test School", signature: "Team", primary: "#336699" },
    template: structuredClone(template),
    editions: [structuredClone(edition)],
    activeEditionId: edition.id,
  };
}

describe("applyNewsletterSaveResultToLiveWorkspace", () => {
  it("uses server edition when live matches submitted", () => {
    const template = defaultSchoolTemplate();
    const submitted = createBlankEdition(template);
    submitted.storyBlocks[0]!.value = "Submitted text";
    const submittedSnapshot = structuredClone(submitted);
    const live = workspaceWithEdition(submittedSnapshot, template);
    const resultEdition = {
      ...submittedSnapshot,
      coverImage: "https://signed.example/cover.jpg",
    };

    const merged = applyNewsletterSaveResultToLiveWorkspace({
      live,
      submittedEdition: submittedSnapshot,
      submittedTemplate: live.template,
      savedEditionId: submittedSnapshot.id,
      resultEdition,
      resultTemplate: live.template,
    });

    assert.equal(merged.editions[0]?.coverImage, "https://signed.example/cover.jpg");
  });

  it("keeps live edition when user edited during save", () => {
    const template = defaultSchoolTemplate();
    const submittedSnapshot = createBlankEdition(template);
    submittedSnapshot.storyBlocks[0]!.value = "Submitted text";
    const live = workspaceWithEdition(submittedSnapshot, template);
    live.editions[0]!.storyBlocks[0]!.value = "Typed during save";
    const resultEdition = {
      ...submittedSnapshot,
      coverImage: "https://signed.example/cover.jpg",
    };

    const merged = applyNewsletterSaveResultToLiveWorkspace({
      live,
      submittedEdition: submittedSnapshot,
      submittedTemplate: live.template,
      savedEditionId: submittedSnapshot.id,
      resultEdition,
      resultTemplate: live.template,
    });

    assert.equal(merged.editions[0]?.storyBlocks[0]?.value, "Typed during save");
    assert.equal(merged.editions[0]?.coverImage, undefined);
  });

  it("uses server template when live template matches submitted", () => {
    const template = defaultSchoolTemplate();
    template.teacherUpdatesHeading = "From the classroom";
    const submittedSnapshot = createBlankEdition(template);
    const live = workspaceWithEdition(submittedSnapshot, template);
    const resultTemplate = {
      ...template,
      teacherUpdatesHeading: "From our teachers",
    };

    const merged = applyNewsletterSaveResultToLiveWorkspace({
      live,
      submittedEdition: submittedSnapshot,
      submittedTemplate: structuredClone(template),
      savedEditionId: submittedSnapshot.id,
      resultEdition: submittedSnapshot,
      resultTemplate,
    });

    assert.equal(merged.template.teacherUpdatesHeading, "From our teachers");
  });

  it("keeps live template when user edited template during save", () => {
    const submittedTemplate = defaultSchoolTemplate();
    submittedTemplate.teacherUpdatesHeading = "Submitted heading";
    const submittedSnapshot = createBlankEdition(submittedTemplate);
    const live = workspaceWithEdition(submittedSnapshot, submittedTemplate);
    live.template.teacherUpdatesHeading = "Live heading";
    const resultTemplate = {
      ...submittedTemplate,
      teacherUpdatesHeading: "Server heading",
    };

    const merged = applyNewsletterSaveResultToLiveWorkspace({
      live,
      submittedEdition: submittedSnapshot,
      submittedTemplate: structuredClone(submittedTemplate),
      savedEditionId: submittedSnapshot.id,
      resultEdition: submittedSnapshot,
      resultTemplate,
    });

    assert.equal(merged.template.teacherUpdatesHeading, "Live heading");
  });
});

describe("buildSavedBaselineAfterNewsletterSave and workspaceStatesEqual", () => {
  it("marks dirty when live content diverges from saved baseline", () => {
    const template = defaultSchoolTemplate();
    const submittedSnapshot = createBlankEdition(template);
    submittedSnapshot.storyBlocks[0]!.value = "Submitted";
    const previousBaseline = workspaceWithEdition(submittedSnapshot, template);
    const live = workspaceWithEdition(submittedSnapshot, template);
    live.editions[0]!.storyBlocks[0]!.value = "During save";
    const resultEdition = {
      ...submittedSnapshot,
      coverImage: "https://signed.example/cover.jpg",
    };

    const baseline = buildSavedBaselineAfterNewsletterSave(
      previousBaseline,
      live,
      submittedSnapshot.id,
      resultEdition,
      template,
    );
    const display = applyNewsletterSaveResultToLiveWorkspace({
      live,
      submittedEdition: submittedSnapshot,
      submittedTemplate: template,
      savedEditionId: submittedSnapshot.id,
      resultEdition,
      resultTemplate: template,
    });

    assert.equal(workspaceStatesEqual(display, baseline), false);
  });
});
