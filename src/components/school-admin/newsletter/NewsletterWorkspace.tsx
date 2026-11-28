"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  History,
  ListChecks,
  Monitor,
  Plus,
  RotateCcw,
  Send,
  Settings2,
  Smartphone,
  Undo2,
} from "lucide-react";
import { BuilderViewToggle } from "@/components/school-admin/admissions/builder-view-mode";
import { FlowReadinessRail, FlowReadinessSummary, FlowStatusPill } from "@/components/school-admin/admissions/flows/FlowReadinessRail";
import GardenFlowActions, { type FlowMenuItem } from "@/components/school-admin/admissions/flows/GardenFlowActions";
import { BusyLabel, GardenNotice, GardenSwitch } from "@/components/school-admin/garden/kit";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  G_FOCUS,
  G_TOGGLE,
  G_TOGGLE_OFF,
  G_TOGGLE_ON,
  GCard,
  GKicker,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { newsletterEditionDateRange } from "@/lib/school-admin/newsletter/newsletter-dates";
import { MAX_NEWSLETTER_PHOTOS } from "@/lib/school-admin/newsletter/newsletter-limits";
import { newsletterRegionTitle, type NewsletterOutlineRow } from "@/lib/school-admin/newsletter/newsletter-readiness";
import type { NewsletterRegion } from "@/lib/school-admin/newsletter/newsletter-render";
import NewsletterEditorPageSkeleton from "./NewsletterEditorPageSkeleton";
import NewsletterGalleryPickerSheet from "./NewsletterGalleryPickerSheet";
import NewsletterModals from "./NewsletterModals";
import NewsletterPreviewPanel from "./NewsletterPreviewPanel";
import {
  CoverEditor,
  DatesEditor,
  PhotosEditor,
  RemindersEditor,
  StoryBlockEditor,
  TeacherUpdatesEditor,
} from "./NewsletterRegionEditors";
import NewsletterVersionHistorySheet from "./NewsletterVersionHistorySheet";
import {
  useNewsletterEditorModel,
  type NewsletterBuilderFocus,
  type NewsletterEditorModel,
  type NewsletterEditorModelProps,
} from "./useNewsletterEditorModel";

type NewsletterWorkspaceProps = NewsletterEditorModelProps & {
  organizationId: string;
  schoolName: string;
};

/**
 * Newsletter builder (Garden), laid out like the enrollment checklist builder:
 * the parts of the newsletter on the left, the newsletter itself in the middle
 * (click any part to edit it in a side panel, or switch to Compact list), and
 * "Before you publish" on the right. The last outline item is Review & publish.
 * Rules: `.claude/skills/admin-portal-garden-design/SKILL.md`.
 */
