import {
  PUBLIC_SUPPORT_REQUEST_TOPICS,
  type PublicSupportRequestTopic,
} from "@/lib/public-support/public-support-types";

export const MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PublicSupportRequestBody = {
  name: string;
  email: string;
  topic: PublicSupportRequestTopic;
  message: string;
  sourcePagePath?: string | null;
};

export type PublicSupportRequestValidationResult =
  | { ok: true; value: PublicSupportRequestBody }
  | { ok: false; error: string };

export function validatePublicSupportRequestBody(
  body: unknown,
): PublicSupportRequestValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const topic = typeof record.topic === "string" ? record.topic.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const sourcePagePathRaw =
    typeof record.sourcePagePath === "string"
      ? record.sourcePagePath.trim()
      : "";

  if (!name || !email || !topic || !message) {
    return { ok: false, error: "Missing required fields." };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Invalid email address." };
  }

  if (
    !PUBLIC_SUPPORT_REQUEST_TOPICS.includes(topic as PublicSupportRequestTopic)
  ) {
    return { ok: false, error: "Invalid topic." };
  }

  if (message.length > MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH) {
    return { ok: false, error: "Message is too long." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      topic: topic as PublicSupportRequestTopic,
      message,
      sourcePagePath: sourcePagePathRaw || null,
    },
  };
}
