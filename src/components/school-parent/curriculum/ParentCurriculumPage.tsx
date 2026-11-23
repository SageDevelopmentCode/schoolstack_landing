"use client";

import { BookOpen } from "lucide-react";
import type { ProgramCoopCurriculumDiscussionMessage } from "@/lib/admissions/program-coop-curriculum-discussion";
import type { ProgramCoopCurriculumRecord } from "@/lib/admissions/program-coop-curriculum-storage";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { GCard } from "@/components/school-parent/garden/ui";
import { WorkspaceDiscussionDrawer, WorkspacePresent } from "./reader/ReaderParts";
import type { CurriculumSignedUrls } from "./reader/useCurriculumDocument";
import { useCurriculumWorkspace } from "./useCurriculumWorkspace";
import CurriculumBookshelf from "./CurriculumBookshelf";

type ParentCurriculumPageProps = {
  organizationId: string;
  programId: string;
  curricula: ProgramCoopCurriculumRecord[];
  /** Signed Storage URLs per guide (server render): PDFs load with range requests. */
  signedUrls?: CurriculumSignedUrls;
  /** Server-loaded discussion by thread ("general" or a guide id). */
  initialThreadMessages?: Record<string, ProgramCoopCurriculumDiscussionMessage[]>;
  currentGuardianId?: string | null;
  previewMode?: boolean;
};

/*
 * Co-op Curriculum tab (Garden, full-height app tab): the Bookshelf — guide
 * covers first, then a reader with a collapsible page tray. The reader
 * engine (`reader/*`) opens guides straight from Storage with range requests
 * and caches them; `useCurriculumWorkspace` holds the shared state.
 * Skill: .agents/skills/parent-portal-garden-design
 */
export default function ParentCurriculumPage(props: ParentCurriculumPageProps) {
  const { theme } = useParentTheme();
  const ws = useCurriculumWorkspace(props);

  return (
    <>
      <ParentGardenFrame theme={theme} className="flex h-full min-h-0 flex-1 flex-col bg-[var(--sf-cream)]">
        {ws.curricula.length > 0 ? (
          <CurriculumBookshelf ws={ws} />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6">
            <h1 className="sr-only">Curriculum</h1>
            <GCard className="w-full max-w-md items-center text-center" bodyClassName="items-center">
              <span
                aria-hidden="true"
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-sky)] text-[#24507a]"
              >
                <BookOpen className="h-5 w-5" />
              </span>
              <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                Curriculum hasn&apos;t been published yet. Check back soon.
              </p>
              <span aria-hidden="true" className="sf-hand mt-2 block text-lg text-[var(--sf-forest)]">
                good things are on the way ✿
              </span>
            </GCard>
          </div>
        )}
      </ParentGardenFrame>

      <WorkspaceDiscussionDrawer ws={ws} theme={theme} />
      <WorkspacePresent ws={ws} theme={theme} />
    </>
  );
}
