"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, FileText, Plus, Send } from "lucide-react";
import TeacherFormCreateWizard from "@/components/school-teacher/forms-documents/TeacherFormCreateWizard";
import TeacherFormDetailSidebar from "@/components/school-teacher/forms-documents/TeacherFormDetailSidebar";
import TeacherFormSendModal from "@/components/school-teacher/forms-documents/TeacherFormSendModal";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GProgress, gBtnPopSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { AdminGardenSkin, useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenEmptyState, GardenFilterChips, GardenLoadError, GardenStatTiles } from "@/components/school-admin/garden/kit";
import { G_TABLE, G_TD, G_TH, GardenLeadStrip, GardenOverlayScope, gRowClass } from "@/components/school-admin/garden/blocks";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import { fetchAdminFormDownloadUrl } from "@/lib/school-admin/forms-documents/fetch-admin-form-download-url";
import type { AdminParentForm } from "@/lib/school-admin/forms-documents/types";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import {
  FORM_STATUS_LABELS,
  FORM_TYPE_LABELS,
  type TeacherFormSignatureRow,
  type TeacherParentFormCategory,
} from "@/lib/school-teacher/forms-documents/types";
import {
  formatAudienceLabel,
  formatFormDueDate,
  getSignatureRowsForForm,
} from "@/lib/school-teacher/forms-documents/utils";
import { FORMS_API_BASE, useFormsDocumentsModel, type FormsDocumentsModel } from "./useFormsDocumentsModel";

export type FormsDocumentsWorkspaceProps = {
  organizationId: string;
  slug?: string;
  staffMemberId: string | null;
  initialForms: AdminParentForm[];
  initialResponsesByFormId: Record<string, TeacherFormSignatureRow[]>;
  classroomOptions: TeacherClassroomOption[];
  initialFormId?: string;
  category: TeacherParentFormCategory;
  audienceMode?: "all" | "families_only";
  syncUrl?: boolean;
  showCreatorFilter?: boolean;
  containerClassName?: string;
  header?: ReactNode | ((props: { onCreate: () => void }) => ReactNode);
  emptyState?: {
    kicker?: string;
    title?: string;
    description?: string;
    createLabel?: string;
  };
  metricsLabels?: {
    active: string;
    pending: string;
    completed: string;
  };
  onFamiliesChanged?: () => void;
};

const STATUS_TONES: Record<AdminParentForm["status"], GChipTone> = {
  active: "success",
  draft: "warning",
  archived: "neutral",
};

function typeLabel(form: AdminParentForm): string {
  if (form.formType === "upload" && form.uploadFormat) return form.uploadFormat.toUpperCase();
  return FORM_TYPE_LABELS[form.formType];
}

/**
 * Family forms list + create wizard + detail sidebar (Garden). Admin
 * Forms & Documents and Tuition → Agreements. Outside a Garden admin page it
 * brings its own Garden scope + skin, so the look is the same everywhere.
 */
export default function FormsDocumentsWorkspace(props: FormsDocumentsWorkspaceProps) {
  const skin = useAdminGardenSkin();
  const { theme } = useParentTheme();
  if (skin) return <WorkspaceInner {...props} />;
  return (
    <ParentGardenScope theme={theme} className="sf-admin-garden-skin">
      <AdminGardenSkin theme={theme}>
        <WorkspaceInner {...props} />
      </AdminGardenSkin>
    </ParentGardenScope>
  );
}

