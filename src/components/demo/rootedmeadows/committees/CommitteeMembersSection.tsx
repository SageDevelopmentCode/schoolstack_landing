"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Mail, Phone, UserMinus, UserPlus } from "lucide-react";
import { getCommitteeTemplate } from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeMember, CommitteeRole } from "./types";
import InviteMemberModal from "./InviteMemberModal";
import MemberDetailModal from "./MemberDetailModal";

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

function MemberRow({
  member,
  showGrade,
  isAdminView,
  selected,
  onToggle,
  onSelect,
}: {
  member: CommitteeMember;
  showGrade?: boolean;
  isAdminView?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
}) {
  const canSelect = isAdminView && member.role !== "faculty_liaison";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#827096]/30 hover:shadow-sm transition-all"
    >
      {canSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 cursor-pointer self-start mt-1 shrink-0"
        />
      )}
      <div className="w-10 h-10 rounded-full bg-[#827096]/10 flex items-center justify-center text-[#827096] font-semibold text-sm shrink-0">
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
        <div className="flex flex-col gap-1 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1 min-w-0">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{member.email}</span>
          </span>
          {member.phone && (
            <span className="flex items-center gap-1 min-w-0">
              <Phone className="w-3 h-3 shrink-0" />
              <span className="truncate">{member.phone}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommitteeMembersSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);
  const template = getCommitteeTemplate(committee.templateId);
  const showGrade = template?.showGradeColumn;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInvite = (member: CommitteeMember) => {
    onCommitteeUpdate?.({ ...committee, members: [...committee.members, member] });
  };

  const handleRemove = () => {
    if (selectedIds.size === 0 || !onCommitteeUpdate) return;
    onCommitteeUpdate({
      ...committee,
      members: committee.members.filter((m) => !selectedIds.has(m.id)),
    });
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Invite member
          </button>
          <button
            onClick={handleRemove}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserMinus className="w-4 h-4" />
            Remove selected
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {committee.members.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            showGrade={showGrade}
            isAdminView={canManage}
            selected={selectedIds.has(m.id)}
            onToggle={() => toggleSelect(m.id)}
            onSelect={() => setSelectedMember(m)}
          />
        ))}
      </div>
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            committee={committee}
            showGrade={showGrade}
            onClose={() => setSelectedMember(null)}
          />
        )}
        {showInvite && (
          <InviteMemberModal
            committee={committee}
            onClose={() => setShowInvite(false)}
            onSave={handleInvite}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
