/** @type {import('@lhci/cli').Config} */
const { register } = require("tsx/cjs/api");
register();

const { resolveCiLighthouseUrls } = require("./src/lib/performance/page-manifest.ts");

module.exports = {
  ci: {
    collect: {
      chromePath: process.env.CHROME_PATH,
      puppeteerScript: "./scripts/lhci-puppeteer-auth.cjs",
      url: resolveCiLighthouseUrls("ci"),
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      numberOfRuns: 1,
      settings: {
        preset: "perf",
        formFactor: "mobile",
        screenEmulation: { mobile: true },
        maxWaitForLoad: 90000,
        disableStorageReset: true,
        chromeFlags: process.env.CI
          ? "--headless --no-sandbox --disable-dev-shm-usage --disable-gpu"
          : "--headless",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.6 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 5000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 600 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.15 }],
        "bootup-time": ["warn", { maxNumericValue: 3000 }],
        "dom-size": ["warn", { maxNumericValue: 1500 }],
        "mainthread-work-breakdown": ["warn", { maxNumericValue: 6000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
