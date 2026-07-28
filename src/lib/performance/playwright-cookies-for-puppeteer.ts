export type PlaywrightCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
};

export type PuppeteerCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

function normalizeDomain(domain: string, hostname: string): string {
  if (domain.startsWith(".")) return domain;
  if (domain === hostname || domain === `localhost`) return domain;
  if (hostname === "localhost" && domain.includes("localhost")) return domain;
  return domain;
}

export function playwrightCookiesToPuppeteer(
  cookies: PlaywrightCookie[],
  hostname: string,
): PuppeteerCookie[] {
  return cookies
    .filter((cookie) => {
      const domain = cookie.domain.replace(/^\./, "");
      return (
        hostname === domain ||
        hostname.endsWith(domain) ||
        (hostname === "localhost" && domain.includes("localhost"))
      );
    })
    .map((cookie) => {
      const puppeteerCookie: PuppeteerCookie = {
        name: cookie.name,
        value: cookie.value,
        domain: normalizeDomain(cookie.domain, hostname),
        path: cookie.path || "/",
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      };

      if (cookie.expires > 0) {
        puppeteerCookie.expires = cookie.expires;
      }

      return puppeteerCookie;
    });
}
