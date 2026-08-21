import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "lighthouserc.js",
      "scripts/**/*.cjs",
      "src/test/integration/**/*.cjs",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: [
      "src/components/demo/**/*DashboardDemo.tsx",
      "src/components/sections/*DashboardDemo.tsx",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "apps/**",
  ]),
]);

export default eslintConfig;
