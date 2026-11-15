"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Plus, UserPlus, Users } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GCard, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
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
import StaffDetailPane from "@/components/school-admin/staff/StaffDetailPane";
import { buildParentThemeTokens, parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { StaffRosterFilter } from "@/lib/school-admin/admin-staff-roster-metrics";
import { staffProfileNeedsReview } from "@/lib/school-admin/admin-staff-roster-metrics";
import { staffDisplayName } from "@/lib/staff/staff-display";
import { staffPortalChip } from "./staff-portal-chip";
import type { StaffMemberRecord, StaffPortalRole } from "@/lib/staff/staff-members";
import { useStaffModel, type StaffAddDraft, type StaffModel } from "./useStaffModel";

type StaffPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialStaff?: StaffMemberRecord[];
  initialSelectedStaffId?: string | null;
  previewMode?: boolean;
};


function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

export default function StaffPage({
  branding,
  slug,
  organizationId,
  initialStaff,
  initialSelectedStaffId,
  previewMode = false,
}: StaffPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useStaffModel({ organizationId, slug, initialStaff, initialSelectedStaffId, previewMode });
  const { metrics } = model;

  const subtitle =
    metrics.totalCount === 0
      ? "Give your team portal access. Each person signs in with a one-time code sent to their email."
      : [
          plural(metrics.totalCount, "person", "people"),
          plural(metrics.teacherCount, "teacher"),
          `${metrics.portalActiveCount} signed in to the portal`,
        ].join(" · ");

  let content;
  if (model.loading) {
    content = <AdminGardenPageSkeleton label="Loading staff" layout="split" />;
  } else if (model.error && model.staffMembers.length === 0) {
    content = (
      <GardenLoadError
        title="Staff didn't load"
        description={model.error}
        onRetry={() => void model.loadStaff()}
        retrying={model.loading}
      />
    );
  } else if (model.staffMembers.length === 0) {
    content = (
      <GCard index={1} kicker="Get started" title="Add your first team member">
        <GardenEmptyState
          icon={UserPlus}
          title="No staff yet"
          description="Add your first team member to give them portal access. They can sign in with a one-time code sent to their email."
          action={
            <button type="button" className={gBtnPopSm} onClick={model.openAdd} disabled={previewMode}>
              <Plus className="h-4 w-4" aria-hidden />
              Add staff
            </button>
          }
        />
      </GCard>
    );
  } else {
    content = <StaffWorkspace model={model} slug={slug} organizationId={organizationId} C={C} />;
  }

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-staff-page"
      overlays={<AddStaffDialog model={model} theme={theme} />}
    >
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            Your <span className="text-[var(--sf-clay)]">staff</span>
          </>
        }
        subtitle={subtitle}
        refresh={
          previewMode || model.staffMembers.length === 0
            ? undefined
            : {
                onRefresh: () => void model.loadStaff({ silent: true }),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastUpdatedAt,
                label: "Refresh staff",
              }
        }
        actions={
          model.staffMembers.length > 0 ? (
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={model.openAdd}
              disabled={previewMode}
              data-testid="staff-add"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add staff
            </button>
          ) : null
        }
      />
      {content}
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace: tiles, notice, list + detail                             */
/* ------------------------------------------------------------------ */

