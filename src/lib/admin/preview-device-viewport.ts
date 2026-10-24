export const ADMIN_PREVIEW_MOBILE_WIDTH = 402;
export const ADMIN_PREVIEW_MOBILE_HEIGHT = 874;
export const ADMIN_PREVIEW_MOBILE_ASPECT =
  ADMIN_PREVIEW_MOBILE_WIDTH / ADMIN_PREVIEW_MOBILE_HEIGHT;

/** Bezel thickness on each side of the preview device chrome. */
export const ADMIN_PREVIEW_DEVICE_BEZEL_PX = 10;

export const ADMIN_PREVIEW_EMBED_PARAM = "previewEmbed";
export const ADMIN_PREVIEW_EMBED_COOKIE = "mk_admin_preview_embed";
export const ADMIN_PREVIEW_VIEWPORT_STORAGE_KEY = "adminPreviewViewport";

/** postMessage `type` when the mobile preview iframe navigates. */
export const ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE = "mk-admin-preview-embed-route";

export type AdminPreviewEmbedRouteMessage = {
  type: typeof ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE;
  pathname: string;
  search: string;
};

export type AdminPreviewViewportMode = "desktop" | "mobile";

const ADMIN_PREVIEW_EMBEDDABLE_PATH =
  /^\/admin\/preview\/[^/]+\/(family|teacher|admin)(\/|$)/;

export function isAdminPreviewEmbeddablePath(pathname: string): boolean {
  return ADMIN_PREVIEW_EMBEDDABLE_PATH.test(pathname);
}

export function isAdminPreviewEmbedSearchParam(
  value: string | null | undefined,
): boolean {
  return value === "1" || value === "true";
}

export function withPreviewEmbedSearchParams(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set(ADMIN_PREVIEW_EMBED_PARAM, "1");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Minimal shape for Next.js `ReadonlyURLSearchParams` and `URLSearchParams`. */
export type ReadonlyURLSearchParamsLike = {
  toString(): string;
};

export function buildPreviewEmbedHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
): string {
  return withPreviewEmbedSearchParams(pathname, searchParams);
}

export function stripPreviewEmbedFromSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(ADMIN_PREVIEW_EMBED_PARAM);
  return params;
}

export function buildPreviewOuterHref(
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike | string,
): string {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : stripPreviewEmbedFromSearchParams(searchParams);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function isAdminPreviewEmbedRouteMessage(
  data: unknown,
): data is AdminPreviewEmbedRouteMessage {
  if (!data || typeof data !== "object") {
    return false;
  }
  const message = data as Record<string, unknown>;
  return (
    message.type === ADMIN_PREVIEW_EMBED_ROUTE_MESSAGE &&
    typeof message.pathname === "string" &&
    typeof message.search === "string"
  );
}
