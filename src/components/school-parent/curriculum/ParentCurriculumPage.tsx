"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import {
  createProgramCoopCurriculumSignedUrl,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { createClient } from "@/utils/supabase/client";

type ParentCurriculumPageProps = {
  schoolName: string;
  programPortalLabel?: string;
  curriculum: ProgramCoopCurriculumRecord | null;
  previewMode?: boolean;
};

function CurriculumPdfViewer({ curriculum }: { curriculum: ProgramCoopCurriculumRecord }) {
  const supabase = useMemo(() => createClient(), []);
  const { theme } = useParentTheme();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUrls() {
      setLoading(true);
      setError(null);
      try {
        const signedUrl = await createProgramCoopCurriculumSignedUrl(
          supabase,
          curriculum.storagePath,
        );
        if (cancelled) return;
        setDownloadUrl(signedUrl);
        setViewerUrl(buildEmbeddedPdfViewerUrl(signedUrl));
      } catch {
        if (!cancelled) {
          setError("We couldn't load the curriculum PDF. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUrls();
    return () => {
      cancelled = true;
    };
  }, [curriculum.storagePath, supabase]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-16 text-sm"
        style={{ color: theme.muted }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading curriculum…
      </div>
    );
  }

  if (error || !viewerUrl) {
    return (
      <p
        className="rounded-[14px] border px-4 py-6 text-sm"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surface,
          color: theme.muted,
        }}
      >
        {error ?? "Curriculum is unavailable right now."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm" style={{ color: theme.muted }}>{curriculum.fileName}</p>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
            style={{ color: theme.primary }}
          >
            Open in new tab
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      <div
        className="overflow-hidden rounded-[14px] border bg-white"
        style={{ borderColor: theme.border }}
      >
        <iframe
          title={curriculum.fileName}
          src={viewerUrl}
          className="h-[min(72vh,900px)] w-full"
        />
      </div>
    </div>
  );
}

export default function ParentCurriculumPage({
  schoolName,
  programPortalLabel,
  curriculum,
  previewMode = false,
}: ParentCurriculumPageProps) {
  const { theme } = useParentTheme();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <ParentSectionKicker theme={theme}>
          {programPortalLabel ?? schoolName}
        </ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1">
          Curriculum
        </ParentDisplayHeading>
        <p className="mt-2 text-[15px]" style={{ color: theme.muted }}>
          Your co-op curriculum guide
          {previewMode ? " (preview)" : ""}.
        </p>
      </div>

      {curriculum ? (
        <CurriculumPdfViewer curriculum={curriculum} />
      ) : (
        <div
          className="rounded-[14px] border px-4 py-8 text-center"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <p className="text-sm" style={{ color: theme.muted }}>
            Curriculum hasn&apos;t been published yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
