"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportApplicationPdf } from "@/lib/admissions/export-application-pdf";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ApplicationPdfDownloadButtonProps = {
  C: AdminThemeTokens;
  downloadLabel: string;
  getElement: () => HTMLElement | null;
  errorClassName?: string;
};

export default function ApplicationPdfDownloadButton({
  C,
  downloadLabel,
  getElement,
  errorClassName,
}: ApplicationPdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPdf = useCallback(async () => {
    const element = getElement();
    if (!element) return;

    setDownloading(true);
    setDownloadError(null);
    try {
      await exportApplicationPdf(element, downloadLabel);
    } catch {
      setDownloadError("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [downloadLabel, getElement]);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void handleDownloadPdf()}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        style={getAdminButtonStyle(C, "secondary")}
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Download PDF
      </button>
      {downloadError ? (
        <p
          className={errorClassName ?? "text-xs"}
          style={{ color: C.error }}
        >
          {downloadError}
        </p>
      ) : null}
    </div>
  );
}
