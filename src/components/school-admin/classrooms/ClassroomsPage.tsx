"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Home, Plus, UserRoundX } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GCard, gBtnOutlineSm, gBtnPopSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  AdminGardenPageSkeleton,
  BusyLabel,
  GardenEmptyState,
  GardenField,
  GardenLoadError,
  GardenNotice,
  GardenSelect,
  GardenStatTiles,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import { GARDEN_LIST_DETAIL_GRID, GardenRecordList } from "@/components/school-admin/garden/blocks";
import ClassroomDetailPane from "@/components/school-admin/classrooms/ClassroomDetailPane";
import { buildParentThemeTokens, parentThemeToAdminCompat, type ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ClassroomStatus, ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import {
  CLASSROOM_STATUS_LABELS,
  useClassroomsModel,
  type ClassroomCreateDraft,
  type ClassroomFilter,
  type ClassroomsModel,
  type ProgramOption,
} from "./useClassroomsModel";

type ClassroomsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialClassrooms?: ClassroomSummary[];
  initialPrograms?: ProgramOption[];
  initialStaff?: StaffMemberRecord[];
  initialSelectedClassroomId?: string | null;
  previewMode?: boolean;
};

export const CLASSROOM_STATUS_TONES: Record<ClassroomStatus, GChipTone> = {
  open: "success",
  full: "warning",
  inactive: "neutral",
};

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export default function ClassroomsPage({
  organizationId,
  branding,
  slug,
  initialClassrooms,
  initialPrograms,
  initialStaff,
  initialSelectedClassroomId,
  previewMode = false,
}: ClassroomsPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useClassroomsModel({
    organizationId,
    slug,
    initialClassrooms,
    initialPrograms,
    initialStaff,
    initialSelectedClassroomId,
    previewMode,
  });
  const { metrics } = model;

  const subtitle =
    metrics.total === 0
      ? "Group students and staff into classroom rosters with lead teacher assignments."
      : [plural(metrics.total, "classroom"), plural(metrics.students, "roster student"), `${metrics.open} open`].join(" · ");

  let content;
  if (model.loading) {
    content = <AdminGardenPageSkeleton label="Loading classrooms" layout="split" />;
  } else if (model.error && model.classrooms.length === 0) {
    content = (
      <GardenLoadError title="Classrooms didn't load" description={model.error} onRetry={() => void model.loadClassrooms()} />
    );
  } else if (model.classrooms.length === 0) {
    content = (
      <GCard index={1} kicker="Get started" title="Create your first classroom">
        <GardenEmptyState
          icon={Home}
          title="No classrooms yet"
          description="Create your first classroom to group students and assign lead teachers."
          action={
            <button type="button" className={gBtnPopSm} onClick={model.openCreate} disabled={previewMode}>
              <Plus className="h-4 w-4" aria-hidden />
              Add classroom
            </button>
          }
        />
      </GCard>
    );
  } else {
    content = <ClassroomsWorkspace model={model} C={C} />;
  }

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-classrooms-page"
      overlays={<CreateClassroomDialog model={model} theme={theme} />}
    >
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            <span className="text-[var(--sf-clay)]">Classrooms</span>
          </>
        }
        subtitle={subtitle}
        refresh={
          previewMode || model.classrooms.length === 0
            ? undefined
            : {
                onRefresh: () => void model.loadClassrooms({ silent: true }),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh classrooms",
              }
        }
        actions={
          model.classrooms.length > 0 ? (
            <button type="button" className={gBtnOutlineSm} onClick={model.openCreate} disabled={previewMode} data-testid="classrooms-add">
              <Plus className="h-4 w-4" aria-hidden />
              Add classroom
            </button>
          ) : null
        }
      />
      {content}
    </AdminGardenPage>
  );
}