function WorkspaceInner({
  organizationId,
  staffMemberId,
  initialForms,
  initialResponsesByFormId,
  classroomOptions,
  initialFormId,
  category,
  audienceMode = "all",
  syncUrl = true,
  showCreatorFilter = category === "general",
  containerClassName = "",
  header,
  emptyState,
  metricsLabels = { active: "Active forms", pending: "Pending signatures", completed: "Completed this month" },
  onFamiliesChanged,
}: FormsDocumentsWorkspaceProps) {
  const { theme } = useParentTheme();
  const skin = useAdminGardenSkin() ?? theme;
  const reduce = useReducedMotion() === true;
  const noun = category === "tuition" ? "agreement" : "form";
  const model = useFormsDocumentsModel({
    organizationId,
    staffMemberId,
    initialForms,
    initialResponsesByFormId,
    initialFormId,
    category,
    syncUrl,
    onFamiliesChanged,
    noun,
  });
  const headerContent = typeof header === "function" ? header({ onCreate: model.startCreate }) : header;
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: PORTAL_EASE } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <div className={containerClassName}>
      <AnimatePresence mode="wait" initial={false}>
        {model.creating ? (
          <motion.div key="create-wizard" {...fade}>
            <TeacherFormCreateWizard
              organizationId={organizationId}
              classroomOptions={classroomOptions}
              apiBasePath={FORMS_API_BASE}
              familySearchApiPath={`${FORMS_API_BASE}/families`}
              allowSelectAllClassrooms={audienceMode === "all"}
              audienceMode={audienceMode}
              formCategory={category}
              operationalErrorSurface="school_admin"
              onCancel={model.cancelCreate}
              onPublished={model.handleFormPublished}
              onSaveDraft={model.handleFormSavedDraft}
            />
          </motion.div>
        ) : (
          <motion.div key="form-list" {...fade} className="flex flex-col gap-5">
            {headerContent}
            <FormsList
              model={model}
              noun={noun}
              showCreatorFilter={showCreatorFilter}
              staffMemberId={staffMemberId}
              metricsLabels={metricsLabels}
              emptyState={emptyState}
              canCreateFromEmpty={typeof header !== "function"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <GardenOverlayScope theme={skin}>
        <AdminGardenSkin theme={skin}>
          <TeacherFormDetailSidebar
            theme={theme}
            open={model.sidebarFormId != null}
            form={model.selectedForm}
            organizationId={organizationId}
            detailLoading={model.detailLoading}
            signatureRows={model.sidebarFormId ? getSignatureRowsForForm(model.sidebarFormId, model.signatureRowsByFormId) : []}
            actionLoading={model.actionLoading}
            onClose={model.closeSidebar}
            onArchive={model.requestArchive}
            onDuplicate={(id) => void model.duplicate(id)}
            onDownload={(id) => void model.download(id)}
            onSend={model.handleSendRequest}
            fetchDownloadUrl={fetchAdminFormDownloadUrl}
          />
          {model.sidebarFormId && model.detailError ? (
            <div className="fixed bottom-4 right-4 z-[115] w-[min(100%-2rem,26rem)]">
              <GardenLoadError
                title="Couldn't load signatures"
                description={`${model.detailError} The rest of the form is shown.`}
                onRetry={model.retryDetail}
                retrying={model.detailLoading}
              />
            </div>
          ) : null}
          {model.sendForm ? (
            <TeacherFormSendModal
              theme={theme}
              open={model.sendForm != null}
              form={model.sendForm}
              organizationId={organizationId}
              classroomOptions={classroomOptions}
              familySearchApiPath={`${FORMS_API_BASE}/families`}
              allowSelectAllClassrooms={audienceMode === "all"}
              audienceMode={audienceMode}
              loading={model.sending}
              onClose={model.closeSend}
              onSend={model.handleSendConfirm}
            />
          ) : null}
          <ConfirmDialog
            C={parentThemeToAdminCompat(skin)}
            open={model.archiveTarget != null}
            title={`Archive ${model.archiveTarget?.title ?? `this ${noun}`}?`}
            description="It moves to Archived. You can still open it there."
            confirmLabel="Archive"
            variant="destructive"
            loading={model.archiving}
            onConfirm={() => void model.confirmArchive()}
            onClose={model.cancelArchive}
          />
        </AdminGardenSkin>
      </GardenOverlayScope>
    </div>
  );
}

function FormsList({
  model,
  noun,
  showCreatorFilter,
  staffMemberId,
  metricsLabels,
  emptyState,
  canCreateFromEmpty,
}: {
  model: FormsDocumentsModel;
  noun: string;
  showCreatorFilter: boolean;
  staffMemberId: string | null;
  metricsLabels: { active: string; pending: string; completed: string };
  emptyState?: FormsDocumentsWorkspaceProps["emptyState"];
  canCreateFromEmpty: boolean;
}) {
  if (model.forms.length === 0) {
    return (
      <GCard index={1} kicker={emptyState?.kicker ?? "Family forms"}>
        <GardenEmptyState
          icon={FileText}
          title={emptyState?.title ?? "Create your first form"}
          description={
            emptyState?.description ??
            "Upload a PDF or build a form for families to sign — like liability waivers, field trip permissions, or photo releases."
          }
          action={
            canCreateFromEmpty ? (
              <button type="button" className={gBtnPopSm} onClick={model.startCreate} data-testid="forms-create-first">
                <Plus className="h-4 w-4" aria-hidden />
                {emptyState?.createLabel ?? "Create form"}
              </button>
            ) : null
          }
        />
      </GCard>
    );
  }

  const firstDraft = model.drafts[0];
  const { metrics } = model;

  return (
    <>
      {firstDraft ? (
        <GardenLeadStrip
          icon={Send}
          kicker={`Needs attention · ${model.drafts.length} draft${model.drafts.length === 1 ? "" : "s"}`}
          title={`${firstDraft.title} hasn't been sent to families yet`}
          meta={model.drafts.length > 1 ? `And ${model.drafts.length - 1} more ${noun}${model.drafts.length - 1 === 1 ? "" : "s"} in draft.` : "Open it to review, then send."}
          cta="Review and send"
          onClick={() => model.openSidebar(firstDraft.id)}
          data-testid="forms-review-draft"
        />
      ) : null}

      <GardenStatTiles
        layout="strip"
        ariaLabel={`${noun === "agreement" ? "Agreements" : "Forms"} at a glance`}
        stats={[
          {
            id: "active",
            label: metricsLabels.active,
            value: metrics.activeCount,
            onClick: () => model.setFilter(model.filter === "active" ? "all" : "active"),
            active: model.filter === "active",
          },
          {
            id: "pending",
            label: metricsLabels.pending,
            value: metrics.pendingSignatures,
            onClick: () => model.setFilter("active"),
          },
          { id: "completed", label: metricsLabels.completed, value: metrics.completedThisMonth },
        ]}
      />

      <GCard
        index={2}
        kicker={noun === "agreement" ? "Agreements" : "Family forms"}
        title={`${model.filteredForms.length} ${noun}${model.filteredForms.length === 1 ? "" : "s"}`}
        data-testid="forms-list"
      >
        <div className="mb-4 flex flex-col gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">
          <GardenFilterChips
            ariaLabel="Filter by status"
            value={model.filter}
            onChange={(key) => model.setFilter(key as typeof model.filter)}
            options={[
              { key: "all", label: "All", count: model.statusCounts.all },
              { key: "draft", label: "Draft", count: model.statusCounts.draft },
              { key: "active", label: "Active", count: model.statusCounts.active },
              { key: "archived", label: "Archived", count: model.statusCounts.archived },
            ]}
          />
          {showCreatorFilter ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Created by</span>
              <GardenFilterChips
                ariaLabel="Filter by creator"
                value={model.creatorFilter}
                onChange={model.setCreatorFilter}
                options={[
                  { key: "all", label: "Everyone" },
                  ...(staffMemberId ? [{ key: "mine", label: "Me" }] : []),
                  ...model.creatorOptions.map((c) => ({ key: c.id, label: c.name })),
                ]}
              />
            </div>
          ) : null}
        </div>

        {model.filteredForms.length === 0 ? (
          <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
            No {noun}s match this filter.{" "}
            <button
              type="button"
              className={gLinkSm}
              onClick={() => {
                model.setFilter("all");
                model.setCreatorFilter("all");
              }}
            >
              Show all {noun}s
            </button>
          </div>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:hidden">
              {model.filteredForms.map((form) => (
                <li key={form.id}>
                  <button
                    type="button"
                    onClick={() => model.openSidebar(form.id)}
                    className={`flex w-full flex-col gap-2 rounded-[16px] border-[1.5px] px-3.5 py-3 text-left transition-colors duration-500 ${
                      model.flashId === form.id
                        ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)]"
                        : form.id === model.sidebarFormId
                          ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                          : "border-[var(--sf-ink)]/10 bg-white"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{form.title}</span>
                      <GChip tone={STATUS_TONES[form.status]}>{FORM_STATUS_LABELS[form.status]}</GChip>
                    </span>
                    <span className="text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {form.createdByName} · {formatAudienceLabel(form)} · Due {formatFormDueDate(form.dueDate)}
                    </span>
                    <span className="flex items-center gap-3">
                      <GProgress value={form.signedFamilies} total={Math.max(form.totalFamilies, 1)} label={`${form.signedFamilies} of ${form.totalFamilies} signed`} done={form.totalFamilies > 0 && form.signedFamilies >= form.totalFamilies} />
                      <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
                        {form.signedFamilies}/{form.totalFamilies}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40" aria-hidden />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="-mx-1 hidden overflow-x-auto lg:block">
              <table className={`${G_TABLE} min-w-[880px]`}>
                <thead>
                  <tr>
                    {["Form", "Created by", "Type", "Signed", "Due", "Status"].map((h) => (
                      <th key={h} scope="col" className={G_TH}>
                        {h === "Form" && noun === "agreement" ? "Agreement" : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {model.filteredForms.map((form) => {
                    const open = () => model.openSidebar(form.id);
                    return (
                      <tr
                        key={form.id}
                        tabIndex={0}
                        onClick={open}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            open();
                          }
                        }}
                        aria-label={`Open ${form.title}`}
                        className={gRowClass({ interactive: true, selected: form.id === model.sidebarFormId, flashed: model.flashId === form.id })}
                      >
                        <td className={G_TD}>
                          <div className="text-[14px] font-extrabold text-[var(--sf-ink)]">{form.title}</div>
                          <div className="text-[12.5px] font-semibold text-[var(--sf-soft)]">{formatAudienceLabel(form)}</div>
                        </td>
                        <td className={`${G_TD} text-[13px] font-bold text-[var(--sf-ink)]/75`}>{form.createdByName}</td>
                        <td className={G_TD}>
                          <GChip tone="info">{typeLabel(form)}</GChip>
                        </td>
                        <td className={`${G_TD} w-48`}>
                          <div className="flex items-center gap-2.5">
                            <GProgress value={form.signedFamilies} total={Math.max(form.totalFamilies, 1)} label={`${form.signedFamilies} of ${form.totalFamilies} families signed`} done={form.totalFamilies > 0 && form.signedFamilies >= form.totalFamilies} />
                            <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-ink)]/75">
                              {form.signedFamilies}/{form.totalFamilies}
                            </span>
                          </div>
                        </td>
                        <td className={`${G_TD} text-[13px] font-bold tabular-nums text-[var(--sf-ink)]/75`}>{formatFormDueDate(form.dueDate)}</td>
                        <td className={G_TD}>
                          <GChip tone={STATUS_TONES[form.status]}>{FORM_STATUS_LABELS[form.status]}</GChip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GCard>
    </>
  );
}
