export const ACTIVITY_CLIENT_HEADER = "x-schoolstack-client";
export const ACTIVITY_PLATFORM_HEADER = "x-schoolstack-platform";

export type ActivityClient = "web" | "mobile";
export type ActivityPlatform = "ios" | "android";

export type ActivityClientMetadata = {
  client: ActivityClient;
  platform?: ActivityPlatform;
  appVersion?: string;
};

function normalizeActivityClient(value: string | null): ActivityClient {
  return value?.trim().toLowerCase() === "mobile" ? "mobile" : "web";
}

function normalizeActivityPlatform(
  value: string | null,
): ActivityPlatform | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "ios" || normalized === "android") {
    return normalized;
  }
  return undefined;
}

export function activityClientMetadataFromRequest(
  request: Request,
): ActivityClientMetadata {
  const client = normalizeActivityClient(
    request.headers.get(ACTIVITY_CLIENT_HEADER),
  );
  const platform = normalizeActivityPlatform(
    request.headers.get(ACTIVITY_PLATFORM_HEADER),
  );

  return {
    client,
    ...(platform ? { platform } : {}),
  };
}

export function mergeActivityClientMetadata(
  request: Request | undefined,
  metadata?: Record<string, unknown>,
): Record<string, unknown> {
  if (!request) {
    return metadata ?? {};
  }

  const clientMetadata = activityClientMetadataFromRequest(request);
  return {
    ...(metadata ?? {}),
    ...clientMetadata,
  };
}

export function activityClientMetadataForStripeSession(
  request: Request,
): Record<string, string> {
  const metadata = activityClientMetadataFromRequest(request);
  const result: Record<string, string> = { client: metadata.client };
  if (metadata.platform) {
    result.platform = metadata.platform;
  }
  return result;
}

export function activityClientMetadataFromStripeMetadata(
  metadata: Record<string, string | null | undefined>,
): ActivityClientMetadata | null {
  const client = metadata.client?.trim().toLowerCase();
  if (client !== "mobile" && client !== "web") {
    return null;
  }

  const platform = normalizeActivityPlatform(metadata.platform ?? null);
  return {
    client: client === "mobile" ? "mobile" : "web",
    ...(platform ? { platform } : {}),
  };
}

export function formatActivityClientLabel(
  metadata: Record<string, unknown> | undefined,
): string | null {
  if (!metadata || metadata.client !== "mobile") {
    return null;
  }

  const platform = metadata.platform;
  if (platform === "ios" || platform === "android") {
    return `Mobile (${platform})`;
  }

  return "Mobile";
}
