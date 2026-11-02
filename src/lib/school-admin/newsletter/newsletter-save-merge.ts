import type {
  NewsletterEdition,
  NewsletterPhoto,
  NewsletterSchoolTemplate,
  NewsletterWorkspaceState,
} from "./newsletter-types";

function displaySrcFromSave(submittedSrc: string | undefined, resultSrc: string | undefined): string {
  const result = resultSrc?.trim() ?? "";
  if (result) return result;
  return submittedSrc?.trim() ?? "";
}

function mergePhotoDisplayAfterSave(
  submitted: NewsletterPhoto | undefined,
  result: NewsletterPhoto,
): NewsletterPhoto {
  if (!submitted) return result;
  return {
    ...result,
    src: displaySrcFromSave(submitted.src, result.src),
  };
}

/** Keep in-editor image URLs when the server clears inline src after persistence. */
export function mergeNewsletterEditionDisplayAfterSave(
  submitted: NewsletterEdition,
  result: NewsletterEdition,
): NewsletterEdition {
  const submittedById = new Map(submitted.photos.map((photo) => [photo.id, photo]));
  const photos = result.photos.map((photo) =>
    mergePhotoDisplayAfterSave(submittedById.get(photo.id), photo),
  );

  const coverImage = displaySrcFromSave(submitted.coverImage, result.coverImage) || undefined;

  return { ...result, photos, coverImage };
}

export function newsletterJsonEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function workspaceStatesEqual(
  a: NewsletterWorkspaceState,
  b: NewsletterWorkspaceState,
): boolean {
  return newsletterJsonEqual(a, b);
}

export type ApplyNewsletterSaveResultInput = {
  live: NewsletterWorkspaceState;
  submittedEdition: NewsletterEdition;
  submittedTemplate: NewsletterSchoolTemplate;
  savedEditionId: string;
  resultEdition: NewsletterEdition;
  resultTemplate: NewsletterSchoolTemplate;
};

/** Merge a save API response into the live workspace without discarding post-save edits. */
export function applyNewsletterSaveResultToLiveWorkspace(
  input: ApplyNewsletterSaveResultInput,
): NewsletterWorkspaceState {
  const {
    live,
    submittedEdition,
    submittedTemplate,
    savedEditionId,
    resultEdition,
    resultTemplate,
  } = input;

  const template = newsletterJsonEqual(live.template, submittedTemplate)
    ? resultTemplate
    : live.template;

  const editions = live.editions.map((edition) => {
    if (edition.id !== savedEditionId) return edition;
    return newsletterJsonEqual(edition, submittedEdition) ? resultEdition : edition;
  });

  return { ...live, template, editions };
}

export function buildSavedBaselineAfterNewsletterSave(
  previousBaseline: NewsletterWorkspaceState,
  live: NewsletterWorkspaceState,
  savedEditionId: string,
  resultEdition: NewsletterEdition,
  resultTemplate: NewsletterSchoolTemplate,
): NewsletterWorkspaceState {
  const baselineHasSavedEdition = previousBaseline.editions.some(
    (edition) => edition.id === savedEditionId,
  );
  let editions = previousBaseline.editions.map((edition) =>
    edition.id === savedEditionId ? resultEdition : edition,
  );
  if (!baselineHasSavedEdition) {
    editions = [...editions, resultEdition];
  }

  return {
    ...previousBaseline,
    school: live.school,
    activeEditionId: live.activeEditionId,
    template: resultTemplate,
    editions,
  };
}
