"use client";

import { ArrowRight, CalendarDays, CheckSquare, Heart } from "lucide-react";
import type { Committee } from "./types";

export default function CommitteeListPage({
  committees,
  onOpenCommittee,
}: {
  committees: Committee[];
  onOpenCommittee: (id: string) => void;
}) {
  if (committees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-[#827096]/5 flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-[#827096]" />
        </div>
        <h3 className="font-semibold text-gray-700 text-lg mb-2">No committees yet</h3>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          When the school invites you to a committee workspace, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-gray-800">My Committees</h2>
        <p className="text-sm text-gray-500 mt-1">
          Private workspaces for volunteer groups and school committees you belong to.
        </p>
      </div>
      <div className="space-y-4">
        {committees.map((c) => {
          const openTasks = c.tasks.filter((t) => t.status !== "done").length;
          const nextEvent = c.events[0];
          return (
            <button
              key={c.id}
              onClick={() => onOpenCommittee(c.id)}
              className="w-full text-left p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#827096]/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-800">{c.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096]">
                      {c.termLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {openTasks > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {openTasks} open task{openTasks !== 1 ? "s" : ""}
                      </span>
                    )}
                    {nextEvent && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Next: {nextEvent.title}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#827096] transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