export default function NewsletterWorkspace(props: NewsletterWorkspaceProps) {
  const model = useNewsletterEditorModel(props);
  const reduce = useReducedMotion() === true;

  const pageLoading =
    (model.staffLoading && model.staffMembers.length === 0 && !model.staffError) || model.galleryUrlsRefreshing;
  if (pageLoading) return <NewsletterEditorPageSkeleton />;

  const { activeEdition, locked, focus } = model;

  return (
    <div className="flex min-h-full flex-col" data-newsletter-builder="">
      <BuilderHeader model={model} />

      {locked ? (
        <div className="border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 bg-[var(--sf-mint)]/45 px-4 py-3 sm:px-6">
          <GardenNotice
            tone="success"
            title="Published · families can read this edition"
            className="!bg-transparent !border-0 !p-0"
            action={
              <button
                type="button"
                className={gBtnOutlineSm}
                onClick={() => model.setModal({ type: "returnToDraft" })}
                data-testid="newsletter-return-to-draft"
              >
                <Undo2 className="h-4 w-4" aria-hidden />
                Return to draft
              </button>
            }
          >
            This is read-only. Return it to draft to make changes.
          </GardenNotice>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <Outline model={model} />

        <main
          className="min-w-0 flex-1 bg-[var(--sf-cream)] bg-[radial-gradient(rgba(43,36,29,0.07)_1px,transparent_1.2px)] [background-size:18px_18px] px-4 py-5 sm:px-6 sm:py-6"
          data-flows-canvas=""
          aria-label="Newsletter"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={focus === "review" ? "review" : model.viewMode}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0.12 : 0.24, ease: PORTAL_EASE }}
              className="mx-auto w-full max-w-[880px]"
            >
              {focus === "review" ? <ReviewStage model={model} /> : <Canvas model={model} />}
            </motion.div>
          </AnimatePresence>

          <p className="mx-auto mt-8 max-w-[880px] text-center text-[12.5px] font-semibold text-[var(--sf-soft)]">
            Save stores edits in MudKitchen. Publish when you are ready for families to read it.{" "}
            <button
              type="button"
              className={`underline decoration-[var(--sf-ink)]/30 underline-offset-2 hover:decoration-[var(--sf-ink)] ${G_FOCUS}`}
              onClick={() => model.setModal({ type: "resetSample" })}
            >
              Reset sample
            </button>
          </p>
        </main>

        {focus !== "review" ? (
          <div className="hidden xl:sticky xl:top-[65px] xl:flex xl:max-h-[calc(100dvh-65px)] xl:self-start">
            <FlowReadinessRail
              readiness={model.readiness}
              isPublished={locked}
              kindLabel="newsletter"
              onSelect={model.focusReadinessItem}
              onPreview={() => model.selectOutline("review")}
            />
          </div>
        ) : null}
      </div>

      <input id={model.photoInputId} type="file" accept="image/*" multiple hidden onChange={model.handlePhotoInput} />

      {/* Overlays: portalled Garden drawers and dialogs. */}
      <GSidePanel
        theme={model.theme}
        open={model.panelOpen && model.viewMode === "family"}
        onClose={() => model.setPanelOpen(false)}
        kicker={focus === "review" ? undefined : regionKicker(focus)}
        title={focus === "review" ? "Review" : newsletterRegionTitle(focus, activeEdition, model.template)}
        subtitle="Edits update the newsletter right away. Close this panel to see them."
        testId="newsletter-region-editor"
        panelId="newsletter-region-editor"
        closeLabel="Close editor"
        footer={
          <button type="button" className={gBtnOutlineSm} onClick={() => model.setPanelOpen(false)}>
            <Check className="h-4 w-4" aria-hidden />
            Done
          </button>
        }
      >
        {focus !== "review" ? <RegionEditor model={model} region={focus} /> : null}
      </GSidePanel>

      <NewsletterModals model={model} />

      <NewsletterGalleryPickerSheet
        open={model.galleryPickerOpen}
        slug={model.slug}
        edition={activeEdition}
        mode="photos"
        previewPhotos={model.preview?.galleryPhotos}
        onClose={() => model.setGalleryPickerOpen(false)}
        onAddPhotos={(newPhotos) => {
          const merged = [...activeEdition.photos, ...newPhotos].slice(0, MAX_NEWSLETTER_PHOTOS);
          model.updateActiveEdition({ ...activeEdition, photos: merged });
        }}
      />
      <NewsletterGalleryPickerSheet
        open={model.coverGalleryPickerOpen}
        slug={model.slug}
        edition={activeEdition}
        mode="cover"
        previewPhotos={model.preview?.galleryPhotos}
        onClose={() => model.setCoverGalleryPickerOpen(false)}
        onPickCover={({ galleryPhotoId, src }) => {
          model.updateActiveEdition({ ...activeEdition, coverGalleryPhotoId: galleryPhotoId, coverImage: src });
        }}
      />
      <NewsletterVersionHistorySheet
        open={model.versionHistoryOpen}
        slug={model.slug}
        edition={activeEdition}
        school={model.school}
        template={model.template}
        branding={model.branding}
        staffMembers={model.staffMembers}
        previewMode={Boolean(model.preview)}
        onClose={() => model.setVersionHistoryOpen(false)}
        onRestored={(edition) => model.onEditionSaved(edition)}
        onToast={model.showToast}
      />
    </div>
  );
}

