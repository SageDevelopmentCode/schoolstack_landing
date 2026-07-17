import type { AuditFormFactor } from "./types";
import {
  extractLighthouseFromPsiResponse,
  normalizeLighthouseResult,
} from "./lighthouse-parse";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function runPageSpeedInsights(
  url: string,
  formFactor: AuditFormFactor,
): Promise<{ raw: unknown; metrics: ReturnType<typeof normalizeLighthouseResult> }> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy: formFactor === "mobile" ? "mobile" : "desktop",
    category: "performance",
  });

  const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PageSpeed Insights failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const raw = await response.json();
  const lighthouseResult = extractLighthouseFromPsiResponse(raw);
  if (!lighthouseResult) {
    throw new Error("PageSpeed Insights response missing lighthouseResult");
  }

  return {
    raw,
    metrics: normalizeLighthouseResult(lighthouseResult),
  };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
