"use client";

import { useMemo, useState } from "react";
import { Car, Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import {
  DEFAULT_ATTENDANCE,
  MOBILE_DEMO_STUDENTS,
  type AttendanceStatus,
} from "../mobileDemoData";

type Props = {
  accentColor: string;
};

const BASE_DATE = new Date(2026, 2, 4);

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === "checked_in") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        In
      </span>
    );
  }
  if (status === "checked_out") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        Out
      </span>
    );
  }
  if (status === "absent") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Absent
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 shrink-0">
      Not marked
    </span>
  );
}

export default function TeacherAttendanceSlide({ accentColor }: Props) {
  const [activeDate, setActiveDate] = useState(BASE_DATE);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({
    ...DEFAULT_ATTENDANCE,
  });

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOBILE_DEMO_STUDENTS;
    return MOBILE_DEMO_STUDENTS.filter((s) => s.name.toLowerCase().includes(q));
  }, [search]);

  const presentCount = MOBILE_DEMO_STUDENTS.filter(
    (s) => records[s.id] === "checked_in" || records[s.id] === "checked_out",
  ).length;

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const shiftDay = (delta: number) => {
    setActiveDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <h1 className="text-base font-bold text-gray-800">Attendance</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {MOBILE_DEMO_STUDENTS.length} students
        </p>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 shrink-0 bg-gray-50/80">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 truncate">
              {formatDateLabel(activeDate)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {presentCount} of {MOBILE_DEMO_STUDENTS.length} present
            </p>
          </div>
          <button
            type="button"
            onClick={() => shiftDay(1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filteredStudents.map((student) => {
          const status = records[student.id] ?? "not_marked";
          const isPresent = status === "checked_in" || status === "checked_out";
          return (
            <div
              key={student.id}
              className={`px-4 py-3 transition-colors ${
                isPresent ? "bg-gray-50/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: student.color }}
                >
                  {student.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {student.name}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <span className="text-[10px] text-gray-400">{student.grade}</span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 pl-12">
                <ActionButton
                  label="Present"
                  icon={<Check className="w-3 h-3" />}
                  active={status === "checked_in"}
                  accentColor={accentColor}
                  onClick={() => setStatus(student.id, "checked_in")}
                />
                <ActionButton
                  label="Pickup"
                  icon={<Car className="w-3 h-3" />}
                  active={status === "checked_out"}
                  accentColor={accentColor}
                  disabled={status !== "checked_in" && status !== "checked_out"}
                  onClick={() => setStatus(student.id, "checked_out")}
                />
                <ActionButton
                  label="Absent"
                  icon={<X className="w-3 h-3" />}
                  active={status === "absent"}
                  accentColor={accentColor}
                  variant="danger"
                  onClick={() => setStatus(student.id, "absent")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  active,
  accentColor,
  disabled,
  variant = "default",
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  accentColor: string;
  disabled?: boolean;
  variant?: "default" | "danger";
  onClick: () => void;
}) {
  const activeStyle =
    variant === "danger"
      ? { backgroundColor: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }
      : { backgroundColor: `${accentColor}15`, color: accentColor, borderColor: `${accentColor}40` };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
      }`}
      style={active ? activeStyle : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
