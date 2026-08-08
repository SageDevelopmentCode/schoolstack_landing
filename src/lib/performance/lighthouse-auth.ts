import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  playwrightCookiesToPuppeteer,
  type PuppeteerCookie,
} from "@/lib/performance/playwright-cookies-for-puppeteer";
import type { PageAuth } from "@/lib/performance/types";

export const AUTH_STATE_PATHS: Record<Exclude<PageAuth, "none">, string> = {
  school_admin: join(process.cwd(), "e2e/.auth/school-admin.json"),
  parent: join(process.cwd(), "e2e/.auth/parent.json"),
};

const PREPARE_COMMAND = "npm run performance:ci:prepare";

type PlaywrightStorageState = {
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Strict" | "Lax" | "None";
  }>;
};

export function assertAuthStateReady(auth: Exclude<PageAuth, "none">): void {
  const statePath = AUTH_STATE_PATHS[auth];
  if (!existsSync(statePath)) {
    throw new Error(
      `Missing Playwright auth state for "${auth}" at ${statePath}. Run ${PREPARE_COMMAND} first.`,
    );
  }
}

export function loadCookiesForPageAuth(
  auth: PageAuth,
  hostname: string,
): PuppeteerCookie[] {
  if (auth === "none") {
    return [];
  }

  assertAuthStateReady(auth);

  const statePath = AUTH_STATE_PATHS[auth];
  const state = JSON.parse(readFileSync(statePath, "utf8")) as PlaywrightStorageState;
  return playwrightCookiesToPuppeteer(state.cookies ?? [], hostname);
}

export function buildCookieHeader(cookies: PuppeteerCookie[]): string {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}
