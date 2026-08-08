/**
 * Resolve which CI Lighthouse page paths to audit for the current git diff.
 *
 * Usage:
 *   npx tsx scripts/resolve-performance-ci-pages.ts --full
 *   npx tsx scripts/resolve-performance-ci-pages.ts --base origin/main
 */

import { execSync } from "node:child_process";
import { CI_LHCI_PAGE_PATHS } from "@/lib/performance/page-manifest";
import { resolveCiPagesFromChangedFiles } from "@/lib/performance/resolve-ci-pages-from-diff";

function log(message: string) {
  console.error(`[performance:ci:pages] ${message}`);
}

function parseArgs(argv: string[]) {
  let baseRef: string | null = null;
  let full = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--full") {
      full = true;
      continue;
    }

    if (arg === "--base") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--base requires a git ref.");
      }
      baseRef = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (full && baseRef) {
    throw new Error("Use either --full or --base, not both.");
  }

  if (!full && !baseRef) {
    throw new Error("Pass --full or --base <ref>.");
  }

  return { baseRef, full };
}

function listChangedFiles(baseRef: string): string[] {
  const output = execSync(`git diff --name-only ${baseRef}...HEAD`, {
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  const { baseRef, full } = parseArgs(process.argv.slice(2));

  const paths = full
    ? [...CI_LHCI_PAGE_PATHS]
    : resolveCiPagesFromChangedFiles(listChangedFiles(baseRef!));

  log(
    full
      ? `Using full CI page set (${paths.length} paths).`
      : `Resolved ${paths.length} path(s) from ${baseRef}...HEAD.`,
  );
  log(paths.join("\n"));

  process.stdout.write(paths.join(" "));
}

main();
