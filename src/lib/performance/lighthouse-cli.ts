import type { AuditFormFactor } from "./types";

export function buildLighthouseArgs(
  url: string,
  formFactor: AuditFormFactor,
  outputPath: string,
  options?: { extraHeaders?: Record<string, string> },
): string[] {
  const base = [
    url,
    "--output=json",
    `--output-path=${outputPath}`,
    "--chrome-flags=--headless --no-sandbox",
    "--only-categories=performance",
    "--quiet",
  ];

  const extraHeaders = options?.extraHeaders;
  if (extraHeaders && Object.keys(extraHeaders).length > 0) {
    base.push(`--extra-headers=${JSON.stringify(extraHeaders)}`);
  }

  if (formFactor === "desktop") {
    return [...base, "--preset=desktop"];
  }

  return [...base, "--form-factor=mobile"];
}

type ExecException = Error & {
  stderr?: string;
  stdout?: string;
};

export function formatExecError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Lighthouse audit failed.";
  }

  const execError = error as ExecException;
  const stderr = execError.stderr?.trim();
  const stdout = execError.stdout?.trim();

  if (stderr) {
    const lastLine = stderr.split(/\r?\n/).filter(Boolean).at(-1);
    if (lastLine) return lastLine;
  }

  if (stdout) {
    const lastLine = stdout.split(/\r?\n/).filter(Boolean).at(-1);
    if (lastLine) return lastLine;
  }

  return error.message || "Lighthouse audit failed.";
}
