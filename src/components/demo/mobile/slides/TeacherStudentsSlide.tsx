"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { DEFAULT_ATTENDANCE, MOBILE_DEMO_STUDENTS } from "../mobileDemoData";

type Props = {
  accentColor: string;
};

const PROFILE_CHIPS = ["Learning profile", "Health", "Pickup"];

function statusLabel(status: string) {
  if (status === "checked_in") return "Checked in";
  if (status === "checked_out") return "Checked out";
  if (status === "absent") return "Absent";
  return "Not marked";
}

function statusColor(status: string, accentColor: string) {
  if (status === "checked_in") return accentColor;
  if (status === "absent") return "#F59E0B";
  return "#9CA3AF";
}

export default function TeacherStudentsSlide({ accentColor }: Props) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOBILE_DEMO_STUDENTS;
    return MOBILE_DEMO_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.guardian.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-4 py-3 shrink-0">
        <p className="text-base font-semibold text-gray-800">My Students</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {MOBILE_DEMO_STUDENTS.length} enrolled
        </p>
      </div>

      <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or guardian..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredStudents.map((student) => {
          const attendance = DEFAULT_ATTENDANCE[student.id] ?? "not_marked";
          const expanded = expandedId === student.id;
          return (
            <button
              key={student.id}
              type="button"
              onClick={() => setExpandedId(expanded ? null : student.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                expanded
                  ? "border-2 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
              }`}
              style={expanded ? { borderColor: accentColor } : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: student.color }}
                >
                  {student.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {student.grade} · {student.classroom}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shrink-0"
                      style={{
                        backgroundColor: statusColor(attendance, accentColor),
                      }}
                    >
                      {statusLabel(attendance)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 truncate">
                    {student.guardian} · {student.guardianPhone}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${
                    expanded ? "rotate-90" : ""
                  }`}
                />
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                  {PROFILE_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full px-2.5 py-1 text-[10px] font-medium text-gray-600 bg-gray-100"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
