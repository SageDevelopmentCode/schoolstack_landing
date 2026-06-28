"use client";

import { MapPin } from "lucide-react";
import type { Committee, CommitteeEvent } from "./types";

const TYPE_COLORS: Record<CommitteeEvent["type"], string> = {
  meeting: "bg-[#827096]/10 text-[#827096]",
  deadline: "bg-amber-100 text-amber-700",
  service: "bg-emerald-100 text-emerald-700",
  event: "bg-[#b3b462]/20 text-[#5C5A30]",
};

export default function CommitteeCalendarSection({ committee }: { committee: Committee }) {
  const sorted = [...committee.events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-3 max-w-2xl">
      {sorted.map((e) => (
        <div
          key={e.id}
          className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {new Date(e.date + "T00:00:00").toLocaleString("en-US", { month: "short" })}
            </span>
            <span className="text-lg font-bold text-gray-800 leading-none">
              {new Date(e.date + "T00:00:00").getDate()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-800">{e.title}</p>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[e.type]}`}>
                {e.type}
              </span>
            </div>
            {e.time && <p className="text-xs text-gray-500 mt-1">{e.time}</p>}
            {e.location && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {e.location}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
