const fs = require("node:fs");
const path = require("node:path");
const { register } = require("tsx/cjs/api");

register();

const {
  loadCookiesForPageAuth,
} = require("../src/lib/performance/lighthouse-auth.ts");

const AUTH_ROUTES_PATH = path.join(__dirname, "lhci-auth-routes.json");

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function loadAuthRoutes() {
  return JSON.parse(fs.readFileSync(AUTH_ROUTES_PATH, "utf8"));
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

    const cookies = loadCookiesForPageAuth(auth, targetUrl.hostname);
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }
  } finally {
    await page.close();
  }
};
