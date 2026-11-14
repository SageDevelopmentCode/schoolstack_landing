"use client";

import { Suspense, useCallback } from "react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { GSkeleton } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentFormsDocumentsPageBundle } from "@/lib/school-parent/forms-documents/types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import FormsListCard from "./garden/FormsListCard";
import FormsNextUpCard from "./garden/FormsNextUpCard";
import { FormsProgressCard } from "./garden/FormsRailCards";
import GardenFormDetailDialog from "./garden/GardenFormDetailDialog";
import { useParentFormsDocumentsModel } from "./useParentFormsDocumentsModel";

type ParentFormsDocumentsPageProps = {
  organizationId: string;
  slug: string;
  initialBundle: ParentFormsDocumentsPageBundle;
  readOnly?: boolean;
  initialFormId?: string;
  uploadPreviewUrlsByFormId?: Record<string, string>;
};

function FormsPageSkeleton() {
  const { theme } = useParentTheme();
  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS} aria-busy="true" aria-label="Loading forms">
        <GSkeleton className="h-20 w-2/3 max-w-md" />
        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GSkeleton className="h-72" />
          <GSkeleton className="h-48" />
        </div>
      </div>
    </ParentGardenFrame>
  );
}

export default function ParentFormsDocumentsPage(props: ParentFormsDocumentsPageProps) {
  return (
    <Suspense fallback={<FormsPageSkeleton />}>
      <ParentFormsDocumentsPageContent {...props} />
    </Suspense>
  );
}

/**
 * Parent Forms & Documents (Garden): what's waiting (most urgent first) and
 * every form in the main column, progress in the rail.
 * Forms open in the Garden signing dialog via `?form=`. Preview (readOnly)
 * shows everything with signing disabled.
 */
function ParentFormsDocumentsPageContent({
  organizationId,
  initialBundle,
  readOnly = false,
  initialFormId,
  uploadPreviewUrlsByFormId,
}: ParentFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  const model = useParentFormsDocumentsModel({
    initialItems: initialBundle.items,
    initialFormId,
  });
  const { setFilter } = model;

  useCelebrate(model.justCompletedAll, theme, "parent-forms-all-signed");

  const showWaiting = useCallback(() => {
    setFilter("needs_action");
    document.getElementById("parent-forms-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setFilter]);

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-forms-documents-page">
          <ParentGardenPageHeader
            kicker="Your family"
            title={
              <>
                Forms &amp; <span className="text-[var(--sf-clay)]">Documents</span>
              </>
            }
            subtitle="Review and sign forms from your child's teachers."
            data-testid="parent-forms-documents-header"
          />

          {readOnly ? (
            <p className="m-0 -mt-3 w-fit rounded-[12px] bg-[var(--sf-sky)] px-3 py-2 text-[12px] font-extrabold text-[#24507a]">
              Preview mode — forms can be opened but not signed here.
            </p>
          ) : null}

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="flex min-w-0 flex-col gap-5">
              <FormsNextUpCard
                index={1}
                items={model.items}
                queue={model.queue}
                signedCount={model.statusCounts.signed}
                onOpen={model.openForm}
                onShowWaiting={showWaiting}
              />
              <FormsListCard
                index={3}
                filter={model.filter}
                onFilterChange={model.setFilter}
                counts={model.statusCounts}
                items={model.filteredItems}
                totalCount={model.items.length}
                recentlySignedId={model.recentlySignedId}
                onOpen={model.openForm}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              <FormsProgressCard
                index={2}
                total={model.statusCounts.all}
                signed={model.statusCounts.signed}
                overdueCount={model.overdueCount}
                nextDue={model.nextDue}
                onOpen={model.openForm}
              />
            </div>
          </div>
        </div>
      </ParentGardenFrame>

      <GardenFormDetailDialog
        theme={theme}
        open={Boolean(model.selectedFormId)}
        organizationId={organizationId}
        formId={model.selectedFormId}
        initialItem={model.selectedItem}
        readOnly={readOnly}
        uploadPreviewUrl={
          model.selectedFormId ? (uploadPreviewUrlsByFormId?.[model.selectedFormId] ?? null) : null
        }
        onClose={model.closeForm}
        onSubmitted={model.handleSubmitted}
        queueRemaining={readOnly ? undefined : model.queueAfterSelected.length}
        onOpenNext={readOnly ? undefined : model.openNext}
      />
    </>
  );
}
