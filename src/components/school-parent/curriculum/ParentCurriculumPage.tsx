"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import type { ProgramCoopCurriculumRecord } from "@/lib/admissions/program-coop-curriculum-storage";
import CurriculumDiscussionSidebar from "@/components/school-parent/curriculum/CurriculumDiscussionSidebar";
import CurriculumGuideListPanel from "@/components/school-parent/curriculum/CurriculumGuideListPanel";
import ProgramCoopCurriculumPdfViewer from "@/components/school-parent/curriculum/ProgramCoopCurriculumPdfViewer";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";

type ParentCurriculumPageProps = {
  organizationId: string;
  programId: string;
  curricula: ProgramCoopCurriculumRecord[];
  initialDiscussionMessages?: ProgramCoopCurriculumDiscussionMessage[];
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

export default function ParentCurriculumPage({
  organizationId,
  programId,
  curricula,
  initialDiscussionMessages = [],
  currentGuardianId = null,
  previewMode = false,
}: ParentCurriculumPageProps) {
  const { theme } = useParentTheme();
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [activeCurriculumId, setActiveCurriculumId] = useState(
    () => curricula[0]?.id ?? "",
  );
  const [discussionCurriculumId, setDiscussionCurriculumId] = useState<string | null>(
    null,
  );

  const activeCurriculum = useMemo(
    () => curricula.find((record) => record.id === activeCurriculumId) ?? curricula[0] ?? null,
    [activeCurriculumId, curricula],
  );

  useEffect(() => {
    if (curricula.length === 0) {
      setActiveCurriculumId("");
      return;
    }
    if (!curricula.some((record) => record.id === activeCurriculumId)) {
      setActiveCurriculumId(curricula[0].id);
    }
  }, [activeCurriculumId, curricula]);

  const handleGuideSelect = (curriculumId: string) => {
    setActiveCurriculumId(curriculumId);
    if (discussionOpen) {
      setDiscussionCurriculumId(curriculumId);
    }
  };

  const openDiscussion = (curriculumId: string | null) => {
    setDiscussionCurriculumId(curriculumId);
    setDiscussionOpen(true);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      {activeCurriculum ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <CurriculumGuideListPanel
              theme={theme}
              curricula={curricula}
              activeCurriculumId={activeCurriculum.id}
              onSelect={handleGuideSelect}
              onOpenDiscussion={openDiscussion}
            />

            <div
              className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-2 sm:px-5"
              data-testid="curriculum-pdf-viewer"
            >
              <ProgramCoopCurriculumPdfViewer
                key={activeCurriculum.id}
                organizationId={organizationId}
                programId={programId}
                curriculumId={activeCurriculum.id}
                fileName={activeCurriculum.fileName}
              />
            </div>
          </div>

          <CurriculumDiscussionSidebar
            theme={theme}
            open={discussionOpen}
            onClose={() => setDiscussionOpen(false)}
            organizationId={organizationId}
            programId={programId}
            curricula={curricula}
            activeCurriculumId={discussionCurriculumId}
            onActiveCurriculumIdChange={setDiscussionCurriculumId}
            initialMessages={initialDiscussionMessages}
            currentGuardianId={currentGuardianId}
            previewMode={previewMode}
          />
        </>
      ) : (
        <ParentCard
          theme={theme}
          className="mx-3 my-2 flex min-h-0 flex-1 items-center justify-center rounded-[14px] px-4 py-8 text-center sm:mx-5"
        >
          <p className="text-sm" style={{ color: theme.muted }}>
            Curriculum hasn&apos;t been published yet. Check back soon.
          </p>
        </ParentCard>
      )}
    </div>
  );
}