function StaffWorkspace({
  model,
  slug,
  organizationId,
  C,
}: {
  model: StaffModel;
  slug: string;
  organizationId: string;
  C: ReturnType<typeof parentThemeToAdminCompat>;
}) {
  const { metrics } = model;
  const setFilter = (key: StaffRosterFilter) => model.setFilter(model.filter === key ? "all" : key);
  const review = model.firstNeedingReview;

  return (
    <>
      <GardenStatTiles
        layout="strip"
        ariaLabel="Staff at a glance"
        stats={[
          { id: "all", label: "Staff", value: metrics.totalCount, onClick: () => model.setFilter("all"), active: model.filter === "all" },
          { id: "teachers", label: "Teachers", value: metrics.teacherCount, onClick: () => setFilter("teachers"), active: model.filter === "teachers" },
          {
            id: "portal",
            label: "Signed in to portal",
            value: metrics.portalActiveCount,
            onClick: () => setFilter("portal_active"),
            active: model.filter === "portal_active",
          },
          {
            id: "review",
            label: "Profiles to finish",
            value: metrics.needsReviewCount,
            onClick: () => setFilter("review"),
            active: model.filter === "review",
          },
        ]}
      />

      {review && metrics.needsReviewCount > 0 ? (
        <GardenNotice
          tone="warning"
          icon={AlertTriangle}
          title={`${plural(metrics.needsReviewCount, "profile")} missing a job title or email`}
          action={
            <button type="button" className={gLinkSm} onClick={() => model.selectStaff(review.id)}>
              Open {staffDisplayName(review)}
            </button>
          }
        >
          Open each one and add what&apos;s missing.
        </GardenNotice>
      ) : null}

      <div className={GARDEN_LIST_DETAIL_GRID}>
        <GardenRecordList
          kicker="Team"
          title="Staff"
          noun={{ one: "staff member", many: "staff" }}
          items={model.filteredMembers.map((member) => {
            const chip = staffPortalChip(member);
            return {
              id: member.id,
              title: staffDisplayName(member),
              meta: [
                member.roleTitle || "No job title",
                (member.assignedStudentCount ?? 0) > 0 ? plural(member.assignedStudentCount ?? 0, "learner") : null,
              ]
                .filter(Boolean)
                .join(" · "),
              chip: staffProfileNeedsReview(member) ? { tone: "warning" as const, label: "Finish profile" } : chip,
              searchText: `${member.email ?? ""} ${member.roleTitle ?? ""}`,
            };
          })}
          selectedId={model.selectedMember?.id ?? null}
          onSelect={model.selectStaff}
          flashId={model.flashId}
          searchPlaceholder="Search name, email or title"
          searchLabel="Search staff"
          filters={{
            ariaLabel: "Filter staff",
            value: model.filter,
            onChange: (key) => model.setFilter(key as StaffRosterFilter),
            options: [
              { key: "all", label: "All", count: metrics.totalCount },
              { key: "teachers", label: "Teachers", count: metrics.teacherCount },
              { key: "portal_active", label: "Signed in", count: metrics.portalActiveCount },
              ...(metrics.needsReviewCount > 0 ? [{ key: "review", label: "To finish", count: metrics.needsReviewCount }] : []),
            ],
          }}
          detailAnchorId="staff-detail"
          data-testid="staff-list"
        />

        {model.selectedMember ? (
          <StaffDetailPane
            key={model.selectedMember.id}
            model={model}
            member={model.selectedMember}
            slug={slug}
            organizationId={organizationId}
            C={C}
          />
        ) : (
          <GardenEmptyState icon={Users} title="Pick someone from the list" description="Their profile, portal access and learners show here." />
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Add staff                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_ADD: StaffAddDraft = { firstName: "", lastName: "", email: "", roleTitle: "", portalRole: "teacher" };

function AddStaffDialog({
  model,
  theme,
}: {
  model: StaffModel;
  theme: ReturnType<typeof buildParentThemeTokens>;
}) {
  const [draft, setDraft] = useState<StaffAddDraft>(EMPTY_ADD);
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(model.addOpen);
  if (wasOpen !== model.addOpen) {
    setWasOpen(model.addOpen);
    if (model.addOpen) {
      setDraft(EMPTY_ADD);
      setTouched(false);
    }
  }
  const ids = {
    first: useGardenFieldId("staff-first"),
    last: useGardenFieldId("staff-last"),
    email: useGardenFieldId("staff-email"),
    title: useGardenFieldId("staff-title"),
    role: useGardenFieldId("staff-role"),
  };
  const errors = {
    firstName: !draft.firstName.trim() ? "Add a first name." : null,
    lastName: !draft.lastName.trim() ? "Add a last name." : null,
    email: !/^\S+@\S+\.\S+$/.test(draft.email.trim()) ? "Add a valid email. Sign-in codes go here." : null,
    roleTitle: !draft.roleTitle.trim() ? "Add a job title, like Lead Teacher." : null,
  };
  const invalid = Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (touched ? errors[key] : null);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setTouched(true);
    if (invalid || model.adding) return;
    await model.addStaff(draft);
  };

  return (
    <GDialog
      theme={theme}
      open={model.addOpen}
      onClose={model.closeAdd}
      closeDisabled={model.adding}
      title="Add staff"
      description="They can sign in with a one-time code sent to their email."
      icon={<UserPlus className="h-5 w-5" aria-hidden />}
      size="md"
      footer={
        <>
          <button type="button" className={gBtnOutlineSm} onClick={model.closeAdd} disabled={model.adding}>
            Cancel
          </button>
          <button
            type="submit"
            form="add-staff-form"
            className={gBtnPopSm}
            disabled={model.adding}
            aria-busy={model.adding || undefined}
            data-testid="staff-add-submit"
          >
            <BusyLabel busy={model.adding} busyLabel="Adding…" icon={<UserPlus className="h-4 w-4" aria-hidden />}>
              Add staff
            </BusyLabel>
          </button>
        </>
      }
    >
      <form id="add-staff-form" onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4">
        {model.addError ? (
          <GardenNotice tone="alert" role="alert" title="Couldn't add this person">
            {model.addError}
          </GardenNotice>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <GardenField id={ids.first} label="First name" required error={show("firstName")}>
            <input
              id={ids.first}
              value={draft.firstName}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
              autoComplete="off"
              data-garden-skip
              className={gInputClass(show("firstName"))}
            />
          </GardenField>
          <GardenField id={ids.last} label="Last name" required error={show("lastName")}>
            <input
              id={ids.last}
              value={draft.lastName}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
              autoComplete="off"
              data-garden-skip
              className={gInputClass(show("lastName"))}
            />
          </GardenField>
        </div>
        <GardenField id={ids.email} label="Email" required error={show("email")} hint="Sign-in codes are sent here.">
          <input
            id={ids.email}
            type="email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            autoComplete="off"
            data-garden-skip
            className={gInputClass(show("email"))}
          />
        </GardenField>
        <GardenField id={ids.title} label="Job title" required error={show("roleTitle")}>
          <input
            id={ids.title}
            value={draft.roleTitle}
            onChange={(e) => setDraft({ ...draft, roleTitle: e.target.value })}
            placeholder="Lead Teacher"
            data-garden-skip
            className={gInputClass(show("roleTitle"))}
          />
        </GardenField>
        <GardenField
          id={ids.role}
          label="Portal role"
        >
          <GardenSelect
            id={ids.role}
            value={draft.portalRole}
            onChange={(value) => setDraft({ ...draft, portalRole: value as StaffPortalRole })}
            options={[
              { value: "teacher", label: "Teacher" },
              { value: "staff", label: "Staff" },
            ]}
          />
        </GardenField>
      </form>
    </GDialog>
  );
}
