import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type PublicFormRateLimitResult =
  | { ok: true }
  | { ok: false; error: string };

let ipLimiter: Ratelimit | null = null;
let emailHourlyLimiter: Ratelimit | null = null;
let emailGapLimiter: Ratelimit | null = null;

export function isUpstashRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function getRedis(): Redis {
  return Redis.fromEnv();
}

function getIpLimiter(): Ratelimit {
  if (!ipLimiter) {
    ipLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "public-form:ip",
    });
  }
  return ipLimiter;
}

function getEmailHourlyLimiter(): Ratelimit {
  if (!emailHourlyLimiter) {
    emailHourlyLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "public-form:email-hourly",
    });
  }
  return emailHourlyLimiter;
}

function getEmailGapLimiter(): Ratelimit {
  if (!emailGapLimiter) {
    emailGapLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.fixedWindow(1, "60 s"),
      prefix: "public-form:email-gap",
    });
  }
  return emailGapLimiter;
}

function normalizeEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

export async function checkPublicFormRateLimits(opts: {
  ip: string | null;
  email?: string | null;
}): Promise<PublicFormRateLimitResult> {
  if (opts.ip) {
    const ipResult = await getIpLimiter().limit(opts.ip);
    if (!ipResult.success) {
      return {
        ok: false,
        error: "Too many submissions from this network. Please try again later.",
      };
    }
  }

  const email = normalizeEmail(opts.email);
  if (email) {
    const hourlyResult = await getEmailHourlyLimiter().limit(email);
    if (!hourlyResult.success) {
      return {
        ok: false,
        error: "Too many submissions for this email. Please try again later.",
      };
    }

    const gapResult = await getEmailGapLimiter().limit(email);
    if (!gapResult.success) {
      return {
        ok: false,
        error: "Please wait a moment before submitting again.",
      };
    }
  }

  return { ok: true };
}
