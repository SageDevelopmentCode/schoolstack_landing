/** Matches mobile preview / impersonation requests (`apps/mobile` preview session store). */
export const MOBILE_PREVIEW_HEADER = "X-MudKitchen-Preview";

export function isMobilePreviewRequest(request: Request): boolean {
  const value = request.headers.get(MOBILE_PREVIEW_HEADER)?.trim();
  return value === "1" || value?.toLowerCase() === "true";
}
