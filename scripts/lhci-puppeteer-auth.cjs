const fs = require("node:fs");
const path = require("node:path");

const AUTH_ROUTES_PATH = path.join(__dirname, "lhci-auth-routes.json");
const AUTH_STATE_PATHS = {
  school_admin: path.join(process.cwd(), "e2e/.auth/school-admin.json"),
  parent: path.join(process.cwd(), "e2e/.auth/parent.json"),
};

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function loadAuthRoutes() {
  return JSON.parse(fs.readFileSync(AUTH_ROUTES_PATH, "utf8"));
}

function playwrightCookiesToPuppeteer(cookies, hostname) {
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
      const puppeteerCookie = {
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain.startsWith(".") ? cookie.domain : cookie.domain,
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

function loadCookiesForAuth(auth, hostname) {
  const statePath = AUTH_STATE_PATHS[auth];
  if (!statePath || !fs.existsSync(statePath)) {
    throw new Error(
      `Missing Playwright auth state for "${auth}" at ${statePath}. Run npm run performance:ci:prepare.`,
    );
  }

  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  return playwrightCookiesToPuppeteer(state.cookies ?? [], hostname);
}

/**
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} context
 */
module.exports = async (browser, context) => {
  const targetUrl = new URL(context.url);
  const routes = loadAuthRoutes();
  const pathname = normalizePathname(targetUrl.pathname);
  const auth = routes[pathname] ?? routes[targetUrl.pathname] ?? "none";

  const page = await browser.newPage();
  try {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");

    if (auth === "none") {
      return;
    }

    const cookies = loadCookiesForAuth(auth, targetUrl.hostname);
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }
  } finally {
    await page.close();
  }
};
