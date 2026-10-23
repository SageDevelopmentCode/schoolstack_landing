import type { MobileErrorReportOptions, MobileErrorReporter } from '@/lib/mobile-error-reporter';

let reporter: MobileErrorReporter | null = null;

export function setMobileGlobalErrorReporter(next: MobileErrorReporter | null): void {
  reporter = next;
}

export function reportMobileGlobalOperationalError(
  operation: string,
  err: unknown,
  options?: MobileErrorReportOptions,
): void {
  reporter?.(operation, err, options);
}
