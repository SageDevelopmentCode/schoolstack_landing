"use client";

import { ArrowRight } from "lucide-react";
import { GCard, GSkeleton, gLinkSm } from "@/components/school-parent/garden/ui";
import type { ParentAssignedTeacher } from "@/lib/admissions/parent-portal-access";
import type { ParentChildrenModel } from "../useParentChildrenModel";
import { TeacherAvatar } from "./TeacherAvatar";

/** "Guides at school": the first two assigned teachers + a link to the Teachers tab. */
export default function ChildTeamCard({ model }: { model: ParentChildrenModel }) {
  const { teachers, firstName, isRecordLoading, openRecordSection } = model;

  return (
    <GCard
      index={3}
      kicker="Guides at school"
      title={isRecordLoading ? "Teachers" : teachers.length === 0 ? "Teachers coming soon" : `${firstName}'s team`}
      action={
        !isRecordLoading && teachers.length > 0 ? (
          <button type="button" className={gLinkSm} onClick={() => openRecordSection("teachers")}>
            See all teachers <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      {isRecordLoading ? (
        <div className="flex flex-col gap-3">
          <GSkeleton className="h-12 !rounded-[16px]" />
          <GSkeleton className="h-12 !rounded-[16px]" />
        </div>
      ) : teachers.length === 0 ? (
        <p className="m-0 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-4 py-3.5 text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
          Assigned teachers will appear here once {firstName} is linked to a class group.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {teachers.slice(0, 2).map((teacher: ParentAssignedTeacher, i) => (
            <li
              key={teacher.id}
              className="flex items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3 py-2.5"
            >
              <TeacherAvatar teacher={teacher} index={i} />
              <div className="min-w-0">
                <h3 className="m-0 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{teacher.name}</h3>
                {teacher.roleTitle ? (
                  <p className="m-0 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{teacher.roleTitle}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </GCard>
  );
}
