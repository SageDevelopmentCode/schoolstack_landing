import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import {
  applyNewsletterSaveResultToLiveWorkspace,
  buildSavedBaselineAfterNewsletterSave,
  mergeNewsletterEditionDisplayAfterSave,
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

describe("mergeNewsletterEditionDisplayAfterSave", () => {
  it("preserves submitted photo src when server clears inline src after upload", () => {
    const template = defaultSchoolTemplate();
    const submitted = createBlankEdition(template);
    submitted.photos = [
      {
        id: "photo-1",
        src: "data:image/png;base64,abc",
        caption: "Field trip",
        storagePath: undefined,
      },
    ];
    const result = {
      ...structuredClone(submitted),
      photos: [
        {
          id: "photo-1",
          src: "",
          caption: "Field trip",
          storagePath: "org/edition/photo-1.png",
        },
      ],
    };

    const merged = mergeNewsletterEditionDisplayAfterSave(submitted, result);

    assert.equal(merged.photos[0]?.src, "data:image/png;base64,abc");
    assert.equal(merged.photos[0]?.storagePath, "org/edition/photo-1.png");
  });

  it("preserves gallery photo display src when server returns empty src", () => {
    const template = defaultSchoolTemplate();
    const submitted = createBlankEdition(template);
    submitted.photos = [
      {
        id: "photo-2",
        src: "https://cdn.example/gallery/1.jpg",
        caption: "",
        galleryPhotoId: "gallery-1",
      },
    ];
    const result = {
      ...structuredClone(submitted),
      photos: [
        {
          id: "photo-2",
          src: "",
          caption: "",
          galleryPhotoId: "gallery-1",
        },
      ],
    };

    const merged = mergeNewsletterEditionDisplayAfterSave(submitted, result);

    assert.equal(merged.photos[0]?.src, "https://cdn.example/gallery/1.jpg");
    assert.equal(merged.photos[0]?.galleryPhotoId, "gallery-1");
  });

  it("prefers server signed URL over submitted data URL when present", () => {
    const template = defaultSchoolTemplate();
    const submitted = createBlankEdition(template);
    submitted.photos = [
      {
        id: "photo-3",
        src: "data:image/png;base64,old",
        caption: "",
      },
    ];
    const result = {
      ...structuredClone(submitted),
      photos: [
        {
          id: "photo-3",
          src: "https://signed.example/photo-3.jpg",
          caption: "",
          storagePath: "org/edition/photo-3.png",
        },
      ],
    };

    const merged = mergeNewsletterEditionDisplayAfterSave(submitted, result);

    assert.equal(merged.photos[0]?.src, "https://signed.example/photo-3.jpg");
  });

  it("preserves submitted cover when server returns empty coverImage", () => {
    const template = defaultSchoolTemplate();
    const submitted = createBlankEdition(template);
    submitted.coverImage = "data:image/png;base64,cover";
    const result = {
      ...structuredClone(submitted),
      coverImage: undefined,
    };

    const merged = mergeNewsletterEditionDisplayAfterSave(submitted, result);

    assert.equal(merged.coverImage, "data:image/png;base64,cover");
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

  it("adds newly saved edition to baseline when it was only in live workspace", () => {
    const template = defaultSchoolTemplate();
    const submittedSnapshot = createBlankEdition(template);
    submittedSnapshot.storyBlocks[0]!.value = "Saved content";
    const previousBaseline: NewsletterWorkspaceState = {
      school: { name: "Test School", signature: "Team", primary: "#336699" },
      template: structuredClone(template),
      editions: [],
      activeEditionId: submittedSnapshot.id,
    };
    const live = workspaceWithEdition(submittedSnapshot, template);
    const resultEdition = structuredClone(submittedSnapshot);

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

    assert.equal(baseline.editions.length, 1);
    assert.equal(baseline.editions[0]?.id, submittedSnapshot.id);
    assert.equal(workspaceStatesEqual(display, baseline), true);
  });
});