function regionKicker(region: NewsletterRegion): string {
  if (region === "cover") return "Top of the newsletter";
  if (region.startsWith("story:")) return "Story section";
  return "Section";
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function BuilderHeader({ model }: { model: NewsletterEditorModel }) {
  const { activeEdition, locked } = model;
  const menuItems: FlowMenuItem[] = [
    {
      key: "sections",
      label: "Edit sections",
      hint: "Turn sections on or off and reorder them",
      icon: <Settings2 className="h-4 w-4" />,
      onSelect: () => model.setModal({ type: "sections" }),
      disabled: locked,
    },
    {
      key: "history",
      label: "Version history",
      hint: "See and restore earlier saves",
      icon: <History className="h-4 w-4" />,
      onSelect: () => model.setVersionHistoryOpen(true),
    },
    {
      key: "export",
      label: "Download or copy",
      hint: "HTML page or plain text",
      icon: <Download className="h-4 w-4" />,
      onSelect: () => model.setModal({ type: "export" }),
    },
    ...(locked
      ? [
          {
            key: "draft",
            label: "Return to draft",
            hint: "Reopen this edition for editing",
            icon: <RotateCcw className="h-4 w-4" />,
            onSelect: () => model.setModal({ type: "returnToDraft" }),
          },
        ]
      : []),
  ];

  return (
    <header
      className="sticky top-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-4 py-3 sm:px-6 lg:min-h-[65px]"
      data-testid="admin-newsletter-editor-header"
    >
      <div className="flex min-w-0 basis-full flex-wrap items-center gap-x-4 gap-y-2 sm:basis-auto sm:flex-1">
        <button type="button" className={`${gLinkSm} whitespace-nowrap`} onClick={model.onBack} aria-label="Back to newsletters">
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          All newsletters
        </button>
        <div className="min-w-0">
          <GKicker>Weekly newsletter</GKicker>
          <h1 className="sf-display m-0 mt-0.5 text-[1.35rem] leading-[1.05] text-[var(--sf-ink)] sm:truncate sm:text-[1.55rem]">
            {newsletterEditionDateRange(activeEdition)}
          </h1>
        </div>
        <FlowStatusPill isPublished={locked} dirty={model.isDirty} saving={model.saving} savedAt={null} />
      </div>
      <GardenFlowActions
        readOnly={false}
        isPublished={locked}
        dirty={model.isDirty}
        saving={model.saving}
        publishing={model.publishing}
        readiness={model.readiness}
        kindLabel="newsletter"
        onSave={() => void model.onSaveNow()}
        onPublish={() => model.selectOutline("review")}
        onSelectReadinessItem={model.focusReadinessItem}
        menuItems={menuItems}
        hidePrimary={model.focus === "review"}
      />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Outline                                                             */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: NewsletterOutlineRow["status"] }) {
  if (status === "filled") {
    return (
      <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sf-forest)] text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "todo") {
    return <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-[#b4412f]/55 bg-[#fdf0ec]" />;
  }
  return <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[var(--sf-ink)]/30" />;
}

const STATUS_TEXT: Record<NewsletterOutlineRow["status"], string> = {
  filled: "done",
  empty: "empty",
  todo: "needs attention",
};

function Outline({ model }: { model: NewsletterEditorModel }) {
  const { outline, focus, locked, readiness } = model;
  const reviewActive = focus === "review";
  const select = (target: NewsletterBuilderFocus) => model.selectOutline(target);

  return (
    <>
      {/* Phones / tablets: horizontal chips. */}
      <nav
        aria-label="Newsletter parts"
        className="flex shrink-0 gap-2 overflow-x-auto border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 bg-[#fffdf8] px-4 py-3 [scroll-padding-inline:1rem] lg:hidden"
      >
        {outline.map((row) => (
          <button
            key={row.region}
            type="button"
            aria-current={focus === row.region ? "true" : undefined}
            onClick={() => select(row.region)}
            className={`${G_TOGGLE} shrink-0 gap-1.5 ${focus === row.region ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
          >
            {row.status === "filled" ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
            <span className="max-w-[12rem] truncate">{row.label}</span>
          </button>
        ))}
        <button
          type="button"
          aria-current={reviewActive ? "true" : undefined}
          onClick={() => select("review")}
          className={`${G_TOGGLE} shrink-0 gap-1.5 ${reviewActive ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          {locked ? "Published" : "Review & publish"}
        </button>
      </nav>

      {/* Desktop: the outline column. */}
      <aside
        aria-label="Newsletter parts"
        className="hidden w-[264px] shrink-0 flex-col gap-1 border-r-[1.5px] border-dashed border-[var(--sf-ink)]/14 bg-[#fffdf8] p-3 lg:sticky lg:top-[65px] lg:flex lg:max-h-[calc(100dvh-65px)] lg:self-start lg:overflow-y-auto"
        data-flows-outline=""
      >
        <GKicker className="px-2 pb-1 pt-1">In this edition</GKicker>
        <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
          {outline.map((row) => {
            const active = focus === row.region;
            return (
              <li key={row.region}>
                <button
                  type="button"
                  onClick={() => select(row.region)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left transition-colors ${
                    active ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/40" : "hover:bg-[var(--sf-accent-wash)]"
                  } ${G_FOCUS} focus-visible:ring-inset`}
                  data-flows-outline-row={active ? "active" : "idle"}
                >
                  <StatusDot status={row.status} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{row.label}</span>
                    <span className="block truncate text-[12px] font-semibold text-[var(--sf-soft)]">
                      {row.meta}
                      <span className="sr-only">, {STATUS_TEXT[row.status]}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {!locked ? (
          <div className="mt-1 flex flex-col items-start gap-1 px-2.5">
            <button type="button" className={`${gLinkSm} !text-[13px]`} onClick={model.addCustomSection}>
              <Plus className="h-4 w-4" aria-hidden />
              Add section
            </button>
            <button type="button" className={`${gLinkSm} !text-[13px]`} onClick={() => model.setModal({ type: "sections" })}>
              <Settings2 className="h-4 w-4" aria-hidden />
              Edit sections
            </button>
          </div>
        ) : null}
        <div className="mt-auto border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-2">
          <button
            type="button"
            onClick={() => select("review")}
            aria-current={reviewActive ? "true" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2.5 text-left transition-colors ${
              reviewActive ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/40" : "hover:bg-[var(--sf-accent-wash)]"
            } ${G_FOCUS} focus-visible:ring-inset`}
            data-testid="newsletter-outline-review"
          >
            <span
              aria-hidden
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sf-clay)] text-white"
            >
              <Send className="h-3 w-3" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">
                {locked ? "Published" : "Review & publish"}
              </span>
              <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">
                {locked ? "Families can read it" : readiness.ready ? "Ready to publish" : `${readiness.blocking} to fix`}
              </span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

function DeviceToggle({ model }: { model: NewsletterEditorModel }) {
  return (
    <div role="group" aria-label="Preview width" className="hidden gap-1.5 sm:inline-flex">
      {(
        [
          { id: "desktop", label: "Desktop", Icon: Monitor },
          { id: "mobile", label: "Phone", Icon: Smartphone },
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={model.device === id}
          onClick={() => model.setDevice(id)}
          className={`${G_TOGGLE} gap-1.5 ${model.device === id ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

function Canvas({ model }: { model: NewsletterEditorModel }) {
  const { locked, viewMode } = model;
  const family = viewMode === "family" || locked;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <GKicker>{family ? "As families see it" : "All parts"}</GKicker>
          <p className="m-0 mt-1 text-[14px] font-semibold text-[var(--sf-soft)]">
            {locked
              ? "This is the published newsletter."
              : family
                ? "Click any part of the newsletter to edit it."
                : "Type straight into each part. Switch back to see the newsletter."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {family ? <DeviceToggle model={model} /> : null}
          {!locked ? (
            <BuilderViewToggle mode={viewMode} onChange={model.setViewMode} label="Newsletter view" />
          ) : null}
        </div>
      </div>

      {family ? (
        <NewsletterPreviewPanel
          theme={model.theme}
          edition={model.activeEdition}
          school={model.school}
          branding={model.previewBranding}
          device={model.device}
          staffMembers={model.staffMembers}
          template={model.template}
          onEditRegion={locked ? undefined : model.openRegion}
          activeRegion={model.panelOpen && model.focus !== "review" ? model.focus : null}
          label="Newsletter as families see it"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {model.outline.map((row, index) => (
            <div key={row.region} data-newsletter-region-card={row.region} className="scroll-mt-24">
              <GCard
                kicker={regionKicker(row.region)}
                title={row.label}
                index={index}
                headingLevel="h2"
                className={model.focus === row.region ? "ring-[2px] ring-[var(--sf-clay)]/45" : ""}
              >
                <RegionEditor model={model} region={row.region} />
              </GCard>
            </div>
          ))}
          <button type="button" className={`${gLinkSm} self-start`} onClick={model.addCustomSection}>
            <Plus className="h-4 w-4" aria-hidden />
            Add section
          </button>
        </div>
      )}
    </div>
  );
}

function RegionEditor({ model, region }: { model: NewsletterEditorModel; region: NewsletterRegion }) {
  const base = {
    edition: model.activeEdition,
    locked: model.locked,
    onEditionChange: model.updateActiveEdition,
    onToast: model.showToast,
  };
  if (region === "cover") {
    return (
      <CoverEditor
        {...base}
        galleryEnabled={model.galleryEnabled}
        onOpenCoverGalleryPicker={model.galleryEnabled ? () => model.setCoverGalleryPickerOpen(true) : undefined}
      />
    );
  }
  if (region === "teachers") {
    return (
      <TeacherUpdatesEditor
        {...base}
        staffMembers={model.staffMembers}
        staffLoading={model.staffLoading}
        staffError={model.staffError}
        onRetryStaff={model.loadStaff}
      />
    );
  }
  if (region === "events") return <DatesEditor {...base} />;
  if (region === "reminders") return <RemindersEditor {...base} />;
  if (region === "photos") {
    return (
      <PhotosEditor
        {...base}
        slug={model.slug}
        galleryEnabled={model.galleryEnabled}
        onUploadPhotos={model.requestPhotoUpload}
        onOpenGalleryPicker={() => model.setGalleryPickerOpen(true)}
      />
    );
  }
  const block = model.activeEdition.storyBlocks.find((b) => `story:${b.id}` === region);
  if (!block) return null;
  return (
    <StoryBlockEditor
      {...base}
      template={model.template}
      block={block}
      onTemplateChange={model.updateTemplate}
      onRemoved={() => model.setPanelOpen(false)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Review & publish                                                    */
/* ------------------------------------------------------------------ */

function ReviewStage({ model }: { model: NewsletterEditorModel }) {
  const { readiness, locked } = model;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <GKicker>{locked ? "Published" : "Last step"}</GKicker>
        <h2 className="sf-display m-0 mt-1 text-[1.9rem] leading-[1] text-[var(--sf-ink)]">
          {locked ? "Families can read this edition" : "Review & publish"}
        </h2>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-5">
          <GCard>
            <FlowReadinessSummary
              readiness={readiness}
              isPublished={locked}
              kindLabel="newsletter"
              onSelect={model.focusReadinessItem}
            />
          </GCard>
          {!locked ? (
            <GCard kicker="Send" title="Tell families">
              <GardenSwitch
                checked={model.notifyFamilies}
                onChange={model.setNotifyFamilies}
                disabled={model.publishing}
                label="Notify families by email and mobile push"
                description="Families can read this newsletter in the parent portal either way."
              />
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
                <button
                  type="button"
                  className={gBtnPopSm}
                  disabled={!readiness.ready || model.publishing || model.saving}
                  aria-busy={model.publishing || undefined}
                  onClick={() => void model.publish()}
                  data-testid="newsletter-publish-confirm"
                >
                  <BusyLabel busy={model.publishing} busyLabel="Publishing…" icon={<Send className="h-4 w-4" aria-hidden />}>
                    Publish newsletter
                  </BusyLabel>
                </button>
                <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]" role="status">
                  {!readiness.ready
                    ? "Finish the checklist above to publish."
                    : model.isDirty
                      ? "Your unsaved edits are saved first."
                      : "Ready when you are."}
                </p>
              </div>
            </GCard>
          ) : (
            <GCard>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={gBtnOutlineSm} onClick={() => model.setModal({ type: "export" })}>
                  <Download className="h-4 w-4" aria-hidden />
                  Download or copy
                </button>
                <button type="button" className={gBtnOutlineSm} onClick={() => model.setModal({ type: "returnToDraft" })}>
                  <Undo2 className="h-4 w-4" aria-hidden />
                  Return to draft
                </button>
              </div>
            </GCard>
          )}
        </div>
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <GKicker>What families will see</GKicker>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--sf-soft)]">
              <Smartphone className="h-4 w-4" aria-hidden />
              Phone
            </span>
          </div>
          <NewsletterPreviewPanel
            theme={model.theme}
            edition={model.activeEdition}
            school={model.school}
            branding={model.previewBranding}
            device="mobile"
            staffMembers={model.staffMembers}
            template={model.template}
            label="What families will see"
          />
        </div>
      </div>
      <button type="button" className={`${gLinkSm} self-start`} onClick={() => model.selectOutline("cover")}>
        <ListChecks className="h-4 w-4" aria-hidden />
        Back to editing
      </button>
    </div>
  );
}
