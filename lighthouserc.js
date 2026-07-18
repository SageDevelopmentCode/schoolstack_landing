/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/get-started",
        "http://localhost:3000/customers",
      ],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      numberOfRuns: 1,
      settings: {
        preset: "perf",
        formFactor: "mobile",
        screenEmulation: { mobile: true },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.6 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 5000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 600 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.15 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
