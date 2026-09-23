import { getRequestIp } from "@/lib/public-forms/request-ip";

type TurnstileVerifyResponse = {
  success?: boolean;
};

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: string,
  ip: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return false;

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) return false;

    const data = (await response.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}

export async function verifyTurnstileFromRequest(
  request: Request,
  token: string | null | undefined,
): Promise<boolean> {
  const trimmed = token?.trim();
  if (!trimmed) return false;
  return verifyTurnstileToken(trimmed, getRequestIp(request));
}
