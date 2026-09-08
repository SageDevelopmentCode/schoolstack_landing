"use client";

import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import type { ProgramCoopCurriculumRecord } from "@/lib/admissions/program-coop-curriculum-storage";
import CurriculumDiscussionPanel from "@/components/school-parent/curriculum/CurriculumDiscussionPanel";
import ProgramCoopCurriculumPdfViewer from "@/components/school-parent/curriculum/ProgramCoopCurriculumPdfViewer";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";

type ParentCurriculumPageProps = {
  organizationId: string;
  programId: string;
  curriculum: ProgramCoopCurriculumRecord | null;
  initialDiscussionMessages?: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

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
            <p className="mb-2 text-xs" style={{ color: theme.muted }}>
              View-only in the portal — downloading and printing are disabled.
            </p>
            <ProgramCoopCurriculumPdfViewer
              organizationId={organizationId}
              programId={programId}
              fileName={curriculum.fileName}
            />
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
