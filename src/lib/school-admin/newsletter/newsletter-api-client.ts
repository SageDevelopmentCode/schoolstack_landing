import type {
  NewsletterEdition,
  NewsletterSchoolTemplate,
  NewsletterWorkspaceState,
} from "./newsletter-types";
import type { NewsletterEditionVersion } from "./newsletter-version-snapshot";

export type { NewsletterEditionVersion } from "./newsletter-version-snapshot";

type ApiErrorBody = {
  error?: string;
  code?: string;
};

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

export async function fetchNewsletterWorkspace(
  slug: string,
): Promise<NewsletterWorkspaceState> {
  const response = await fetch(`/api/school/${slug}/newsletters`, {
    method: "GET",
    credentials: "include",
  });
  return readJson(response);
}

export type CreateNewsletterEditionBody = {
  week: string;
  weekEnd?: string;
  title?: string;
  cloneFromEditionId?: string;
};

export async function createNewsletterEditionApi(
  slug: string,
  body: CreateNewsletterEditionBody,
): Promise<NewsletterEdition> {
  const response = await fetch(`/api/school/${slug}/newsletters/editions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await readJson<{ edition: NewsletterEdition }>(response);
  return data.edition;
}

export async function updateNewsletterEditionApi(
  slug: string,
  editionId: string,
  edition: NewsletterEdition,
): Promise<NewsletterEdition> {
  const response = await fetch(`/api/school/${slug}/newsletters/editions/${editionId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ edition }),
  });
  const data = await readJson<{ edition: NewsletterEdition }>(response);
  return data.edition;
}

export async function deleteNewsletterEditionApi(
  slug: string,
  editionId: string,
): Promise<void> {
  const response = await fetch(`/api/school/${slug}/newsletters/editions/${editionId}`, {
    method: "DELETE",
    credentials: "include",
  });
  await readJson(response);
}

export async function saveNewsletterTemplateApi(
  slug: string,
  template: NewsletterSchoolTemplate,
): Promise<NewsletterSchoolTemplate> {
  const response = await fetch(`/api/school/${slug}/newsletters/template`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template }),
  });
  const data = await readJson<{ template: NewsletterSchoolTemplate }>(response);
  return data.template;
}

export async function publishNewsletterEditionApi(
  slug: string,
  editionId: string,
): Promise<NewsletterEdition> {
  const response = await fetch(
    `/api/school/${slug}/newsletters/editions/${editionId}/publish`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = await readJson<{ edition: NewsletterEdition }>(response);
  return data.edition;
}

export async function importNewsletterWorkspaceApi(
  slug: string,
  workspace: NewsletterWorkspaceState,
): Promise<NewsletterWorkspaceState> {
  const response = await fetch(`/api/school/${slug}/newsletters/import`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace }),
  });
  return readJson(response);
}

export async function saveNewsletterEditionWithVersionApi(
  slug: string,
  editionId: string,
  edition: NewsletterEdition,
  template: NewsletterSchoolTemplate,
): Promise<{
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  version: NewsletterEditionVersion;
}> {
  const response = await fetch(
    `/api/school/${slug}/newsletters/editions/${editionId}/save`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edition, template }),
    },
  );
  return readJson(response);
}

export async function listNewsletterEditionVersionsApi(
  slug: string,
  editionId: string,
): Promise<NewsletterEditionVersion[]> {
  const response = await fetch(
    `/api/school/${slug}/newsletters/editions/${editionId}/versions`,
    { method: "GET", credentials: "include" },
  );
  const data = await readJson<{ versions: NewsletterEditionVersion[] }>(response);
  return data.versions;
}

export async function restoreNewsletterEditionVersionApi(
  slug: string,
  editionId: string,
  versionId: string,
): Promise<NewsletterEdition> {
  const response = await fetch(
    `/api/school/${slug}/newsletters/editions/${editionId}/versions/${versionId}/restore`,
    { method: "POST", credentials: "include" },
  );
  const data = await readJson<{ edition: NewsletterEdition }>(response);
  return data.edition;
}
