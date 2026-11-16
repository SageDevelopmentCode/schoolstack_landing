"use client";

import { Camera, CheckSquare, ImagePlus, Loader2, ShieldCheck, Trash2, X } from "lucide-react";
import GardenAdminPhotoTile from "@/components/school-admin/gallery/GardenAdminPhotoTile";
import GardenGalleryUploadSheet from "@/components/school-admin/gallery/GardenGalleryUploadSheet";
import PhotoMediaPermissionsSidebar from "@/components/school-admin/gallery/PhotoMediaPermissionsSidebar";
import GardenPhotoViewer from "@/components/school-parent/photos/garden/GardenPhotoViewer";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GCard, GSkeleton, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  BusyLabel,
  GardenEmptyState,
  GardenField,
  GardenLoadError,
  GardenNotice,
  gBtnDangerSm,
  gBtnOutlineXs,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { GardenGroupHeading, GardenRefetchVeil } from "@/components/school-admin/garden/blocks";
import { formatGalleryDateLabel } from "@/lib/school-gallery/format-gallery-date";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { shortGalleryDate, usePhotosModel, type PhotosModel } from "./usePhotosModel";

type PhotosPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
};

const GRID = "grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-6";
const photosLabel = (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`;

function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <GSkeleton key={index} className="aspect-square rounded-[14px]" />
      ))}
    </div>
  );
}

/** Photos (admin Garden): the school gallery, batch upload, dates and permissions. */
export default function PhotosPage({ organizationId, slug, schoolName }: PhotosPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const { model, loadMoreRef } = usePhotosModel({ organizationId, slug, C });
  const { photos, groups } = model;
  const firstLoad = model.loading && !model.refreshing;
  const blockingError = model.initialError && photos.length === 0;
  const empty = !firstLoad && !blockingError && groups.length === 0;

  const subtitle =
    firstLoad || blockingError
      ? `School gallery for ${schoolName}`
      : empty
        ? `School gallery for ${schoolName} · no photos yet`
        : `Showing ${photosLabel(photos.length)} from ${groups.length} ${groups.length === 1 ? "day" : "days"}${
            model.hasMore ? " · scroll for more" : ""
          }`;

  const overlays = (
    <>
      <GardenGalleryUploadSheet
        open={model.uploadOpen}
        onClose={() => model.setUploadOpen(false)}
        slug={slug}
        organizationId={organizationId}
        theme={theme}
        onUploaded={model.handleUploaded}
      />
      <PhotoMediaPermissionsSidebar
        organizationId={organizationId}
        open={model.permissionsOpen}
        onClose={() => model.setPermissionsOpen(false)}
      />
      {model.viewerIndex != null ? (
        <GardenPhotoViewer
          key={model.viewerIndex}
          theme={theme}
          items={photos}
          initialIndex={model.viewerIndex}
          onClose={() => model.setViewerIndex(null)}
          hasMore={model.hasMore}
          onRequestMore={model.loadMore}
          showStaffDetails
          testId="admin-photo-viewer"
        />
      ) : null}
      <EditDateDialog model={model} />
      {model.confirmDialog}
    </>
  );

  let content;
  if (firstLoad) {
    content = (
      <GCard index={1}>
        <GSkeleton className="mb-4 h-4 w-40 rounded-full" />
        <GridSkeleton />
      </GCard>
    );
  } else if (blockingError) {
    content = (
      <GCard index={1}>
        <GardenLoadError
          title="Couldn't load the gallery."
          description={`${model.initialError} Nothing has changed.`}
          onRetry={() => void model.reload()}
        />
      </GCard>
    );
  } else if (empty) {
    content = (
      <GCard index={1} kicker="Get started">
        <GardenEmptyState
          icon={Camera}
          title="No photos yet"
          description="Upload your first batch to get started. Set the date once and every photo in the batch is grouped under it for families and staff."
          action={
            <button type="button" className={gBtnPopSm} onClick={() => model.setUploadOpen(true)} data-testid="photos-upload-first">
              <ImagePlus className="h-4 w-4" aria-hidden />
              Upload your first batch
            </button>
          }
        />
      </GCard>
    );
  } else {
    content = (
      <>
        {model.initialError ? (
          <GardenNotice
            tone="warning"
            role="alert"
            title="Couldn't refresh the gallery."
            action={
              <button type="button" className={gBtnOutlineXs} onClick={() => void model.refresh()}>
                Try again
              </button>
            }
          >
            {model.initialError} The photos below are from the last load.
          </GardenNotice>
        ) : null}
        {model.selectionMode ? <SelectionBar model={model} /> : null}
        <GCard index={1} kicker="Gallery" title="By date">
          <GardenRefetchVeil active={model.refreshing}>
            <div className="flex flex-col gap-7">
              {groups.map((group) => (
                <DateGroup key={group.photoDate} model={model} photoDate={group.photoDate} photoIds={group.photos.map((p) => p.id)} />
              ))}
            </div>
          </GardenRefetchVeil>
          <div ref={loadMoreRef} className="h-6 w-full" aria-hidden />
          {model.loadingMore ? (
            <div className="mt-2" aria-live="polite">
              <span className="sr-only">Loading more photos…</span>
              <GridSkeleton count={6} />
            </div>
          ) : null}
          {model.loadMoreError && !model.loadingMore ? (
            <GardenNotice
              tone="alert"
              role="alert"
              className="mt-3"
              title="Couldn't load more photos."
              action={
                <button type="button" className={gBtnOutlineXs} onClick={() => void model.loadMore()}>
                  Try again
                </button>
              }
            >
              {model.loadMoreError}
            </GardenNotice>
          ) : null}
          {!model.hasMore && !model.loadingMore && photos.length > 0 ? (
            <p className="m-0 mt-4 text-center text-[12.5px] font-semibold text-[var(--sf-soft)]">
              That&apos;s every photo · {photosLabel(photos.length)}
            </p>
          ) : null}
        </GCard>
      </>
    );
  }

  return (
    <AdminGardenPage theme={theme} skinOverlays data-testid="admin-photos-page" overlays={overlays}>
      <AdminGardenPageHeader
        kicker="Communication"
        title={<span className="text-[var(--sf-clay)]">Photos</span>}
        subtitle={subtitle}
        refresh={
          firstLoad || blockingError || empty
            ? undefined
            : {
                onRefresh: () => void model.refresh(),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh photos",
              }
        }
        actions={
          <>
            <button type="button" className={gBtnOutlineSm} onClick={() => model.setPermissionsOpen(true)} data-testid="photos-permissions">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Photo permissions
            </button>
            {photos.length > 0 ? (
              model.selectionMode ? (
                <button type="button" className={gBtnOutlineSm} onClick={model.stopSelecting} disabled={model.bulk != null}>
                  <X className="h-4 w-4" aria-hidden />
                  Done selecting
                </button>
              ) : (
                <button type="button" className={gBtnOutlineSm} onClick={model.startSelecting} data-testid="photos-select">
                  <CheckSquare className="h-4 w-4" aria-hidden />
                  Select
                </button>
              )
            ) : null}
            <button
              type="button"
              className={empty || blockingError ? gBtnOutlineSm : gBtnPopSm}
              onClick={() => model.setUploadOpen(true)}
              data-testid="photos-upload"
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              Upload photos
            </button>
          </>
        }
      />
      {content}
    </AdminGardenPage>
  );
}

function DateGroup({ model, photoDate, photoIds }: { model: PhotosModel; photoDate: string; photoIds: string[] }) {
  const group = model.groups.find((g) => g.photoDate === photoDate);
  if (!group) return null;
  const allSelected = photoIds.every((id) => model.selectedIds.has(id));
  return (
    <section aria-label={formatGalleryDateLabel(photoDate)}>
      <GardenGroupHeading
        count={group.photos.length}
        action={
          model.selectionMode ? (
            <button type="button" className={gLinkSm} onClick={() => model.setDaySelected(photoIds, !allSelected)}>
              {allSelected ? "Deselect day" : "Select day"}
            </button>
          ) : null
        }
      >
        {formatGalleryDateLabel(photoDate)}
      </GardenGroupHeading>
      <div className={GRID}>
        {group.photos.map((photo) => (
          <GardenAdminPhotoTile
            key={photo.id}
            photo={photo}
            selectionMode={model.selectionMode}
            selected={model.selectedIds.has(photo.id)}
            flashed={model.flashIds.has(photo.id)}
            deleting={model.pendingKey === `photo-delete:${photo.id}`}
            onToggleSelect={() => model.toggleSelected(photo.id)}
            onView={() => model.openPhoto(photo.id)}
            onEditDate={() => model.openDateEdit(photo)}
            onDelete={() => void model.deleteOne(photo)}
          />
        ))}
      </div>
    </section>
  );
}

function SelectionBar({ model }: { model: PhotosModel }) {
  const count = model.selectedIds.size;
  const bulk = model.bulk;
  return (
    <div
      className="sticky top-3 z-20 flex flex-col gap-3 rounded-[20px] border-2 border-[var(--sf-ink)] bg-white px-4 py-3 shadow-[0_4px_0_0_var(--sf-ink)] sm:flex-row sm:items-center sm:justify-between"
      role="region"
      aria-label="Selected photos"
      data-testid="photos-selection-bar"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="m-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]" aria-live="polite">
          {count === 0 ? "Tap photos to select them" : `${photosLabel(count)} selected`}
        </p>
        <button type="button" className={gLinkSm} onClick={model.selectAllLoaded} disabled={bulk != null}>
          Select all loaded
        </button>
        {count > 0 ? (
          <button type="button" className={gLinkSm} onClick={model.clearSelection} disabled={bulk != null}>
            Clear
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className={gBtnDangerSm}
        onClick={() => void model.deleteSelected()}
        disabled={count === 0 || bulk != null}
        aria-busy={bulk != null || undefined}
        data-testid="photos-delete-selected"
      >
        {bulk ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Deleting {bulk.done} of {bulk.total}…
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete selected
          </>
        )}
      </button>
    </div>
  );
}

function EditDateDialog({ model }: { model: PhotosModel }) {
  const { theme } = useSchoolAdminStoryTheme();
  const edit = model.dateEdit;
  const saving = model.pendingKey === "photo-date";
  return (
    <GDialog
      theme={theme}
      open={edit != null}
      onClose={model.closeDateEdit}
      closeDisabled={saving}
      size="sm"
      title="Change photo date"
      description={edit ? `Currently on ${formatGalleryDateLabel(edit.photo.photoDate)}. The gallery groups photos by this date.` : undefined}
      data-testid="admin-photo-date-dialog"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={gBtnOutlineSm} onClick={model.closeDateEdit} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={gBtnPopSm}
            onClick={() => void model.saveDate()}
            disabled={saving || !edit}
            aria-busy={saving || undefined}
            data-testid="admin-photo-date-save"
          >
            <BusyLabel busy={saving} busyLabel="Moving…">
              {edit && edit.value && edit.value !== edit.photo.photoDate ? `Move to ${shortGalleryDate(edit.value)}` : "Save date"}
            </BusyLabel>
          </button>
        </div>
      }
    >
      {edit ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void model.saveDate();
          }}
        >
          <GardenField id="admin-photo-date" label="Photo date" error={edit.error}>
            <input
              id="admin-photo-date"
              type="date"
              value={edit.value}
              onChange={(event) => model.setDateValue(event.target.value)}
              className={gInputClass(edit.error)}
              disabled={saving}
              data-garden-skip
              autoFocus
            />
          </GardenField>
        </form>
      ) : null}
    </GDialog>
  );
}