function ClassroomsWorkspace({ model, C }: { model: ClassroomsModel; C: ReturnType<typeof parentThemeToAdminCompat> }) {
  const { metrics } = model;
  const toggle = (key: ClassroomFilter) => model.setFilter(model.filter === key ? "all" : key);
  const noLead = model.firstWithoutLead;

  return (
    <>
      <GardenStatTiles
        layout="strip"
        ariaLabel="Classrooms at a glance"
        stats={[
          { id: "all", label: "Classrooms", value: metrics.total, onClick: () => model.setFilter("all"), active: model.filter === "all" },
          { id: "students", label: "Roster students", value: metrics.students },
          { id: "open", label: "Open", value: metrics.open, onClick: () => toggle("open"), active: model.filter === "open" },
          { id: "no_lead", label: "Need a lead teacher", value: metrics.noLead, onClick: () => toggle("no_lead"), active: model.filter === "no_lead" },
        ]}
      />

      {noLead ? (
        <GardenNotice
          tone="warning"
          icon={UserRoundX}
          title={`${plural(metrics.noLead, "classroom")} without a lead teacher`}
          action={
            <button type="button" className={gLinkSm} onClick={() => model.selectClassroom(noLead.id)}>
              Open {noLead.name}
            </button>
          }
        >
          Lead teachers automatically receive roster students as assigned learners.
        </GardenNotice>
      ) : null}

      <div className={GARDEN_LIST_DETAIL_GRID}>
        <GardenRecordList
          kicker="Rosters"
          title="Classrooms"
          noun={{ one: "classroom", many: "classrooms" }}
          items={model.filteredClassrooms.map((classroom) => ({
            id: classroom.id,
            title: classroom.name,
            meta: [
              classroom.programName ?? "All programs",
              plural(classroom.studentCount, "student"),
              classroom.leadTeacherNames.length ? classroom.leadTeacherNames.join(", ") : "No lead teacher",
            ].join(" · "),
            chip: { tone: CLASSROOM_STATUS_TONES[classroom.status], label: CLASSROOM_STATUS_LABELS[classroom.status] },
            searchText: `${classroom.programName ?? ""} ${classroom.leadTeacherNames.join(" ")}`,
          }))}
          selectedId={model.selectedClassroom?.id ?? null}
          onSelect={model.selectClassroom}
          searchPlaceholder="Search classroom, program or teacher"
          searchLabel="Search classrooms"
          filters={{
            ariaLabel: "Filter classrooms",
            value: model.filter,
            onChange: (key) => model.setFilter(key as ClassroomFilter),
            options: [
              { key: "all", label: "All", count: metrics.total },
              ...(metrics.open ? [{ key: "open", label: "Open", count: metrics.open }] : []),
              ...(metrics.full ? [{ key: "full", label: "Full", count: metrics.full }] : []),
              ...(metrics.inactive ? [{ key: "inactive", label: "Inactive", count: metrics.inactive }] : []),
              ...(metrics.noLead ? [{ key: "no_lead", label: "No lead", count: metrics.noLead }] : []),
            ],
          }}
          detailAnchorId="classroom-detail"
          data-testid="classrooms-list"
        />
        {model.selectedClassroom ? (
          <ClassroomDetailPane key={model.selectedClassroom.id} model={model} classroom={model.selectedClassroom} C={C} />
        ) : (
          <GardenEmptyState icon={Home} title="Pick a classroom" description="Select a classroom from the list to manage staff and roster." />
        )}
      </div>
    </>
  );
}

function CreateClassroomDialog({ model, theme }: { model: ClassroomsModel; theme: ParentThemeTokens }) {
  const empty: ClassroomCreateDraft = { name: "", programId: "", status: "open" };
  const [draft, setDraft] = useState<ClassroomCreateDraft>(empty);
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(model.createOpen);
  if (wasOpen !== model.createOpen) {
    setWasOpen(model.createOpen);
    if (model.createOpen) {
      setDraft(empty);
      setTouched(false);
    }
  }
  const nameId = useGardenFieldId("classroom-name");
  const programId = useGardenFieldId("classroom-program");
  const statusId = useGardenFieldId("classroom-status");
  const nameError = touched && !draft.name.trim() ? "Give the classroom a name." : null;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setTouched(true);
    if (!draft.name.trim() || model.creating) return;
    await model.createClassroom(draft);
  };

  return (
    <GDialog
      theme={theme}
      open={model.createOpen}
      onClose={model.closeCreate}
      closeDisabled={model.creating}
      title="Add classroom"
      description="Group students and staff into a classroom roster."
      icon={<Home className="h-5 w-5" aria-hidden />}
      size="md"
      footer={
        <>
          <button type="button" className={gBtnOutlineSm} onClick={model.closeCreate} disabled={model.creating}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-classroom-form"
            className={gBtnPopSm}
            disabled={model.creating}
            aria-busy={model.creating || undefined}
            data-testid="classrooms-create-submit"
          >
            <BusyLabel busy={model.creating} busyLabel="Creating…" icon={<Plus className="h-4 w-4" aria-hidden />}>
              Create classroom
            </BusyLabel>
          </button>
        </>
      }
    >
      <form id="create-classroom-form" onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4">
        {model.createError ? (
          <GardenNotice tone="alert" role="alert" title="Couldn't create the classroom">
            {model.createError}
          </GardenNotice>
        ) : null}
        <GardenField id={nameId} label="Name" required error={nameError}>
          <input
            id={nameId}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Kindergarten Group A"
            data-garden-skip
            className={gInputClass(nameError)}
          />
        </GardenField>
        <GardenField id={programId} label="Program" optional hint="Leave on All programs if any student can join.">
          <GardenSelect
            id={programId}
            value={draft.programId}
            onChange={(value) => setDraft({ ...draft, programId: value })}
            options={[{ value: "", label: "All programs" }, ...model.programs.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </GardenField>
        <GardenField id={statusId} label="Status">
          <GardenSelect
            id={statusId}
            value={draft.status}
            onChange={(value) => setDraft({ ...draft, status: value as ClassroomStatus })}
            options={[
              { value: "open", label: "Open" },
              { value: "full", label: "Full" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </GardenField>
      </form>
    </GDialog>
  );
}
