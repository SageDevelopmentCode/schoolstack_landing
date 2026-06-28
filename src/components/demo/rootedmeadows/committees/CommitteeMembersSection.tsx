"use client";

import { Mail, Phone } from "lucide-react";
import { getCommitteeTemplate } from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeMember, CommitteeRole } from "./types";

const ROLE_LABELS: Record<CommitteeRole, string> = {
  member: "Member",
  lead: "Lead",
  faculty_liaison: "Faculty liaison",
  admin: "Admin",
};

const ROLE_STYLES: Record<CommitteeRole, string> = {
  member: "bg-gray-100 text-gray-600",
  lead: "bg-[#827096]/15 text-[#827096]",
  faculty_liaison: "bg-[#b3b462]/20 text-[#5C5A30]",
  admin: "bg-amber-100 text-amber-700",
};

function MemberRow({ member, showGrade }: { member: CommitteeMember; showGrade?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-[#827096]/10 flex items-center justify-center text-[#827096] font-semibold text-sm">
        {member.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800">{member.name}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[member.role]}`}>
            {ROLE_LABELS[member.role]}
          </span>
          {showGrade && member.grade && (
            <span className="text-[10px] font-medium text-gray-400">{member.grade}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {member.email}
          </span>
          {member.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {member.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommitteeMembersSection({ committee }: { committee: Committee }) {
  const template = getCommitteeTemplate(committee.templateId);
  const showGrade = template?.showGradeColumn;

  return (
    <div className="space-y-3 max-w-2xl">
      {committee.members.map((m) => (
        <MemberRow key={m.id} member={m} showGrade={showGrade} />
      ))}
    </div>
  );
}
