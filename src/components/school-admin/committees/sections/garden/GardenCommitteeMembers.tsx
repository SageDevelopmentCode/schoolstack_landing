"use client";

import { Mail, Phone, UserPlus, UserRound, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import { gFade } from "@/components/school-parent/garden/motion";
import { GChip, GKicker, NOTE_TINTS, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { COMMITTEE_ROLE_LABELS } from "@/lib/committees/committee-role-labels";
import type { Committee } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GardenSectionHeader, initialsOf, plural } from "./committee-garden-section";

/**
 * Committee Members (Garden): person mini-cards (initials on a pastel, name,
 * role chip, grade, tap-to-email/call) and the duty roles with who holds them.
 */
export default function GardenCommitteeMembers({
  committee,
  theme,
  readOnly,
  showGrade,
  onInvite,
  onRemove,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  readOnly: boolean;
  showGrade: boolean;
  onInvite: () => void;
  onRemove: (memberId: string) => void;
}) {
  const reduce = useReducedMotion() === true;
  const leads = committee.members.filter((member) => member.role === "lead");

  return (
    <div data-testid="committee-members-garden">
      <GardenSectionHeader
        kicker="People"
        title={plural(committee.members.length, "member")}
        description={
          leads.length > 0
            ? `Led by ${leads.map((lead) => lead.name).join(", ")}. Reach out to anyone below.`
            : "Everyone on this committee and their role."
        }
        actions={
          !readOnly ? (
            <button type="button" className={gBtnPopSm} onClick={onInvite}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invite member
            </button>
          ) : null
        }
      />

      {committee.members.length === 0 ? (
        <CommitteeSectionEmptyState
          theme={theme}
          icon={Users}
          title="No members listed yet"
          description="Committee members will appear here once they are added or invited."
        />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" aria-label="Committee members">
          {committee.members.map((member, index) => (
            <motion.li
              key={member.id}
              {...gFade(index + 1, reduce)}
              className="flex items-start gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.06)]"
            >
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)] ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
              >
                {initialsOf(member.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)]">{member.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <GChip tone={member.role === "lead" ? "success" : "neutral"}>{COMMITTEE_ROLE_LABELS[member.role]}</GChip>
                  {showGrade && member.grade ? <GChip tone="info">{member.grade}</GChip> : null}
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {member.email ? (
                    <a href={`mailto:${member.email}`} className={`${gLinkSm} min-w-0 !text-[13px]`}>
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  ) : null}
                  {member.phone ? (
                    <a href={`tel:${member.phone}`} className={`${gLinkSm} !text-[13px]`}>
                      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {member.phone}
                    </a>
                  ) : null}
                </div>
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => onRemove(member.id)}
                  className="shrink-0 rounded-full px-2 py-1 text-[13px] font-extrabold text-[#b42318] hover:bg-[#b42318]/[0.06]"
                >
                  Remove
                </button>
              ) : null}
            </motion.li>
          ))}
        </ul>
      )}

      {committee.dutyRoles.length > 0 ? (
        <section className="mt-8" aria-labelledby="committee-duty-roles-heading">
          <GKicker>Who does what</GKicker>
          <h3 id="committee-duty-roles-heading" className="sf-display m-0 mt-1 text-[1.35rem] leading-[1.05] text-[var(--sf-ink)]">
            Duty roles
          </h3>
          <ul className="m-0 mt-3 grid list-none gap-3 p-0 md:grid-cols-2">
            {committee.dutyRoles.map((dutyRole) => {
              const assignee = committee.members.find((member) => member.id === dutyRole.assigneeId);
              return (
                <li key={dutyRole.id} className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
                  <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{dutyRole.title}</p>
                  <p className="m-0 mt-1 line-clamp-3 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                    {dutyRole.description || "No description yet."}
                  </p>
                  <div className="mt-3 flex items-center gap-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
                    {assignee ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]"
                        >
                          {initialsOf(assignee.name)}
                        </span>
                        <span className="truncate text-[13px] font-bold text-[var(--sf-ink)]/80">{assignee.name}</span>
                      </>
                    ) : (
                      <>
                        <UserRound className="h-4 w-4 text-[var(--sf-soft)]" aria-hidden="true" />
                        <GChip tone="warning">Open role</GChip>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
