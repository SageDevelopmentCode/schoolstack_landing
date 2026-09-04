"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { buildEmbeddedPdfViewerUrl } from "@/lib/admissions/enrollment-checklist-document-storage";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import {
  createProgramCoopCurriculumSignedUrl,
  type ProgramCoopCurriculumRecord,
} from "@/lib/admissions/program-coop-curriculum-storage";
import CurriculumDiscussionPanel from "@/components/school-parent/curriculum/CurriculumDiscussionPanel";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { createClient } from "@/utils/supabase/client";

type ParentCurriculumPageProps = {
  organizationId: string;
  programId: string;
  curriculum: ProgramCoopCurriculumRecord | null;
  initialDiscussionMessages?: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
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
        className="flex h-full min-h-0 flex-1 items-center justify-center gap-2 text-sm"
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
        className="rounded-[12px] border px-4 py-6 text-sm"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.cream,
          color: theme.muted,
        }}
      >
        {error ?? "Curriculum is unavailable right now."}
      </p>
    );
  }

  return (
    <ParentCard
      theme={theme}
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] p-0"
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
        style={{ borderColor: theme.line }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0" style={{ color: theme.muted }} />
          <p className="truncate text-xs font-medium" style={{ color: theme.ink }}>
            {curriculum.fileName}
          </p>
        </div>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: theme.primary }}
          >
            Open in new tab
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 bg-white">
        <iframe
          title={curriculum.fileName}
          src={viewerUrl}
          className="h-full min-h-0 w-full"
        />
      </div>
    </ParentCard>
  );
}

export default function ParentCurriculumPage({
  organizationId,
  programId,
  curriculum,
  initialDiscussionMessages = [],
  currentGuardianId = null,
  previewMode = false,
}: ParentCurriculumPageProps) {
  const { theme } = useParentTheme();

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1250px] flex-1 flex-col px-3 pt-2 pb-0 sm:px-5 md:px-7">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-4">
        {curriculum ? (
          <div className="flex min-h-0 flex-col" data-testid="curriculum-pdf-viewer">
            <CurriculumPdfViewer curriculum={curriculum} />
          </div>
        ) : (
          <ParentCard
            theme={theme}
            className="flex min-h-0 items-center justify-center rounded-[14px] px-4 py-8 text-center"
          >
            <p className="text-sm" style={{ color: theme.muted }}>
              Curriculum hasn&apos;t been published yet. Check back soon.
            </p>
          </ParentCard>
        )}
        <div className="flex min-h-[280px] flex-col lg:min-h-0">
          <CurriculumDiscussionPanel
            organizationId={organizationId}
            programId={programId}
            initialMessages={initialDiscussionMessages}
            currentGuardianId={currentGuardianId}
            previewMode={previewMode}
          />
        </div>
      </div>
    </div>
  );
}
