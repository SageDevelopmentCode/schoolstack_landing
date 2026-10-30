import type {
  NewsletterEdition,
  NewsletterSchoolTemplate,
  NewsletterWorkspaceState,
} from "./newsletter-types";

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
  return {
    ...previousBaseline,
    school: live.school,
    activeEditionId: live.activeEditionId,
    template: resultTemplate,
    editions: previousBaseline.editions.map((edition) =>
      edition.id === savedEditionId ? resultEdition : edition,
    ),
  };
}
