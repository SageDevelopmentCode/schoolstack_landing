"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Mail, X } from "lucide-react";
import { DEMO_COMMITTEES } from "@/data/school-demos/rooted-meadows-committees";
import type { AugustSignupResponse } from "./types";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  placed: "bg-blue-100 text-blue-700",
  invited: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  placed: "Placed",
  invited: "Invite sent",
};

export default function AugustSignupDetailModal({
  signup,
  onClose,
}: {
  signup: AugustSignupResponse | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && signup) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [signup, onClose]);

  const committee = signup?.placedCommitteeId
    ? DEMO_COMMITTEES.find((c) => c.id === signup.placedCommitteeId)
    : undefined;

  return (
    <AnimatePresence>
      {signup && (
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
              <div>
                <h2 className="text-lg font-semibold text-gray-800 leading-snug">
                  {signup.parentName}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{signup.familyName}</p>
              </div>
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
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[signup.status]}`}
                >
                  {STATUS_LABELS[signup.status]}
                </span>
                {committee && (
                  <span className="text-xs text-gray-500">{committee.name}</span>
                )}
              </div>

              {signup.assignedRole && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Role
                  </p>
                  <p className="text-sm text-gray-800">{signup.assignedRole}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Committee preferences
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {signup.preferences.map((p, idx) => (
                    <span
                      key={p}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                    >
                      {idx + 1}. {p}
                    </span>
                  ))}
                </div>
              </div>

              {signup.participationSummary && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Participation
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {signup.participationSummary}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Contact
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    {signup.email}
                  </p>
                  {signup.gradeLevel && (
                    <p className="text-sm text-gray-700">
                      Child&apos;s grade: {signup.gradeLevel}
                    </p>
                  )}
                </div>
              </div>

              {signup.inviteSentAt && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Invite sent
                  </p>
                  <p className="text-sm text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    {signup.inviteSentAt}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
