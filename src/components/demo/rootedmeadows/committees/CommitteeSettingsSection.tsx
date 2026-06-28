"use client";

import { Archive, UserMinus, UserPlus } from "lucide-react";
import type { Committee } from "./types";

export default function CommitteeSettingsSection({
  committee,
  onArchive,
}: {
  committee: Committee;
  onArchive?: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <section className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Membership</h3>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] rounded-xl hover:bg-[#5A4D68] transition-colors cursor-pointer">
            <UserPlus className="w-4 h-4" />
            Invite member
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <UserMinus className="w-4 h-4" />
            Remove selected
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {committee.members.length} members · Term {committee.termLabel}
        </p>
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Term dates</h3>
        <p className="text-sm text-gray-600">
          {new Date(committee.termStart + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          –{" "}
          {new Date(committee.termEnd + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </section>

      {committee.status === "active" && onArchive && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">End of term</h3>
          <p className="text-xs text-amber-700 mb-4">
            Archive this committee at year end. Messages, tasks, and files are preserved. Members can be bulk-uninvited and the workspace duplicated for next year.
          </p>
          <button
            onClick={onArchive}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-800 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            Archive committee
          </button>
        </section>
      )}
    </div>
  );
}
