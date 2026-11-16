"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, Loader2, RotateCcw } from "lucide-react";
import {
  GIcon,
  GSkeleton,
  G_FOCUS,
  gBtnOutlineSm,
} from "@/components/school-parent/garden/ui";
import { fetchParentFormDownloadUrl } from "@/lib/school-parent/forms-documents/fetch-parent-form-download-url";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";
import { STAFF_PREVIEW_PENDING, useParentFormPreviewUrl } from "../ParentFormDocumentPreview";

const fileLink = `inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-3 py-1.5 text-[13px] font-extrabold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-ink)]/45 disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;

type GardenFormDocumentPreviewProps = {
  form: TeacherParentForm;
  organizationId: string;
  readOnly?: boolean;
  remoteDownloadEnabled?: boolean;
  previewUrl?: string | null;
  localPreviewUrl?: string | null;
  previewHeightClass: string;
};

/**
 * Garden view of an uploaded form: a file strip (name, size, open/download)
 * above the embedded PDF. Word files can't preview in the browser, so they get
 * a clear download step instead.
 */
export default function GardenFormDocumentPreview({
  form,
  organizationId,
  readOnly = false,
  remoteDownloadEnabled = true,
  previewUrl = null,
  localPreviewUrl = null,
  previewHeightClass,
}: GardenFormDocumentPreviewProps) {
  const { previewState, loadPreview } = useParentFormPreviewUrl({
    form,
    organizationId,
    readOnly,
    remoteDownloadEnabled,
    previewUrl,
    localPreviewUrl,
  });
  const [downloading, setDownloading] = useState(false);
  const isDocx = form.uploadFormat === "docx";
  const knownUrl = previewUrl ?? localPreviewUrl;
  const canFetch = remoteDownloadEnabled && !readOnly;
  const fileName = form.uploadFileName ?? (isDocx ? "Word document" : "PDF document");

  async function openDocument() {
    if (knownUrl) {
      window.open(knownUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!canFetch) return;
    // Open the tab synchronously so pop-up blockers allow it, then point it at the signed URL.
    const tab = window.open("", "_blank");
    setDownloading(true);
    try {
      const url = await fetchParentFormDownloadUrl(form.id, organizationId);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch (error) {
      tab?.close();
      parentToast.error("Couldn't open the document", {
        position: "top-center",
        description: `${error instanceof Error ? error.message : "Failed to load document."} Please try again in a moment.`,
      });
    } finally {
      setDownloading(false);
    }
  }

  const readyUrl = previewState.status === "ready" ? previewState.rawUrl : null;
  const canOpen = Boolean(knownUrl || readyUrl || canFetch);

  const strip = (
    <div className="flex flex-wrap items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3.5 py-2.5">
      <GIcon size="sm">
        <FileText />
      </GIcon>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[14px] font-extrabold text-[var(--sf-ink)]" title={fileName}>
          {fileName}
        </p>
        <p className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">
          {isDocx ? "Word document" : "PDF"}
          {form.uploadFileSize ? ` · ${form.uploadFileSize}` : ""}
        </p>
      </div>
      {readyUrl && !isDocx ? (
        <a href={readyUrl} target="_blank" rel="noopener noreferrer" className={fileLink}>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          Open in new tab
        </a>
      ) : (
        <button
          type="button"
          onClick={() => void openDocument()}
          disabled={!canOpen || downloading}
          aria-busy={downloading || undefined}
          className={fileLink}
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : isDocx ? (
            <Download className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          )}
          {isDocx ? "Download" : "Open in new tab"}
        </button>
      )}
    </div>
  );

  let body: React.ReactNode;
  if (isDocx) {
    body = (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-sky)]/50 px-5 py-8 text-center">
        <p className="m-0 max-w-md text-[14px] font-semibold text-[var(--sf-ink)]/75">
          Word preview isn&apos;t available in the browser — download the file to review it before signing.
        </p>
      </div>
    );
  } else if (previewState.status === "loading") {
    body =
      !remoteDownloadEnabled && !previewUrl && !localPreviewUrl ? (
        <div
          className="flex min-h-[160px] items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-4 text-center"
          aria-busy="true"
          aria-label="Loading document preview"
        >
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">{STAFF_PREVIEW_PENDING}</p>
        </div>
      ) : (
        <div aria-busy="true" aria-label="Loading document preview">
          <GSkeleton className={`${previewHeightClass} w-full !rounded-[18px]`} />
        </div>
      );
  } else if (previewState.status === "error") {
    body = (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-[18px] bg-[var(--sf-peach)]/60 px-5 py-6 text-center">
        <p className="m-0 max-w-md text-[14px] font-extrabold text-[var(--sf-clay-deep)]">{previewState.message}</p>
        {!readOnly ? (
          <button type="button" className={gBtnOutlineSm} onClick={() => void loadPreview()}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        ) : null}
      </div>
    );
  } else {
    body = (
      <div className="overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)]">
        <iframe
          src={previewState.url}
          title={form.uploadFileName ?? "Document preview"}
          className={`${previewHeightClass} w-full border-0`}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {strip}
      {body}
    </div>
  );
}
