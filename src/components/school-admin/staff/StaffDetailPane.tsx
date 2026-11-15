"use client";

import { useState } from "react";
import { Check, LayoutDashboard, LogIn, Mail, Pencil, Power, Users, X } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import {
  BusyLabel,
  GardenField,
  GardenNotice,
  GardenSelect,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import { GardenAvatar, GardenCopyRow, GardenFacts } from "@/components/school-admin/garden/blocks";
import { gBtnDangerTight, gBtnSolidSm } from "@/components/school-admin/garden/skin";
import StaffAssignedStudentsSection from "@/components/school-admin/staff/StaffAssignedStudentsSection";
import { GChip, GTabBar, gBtnOutlineSm, gBtnPopSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { staffProfileNeedsReview } from "@/lib/school-admin/admin-staff-roster-metrics";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { employmentStatusLabel, portalRoleLabel, staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffEmploymentStatus, StaffMemberRecord, StaffPortalRole } from "@/lib/staff/staff-members";
import { staffPortalChip } from "./staff-portal-chip";
import type { StaffModel } from "./useStaffModel";

type StaffDetailTab = "profile" | "portal" | "students" | "contact";

const EMPLOYMENT_TONES: Record<StaffEmploymentStatus, GChipTone> = {
  active: "success",
  on_leave: "info",
  inactive: "warning",
};

function formatSignIn(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function StaffDetailPane({
  model,
  member,
  slug,
  organizationId,
  C,
}: {
  model: StaffModel;
  member: StaffMemberRecord;
  slug: string;
  organizationId: string;
  C: AdminThemeTokens;
}) {
  const [tab, setTab] = useState<StaffDetailTab>("profile");
  const displayName = staffDisplayName(member);
  const portalChip = staffPortalChip(member);
  const accessOff = member.membershipStatus === "disabled" || member.employmentStatus === "inactive";
  const flashed = model.flashId === member.id;

  return (
    <section
      id="staff-detail"
      aria-label={`${displayName} profile`}
      data-testid="staff-detail"
      className={`flex min-w-0 scroll-mt-4 flex-col overflow-hidden rounded-[24px] border-[1.5px] bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] transition-colors duration-500 ${
        flashed ? "border-[var(--sf-forest)]/40" : "border-[var(--sf-ink)]/12"
      }`}
    >
      <header
        className={`flex flex-col gap-4 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-5 py-5 transition-colors duration-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
          flashed ? "bg-[var(--sf-mint)]/60" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <GardenAvatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Staff profile</p>
            <h2 className="sf-display m-0 mt-0.5 truncate text-[1.5rem] leading-tight text-[var(--sf-ink)]">{displayName}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[var(--sf-soft)]">{member.roleTitle || "No job title"}</span>
              <GChip tone={EMPLOYMENT_TONES[member.employmentStatus]}>{employmentStatusLabel(member.employmentStatus)}</GChip>
              <GChip tone={portalChip.tone}>{portalChip.label}</GChip>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {model.editing ? (
            <>
              <button type="button" className={gBtnOutlineSm} disabled={model.saving} onClick={model.cancelEdit}>
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                className={gBtnPopSm}
                disabled={model.saving || !model.draft?.firstName.trim() || !model.draft?.lastName.trim() || !model.draft?.roleTitle.trim()}
                aria-busy={model.saving || undefined}
                onClick={() => void model.saveEdit()}
                data-testid="staff-save"
              >
                <BusyLabel busy={model.saving} busyLabel="Saving…" icon={<Check className="h-4 w-4" aria-hidden />}>
                  Save
                </BusyLabel>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={gBtnOutlineSm}
              disabled={model.previewMode || model.portalBusy}
              onClick={() => {
                setTab("profile");
                model.startEdit();
              }}
              data-testid="staff-edit"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Edit profile
            </button>
          )}
        </div>
      </header>

      <div className="border-b-[1.5px] border-[var(--sf-ink)]/[0.08] px-5 py-3 sm:px-6">
        <GTabBar
          ariaLabel="Staff sections"
          activeKey={tab}
          onChange={(key) => setTab(key as StaffDetailTab)}
          items={[
            { key: "profile", label: "Profile", icon: <LayoutDashboard className="h-3.5 w-3.5" aria-hidden /> },
            { key: "portal", label: "Portal access", icon: <LogIn className="h-3.5 w-3.5" aria-hidden /> },
            {
              key: "students",
              label: "Learners & groups",
              icon: <Users className="h-3.5 w-3.5" aria-hidden />,
              suffix:
                (member.assignedStudentCount ?? 0) > 0 ? (
                  <span className="rounded-full bg-[var(--sf-ink)]/[0.07] px-1.5 text-[11px] tabular-nums">{member.assignedStudentCount}</span>
                ) : undefined,
            },
            { key: "contact", label: "Contact", icon: <Mail className="h-3.5 w-3.5" aria-hidden /> },
          ]}
        />
      </div>

      <div className="px-5 py-5 sm:px-6" role="tabpanel" aria-label={tab}>
        {tab === "profile" ? (
          model.editing && model.draft ? (
            <EditForm model={model} />
          ) : (
            <div className="flex flex-col gap-4">
              {staffProfileNeedsReview(member) ? (
                <GardenNotice
                  tone="warning"
                  title="This profile isn't finished"
                  action={
                    model.previewMode ? null : (
                      <button type="button" className={gLinkSm} onClick={model.startEdit}>
                        Finish it now
                      </button>
                    )
                  }
                >
                  {!member.roleTitle?.trim() ? "Add a job title." : "Add an email so they can sign in."}
                </GardenNotice>
              ) : null}
              <GardenFacts
                items={[
                  { label: "Name", value: displayName },
                  { label: "Job title", value: member.roleTitle || "—" },
                  { label: "Employment status", value: employmentStatusLabel(member.employmentStatus) },
                  { label: "Portal role", value: portalRoleLabel(member.portalRole) },
                  { label: "Portal account", value: <GChip tone={portalChip.tone}>{portalChip.label}</GChip> },
                  {
                    label: "Learners",
                    value: (
                      <button type="button" className={gLinkSm} onClick={() => setTab("students")}>
                        {member.assignedStudentCount ?? 0} assigned
                      </button>
                    ),
                  },
                ]}
              />
            </div>
          )
        ) : null}

        {tab === "portal" ? (
          <div className="flex flex-col gap-5">
            <GardenFacts
              items={[
                { label: "Role", value: portalRoleLabel(member.portalRole) },
                {
                  label: "Sign-in status",
                  value: <GChip tone={portalChip.tone}>{portalChip.label}</GChip>,
                  hint: formatSignIn(member.lastSignInAt) ? `Last signed in ${formatSignIn(member.lastSignInAt)}` : undefined,
                },
              ]}
            />
            <div>
              <p className="m-0 mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">Sign-in URL</p>
              <GardenCopyRow value={model.loginUrl} label="Sign-in link" toastTitle="Sign-in link copied." data-testid="staff-login-url" />
              <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                Share this with {member.firstName || displayName}. They sign in with a one-time code sent to {member.email || "their email"}.
              </p>
            </div>
            <div className="rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] p-4">
              {accessOff ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">
                    {displayName} can&apos;t sign in right now.
                  </p>
                  <button
                    type="button"
                    className={gBtnSolidSm}
                    disabled={model.portalBusy || model.previewMode}
                    aria-busy={model.portalBusy || undefined}
                    onClick={() => void model.portalAction("reactivatePortalAccess")}
                    data-testid="staff-reactivate"
                  >
                    <BusyLabel busy={model.portalBusy} busyLabel="Reactivating…" icon={<Power className="h-4 w-4" aria-hidden />}>
                      Reactivate portal access
                    </BusyLabel>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">
                    Turn off sign-in if {member.firstName || displayName} leaves or shouldn&apos;t have access.
                  </p>
                  <button
                    type="button"
                    className={gBtnDangerTight}
                    disabled={model.portalBusy || model.previewMode}
                    onClick={() => model.setConfirmDeactivate(true)}
                    data-testid="staff-deactivate"
                  >
                    <Power className="h-4 w-4" aria-hidden />
                    Deactivate portal access
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "students" ? (
          <StaffAssignedStudentsSection
            key={member.id}
            slug={slug}
            organizationId={organizationId}
            staffMemberId={member.id}
            staffMemberName={displayName}
            staffIsActive={member.employmentStatus === "active"}
            previewMode={model.previewMode}
            embedded
            onAssignmentsChanged={() => void model.loadStaff({ silent: true })}
          />
        ) : null}

        {tab === "contact" ? (
          <div className="flex flex-col gap-3">
            <GardenFacts
              items={[
                {
                  label: "Email",
                  value: member.email ? (
                    <a href={`mailto:${member.email}`} className={gLinkSm}>
                      {member.email}
                    </a>
                  ) : (
                    "—"
                  ),
                  hint: "Email can't be changed here.",
                },
              ]}
            />
            {member.email ? <GardenCopyRow value={member.email} label="Email" toastTitle="Email copied." /> : null}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={model.confirmDeactivate}
        title="Deactivate portal access?"
        description={`${displayName} will no longer be able to sign in to the teacher portal.`}
        confirmLabel="Deactivate"
        variant="destructive"
        loading={model.portalBusy}
        onClose={() => model.setConfirmDeactivate(false)}
        onConfirm={() => void model.portalAction("deactivatePortalAccess")}
        C={C}
      />
    </section>
  );
}

function EditForm({ model }: { model: StaffModel }) {
  const draft = model.draft!;
  const set = (patch: Partial<typeof draft>) => model.setDraft({ ...draft, ...patch });
  const ids = {
    first: useGardenFieldId("edit-first"),
    last: useGardenFieldId("edit-last"),
    title: useGardenFieldId("edit-title"),
    status: useGardenFieldId("edit-status"),
    role: useGardenFieldId("edit-role"),
  };
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void model.saveEdit();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <GardenField id={ids.first} label="First name" required error={draft.firstName.trim() ? null : "Add a first name."}>
          <input id={ids.first} value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} data-garden-skip className={gInputClass(draft.firstName.trim() ? null : "x")} />
        </GardenField>
        <GardenField id={ids.last} label="Last name" required error={draft.lastName.trim() ? null : "Add a last name."}>
          <input id={ids.last} value={draft.lastName} onChange={(e) => set({ lastName: e.target.value })} data-garden-skip className={gInputClass(draft.lastName.trim() ? null : "x")} />
        </GardenField>
      </div>
      <GardenField id={ids.title} label="Job title" required error={draft.roleTitle.trim() ? null : "Add a job title."}>
        <input id={ids.title} value={draft.roleTitle} onChange={(e) => set({ roleTitle: e.target.value })} data-garden-skip className={gInputClass(draft.roleTitle.trim() ? null : "x")} />
      </GardenField>
      <div className="grid gap-3 sm:grid-cols-2">
        <GardenField id={ids.status} label="Employment status" hint="To revoke sign-in access, deactivate on the Portal access tab.">
          <GardenSelect
            id={ids.status}
            value={draft.employmentStatus}
            onChange={(value) => set({ employmentStatus: value as StaffEmploymentStatus })}
            options={[
              { value: "active", label: "Active" },
              { value: "on_leave", label: "On leave" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </GardenField>
        <GardenField id={ids.role} label="Portal role">
          <GardenSelect
            id={ids.role}
            value={draft.portalRole}
            onChange={(value) => set({ portalRole: value as StaffPortalRole })}
            options={[
              { value: "teacher", label: "Teacher" },
              { value: "staff", label: "Staff" },
            ]}
          />
        </GardenField>
      </div>
      <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">Email can&apos;t be changed here.</p>
    </form>
  );
}
