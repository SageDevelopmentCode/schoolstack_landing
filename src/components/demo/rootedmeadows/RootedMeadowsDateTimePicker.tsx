"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import { ROOTED_MEADOWS_ADMIN_COLORS } from "@/data/school-demos/rootedmeadows-admin-demo";
import { ROOTED_MEADOWS_OBSERVATION_COPY } from "@/data/school-demos/rooted-meadows-observation";
import {
  formatSelectedDate,
  isCurrentMonth,
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
} from "@/lib/demo-scheduler";

const C = ROOTED_MEADOWS_ADMIN_COLORS;
const ease = [0.16, 1, 0.3, 1] as const;

const calendarColors = {
  accent: C.accent,
  accentLight: C.accentLight,
  text: C.textPrimary,
  textFaint: C.textSecondary,
};

interface Props {
  availabilitySlots: Record<string, string[]>;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string | null) => void;
  onTimeChange: (time: string | null) => void;
}

function TimeSlotList({
  dateStr,
  timeSlots,
  selectedTime,
  onSelectTime,
}: {
  dateStr: string;
  timeSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
}) {
  const formatted = formatSelectedDate(dateStr).toUpperCase();

  return (
    <div className="flex flex-col p-4 md:h-full md:min-h-[280px]">
      <div className="mb-3 flex items-center gap-2">
        <Clock size={14} style={{ color: C.accent }} aria-hidden />
        <div className="text-xs font-semibold tracking-wide" style={{ color: C.textPrimary }}>
          {formatted}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {timeSlots.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: C.textSecondary }}>
            No times available for this date.
          </p>
        ) : (
          timeSlots.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTime(isSelected ? null : slot)}
                className="w-full rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-150"
                style={
                  isSelected
                    ? {
                        backgroundColor: C.accent,
                        borderColor: C.accent,
                        color: "#FFFFFF",
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        borderColor: C.border,
                        color: C.textPrimary,
                      }
                }
              >
                {slot}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function RootedMeadowsDateTimePicker({
  availabilitySlots,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: Props) {
  const initial = todayMonthYear();
  const [viewYear, setViewYear] = useState(() =>
    selectedDate ? Number(selectedDate.slice(0, 4)) : initial.year,
  );
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? Number(selectedDate.slice(5, 7)) - 1 : initial.month,
  );

  const today = todayKey();
  const availableDates = new Set(Object.keys(availabilitySlots));
  const selectedTimeSlots = selectedDate ? availabilitySlots[selectedDate] ?? [] : [];

  function handleDateSelect(date: string) {
    onDateChange(date);
    onTimeChange(null);
  }

  function prevMonth() {
    if (isCurrentMonth(viewYear, viewMonth)) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    onDateChange(null);
    onTimeChange(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    onDateChange(null);
    onTimeChange(null);
  }

  return (
    <div>
      <h3
        className="font-heading text-lg font-semibold"
        style={{ color: C.accentDark }}
      >
        {ROOTED_MEADOWS_OBSERVATION_COPY.dateTimeHeading}
      </h3>
      <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
        {ROOTED_MEADOWS_OBSERVATION_COPY.dateTimeSubheading}
      </p>

      <div
        className="mt-4 overflow-hidden rounded-md border md:flex"
        style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
      >
        <div className="min-w-0 flex-1 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isCurrentMonth(viewYear, viewMonth)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 disabled:pointer-events-none disabled:opacity-30"
              style={{ color: C.textSecondary }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="text-sm font-medium font-secondary"
              style={{ color: C.textPrimary }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: C.textSecondary }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={selectedDate}
            onSelect={handleDateSelect}
            availableDates={availableDates}
            minDate={today}
            colors={calendarColors}
          />
        </div>

        <AnimatePresence>
          {selectedDate ? (
            <>
              <motion.div
                key="times-mobile"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease } }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="overflow-hidden border-t md:hidden"
                style={{ borderColor: C.border }}
              >
                <TimeSlotList
                  dateStr={selectedDate}
                  timeSlots={selectedTimeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={onTimeChange}
                />
              </motion.div>
              <motion.div
                key="times-desktop"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 180, transition: { duration: 0.28, ease } }}
                exit={{ opacity: 0, width: 0, transition: { duration: 0.2 } }}
                className="hidden shrink-0 overflow-hidden border-l md:block"
                style={{ borderColor: C.border }}
              >
                <TimeSlotList
                  dateStr={selectedDate}
                  timeSlots={selectedTimeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={onTimeChange}
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>

      {selectedDate && selectedTime ? (
        <div
          className="mt-3 rounded-md px-4 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: C.clayBg,
            color: C.accentDark,
            border: `1px solid ${C.clayBorder}`,
          }}
        >
          {formatSelectedDate(selectedDate)} at {selectedTime} selected
        </div>
      ) : null}
    </div>
  );
}
