"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Mail, Phone, X } from "lucide-react";
import type { Committee, CommitteeMember, CommitteeRole } from "./types";
import { memberInitials } from "./committeeTaskUtils";

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

const ROLE_DESCRIPTIONS: Record<CommitteeRole, string> = {
  lead: "Coordinates committee planning, meetings, and serves as the primary family point of contact.",
  member: "Participates in committee activities, service projects, and volunteer support for the school year.",
  faculty_liaison: "School staff partner who supports logistics, communication, and alignment with school policies.",
  admin: "Oversees committee setup, membership, and workspace administration.",
};

export default function MemberDetailModal({
  member,
  committee,
  showGrade,
  onClose,
}: {
  member: CommitteeMember | null;
  committee: Committee;
  showGrade?: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && member) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 leading-snug">{member.name}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#827096] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {memberInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLES[member.role]}`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{ROLE_DESCRIPTIONS[member.role]}</p>
                </div>
              </div>

              {member.bio && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    {member.email}
                  </p>
                  {member.phone && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      {member.phone}
                    </p>
                  )}
                </div>
              </div>

              {showGrade && member.grade && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Grade</p>
                  <p className="text-sm text-gray-800">{member.grade}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Committee term
                </p>
                <p className="text-sm text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  {committee.termLabel}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
