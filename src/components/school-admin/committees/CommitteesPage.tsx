"use client";

import { useMemo, useState } from "react";
import { Archive, ArrowLeft } from "lucide-react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageSkeleton,
  GardenLoadError,
  ADMIN_GARDEN_CONTAINER_CLASS,
} from "@/components/school-admin/garden/kit";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import CommitteeWorkspaceShell from "./CommitteeWorkspaceShell";
import { CommitteeSurfaceProvider } from "./committee-surface";
import { buildTemplateOptions } from "./modals/CreateCommitteeModal";
import CommitteesGardenOverview from "./garden/CommitteesGardenOverview";
import GardenCreateCommitteeDialog from "./garden/GardenCreateCommitteeDialog";
import { useCommitteesModel, type CreateCommitteeInput } from "./useCommitteesModel";

type CommitteesPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

const CREATE_ERROR_ID = "committee-create-error";
const ARCHIVE_ERROR_ID = "committee-archive-error";

/**
 * Admin Communication → Committees on the admin Garden look.
 * State and data: `useCommitteesModel`. Skill: admin-portal-garden-design.
 */
export default function CommitteesPage({ organizationId, branding, slug }: CommitteesPageProps) {
  void branding;
  const { theme, C } = useSchoolAdminStoryTheme();
  const model = useCommitteesModel({ organizationId, slug });
  const [createOpen, setCreateOpen] = useState(false);
  // Remount the dialog on each open so it starts from step 1 with fresh answers.
  const [createKey, setCreateKey] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const templateOptions = useMemo(() => buildTemplateOptions(model.templates), [model.templates]);

  const openCreate = () => {
    setCreateKey((key) => key + 1);
    setCreateOpen(true);
  };

  const handleCreate = async (input: CreateCommitteeInput): Promise<boolean> => {
    try {
      const created = await model.createCommittee(input);
      adminToast.dismiss(CREATE_ERROR_ID);
      adminToast.success(`${created.name} created.`, {
        id: "committee-create",
        description: "Its workspace is open on Members — invite volunteers next.",
      });
      return true;
    } catch (err) {
      adminToast.error("Couldn't create the committee.", {
        id: CREATE_ERROR_ID,
        description: `${formatActionError(err, "Failed to create committee.")} Nothing was created — your answers are still in the form.`,
        action: { label: "Retry", onClick: () => void handleCreate(input).then((ok) => ok && setCreateOpen(false)) },
      });
      return false;
    }
  };

  const handleArchive = async () => {
    const name = model.displayedCommittee?.name ?? "Committee";
    setArchiving(true);
    try {
      await model.archiveActiveCommittee();
      setArchiveOpen(false);
      adminToast.dismiss(ARCHIVE_ERROR_ID);
      adminToast.success(`${name} archived.`, {
        id: "committee-archive",
        description: "Members can no longer make changes. Its history is kept and it stays under Archived.",
      });
    } catch (err) {
      adminToast.error(`Couldn't archive ${name}.`, {
        id: ARCHIVE_ERROR_ID,
        description: `${formatActionError(err, "Failed to archive committee.")} It's still active.`,
        action: { label: "Retry", onClick: () => void handleArchive() },
      });
    } finally {
      setArchiving(false);
    }
  };

  const createDialog = (
    <GardenCreateCommitteeDialog
      key={createKey}
      theme={theme}
      open={createOpen}
      options={templateOptions}
      onClose={() => setCreateOpen(false)}
      onCreate={handleCreate}
    />
  );

  if (model.committeeId) {
    const committee = model.displayedCommittee;
    if (!committee) {
      return (
        <ParentGardenFrame theme={theme} className="h-full overflow-y-auto bg-[var(--sf-cream)]">
          <div className={ADMIN_GARDEN_CONTAINER_CLASS}>
            <button type="button" className={`${gLinkSm} self-start`} onClick={model.back}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              All committees
            </button>
            {model.committeeError ? (
              <GardenLoadError
                title="Couldn't open this committee."
                description={`${model.committeeError} Nothing was changed.`}
                onRetry={model.retryCommittee}
                retrying={model.loadingCommittee}
              />
            ) : (
              <AdminGardenPageSkeleton label="Loading committee" layout="split" />
            )}
          </div>
        </ParentGardenFrame>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <CommitteeWorkspaceShell
          committee={committee}
          theme={theme}
          composeTokens={C}
          supabase={model.supabase}
          organizationId={organizationId}
          schoolSlug={slug}
          activeSection={model.activeSection}
          onSectionChange={model.changeSection}
          onBack={model.back}
          onCommitteeChange={model.setActiveCommittee}
          onArchive={() => setArchiveOpen(true)}
          onJoinRequestsChanged={() => void model.loadPendingRequestCount()}
          initialProjectId={model.initialProjectId}
        />
        <GConfirmDialog
          theme={theme}
          open={archiveOpen}
          title={`Archive ${committee.name}?`}
          description="The workspace will be marked archived. Members can no longer make changes, but history is preserved."
          confirmLabel="Archive committee"
          loadingLabel="Archiving…"
          destructive
          icon={<Archive />}
          loading={archiving}
          onConfirm={() => void handleArchive()}
          onClose={() => {
            if (!archiving) setArchiveOpen(false);
          }}
          confirmTestId="committee-archive-confirm"
        />
      </div>
    );
  }

  return (
    <AdminGardenPage theme={theme} overlays={createDialog} data-testid="committees-page">
      <CommitteeSurfaceProvider value="admin-garden">
        {model.loading ? (
          <AdminGardenPageSkeleton label="Loading committees" />
        ) : (
          <CommitteesGardenOverview
            model={model}
            theme={theme}
            organizationId={organizationId}
            slug={slug}
            onCreate={openCreate}
          />
        )}
      </CommitteeSurfaceProvider>
    </AdminGardenPage>
  );
}
