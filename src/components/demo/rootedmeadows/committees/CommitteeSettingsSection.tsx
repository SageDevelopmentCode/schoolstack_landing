"use client";

import { Archive } from "lucide-react";
import type { Committee, CommitteeWorkspaceSection } from "./types";

export default function CommitteeSettingsSection({
  committee,
  onArchive,
  onNavigateToSection,
}: {
  committee: Committee;
  onArchive?: () => void;
  onNavigateToSection?: (section: CommitteeWorkspaceSection) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <section className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Membership</h3>
        <p className="text-sm text-gray-600">
          {committee.members.length} members · Term {committee.termLabel}
        </p>
        {onNavigateToSection && (
          <button
            onClick={() => onNavigateToSection("members")}
            className="mt-3 text-sm font-medium text-[#827096] hover:underline cursor-pointer"
          >
            Manage members in the Members tab
          </button>
        )}
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-800 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            Archive committee
          </button>
        </section>
      )}
    </div>
  );
}
