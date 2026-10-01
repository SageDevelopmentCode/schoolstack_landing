"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CalendarGrid,
  type CalendarGridColors,
} from "@/components/scheduler/CalendarGrid";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  MONTH_NAMES,
  todayKey,
  todayMonthYear,
  isCurrentMonth,
  formatSelectedDate,
  firstAvailableDemoDate,
  sortDemoTimeSlots,
  SCHEDULER_TIMEZONE_LABEL,
} from "@/lib/demo-scheduler";
import { SITE_NAME } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;

function storyCalendarColors(theme: ParentThemeTokens): CalendarGridColors {
  return {
    accent: theme.primary,
    accentLight: theme.primaryLight,
    text: theme.ink,
    textFaint: theme.muted,
    textSecondary: theme.muted,
    border: theme.line,
    bg: theme.white,
    warning: theme.warning,
    warningBg: theme.warningBg,
  };
}

function TimeSlotList({
  dateStr,
  timeSlots,
  selectedTime,
  onSelectTime,
  onConfirm,
  isSubmitting,
  preview,
  confirmDisabled,
  storyTheme,
}: {
  dateStr: string;
  timeSlots: string[];
  selectedTime: string | null;
  onSelectTime: (t: string) => void;
  onConfirm?: (booking: { date: string; time: string }) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
  storyTheme?: ParentThemeTokens;
}) {
  return (
    <div className="flex flex-col md:h-full p-4">
      <div className="mb-3">
        <div
          className={`mb-0.5 text-[10px] font-medium uppercase tracking-widest ${storyTheme ? "" : "font-secondary text-text-faint"}`}
          style={
            storyTheme
              ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          Select a time
        </div>
        <div
          className={`text-[12px] font-medium leading-snug ${storyTheme ? "" : "font-secondary text-text"}`}
          style={
            storyTheme
              ? { color: storyTheme.ink, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          {formatSelectedDate(dateStr)}
        </div>
        <p
          className={`mt-1 text-[11px] ${storyTheme ? "" : "font-secondary text-text-faint"}`}
          style={
            storyTheme
              ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          All times in {SCHEDULER_TIMEZONE_LABEL}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {timeSlots.length === 0 ? (
          <p
            className={`text-center py-4 text-[13px] ${storyTheme ? "" : "text-text-faint font-secondary"}`}
            style={
              storyTheme
                ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
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
                className={
                  storyTheme
                    ? "w-full h-10 border-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                    : `w-full h-10 rounded-lg border-2 text-[13px] font-medium font-secondary transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-border text-text hover:border-accent hover:text-accent"
                      }`
                }
                style={
                  storyTheme
                    ? {
                        fontFamily: storyTheme.fontBody,
                        borderRadius: storyTheme.radiusButton,
                        borderColor: isSelected ? storyTheme.primary : storyTheme.line,
                        backgroundColor: isSelected ? storyTheme.primary : storyTheme.white,
                        color: isSelected ? storyTheme.white : storyTheme.ink,
                      }
                    : undefined
                }
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
            className={`mt-3 pt-3 border-t ${storyTheme ? "" : "border-border"}`}
            style={storyTheme ? { borderColor: storyTheme.line } : undefined}
          >
            <button
              type="button"
              disabled={isSubmitting || preview || confirmDisabled}
              onClick={() => {
                if (selectedTime && onConfirm) {
                  onConfirm({ date: dateStr, time: selectedTime });
                }
              }}
              className={
                storyTheme
                  ? `w-full h-10 text-white text-[13px] font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`
                  : `w-full h-10 rounded-pill text-white text-[13px] font-medium font-secondary hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`
              }
              style={{
                backgroundColor: storyTheme
                  ? storyTheme.primary
                  : "var(--color-clay)",
                borderRadius: storyTheme?.radiusButton,
                fontFamily: storyTheme?.fontBody,
              }}
            >
              {preview ? (
                "Preview only"
              ) : (
                <ButtonLoadingLabel loading={Boolean(isSubmitting)} loadingLabel="Booking…">
                  Confirm
                </ButtonLoadingLabel>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DemoMetaRow({
  storyTheme,
  durationMinutes,
  showTimezone = true,
}: {
  storyTheme?: ParentThemeTokens;
  durationMinutes: number;
  showTimezone?: boolean;
}) {
  const mutedClass = storyTheme
    ? "text-[12px] font-semibold"
    : "text-[12px] font-secondary text-text-muted";
  const faintClass = storyTheme
    ? "text-[12px] font-semibold"
    : "text-[12px] font-secondary text-text-faint";

  const mutedStyle = storyTheme
    ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
    : undefined;
  const faintStyle = storyTheme
    ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
    : undefined;

  return (
    <>
      <span className={`flex items-center gap-1.5 ${mutedClass}`} style={mutedStyle}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {durationMinutes} min
      </span>
      <span className={`flex items-center gap-1.5 ${mutedClass}`} style={mutedStyle}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden="true">
          <rect x="1" y="3.5" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 6l3.5-2v6L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Video call
      </span>
      {showTimezone ? (
        <span className={`flex items-center gap-1.5 ${faintClass}`} style={faintStyle}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden="true">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="6" cy="6" rx="2.2" ry="5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {SCHEDULER_TIMEZONE_LABEL}
        </span>
      ) : null}
    </>
  );
}

export function DemoScheduler({
  availabilitySlots,
  onConfirm,
  isSubmitting,
  preview = false,
  confirmDisabled = false,
  storyTheme,
}: {
  availabilitySlots: Record<string, string[]>;
  onConfirm?: (booking: { date: string; time: string }) => void;
  isSubmitting?: boolean;
  preview?: boolean;
  confirmDisabled?: boolean;
  storyTheme?: ParentThemeTokens;
}) {
  const initial = todayMonthYear();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const initialDateAutoSelected = useRef(false);

  useEffect(() => {
    if (initialDateAutoSelected.current) return;

    const first = firstAvailableDemoDate(availabilitySlots);
    if (!first) return;

    initialDateAutoSelected.current = true;
    const [y, m] = first.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setSelectedDate(first);
  }, [availabilitySlots]);

  const today = todayKey();
  const availableDates = new Set(Object.keys(availabilitySlots));
  const selectedTimeSlots = useMemo(
    () =>
      sortDemoTimeSlots(
        selectedDate ? availabilitySlots[selectedDate] ?? [] : [],
      ),
    [selectedDate, availabilitySlots],
  );
  const durationMinutes = storyTheme ? 20 : 30;
  const calendarColors = storyTheme ? storyCalendarColors(storyTheme) : undefined;
  const borderColor = storyTheme?.line;

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

  const titleStyle = storyTheme
    ? {
        fontFamily: storyTheme.fontDisplay,
        color: storyTheme.ink,
        fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
      }
    : { fontSize: "clamp(1rem, 2.5vw, 1.15rem)" };

  return (
    <div className="flex flex-col md:flex-row md:min-h-[500px]">
      <div
        className={`flex md:hidden w-full border-b p-4 flex-col gap-2 ${storyTheme ? "" : "border-border"}`}
        style={borderColor ? { borderColor } : undefined}
      >
        <div>
          <div
            className={`mb-1 text-[10px] font-medium uppercase tracking-widest ${storyTheme ? "" : "font-secondary text-text-faint"}`}
            style={
              storyTheme
                ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
            {SITE_NAME}
          </div>
          <div className={storyTheme ? "leading-snug" : "font-display leading-snug text-text"} style={titleStyle}>
            Demo Call
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <DemoMetaRow storyTheme={storyTheme} durationMinutes={durationMinutes} />
        </div>
      </div>

      <div
        className={`hidden md:flex w-[140px] flex-shrink-0 border-r p-5 flex-col gap-5 ${storyTheme ? "" : "border-border"}`}
        style={borderColor ? { borderColor } : undefined}
      >
        <div>
          <div
            className={`mb-1.5 text-[10px] font-medium uppercase tracking-widest ${storyTheme ? "" : "font-secondary text-text-faint"}`}
            style={
              storyTheme
                ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
            {SITE_NAME}
          </div>
          <div className={storyTheme ? "leading-snug" : "font-display leading-snug text-text"} style={titleStyle}>
            Demo Call
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <DemoMetaRow
            storyTheme={storyTheme}
            durationMinutes={durationMinutes}
            showTimezone={false}
          />
        </div>

        <div
          className={`mt-auto pt-4 border-t ${storyTheme ? "" : "border-border"}`}
          style={borderColor ? { borderColor } : undefined}
        >
          <div
            className={`flex items-center gap-1.5 text-[11px] ${storyTheme ? "font-semibold" : "font-secondary text-text-faint"}`}
            style={
              storyTheme
                ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="6" cy="6" rx="2.2" ry="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {SCHEDULER_TIMEZONE_LABEL}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isCurrentMonth(viewYear, viewMonth)}
            className={
              storyTheme
                ? "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
                : "w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
            }
            style={
              storyTheme
                ? { color: storyTheme.muted }
                : undefined
            }
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className={`text-[14px] font-medium ${storyTheme ? "" : "font-secondary text-text"}`}
            style={
              storyTheme
                ? { color: storyTheme.ink, fontFamily: storyTheme.fontBody }
                : undefined
            }
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className={
              storyTheme
                ? "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                : "w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-border/30 transition-all duration-150"
            }
            style={
              storyTheme
                ? { color: storyTheme.muted }
                : undefined
            }
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
        {selectedDate && (
          <>
            <motion.div
              key="times-col-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: 0.28, ease } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className={`md:hidden w-full border-t overflow-hidden ${storyTheme ? "" : "border-border"}`}
              style={borderColor ? { borderColor } : undefined}
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
                storyTheme={storyTheme}
              />
            </motion.div>
            <motion.div
              key="times-col-desktop"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 158, transition: { duration: 0.28, ease } }}
              exit={{ opacity: 0, width: 0, transition: { duration: 0.2 } }}
              className={`hidden md:block flex-shrink-0 border-l overflow-hidden ${storyTheme ? "" : "border-border"}`}
              style={borderColor ? { borderColor } : undefined}
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
                storyTheme={storyTheme}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
