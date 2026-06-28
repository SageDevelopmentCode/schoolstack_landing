"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, UserRound } from "lucide-react";
import type { Committee, CommitteeDutyRole } from "./types";
import { memberInitials } from "./committeeTaskUtils";
import EditDutyRoleModal from "./EditDutyRoleModal";

function OverviewCard({ aboutHtml }: { aboutHtml: string }) {
  const paragraphs = aboutHtml.split("\n\n");

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      {paragraphs.map((block, i) => {
        if (block.startsWith("**") && block.includes(":**")) {
          const [heading, ...rest] = block.split("\n");
          const title = heading.replace(/\*\*/g, "").replace(":", "");
          return (
            <div key={i}>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
              <ul className="space-y-1.5">
                {rest
                  .filter((line) => line.startsWith("- "))
                  .map((line, j) => (
                    <li key={j} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-[#827096]">•</span>
                      {line.slice(2)}
                    </li>
                  ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function DutyRoleCard({
  dutyRole,
  assigneeName,
  canManage,
  onSelect,
}: {
  dutyRole: CommitteeDutyRole;
  assigneeName?: string;
  canManage?: boolean;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold text-gray-800">{dutyRole.title}</p>
      <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">{dutyRole.description}</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        {assigneeName ? (
          <>
            <div className="w-7 h-7 rounded-full bg-[#827096]/10 flex items-center justify-center text-[#827096] font-semibold text-[10px] shrink-0">
              {memberInitials(assigneeName)}
            </div>
            <p className="text-xs font-medium text-gray-700 truncate">{assigneeName}</p>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <UserRound className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 italic">Unassigned</p>
          </>
        )}
      </div>
    </>
  );

  if (canManage && onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="text-left p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#827096]/30 hover:shadow-sm transition-all"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      {content}
    </div>
  );
}

export default function CommitteeAboutSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
}) {
  const [editingRole, setEditingRole] = useState<CommitteeDutyRole | null | undefined>(undefined);
  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);

  const getAssigneeName = (assigneeId?: string) =>
    assigneeId ? committee.members.find((m) => m.id === assigneeId)?.name : undefined;

  const handleSaveRole = (dutyRole: CommitteeDutyRole) => {
    if (!onCommitteeUpdate) return;
    const exists = committee.dutyRoles.some((r) => r.id === dutyRole.id);
    onCommitteeUpdate({
      ...committee,
      dutyRoles: exists
        ? committee.dutyRoles.map((r) => (r.id === dutyRole.id ? dutyRole : r))
        : [...committee.dutyRoles, dutyRole],
    });
  };

  return (
    <div className="space-y-6">
      <OverviewCard aboutHtml={committee.aboutHtml} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Committee roles</h3>
          {canManage && (
            <button
              type="button"
              onClick={() => setEditingRole(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add role
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {committee.dutyRoles.map((role) => (
            <DutyRoleCard
              key={role.id}
              dutyRole={role}
              assigneeName={getAssigneeName(role.assigneeId)}
              canManage={canManage}
              onSelect={canManage ? () => setEditingRole(role) : undefined}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {editingRole !== undefined && (
          <EditDutyRoleModal
            committee={committee}
            dutyRole={editingRole}
            onClose={() => setEditingRole(undefined)}
            onSave={handleSaveRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
