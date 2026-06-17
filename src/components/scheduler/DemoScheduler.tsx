"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
  isCurrentMonth,
  formatSelectedDate,
} from "@/lib/demo-scheduler";

const ease = [0.16, 1, 0.3, 1] as const;

function TimeSlotList({
  dateStr,
  timeSlots,
  selectedTime,
  onSelectTime,
  onConfirm,
  isSubmitting,
  preview,
  confirmDisabled,
}: {
  dateStr: string;
  timeSlots: string[];
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
  onConfirm?: (booking: { date: string; time: string }) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col md:h-full p-4">
      <div className="mb-3">
        <div className="text-[10px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-0.5">
          Select a time
        </div>
        <div className="text-[12px] font-medium font-secondary text-text leading-snug">
          {formatSelectedDate(dateStr)}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {timeSlots.length === 0 ? (
          <p className="text-[13px] text-text-faint font-secondary text-center py-4">
            No times available for this date.
          </p>
        ) : (
          timeSlots.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTime(slot)}
                className={`w-full h-10 rounded-lg border-2 text-[13px] font-medium font-secondary transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-accent bg-accent text-white"
                    : "border-border text-text hover:border-accent hover:text-accent"
                }`}
              >
                {slot}
              </button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedTime && (
          <motion.div
            key="confirm-btn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            className="mt-3 pt-3 border-t border-border"
          >
            <button
              type="button"
              disabled={isSubmitting || preview || confirmDisabled}
              onClick={() => {
                if (selectedTime && onConfirm) {
                  onConfirm({ date: dateStr, time: selectedTime });
                }
              }}
              className="w-full h-10 rounded-pill text-white text-[13px] font-medium font-secondary hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-clay)" }}
            >
              {preview ? "Preview only" : isSubmitting ? "Booking…" : "Confirm"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DemoScheduler({
  availabilitySlots,
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
}: {
  availabilitySlots: Record<string, string[]>;
  onConfirm?: (booking: { date: string; time: string }) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
}) {
  const initial = todayMonthYear();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = todayKey();
  const availableDates = new Set(Object.keys(availabilitySlots));
  const selectedTimeSlots = selectedDate
    ? availabilitySlots[selectedDate] ?? []
    : [];

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function prevMonth() {
    if (isCurrentMonth(viewYear, viewMonth)) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  }

  return (
    <div className="flex flex-col md:flex-row md:min-h-[500px]">
      <div className="flex md:hidden w-full border-b border-border p-4 flex-col gap-2">
        <div>
          <div className="text-[10px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-1">
            SchoolStack
          </div>
          <div
            className="font-display leading-snug text-text"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            Demo Call
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-secondary text-text-muted">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            30 min
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
              <rect x="1" y="3.5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 6l3.5-2v6L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Video call
          </span>
          <span className="flex items-center gap-1.5 text-text-faint">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="6" cy="6" rx="2.2" ry="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Central (CT)
          </span>
        </div>
      </div>

      <div className="hidden md:flex w-[140px] flex-shrink-0 border-r border-border p-5 flex-col gap-5">
        <div>
          <div className="text-[10px] font-medium font-secondary text-text-faint uppercase tracking-widest mb-1.5">
            SchoolStack
          </div>
          <div
            className="font-display leading-snug text-text"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
          >
            Demo Call
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[12px] font-secondary text-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            30 min
          </div>
          <div className="flex items-center gap-2 text-[12px] font-secondary text-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
              <rect x="1" y="3.5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 6l3.5-2v6L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Video call
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-[11px] font-secondary text-text-faint">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="6" cy="6" rx="2.2" ry="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Central (CT)
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isCurrentMonth(viewYear, viewMonth)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[14px] font-medium font-secondary text-text">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150"
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
        />
      </div>

      <AnimatePresence>
        {selectedDate && (
          <>
            <motion.div
              key="times-col-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className="md:hidden w-full border-t border-border overflow-hidden"
            >
              <TimeSlotList
                dateStr={selectedDate}
                timeSlots={selectedTimeSlots}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                onConfirm={onConfirm}
                isSubmitting={isSubmitting}
                preview={preview}
                confirmDisabled={confirmDisabled}
              />
            </motion.div>
            <motion.div
              key="times-col-desktop"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 158, transition: { duration: 0.28, ease } }}
              exit={{ opacity: 0, width: 0, transition: { duration: 0.2 } }}
              className="hidden md:block flex-shrink-0 border-l border-border overflow-hidden"
            >
              <TimeSlotList
                dateStr={selectedDate}
                timeSlots={selectedTimeSlots}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                onConfirm={onConfirm}
                isSubmitting={isSubmitting}
                preview={preview}
                confirmDisabled={confirmDisabled}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
